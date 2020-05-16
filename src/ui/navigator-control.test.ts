import {
  ThreadCount,
  NavigatorControl,
  NextButton,
  PrevButton,
} from "./navigator-control";
import { ParseForThreads, ThreadCollection } from "../thread/thread-collection";
import * as selectors from "../constants/selectors";
import { FiltrationRecord } from "../filter/filtration-record";
import { FilterCollection } from "../filter/filter-collection";
import { MockCommentThread } from "../test-utils/mock-html";

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

// TODO: NextButton is crying out to be refactored along with
// PrevButton to create a common navigation button interface.
// The tests should be refactored too.
// TODO: Also test a wraparound scenario
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
    const nb = new NextButton();
    const fc = new FilterCollection([]);
    const fr = new FiltrationRecord(tc, tc, fc);
    nb.refresh(fr);
    const actualText = nb.target().element.querySelector(selectors.commentBody)
      .textContent;
    expect(actualText.trim()).toEqual(expectedText);
  });

  test("renders a button", () => {
    const nb = new NextButton();
    document.body.appendChild(nb.render());
    expect([...document.body.getElementsByTagName("button")].length).toEqual(1);
  });

  test("dispatches a click to the next thread", () => {
    document.body.innerHTML = [
      MockCommentThread({
        author: "Foo Bar",
        text: "This is a thread",
        replies: [],
        isActive: true,
      }),
      MockCommentThread({
        author: "Foo Bar",
        text: "This is a second thread",
        replies: [],
        isActive: false,
      }),
    ].join("\n");

    const nb = new NextButton();
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
      (ev) => {
        actual = ev.type;
      }
    );
    el.dispatchEvent(new MouseEvent("click"));
    expect(actual).toEqual(expected);
  });
});

// TODO: Also test a wraparound scenario
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
    const pb = new PrevButton();
    const fc = new FilterCollection([]);
    const fr = new FiltrationRecord(tc, tc, fc);
    pb.refresh(fr);
    const actualText = pb.target().element.querySelector(selectors.commentBody)
      .textContent;
    expect(actualText.trim()).toEqual(expectedText);
  });

  test("renders a button", () => {
    const nb = new PrevButton();
    document.body.appendChild(nb.render());
    expect([...document.body.getElementsByTagName("button")].length).toEqual(1);
  });

  test("dispatches a click to the previous thread", () => {
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
    ].join("\n");

    const pb = new PrevButton();
    document.body.appendChild(pb.render());
    const tc = ParseForThreads(document.body);
    const fc = new FilterCollection([]);
    const fr = new FiltrationRecord(tc, tc, fc);
    const expected = "click";
    const el = pb.controlElement();
    pb.refresh(fr);
    let actual;

    // The ThreadCollection's outermost wrapper should receive the click.
    // This is a clumsier by more straightforward approach than using
    // Jest mocks.
    pb.target().element.parentElement.parentElement.addEventListener(
      "click",
      (ev) => {
        actual = ev.type;
      }
    );

    el.dispatchEvent(new MouseEvent("click"));
    expect(actual).toEqual(expected);
  });
});
