import { ThreadCount } from "./navigator-control";
import { ParseForThreads, ThreadCollection } from "../thread/thread-collection";
import { FinalCommentAuthorNameFilter, Filter } from "../filter/filter";
import { FiltrationRecord } from "../filter/filtration-record";
import { FilterCollection } from "../filter/filter-collection";
import { MockCommentThread } from "../test-utils/mock-html";

// This file expects you to be using Jest

// Clear the document body so we can muddy it up with each test.
beforeEach(() => {
  document.body.innerHTML = null;
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
