// This file assumes you're using Jest

import { ParseForThreads } from "../thread/thread-collection";
import { FilterCollection } from "./filter-collection";
import {
  FinalCommentAuthorNameFilter,
  SuggestionsFilter,
  RegexpBodyFilter,
} from "./filter";
import * as fs from "fs";
import {
  MockCommentThread,
  MockSuggestionThread,
} from "../test-utils/mock-html";

interface testCase {
  input: any;
  results: number;
}

// Clear the document body so we can muddy it up with each test.
beforeEach(() => {
  document.body.innerHTML = null;
});

describe("FilterCollection", () => {
  test("chains filters together", () => {
    document.body.innerHTML = [
      MockSuggestionThread({
        author: "Foo Bar",
        text: "This is a comment",
        replies: [
          {
            author: "Fake Name",
            text: "Fake comment",
          },
          {
            author: "Blah Blah",
            text: "This is the final response",
          },
        ],
      }),
      MockCommentThread({
        author: "Example",
        text: "This is a comment",
        replies: [
          {
            author: "Foo Bar",
            text: "This is a response!",
          },
        ],
      }),
      MockSuggestionThread({
        author: "Bar Baz",
        text: "This is a suggestion",
        replies: [
          {
            author: "Blah Blah",
            text: "Example",
          },
        ],
      }),
      MockSuggestionThread({
        author: "Bar Baz",
        text: "This is a suggestion",
        replies: [
          {
            author: "Foo Bar",
            text: "This is a response!",
          },
        ],
      }),
    ].join("\n");
    const threadColl = ParseForThreads(
      document.getElementsByTagName("body")[0]
    );
    const cases: Array<testCase> = [
      {
        input: [
          // This test is getting zero results, but shouldn't be--
          // finalCommentAuthorNameFilter works for a thread that's
          // a single suggestion with no comments.
          new FinalCommentAuthorNameFilter("Blah Blah"),
          new SuggestionsFilter(),
        ],
        results: 2,
      },
      {
        input: [
          new FinalCommentAuthorNameFilter("Foo Bar"),
          new RegexpBodyFilter("resp.*"),
        ],
        results: 2,
      },
    ];

    cases.forEach((c) => {
      const filterColl = new FilterCollection(c.input);
      expect(filterColl.use(threadColl).elements.length).toEqual(c.results);
    });
  });
});
