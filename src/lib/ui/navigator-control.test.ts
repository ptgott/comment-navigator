import {
  ThreadCount,
  NextButton,
  PrevButton,
  NavButton,
  FirstButton,
  LastButton,
  AuthorSelectBox,
  RegexpSearchBox,
  ThreadTypeCheckBoxes,
} from "./navigator-control";
import { ParseForThreads, ThreadCollection } from "../thread/thread-collection";
import * as selectors from "../constants/selectors";
import { FiltrationRecord } from "../filter/filtration-record";
import { FilterCollection } from "../filter/filter-collection";
import {
  MockCommentThread,
  MockSuggestionThread,
} from "../test-utils/mock-html";
import { CommentThread } from "../thread/comment-thread";
import { SuggestionsFilter, CommentsFilter, Filter } from "../filter/filter";
import { TestNavigatorControl } from "../test-utils/test-navigator-control";

// This file expects you to be using Jest

// Clear the document body so we can muddy it up with each test.
beforeEach(() => {
  document.body.innerHTML = null;
});

// Since NavigatorControl is an abstract class, we test it
// by using a TestNavigatorControl that contains minimal
// functionality.
describe("All NavigatorControls", () => {
  test("should remove their wrapper from the DOM on destroy()", () => {
    const tnc = new TestNavigatorControl();
    document.body.appendChild(tnc.render());
    tnc.destroy();
    expect(document.body.innerHTML).not.toContain(tnc.wrapper.innerHTML);
  });
});

describe("ThreadCount", () => {
  // So all tests can access a new ThreadCount.
  let threadCount: ThreadCount;

  beforeEach(() => {
    threadCount = new ThreadCount();
  });

  test("should create a span on render", () => {
    const el = threadCount.render();
    expect(el.tagName).toEqual("SPAN");
  });

  test("should no-op on readFilters", () => {
    expect(threadCount.readFilters().filters).toHaveLength(0);
  });

  test("should show the ratio of filtered threads on refresh", () => {
    const threads = new Array(4);
    for (let i = 0; i < threads.length; i++) {
      threads[i] = MockCommentThread({
        author: "Foo Bar",
        text: "This is a thread",
        replies: [
          {
            author: "Paul Gottschling",
            text: "This is a reply",
          },
        ],
      });
    }
    document.body.innerHTML = threads.join("\n");

    const coll = ParseForThreads(document.body);
    const el = threadCount.render();
    const expectedFiltered = 2;
    const filtered: ThreadCollection = new ThreadCollection(
      coll.elements.slice(0, expectedFiltered)
    );
    // Don't use actual filters here--we don't need them, and this will
    // keep the test more isolated.
    const fr = new FiltrationRecord(
      coll,
      filtered,
      new FilterCollection([], "AND"),
      null
    );

    threadCount.refresh(fr);
    expect(el.textContent).toContain(
      `${expectedFiltered}/${coll.elements.length}`
    );
  });
});

describe("NavButton", () => {
  const testNavButton = new NavButton(
    "Test",
    (fr: FiltrationRecord): CommentThread => {
      return fr.after.elements[0];
    }
  );
  test("renders a button", () => {
    document.body.appendChild(testNavButton.render());
    expect([...document.body.getElementsByTagName("button")].length).toEqual(1);
  });

  test("should no-op on readFilters", () => {
    expect(testNavButton.readFilters().filters).toHaveLength(0);
  });

  test("dispatches a click to the expected thread", () => {
    document.body.innerHTML = [
      MockCommentThread({
        author: "Foo Bar",
        text: "This is a thread",
        replies: [],
        isActive: true,
      }),
    ].join("\n");

    document.body.appendChild(testNavButton.render());
    const tc = ParseForThreads(document.body);
    const fc = new FilterCollection([], "AND");
    const fr = new FiltrationRecord(tc, tc, fc, null);
    const expected = "click";
    const el = testNavButton.controlElement();
    testNavButton.refresh(fr);
    let actual;

    // The ThreadCollection's outermost wrapper should receive the click.
    // This is a clumsier by more straightforward approach than using
    // Jest mocks.
    testNavButton
      .target()
      .element.parentElement.parentElement.addEventListener(
        "click",
        (ev: Event) => {
          actual = ev.type;
        }
      );
    el.dispatchEvent(new MouseEvent("click"));
    expect(actual).toEqual(expected);
  });
});

describe("NextButton", () => {
  test("points to the correct target thread", () => {
    const expectedText = "This is a third thread";
    document.body.innerHTML = [
      MockCommentThread({
        author: "Foo Bar",
        text: "This is a thread",
        replies: [],
        isActive: false,
      }),
      MockCommentThread({
        author: "Foo Bar",
        text: "This is a second thread",
        replies: [],
        isActive: true,
      }),
      MockCommentThread({
        author: "Blah Blah",
        text: expectedText,
        replies: [],
        isActive: false,
      }),
    ].join("\n");
    const tc = ParseForThreads(document.body);
    const nb = NextButton();
    const fc = new FilterCollection([], "AND");
    const fr = new FiltrationRecord(tc, tc, fc, tc.elements[1]);
    nb.refresh(fr);
    const actualText = nb.target().element.querySelector(selectors.commentBody)
      .textContent;
    expect(actualText.trim()).toEqual(expectedText);
  });

  test("points to the correct target thread with a previous index", () => {
    interface testCase {
      prevIndex: number;
      expectedText: string;
    }

    const cases: Array<testCase> = [
      { prevIndex: 0, expectedText: "This is a second thread" },
      { prevIndex: 1, expectedText: "This is a third thread" },
      { prevIndex: null, expectedText: "This is a thread" },
      { prevIndex: undefined, expectedText: "This is a thread" },
      { prevIndex: 3, expectedText: "This is also text" },
    ];

    // No active threads
    document.body.innerHTML = [
      MockCommentThread({
        author: "Foo Bar",
        text: "This is a thread",
        replies: [],
        isActive: false,
      }),
      MockCommentThread({
        author: "Foo Bar",
        text: "This is a second thread",
        replies: [],
        isActive: false,
      }),
      MockCommentThread({
        author: "Blah Blah",
        text: "This is a third thread",
        replies: [],
        isActive: false,
      }),
      MockSuggestionThread({
        author: "Example athor",
        text: "This is also text",
        replies: [],
        isActive: false,
      }),
    ].join("\n");

    cases.forEach((c) => {
      const tc = ParseForThreads(document.body);
      const nb = NextButton();
      const fc = new FilterCollection([], "AND");
      const fr = new FiltrationRecord(tc, tc, fc, tc.elements[c.prevIndex]);
      nb.refresh(fr);
      const actualText = nb
        .target()
        .element.querySelector(selectors.commentBody).textContent;
      expect(actualText.trim()).toEqual(c.expectedText);
    });
  });
});

describe("PrevButton", () => {
  test("points to the correct target thread", () => {
    const expectedText = "This is a thread";
    document.body.innerHTML = [
      MockCommentThread({
        author: "Foo Bar",
        text: expectedText,
        replies: [],
        isActive: false,
      }),
      MockCommentThread({
        author: "Foo Bar",
        text: "This is a second thread",
        replies: [],
        isActive: true,
      }),
      MockCommentThread({
        author: "Blah Blah",
        text: "This is a third thread",
        replies: [],
        isActive: false,
      }),
    ].join("\n");
    const tc = ParseForThreads(document.body);
    const pb = PrevButton();
    const fc = new FilterCollection([], "AND");
    const fr = new FiltrationRecord(tc, tc, fc, tc.elements[1]);
    pb.refresh(fr);
    const actualText = pb.target().element.querySelector(selectors.commentBody)
      .textContent;
    expect(actualText.trim()).toEqual(expectedText);
  });

  test("points to the correct target thread with a previous index", () => {
    interface testCase {
      prevIndex: number;
      expectedText: string;
    }

    const cases: Array<testCase> = [
      { prevIndex: 0, expectedText: "This is a thread" },
      { prevIndex: 1, expectedText: "This is a thread" },
      { prevIndex: null, expectedText: "This is a thread" },
      { prevIndex: undefined, expectedText: "This is a thread" },
      { prevIndex: 3, expectedText: "This is a third thread" },
      { prevIndex: 2, expectedText: "This is a second thread" },
    ];

    // No active threads
    document.body.innerHTML = [
      MockCommentThread({
        author: "Foo Bar",
        text: "This is a thread",
        replies: [],
        isActive: false,
      }),
      MockCommentThread({
        author: "Foo Bar",
        text: "This is a second thread",
        replies: [],
        isActive: false,
      }),
      MockCommentThread({
        author: "Blah Blah",
        text: "This is a third thread",
        replies: [],
        isActive: false,
      }),
      MockSuggestionThread({
        author: "Example athor",
        text: "This is also text",
        replies: [],
        isActive: false,
      }),
    ].join("\n");

    cases.forEach((c) => {
      const tc = ParseForThreads(document.body);
      const nb = PrevButton();
      const fc = new FilterCollection([], "AND");
      const fr = new FiltrationRecord(tc, tc, fc, tc.elements[c.prevIndex]);
      nb.refresh(fr);
      const actualText = nb
        .target()
        .element.querySelector(selectors.commentBody).textContent;
      expect(actualText.trim()).toEqual(c.expectedText);
    });
  });
});

describe("FirstButton", () => {
  test("points to the correct target thread", () => {
    const expectedText = "This is a thread";
    document.body.innerHTML = [
      MockCommentThread({
        author: "Foo Bar",
        text: expectedText,
        replies: [],
        isActive: false,
      }),
      MockCommentThread({
        author: "Foo Bar",
        text: "This is a second thread",
        replies: [],
        isActive: false,
      }),
      MockCommentThread({
        author: "Blah Blah",
        text: "This is a third thread",
        replies: [],
        isActive: true,
      }),
    ].join("\n");
    const tc = ParseForThreads(document.body);
    const pb = FirstButton();
    const fc = new FilterCollection([], "AND");
    const fr = new FiltrationRecord(tc, tc, fc, null);
    pb.refresh(fr);
    const actualText = pb.target().element.querySelector(selectors.commentBody)
      .textContent;
    expect(actualText.trim()).toEqual(expectedText);
  });
});

describe("LastButton", () => {
  test("points to the correct target thread", () => {
    const expectedText = "This is a thread";
    document.body.innerHTML = [
      MockCommentThread({
        author: "Foo Bar",
        text: "This is a first thread",
        replies: [],
        isActive: false,
      }),
      MockCommentThread({
        author: "Foo Bar",
        text: "This is a second thread",
        replies: [],
        isActive: false,
      }),
      MockCommentThread({
        author: "Blah Blah",
        text: expectedText,
        replies: [],
        isActive: true,
      }),
    ].join("\n");
    const tc = ParseForThreads(document.body);
    const pb = LastButton();
    const fc = new FilterCollection([], "AND");
    const fr = new FiltrationRecord(tc, tc, fc, null);
    pb.refresh(fr);
    const actualText = pb.target().element.querySelector(selectors.commentBody)
      .textContent;
    expect(actualText.trim()).toEqual(expectedText);
  });
});

describe("AuthorSelectBox", () => {
  // So we can use these vars in each test
  let tc: ThreadCollection, asb: AuthorSelectBox, fr, box: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = [
      MockCommentThread({
        author: "Foo Bar",
        text: "This is a first thread",
        replies: [
          {
            author: "Foo Bar",
            text: "Replying to my own thread",
          },
        ],
        isActive: false,
      }),
      MockCommentThread({
        author: "Blah Blah",
        text: "This is a second thread",
        replies: [],
        isActive: false,
      }),
      MockSuggestionThread({
        author: "Example User",
        text: "This is a third thread",
        replies: [],
        isActive: true,
      }),
    ].join("\n");
    tc = ParseForThreads(document.body);
    asb = new AuthorSelectBox();
    fr = new FiltrationRecord(tc, tc, null, null);
    box = asb.render();
    asb.refresh(fr);
  });

  test("lists final comment authors on render", () => {
    const expectedNames = ["Foo Bar", "Blah Blah", "Example User"];
    expectedNames.forEach((name) => {
      expect(box.innerHTML.includes(name)).toEqual(true);
    });
  });

  test("returns a FilterCollection that filters by author", () => {
    const expectedNames = ["Foo Bar", "Blah Blah"];
    // Select the first two options in the selection box
    // It should be okay if box.innerHTML doesn't include the
    // "selected" attribute in its option elements--this behavior
    // also takes place in a real DOM.
    [...box.getElementsByTagName("option")].slice(0, 2).forEach((el) => {
      const opt = el as HTMLOptionElement;
      opt.selected = true;
    });
    const filterCriteria = asb.readFilters().filters.map((filter) => {
      return (filter as Filter).criterion;
    });
    expect(filterCriteria).toEqual(expect.arrayContaining(expectedNames));
    expect(filterCriteria.length).toEqual(expectedNames.length);
  });

  test("filters for all authors when no options are selected", () => {
    // Make sure no names are selected
    [...box.getElementsByTagName("option")].forEach((el) => {
      const opt = el as HTMLOptionElement;
      opt.selected = false;
    });
    const fc = asb.readFilters();
    const a = fc.use(tc);
    // There shouldn't be any actual filtration if
    // no authors are selected
    expect(a.elements.length).toEqual(tc.elements.length);
  });
  test("updates when conversations change", () => {
    // Change the comment HTML after the initial
    // select box refresh
    document.body.innerHTML = [
      MockCommentThread({
        author: "Fake User",
        text: "This is a first thread",
        replies: [],
        isActive: false,
      }),
      MockSuggestionThread({
        author: "Example User",
        text: "This is a third thread",
        replies: [],
        isActive: true,
      }),
    ].join("\n");
    const tc2 = ParseForThreads(document.body);
    const fr2 = new FiltrationRecord(tc2, tc2, null, null);
    // Second refresh after the beforeEach block
    asb.refresh(fr2);
    const expectedNames = ["Fake User", "Example User"];
    expectedNames.forEach((name) => {
      expect(box.innerHTML.includes(name)).toEqual(true);
    });
  });
});

describe("RegexpSearchBox", () => {
  test("creates an input box label on render", () => {
    const rsb = new RegexpSearchBox();
    expect(
      [...rsb.render().children].map((el) => {
        return el.tagName;
      })
    ).toEqual(expect.arrayContaining(["LABEL", "INPUT"]));
  });

  test("is no-op on refresh", () => {
    const rsb = new RegexpSearchBox();
    document.body.appendChild(rsb.render());
    const before = rsb.wrapper.innerHTML;
    const tc = ParseForThreads(document.body);
    const nb = NextButton();
    const fc = new FilterCollection([], "AND");
    const fr = new FiltrationRecord(tc, tc, fc, null);
    rsb.refresh(fr);
    expect(rsb.wrapper.innerHTML).toEqual(before);
  });

  test("produces a RegexpBodyFilter on read", () => {
    const rsb = new RegexpSearchBox();
    const box = rsb.render();
    const expected = "/^[A-Z][a-z]+/";
    box.getElementsByTagName("input")[0].value = expected;
    const rf = rsb.readFilters();
    expect(rf.filters.length).toEqual(1);
    const actual = (rf.filters[0] as Filter).criterion;
    expect(actual).toEqual(expected);
  });
});

describe("ThreadTypeCheckBoxes", () => {
  test("creates two checkboxes on render", () => {
    const ttc = new ThreadTypeCheckBoxes();
    const r = ttc.render();
    expect(
      [...r.children].map((el) => {
        return el.tagName;
      })
    ).toEqual(expect.arrayContaining(["INPUT", "LABEL", "INPUT", "LABEL"]));
    expect(r.innerHTML).toContain("Comments");
    expect(r.innerHTML).toContain("Suggestions");
  });

  test("is no-op on refresh", () => {
    const ttc = new ThreadTypeCheckBoxes();
    document.body.appendChild(ttc.render());
    const before = ttc.wrapper.innerHTML;
    const tc = ParseForThreads(document.body);
    const nb = NextButton();
    const fc = new FilterCollection([], "AND");
    const fr = new FiltrationRecord(tc, tc, fc, null);
    ttc.refresh(fr);
    expect(ttc.wrapper.innerHTML).toEqual(before);
  });

  test("reads the expected filters", () => {
    const ttc = new ThreadTypeCheckBoxes();
    const r = ttc.render();
    // In other words, the checkboxes should behave the same way regardless
    // of whether both or none are checked.
    [true, false].forEach((val) => {
      [...r.getElementsByTagName("input")].forEach((el) => {
        el.checked = val;
      });
      const f = ttc.readFilters();
      expect(
        f.filters.map((filt) => {
          return filt.constructor;
        })
      ).toEqual(expect.arrayContaining([SuggestionsFilter, CommentsFilter]));
    });
  });
});
