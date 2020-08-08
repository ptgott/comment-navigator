// This is a Jest test suite

import { CommentNavigator } from "./comment-navigator";
import { FiltrationRecord } from "../filter/filtration-record";
import { ThreadCollection } from "../thread/thread-collection";
import { TestNavigatorControl } from "../test-utils/test-navigator-control";
import {
  MockSuggestionThread,
  MockCommentThread,
} from "../test-utils/mock-html";

beforeEach(() => {
  document.body.innerHTML = "";
});

describe("CommentNavigator", () => {
  test("render generates HTML", () => {
    const n = new CommentNavigator([], 0);
    n.render(document.body);
    // In this test, we just want to make sure that CommentNavigator.render()
    // generates HTML, without checking for the specific elements
    // generated.
    expect(document.body.querySelectorAll("*").length).toBeGreaterThan(0);
  });

  test("rendering a CommentNavigator with null subcomponents throws an error", () => {
    const n = new CommentNavigator(null, 0);
    expect(() => {
      n.render(document.body);
    }).toThrowError("null");
  });

  test("render() adds child component elements to navigator", () => {
    const n = new CommentNavigator(
      [
        new TestNavigatorControl(),
        new TestNavigatorControl(),
        new TestNavigatorControl(),
      ],
      0
    );
    n.render(document.body);
    // It's intended behavior for the UI components to begin refreshing
    // as soon as this is rendered.
    const texts = [...n.element.querySelectorAll("div")].map((el) => {
      return el.textContent;
    });
    const expected = ["Refreshed", "Refreshed", "Refreshed"];
    expect(texts).toEqual(expect.arrayContaining(expected));
    expect(texts.length).toEqual(expected.length);
  });

  test("refresh() updates child component elements to navigator", () => {
    const n = new CommentNavigator(
      [
        // Sometimes a component won't implement readFilters() or
        // refresh(), and that's okay!
        new TestNavigatorControl(),
        new TestNavigatorControl(),
        new TestNavigatorControl(),
      ],
      0
    );
    n.render(document.body);
    n.refresh(
      new FiltrationRecord(
        new ThreadCollection([]),
        new ThreadCollection([]),
        null
      )
    );
    // Each TestNavigatorControl creates a single div containing the text
    // "Refresh" when refreshed.
    const texts = [...n.element.querySelectorAll("div")].map((el) => {
      return el.textContent;
    });
    const expected = ["Refreshed", "Refreshed", "Refreshed"];
    expect(texts).toEqual(expect.arrayContaining(expected));
    expect(texts.length).toEqual(expected.length);
  });

  test("readFilters() creates a combined FilterCollection", () => {
    const n = new CommentNavigator(
      [
        new TestNavigatorControl(),
        new TestNavigatorControl(),
        new TestNavigatorControl(),
      ],
      0
    );
    // This should result in two FilterCollections, each containing
    // TestFilters
    const fc = n.readFilters();
    const filterTypes = fc.filters.map((filt) => {
      return filt.constructor.name;
    });

    expect(filterTypes).toEqual(
      expect.arrayContaining(["FilterCollection", "FilterCollection"])
    );
  });

  test("readAndRefresh assigns previouslySelectedThreadIndex if a thread is selected", () => {
    const expectedIndex = 2;
    document.body.innerHTML = [
      MockSuggestionThread({
        author: "Example Author 1",
        text: "Example text",
        replies: [],
      }),
      MockCommentThread({
        author: "Example Author 2",
        text: "Example text",
        replies: [],
      }),
      MockCommentThread({
        author: "Example Author 3",
        text: "Example text",
        replies: [],
        isActive: true,
      }),
    ].join("\n");

    const n = new CommentNavigator(
      [
        new TestNavigatorControl(),
        new TestNavigatorControl(),
        new TestNavigatorControl(),
      ],
      0
    );

    n.render(document.body);
    n.readAndRefresh();
    expect(n.previouslySelectedThreadIndex).toEqual(expectedIndex);
  });

  test("minimize does not remove subcomponents from the DOM", (done) => {
    const subs = [
      new TestNavigatorControl(),
      new TestNavigatorControl(),
      new TestNavigatorControl(),
    ];
    const n = new CommentNavigator(subs, 0);
    n.render(document.body);
    // Don't pass a duration since we're not waiting for the component
    // to animate.
    n.minimize(0, () => {
      // All TestNavigatorControls have the same wrapper, and we want to
      // make sure not one is left inside the CommentNavigator.
      expect(n.element.innerHTML).toContain(subs[0].wrapper.innerHTML);
      done();
    });
  });

  test("minimizes on Escape keypress does not remove subcomponents from the DOM", () => {
    const subs = [
      new TestNavigatorControl(),
      new TestNavigatorControl(),
      new TestNavigatorControl(),
    ];
    const n = new CommentNavigator(subs, 0);
    n.render(document.body);
    n.maximize();
    document.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Escape",
      })
    );
    expect(n.minimized).toEqual(true);
  });

  test("doesn't minimize on a non-Escape keypress", () => {
    const subs = [
      new TestNavigatorControl(),
      new TestNavigatorControl(),
      new TestNavigatorControl(),
    ];
    const n = new CommentNavigator(subs, 0);
    n.render(document.body);
    n.maximize();
    document.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Enter",
      })
    );
    expect(n.minimized).toEqual(false);
  });

  test("toggleMinimize changes minimization based on state", () => {
    const subs = [
      new TestNavigatorControl(),
      new TestNavigatorControl(),
      new TestNavigatorControl(),
    ];
    const n = new CommentNavigator(subs, 0);

    // There's not really a great way to test this. We can't test the actual
    // computed style of the element without some extensive mocking, and this
    // environment isn't set up for Puppeteer (nor should it be). Best to
    // just use the `minimized` property.
    n.render(document.body);
    const firstMinStatus = n.minimized;
    n.toggleMinimize(0);
    expect(n.minimized).toEqual(!firstMinStatus);
    n.toggleMinimize(0);
    expect(n.minimized).toEqual(firstMinStatus);
  });
});
