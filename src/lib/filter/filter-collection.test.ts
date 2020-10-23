// This file assumes you're using Jest

import { ParseForThreads } from "../thread/thread-collection";
import { FilterCollection } from "./filter-collection";
import {
  FinalCommentAuthorNameFilter,
  SuggestionsFilter,
  RegexpBodyFilter,
  CommentsFilter,
} from "./filter";
import {
  MockCommentThread,
  MockSuggestionThread,
} from "../test-utils/mock-html";

interface testCase {
  input: any;
  results: number;
}

beforeEach(() => {
  document.body.innerHTML = "<div id='context'>" + [
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
  ].join("\n") + "</div>";
});

describe("FilterCollection", () => {
  test("throws an error if there's no Boolean provided", () => {
    expect(() => {
      new FilterCollection([], "");
    }).toThrowError("Boolean");
  });

  test("with AND logic, accepts CommentThreads that all filters apply to", () => {
    const threadColl = ParseForThreads(
      document.getElementsByTagName("body")[0]
    );
    const cases: Array<testCase> = [
      {
        input: [
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
      const filterColl = new FilterCollection(c.input, "AND");
      expect(filterColl.use(threadColl).elements.length).toEqual(c.results);
    });
  });

  test("with OR logic, accepts CommentThreads that any filter applies to", () => {
    const threadColl = ParseForThreads(
      document.getElementsByTagName("body")[0]
    );
    const cases: Array<testCase> = [
      {
        input: [
          new FinalCommentAuthorNameFilter("Blah Blah"),
          new FinalCommentAuthorNameFilter("Example"),
        ],
        results: 2,
      },
      {
        input: [new SuggestionsFilter(), new CommentsFilter()],
        results: 4,
      },
    ];

    cases.forEach((c) => {
      const filterColl = new FilterCollection(c.input, "OR");
      expect(filterColl.use(threadColl).elements.length).toEqual(c.results);
    });
  });
});
