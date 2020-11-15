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

// Expected height in px for the minimized navigator. The actual height can be
// a bit lower than this--make this somewhat roomy to avoid flaky tests.
const expectedMinHeight = 35;

const navigatorSelector = "div#googleDocsCommentNavigator";

// The first span is instructional text. The second is the minimization
// component.
const minimizeSelector = `${navigatorSelector} span:nth-of-type(2)`;
const fixture = safeLoad(
  fs.readFileSync(path.join("src", "e2e", "fixture.yaml"), "utf8")
);

/**
 * activateThread makes a thread active, i.e., simulates selecting or
 * clicking the discussion thread in Google Docs.
 * @param threadIndex the index of the discussion thread within
 * an array of all discussion threads, ordered so that the highest
 * in the document comes first.
 */
async function activateThread(threadIndex: number) {
  // Note that this function only triggers the active/inactive state.
  // The functionality for implementing the state is left to the
  // e2e test server in order to simulate Google Docs.
  await page.click(
    // Remember that nth-of-type starts at 1, not 0!
    `${conversationWrapper}:nth-of-type(${threadIndex + 1})`
  );
  // Wait a bit to let the navigator refresh
  await sleep(200);
}

/**
 * resolveDiscussion simulates resolving a comment thread or accepting a suggestion.
 * In a real Google Doc, resolving a discussion or accepting a suggestion removes the
 * discussion thread from the DOM--so does resolveDiscussion.
 * @param threadIndex the index of the discussion thread within
 * an array of all discussion threads, ordered so that the highest
 * in the document comes first.
 */
async function resolveDiscussion(threadIndex: number) {
  // Remember that nth-of-type starts at 1, not 0!
  const sel = `${conversationWrapper}:nth-of-type(${threadIndex + 1})`;
  try {
    await page.evaluate((selectorToRemove) => {
      const el = document.querySelector(selectorToRemove);
      el.remove();
    }, sel);
  } catch (err) {
    // This shouldn't happen unless the fixture used for the e2e tests
    // has changed.
    throw new Error(
      `Can't find an element matching the selector ${sel}: ${err}`
    );
  }
}

/**
 * deactivateThreads renders all discussions on the page inactive.
 */
async function deactivateThreads() {
  // Note that in a real Google Doc, removing the activeClass
  // doesn't actually deactivate a thread. But since the class's
  // presence is sufficient to identify a thread as active, we can
  // keep this here.
  await page.evaluate((activationSelector) => {
    const activeClass = activationSelector.replace(".", "");
    document.querySelectorAll(activationSelector).forEach((el) => {
      el.classList.remove(activeClass);
    });
  }, activeThread);

  // Without waiting at all, the code following deactivateThreads()
  // sometimes detects active threads.
  await sleep(300);
}

type buttonSymbol = Symbol;
const SELECTOR_NEXT: buttonSymbol = Symbol("next");
const SELECTOR_PREV: buttonSymbol = Symbol("previous");
const SELECTOR_LAST: buttonSymbol = Symbol("last");
const SELECTOR_FIRST: buttonSymbol = Symbol("first");

async function clickNavButton(direction: buttonSymbol) {
  // Check if direction is valid.
  if (
    ![SELECTOR_NEXT, SELECTOR_PREV, SELECTOR_LAST, SELECTOR_FIRST].includes(
      direction
    )
  ) {
    throw new Error("direction is not a valid buttonSymbol");
  }

  const buttonSelectors: Map<buttonSymbol, string> = new Map();
  buttonSelectors.set(
    SELECTOR_FIRST,
    `${navigatorSelector} button[data-direction="First"]`
  );
  buttonSelectors.set(
    SELECTOR_PREV,
    `${navigatorSelector} button[data-direction="Previous"]`
  );
  buttonSelectors.set(
    SELECTOR_NEXT,
    `${navigatorSelector} button[data-direction="Next"]`
  );
  buttonSelectors.set(
    SELECTOR_LAST,
    `${navigatorSelector} button[data-direction="Last"]`
  );
  await page.click(buttonSelectors.get(direction));
}

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

/**
 * getActiveThreadIndex gets the index of the active
 * discussion thread within an array of all discussion
 * threads ordered from highest in the doc to lowest
 * in the doc. It returns -1 if no thread is active.
 */
async function getActiveThreadIndex(): Promise<number> {
  const indx = await page.evaluate(
    (threadSelector, activeSelector) => {
      // Check the index of the active thread container within
      // the array of all thread containers.
      const activeThreadContainers = document.body.querySelectorAll(
        activeSelector
      );
      if (activeThreadContainers.length !== 1) {
        return -1;
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
  return indx;
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

    expect(navHeight).toBeLessThanOrEqual(expectedMinHeight);
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
      expect(navHeight).toBeLessThanOrEqual(expectedMinHeight);
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
          const desiredElement = opts.find((el) => {
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

  interface testCase {
    startingIndex: number; // Which thread to begin from
    expectedIndex: number; // Which thread we should end up with
    button: buttonSymbol; // For determining where to click
  }

  test("Clicking a navigation button should activate the expected thread", async () => {
    const testCases: Array<testCase> = [
      // Go to first
      {
        startingIndex: 3,
        expectedIndex: 0,
        button: SELECTOR_FIRST,
      },
      // Go to previous
      {
        startingIndex: 3,
        expectedIndex: 2,
        button: SELECTOR_PREV,
      },
      // Go to next
      {
        startingIndex: 2,
        expectedIndex: 3,
        button: SELECTOR_NEXT,
      },
      // Go to last
      {
        startingIndex: 1,
        expectedIndex: Math.max(0, fixture.length - 1),
        button: SELECTOR_LAST,
      },
    ];
    // Can't use forEach here because the code is asynchronous and we
    // need to be careful about the `page` object state.
    for (let tc of testCases) {
      await sleep(200); // Let things settle a bit
      try {
        // Make the starting thread active by clicking on it
        await activateThread(tc.startingIndex);

        await clickNavButton(tc.button);
        // wait a bit
        await sleep(200);

        // check the results
        const actualIndex = await getActiveThreadIndex();
        expect(actualIndex).toEqual(tc.expectedIndex);
      } catch (err) {
        fail(err);
      }
    }
  });

  test("if threads are made inactive, the thread selection sequence persists", async () => {
    const testCases: Array<testCase> = [
      // Go to previous
      {
        startingIndex: 3,
        expectedIndex: 2,
        button: SELECTOR_PREV,
      },
      // Go to next
      {
        startingIndex: 2,
        expectedIndex: 3,
        button: SELECTOR_NEXT,
      },
    ];
    // Can't use forEach here because the code is asynchronous and we
    // need to be careful about the `page` object state.
    for (let tc of testCases) {
      await sleep(200); // Let things settle a bit
      try {
        // Make the starting thread active by clicking on it
        await activateThread(tc.startingIndex);

        await deactivateThreads();

        await clickNavButton(tc.button);

        // wait a bit
        await sleep(200);

        // check the results
        const actualIndex = await getActiveThreadIndex();
        expect(actualIndex).toEqual(tc.expectedIndex);
      } catch (err) {
        fail(
          `Couldn't navigate correctly from the selected button: \n${tc.button.toString()}\n${err}`
        );
      }
    }
  });

  test("if you resolve/accept/reject the only discussion that matches filters, then navigate to the previous thread, there shouldn't be an error", async () => {
    // 1. Enter search criteria
    await page.type(
      `${navigatorSelector} input[name="regexpSearch"]`,
      "good" // With the current fixture, this filter produces one result
    );
    await sleep(300);

    // 2.
    await clickNavButton(SELECTOR_NEXT);
    await sleep(300);

    const prevActiveIndex = await getActiveThreadIndex();

    // 3. Resolve/accept the currently active discussion
    await resolveDiscussion(prevActiveIndex);
    await sleep(300);

    // 4. Click "Previous"
    // "Return a promise from your test, and Jest will wait for that promise to resolve.
    // If the promise is rejected, the test will automatically fail."
    // https://jestjs.io/docs/en/asynchronous#promises
    return clickNavButton(SELECTOR_PREV);
  });

  test("if all discussions are inactive, navigating to the next discussion matching filter criteria shouldn't skip a discussion", async () => {
    // 1. Enter search criteria
    await page.type(
      `${navigatorSelector} input[name="regexpSearch"]`,
      // Looking for any discussion that includes a literal "?" character.
      // This should filter to 3/5 discussions
      "\\?"
    );
    await sleep(300);

    // 2. Click "next," which should take us to the thread with index 1
    // within all discussion threads.
    await clickNavButton(SELECTOR_NEXT);
    await sleep(300);

    // 3.
    await deactivateThreads();

    // 4.
    await clickNavButton(SELECTOR_NEXT);
    await sleep(300);

    // We should navigate to the discussion with index 3 (among all discussions,
    // unfiltered)
    expect(await getActiveThreadIndex()).toEqual(3);
  });

  test("if all discussions are inactive, navigating to the previous discussion matching filter criteria shouldn't skip a discussion", async () => {
    // 1. Enter search criteria
    await page.type(
      `${navigatorSelector} input[name="regexpSearch"]`,
      // Looking for any discussion that includes a literal "?" character.
      // This should filter to 3/5 discussions
      "\\?"
    );
    await sleep(300);

    // 2. Go to the final discussion matching the criteria.
    // This should be the final discussion.
    await clickNavButton(SELECTOR_LAST);
    await sleep(300);

    // 3.
    await deactivateThreads();

    // 4.
    await clickNavButton(SELECTOR_PREV);
    await sleep(300);

    // We should navigate to the discussion with index 3 (among all discussions,
    // unfiltered), the second-to-last thread
    expect(await getActiveThreadIndex()).toEqual(3);
  });

  test('if you resolve the > 1st discussion matching criteria, clicking "next" should take you to the next discussion', async () => {
    // 1. Enter search criteria
    await page.type(
      `${navigatorSelector} input[name="regexpSearch"]`,
      // Looking for any discussion that includes a literal "?" character.
      // This should filter to 3/5 discussions
      "\\?"
    );
    await sleep(300);

    // 2. Navigate to a discussion after the first that matches the criteria
    await clickNavButton(SELECTOR_NEXT);
    await sleep(300);

    await clickNavButton(SELECTOR_NEXT);
    await sleep(300);

    // 3. resolve the discussion
    await resolveDiscussion(await getActiveThreadIndex());
    await sleep(300);

    // 4. Navigate to the next discussion. If we're breezing through a document
    // responding to discussion threads, we'd expect this to take us to the final
    // discussion in the document, rather than reversing our course and taking us
    // to the first discussion.
    await clickNavButton(SELECTOR_NEXT);
    await sleep(300);

    // We should be at the final discussion in the list, which now has the
    // index 3, rather than 4, since one discussion was resolved.
    expect(await getActiveThreadIndex()).toEqual(3);
  });
});
