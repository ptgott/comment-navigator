import {
  ThreadCount,
  NavigatorControl,
  NextButton,
  PrevButton,
  NavButton,
  FirstButton,
  LastButton,
} from "./navigator-control";
import { ParseForThreads, ThreadCollection } from "../thread/thread-collection";
import * as selectors from "../constants/selectors";
import { FiltrationRecord } from "../filter/filtration-record";
import { FilterCollection } from "../filter/filter-collection";
import { MockCommentThread } from "../test-utils/mock-html";
import { CommentThread } from "../thread/comment-thread";

// This file expects you to be using Jest

// Clear the document body so we can muddy it up with each test.
beforeEach(() => {
  document.body.innerHTML = null;
});

describe("NavigatorControl", () => {
  const err = new RegExp(".*[nN]ot [iI]mplemented.*");
  test("refresh returns an error on the parent class", () => {
    const nc = new NavigatorControl();
    expect(() => {
      const fr = new FiltrationRecord(null, null, null);
      nc.refresh(fr);
    }).toThrowError(err);
  });

  test("render returns an error on the parent class", () => {
    const nc = new NavigatorControl();
    expect(() => {
      nc.render();
    }).toThrowError(err);
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
    const fr = new FiltrationRecord(coll, filtered, new FilterCollection([]));

    threadCount.refresh(fr);
    expect(el.textContent).toEqual(
      `${expectedFiltered}/${coll.elements.length}`
    );
  });
});

describe("NavButton", () => {
  test("renders a button", () => {
    const nb = new NavButton(
      (tc: ThreadCollection): CommentThread => {
        return tc.elements[0];
      }
    );
    document.body.appendChild(nb.render());
    expect([...document.body.getElementsByTagName("button")].length).toEqual(1);
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

    const nb = new NavButton(
      (tc: ThreadCollection): CommentThread => {
        return tc.elements[0];
      }
    );
    document.body.appendChild(nb.render());
    const tc = ParseForThreads(document.body);
    const fc = new FilterCollection([]);
    const fr = new FiltrationRecord(tc, tc, fc);
    const expected = "click";
    const el = nb.controlElement();
    nb.refresh(fr);
    let actual;

    // The ThreadCollection's outermost wrapper should receive the click.
    // This is a clumsier by more straightforward approach than using
    // Jest mocks.
    nb.target().element.parentElement.parentElement.addEventListener(
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
    const fc = new FilterCollection([]);
    const fr = new FiltrationRecord(tc, tc, fc);
    nb.refresh(fr);
    const actualText = nb.target().element.querySelector(selectors.commentBody)
      .textContent;
    expect(actualText.trim()).toEqual(expectedText);
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
    const fc = new FilterCollection([]);
    const fr = new FiltrationRecord(tc, tc, fc);
    pb.refresh(fr);
    const actualText = pb.target().element.querySelector(selectors.commentBody)
      .textContent;
    expect(actualText.trim()).toEqual(expectedText);
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
    const fc = new FilterCollection([]);
    const fr = new FiltrationRecord(tc, tc, fc);
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
    const fc = new FilterCollection([]);
    const fr = new FiltrationRecord(tc, tc, fc);
    pb.refresh(fr);
    const actualText = pb.target().element.querySelector(selectors.commentBody)
      .textContent;
    expect(actualText.trim()).toEqual(expectedText);
  });
});
