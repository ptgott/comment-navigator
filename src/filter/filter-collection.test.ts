// This file assumes you're using Jest

import { ParseBodyForThreads } from "../thread/thread-collection";
import { FilterCollection } from "./filter-collection";
import {
  FinalCommentAuthorNameFilter,
  SuggestionsFilter,
  RegexpBodyFilter,
} from "./filter";
import * as fs from "fs";

const testHTMLPath = "./test.html";

interface testCase {
  input: any;
  results: number;
}

describe("FilterCollection", () => {
  // There shouldn't be any DOM manipulation here since all tests share
  // the same HTML
  beforeAll(() => {
    document.body.innerHTML = fs.readFileSync(testHTMLPath).toString("utf8");
  });

  test("chains filters together", () => {
    const threadColl = ParseBodyForThreads(
      document.getElementsByTagName("body")[0]
    );
    const cases: Array<testCase> = [
      {
        input: [
          // This test is getting zero results, but shouldn't be--
          // finalCommentAuthorNameFilter works for a thread that's
          // a single suggestion with no comments.
          new FinalCommentAuthorNameFilter("Paul Gottschling"),
          new SuggestionsFilter(),
        ],
        results: 1,
      },
      {
        input: [
          new FinalCommentAuthorNameFilter("Foo Bar"),
          new RegexpBodyFilter("resp.*"),
        ],
        results: 1,
      },
    ];

    cases.forEach((c) => {
      const filterColl = new FilterCollection(c.input);
      expect(filterColl.use(threadColl).elements.length).toEqual(c.results);
    });
  });
});
