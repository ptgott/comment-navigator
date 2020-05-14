import { ThreadCount } from "./navigator-control";
import * as fs from "fs";
import { ParseForThreads, ThreadCollection } from "../thread/thread-collection";
import { FinalCommentAuthorNameFilter, Filter } from "../filter/filter";
import { FiltrationRecord } from "../filter/filtration-record";
import { FilterCollection } from "../filter/filter-collection";

// This file expects you to be using Jest

describe("ThreadCount", () => {
  const testHTMLPath = "./test.html";

  // There shouldn't be any DOM manipulation here since all tests share
  // the same HTML
  beforeAll(() => {
    document.body.innerHTML = fs.readFileSync(testHTMLPath).toString("utf8");
  });

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
    const el = threadCount.render();

    const coll = ParseForThreads(document.body);

    // Regrettably, this places a tight coupling between this test
    // and FinalCommentAuthorNameFilter.
    // TODO: Write a more isolated version of this test.
    const f: Filter = new FinalCommentAuthorNameFilter("Paul Gottschling");
    const filtered: ThreadCollection = f.use(coll);
    const expectedFiltered = 2;
    const fr = new FiltrationRecord(coll, filtered, new FilterCollection([f]));

    threadCount.refresh(fr);
    expect(el.textContent).toEqual(
      `${expectedFiltered}/${coll.elements.length}`
    );
  });
});
