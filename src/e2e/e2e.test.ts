import * as fs from "fs";
import { safeLoad } from "js-yaml";
import path from "path";
import { threadConfig } from "../e2e-utils/server";
import {
  activeThread,
  thread as threadSelector,
  conversationWrapper,
} from "../lib/constants/selectors";

// e2e tests using Jest

// Note that expect-puppeteer matchers have a 500ms
// timeout by default.
// https://github.com/smooth-code/jest-puppeteer/tree/0c40becfb6ba4b2e9600fe71c4b82350cf583886/packages/expect-puppeteer
// We make sure the content loads fully before running tests,
// so you shouldn't need to adjust the timeout that much.

// 20 is the padding of the comment navigator
// TODO: Connect this value to the actual padding of the navigator
const navigatorPadding = 20;
const navigatorSelector = "div#googleDocsCommentNavigator";
const minimizeSelector = `${navigatorSelector} span:nth-of-type(1)`;
const fixture = safeLoad(
  fs.readFileSync(path.join("src", "e2e", "fixture.yaml"), "utf8")
);

async function threadCounterValue(): Promise<string> {
  return await page.evaluate(async (ns) => {
    return document.querySelector(`${ns} #commentThreadCount`).textContent;
  }, navigatorSelector);
}

// See this StackOverflow post: https://stackoverflow.com/a/41957152
async function sleep(ms: number): Promise<(PromiseLike: any) => void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function maximizeTheNavigator(): Promise<void> {
  await page.click(minimizeSelector);
  // This is a gross hack to wait until the navigator is maximized.
  // In the production version of the script, it animates for 1s.
  // TODO: Parameterize the animation interval for e2e tests.
  // TODO: Find a less brittle way of waiting until the nav component
  // is ready.
  await sleep(1000);
}

async function getNavigatorHeight(): Promise<number> {
  let heights;
  try {
    // Since page.evaluate can only return strings, we do some
    // really gross serialization, then parse.
    heights = await page.evaluate((selector) => {
      const navEl = document.querySelector(selector);
      const navHeight = navEl.getBoundingClientRect().top + scrollY;
      // The body itself doesn't have a height because all elements
      // have fixed or absolute positioning, so we compensate.
      const bodyHeight = window.innerHeight + scrollY;
      return `${navHeight},${bodyHeight}`;
    }, navigatorSelector);
  } catch (err) {
    fail(err);
  }
  heights = heights.split(",").map((h) => {
    return parseInt(h.replace("px", ""));
  });
  const navHeight = heights[1] - heights[0];
  return navHeight;
}

beforeEach(async () => {
  // If you don't call resetPage(), you'll get weird state pollution in the
  // global page object between tests, even if page is altered in
  // different `describe` blocks
  await jestPuppeteer.resetPage();
  try {
    // Forward console logs so they're not stuck in browserland
    page.on("console", (msg) => {
      console.log(msg.location().url, msg.text());
    });
    await page.goto(`http://localhost:${process.env["APP_PORT"]}`);
    await page.content(); // Let the page have content before testing it
  } catch (err) {
    throw new Error(`Encountered a problem when visiting the page:\n${err}`);
  }
});

describe("When a user loads the navigator UI", () => {
  test("they should see the navigator component", async () => {
    try {
      await expect(page).toMatchElement(navigatorSelector, {
        timeout: 500,
      });
    } catch (err) {
      fail(err);
    }
  });

  test("the navigator component should be minimized", async () => {
    const navHeight = await getNavigatorHeight();

    expect(navHeight).toBeLessThanOrEqual(navigatorPadding);
  });

  describe("After maximizing the navigator", () => {
    beforeEach(async () => {
      try {
        await maximizeTheNavigator();
      } catch (err) {
        throw new Error(
          `Encountered a problem maximizing the navigator:\n${err}`
        );
      }
    });

    test("pressing the escape key should minimize it", async () => {
      await page.keyboard.press("Escape");
      await sleep(1000);
      const navHeight = await getNavigatorHeight();
      expect(navHeight).toBeLessThanOrEqual(navigatorPadding);
    });

    test("there should be a count of all threads", async () => {
      try {
        const c = await threadCounterValue();
        await expect(c).toMatch(`${fixture.length}/${fixture.length}`, {
          timeout: 500,
        });
      } catch (err) {
        fail(err);
      }
    });

    test("The author selection box should list all final comment authors", async () => {
      let expectedBoxAuthors = fixture.map((obj: threadConfig) => {
        return obj.replies.length > 0
          ? obj.replies[obj.replies.length - 1].author
          : obj.author;
      });

      expectedBoxAuthors = [...new Set(expectedBoxAuthors)]; //dedup

      try {
        // Because page.evaluate has to return a string, we
        // need to use crude serialization and splitting to
        // get a list of author names.
        const authorsSerialized = await page.evaluate(async () => {
          return [...document.querySelectorAll("select option")].reduce(
            (accum: string, opt: Element, i: number, ary: Array<Element>) => {
              // Add a delimeter after every element but the last--
              // otherwise splitting creates a final empty string element.
              if (i < ary.length - 1) {
                accum = accum + opt.textContent + "&&&&&";
              } else {
                accum = accum + opt.textContent;
              }
              return accum;
            },
            ""
          );
        });
        const actualBoxAuthors = authorsSerialized.split("&&&&&");
        expect(actualBoxAuthors).toEqual(
          expect.arrayContaining(expectedBoxAuthors)
        );

        expect(expectedBoxAuthors.length).toEqual(actualBoxAuthors.length);
      } catch (err) {
        fail(err);
      }
    });

    test("selecting an author should change the thread counter accordingly", async () => {
      const desiredAuthor = "Fake Fakesley";
      try {
        const indexWithinOptions = await page.evaluate((auth) => {
          const opts = [...document.body.querySelectorAll("select option")];
          const desiredElement = [
            ...document.body.querySelectorAll("select option"),
          ].find((el) => {
            return el.textContent == auth;
          });
          return opts.indexOf(desiredElement);
        }, desiredAuthor);

        await page.click(`select option:nth-child(${indexWithinOptions})`);
        // Add an arbitrary wait period to allow the navigator to refresh
        await sleep(300);
        const c = await threadCounterValue();
        await expect(c).toMatch(`2/${fixture.length}`);
      } catch (err) {
        fail(err);
      }
    });

    test("adding a regexp search term should change the thread counter accordingly", async () => {
      // Looking for all comments that end with a question
      await page.type(
        `${navigatorSelector} input[name="regexpSearch"]`,
        "\\?$" // Need to escape the escape character or Puppeteer will remove it
      );
      await sleep(300);
      const c = await threadCounterValue();
      await expect(c).toMatch(`3/${fixture.length}`);
    });

    test("choosing only suggestions changes the thread counter", async () => {
      await page.click(`${navigatorSelector} input[name="Suggestions"]`);
      await sleep(300);
      const c = await threadCounterValue();
      await expect(c).toMatch(`3/${fixture.length}`);
    });
  });
});

describe("The navigation buttons", () => {
  beforeEach(async () => {
    try {
      await maximizeTheNavigator();
    } catch (err) {
      throw new Error(
        `Encountered a problem maximizing the navigator:\n${err}`
      );
    }
  });

  test("Clicking a navigation button should activate the expected thread", async () => {
    interface testCase {
      startingIndex: number; // Which thread to begin from
      expectedIndex: number; // Which thread we should end up with
      buttonSelector: string; // For determining where to click
    }
    const testCases: Array<testCase> = [
      // Go to first
      {
        startingIndex: 3,
        expectedIndex: 0,
        buttonSelector: `${navigatorSelector} button[data-direction="First"]`,
      },
      // Go to previous
      {
        startingIndex: 3,
        expectedIndex: 2,
        buttonSelector: `${navigatorSelector} button[data-direction="Previous"]`,
      },
      // Go to next
      {
        startingIndex: 2,
        expectedIndex: 3,
        buttonSelector: `${navigatorSelector} button[data-direction="Next"]`,
      },
      // Go to last
      {
        startingIndex: 1,
        expectedIndex: Math.max(0, fixture.length - 1),
        buttonSelector: `${navigatorSelector} button[data-direction="Last"]`,
      },
    ];
    // Can't use forEach here because the code is asynchronous and we
    // need to be careful about the `page` object state.
    for (let tc of testCases) {
      await sleep(200); // Let things settle a bit
      try {
        // Make the starting thread active by clicking on it
        await page.click(
          // Remember that nth-of-type starts at 1, not 0!
          `${conversationWrapper}:nth-of-type(${tc.startingIndex + 1})`
        );
        // Wait a bit to let the navigator refresh
        await sleep(200);
        // Click the button
        await page.click(tc.buttonSelector);
        // wait a bit
        await sleep(200);

        // check the results
        const actualIndex = await page.evaluate(
          (threadSelector, activeSelector) => {
            // Check the index of the active thread container within
            // the array of all thread containers.
            const activeThreadContainers = document.body.querySelectorAll(
              activeSelector
            );
            if (activeThreadContainers.length !== 1) {
              throw new Error(
                `Got ${activeThreadContainers.length} active thread containers!`
              );
            }
            const allThreadContainers = [
              ...document.querySelectorAll(threadSelector),
            ].map((ts) => {
              return ts.parentElement.parentElement;
            });
            return allThreadContainers.indexOf(activeThreadContainers[0]);
          },
          threadSelector,
          activeThread
        );
        expect(actualIndex).toEqual(tc.expectedIndex);
      } catch (err) {
        fail(err);
      }
    }
  });
});
