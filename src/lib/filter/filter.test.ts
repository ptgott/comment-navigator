import { ParseForThreads, ThreadCollection } from "../thread/thread-collection";
import {
  FinalCommentAuthorNameFilter,
  RegexpBodyFilter,
  SuggestionsFilter,
  CommentsFilter,
  Filter,
  SelectedThreadFilter,
} from "./filter";
import {
  MockCommentThread,
  MockSuggestionThread,
} from "../test-utils/mock-html";

// This file expects you to be using Jest

interface testCase {
  input: any;
  results: number;
}

// Clear the document body so we can muddy it up with each test.
beforeEach(() => {
  document.body.innerHTML = null;
});

describe("Filter", () => {
  // TODO: Add a test for when the ThreadCollection arg of use() is empty.

  test("should throw an error when using directly on a nonempty ThreadCollection", () => {
    document.body.innerHTML = MockCommentThread({
      author: "Foo Bar",
      text: "This is a comment thread!",
      replies: [],
    });
    const coll = ParseForThreads(document.body);
    const f = new Filter("");
    const err = new RegExp(".*[nN]ot [iI]mplemented.*");
    expect(() => {
      f.use(coll);
    }).toThrowError(err);
  });
});

describe("FinalCommentAuthorNameFilter", () => {
  test("filters threads by the author of the final comment", () => {
    document.body.innerHTML = [
      MockCommentThread({
        author: "Foo Bar",
        text: "This is a thread",
        replies: [
          {
            author: "Paul Gottschling",
            text: "This is a reply",
          },
        ],
      }),
      MockCommentThread({
        author: "Foo Bar",
        text: "This is a thread",
        replies: [
          {
            author: "Paul Gottschling",
            text: "This is a reply",
          },
        ],
      }),
      MockCommentThread({
        author: "Foo Bar",
        text: "This is a thread",
        replies: [
          {
            author: "Foo Bar",
            text: "This is a reply",
          },
        ],
      }),
      MockCommentThread({
        author: "Foo Bar",
        text: "This is a thread",
        replies: [
          {
            author: "Foo Bar",
            text: "This is a reply",
          },
        ],
      }),
    ].join("\n");

    const authorCases: Array<testCase> = [
      {
        input: "Paul Gottschling",
        results: 2,
      },
      {
        input: "Foo Bar",
        results: 2,
      },
      {
        input: "Blargh Blargh",
        results: 0,
      },
      // Having no input should show all results.
      { input: "", results: 4 },
    ];

    authorCases.forEach((ac) => {
      const tc = ParseForThreads(document.getElementsByTagName("body")[0]);
      const af = new FinalCommentAuthorNameFilter(ac.input);
      const results = af.use(tc);
      expect(results.elements.length).toEqual(ac.results);
    });
  });
});

describe("RegexpBodyFilter", () => {
  test("filters threads by regular expression", () => {
    document.body.innerHTML = [
      MockCommentThread({
        author: "Foo Bar",
        text: "This is a comment",
        replies: [
          {
            author: "Blah Blah",
            text: "This is a reply",
          },
        ],
      }),
      MockCommentThread({
        author: "Foo Bar",
        text: "This is a comment",
        replies: [
          {
            author: "Fake Name",
            text: "This is a reply",
          },
        ],
      }),
      MockCommentThread({
        author: "Foo Bar",
        text: "This is a comment",
        replies: [
          {
            author: "Fake Name",
            text: "This is an answer",
          },
        ],
      }),
    ].join("\n");
    const regexpCases: Array<testCase> = [
      {
        input: "[][", // An invalid case
        results: 0,
      },
      {
        input: "/.*reply/",
        results: 2,
      },
      {
        input: ".*reply", // It shouldn't matter of there's a solidus
        results: 2,
      },
      {
        input: "", // Matches everything
        results: 3,
      },
    ];

    regexpCases.forEach((rc) => {
      const tc = ParseForThreads(document.getElementsByTagName("body")[0]);
      const f = new RegexpBodyFilter(rc.input);
      expect(f.use(tc).elements.length).toEqual(rc.results);
    });
  });
});

describe("SuggestionsFilter", () => {
  test("filters threads to show only suggestion threads", () => {
    document.body.innerHTML = [
      MockCommentThread({
        author: "Foo Bar",
        text: "This is a thread",
        replies: [],
      }),
      MockSuggestionThread({
        author: "Foo Bar",
        text: "This is a thread",
        replies: [],
      }),
      MockSuggestionThread({
        author: "Foo Bar",
        text: "This is a thread",
        replies: [],
      }),
    ].join("\n");
    const sugCount = 2;
    const col = ParseForThreads(document.getElementsByTagName("body")[0]);
    const f = new SuggestionsFilter();
    expect(f.use(col).elements.length).toEqual(sugCount);
  });
});

describe("CommentsFilter", () => {
  test("filters threads to show only comment threads", () => {
    document.body.innerHTML = [
      MockCommentThread({
        author: "Foo Bar",
        text: "This is a thread",
        replies: [],
      }),
      MockCommentThread({
        author: "Foo Bar",
        text: "This is a thread",
        replies: [],
      }),
      MockSuggestionThread({
        author: "Foo Bar",
        text: "This is a thread",
        replies: [],
      }),
    ].join("\n");

    const commentCount = 2;
    const col = ParseForThreads(document.getElementsByTagName("body")[0]);
    const f = new CommentsFilter();
    expect(f.use(col).elements.length).toEqual(commentCount);
  });
});

describe("SelectedThreadFilter", () => {
  test("filters threads to show those that are currently active", () => {
    document.body.innerHTML = [
      MockCommentThread({
        author: "Foo Bar",
        text: "This is a thread",
        replies: [],
        isActive: true,
      }),
      MockCommentThread({
        author: "Foo Bar",
        text: "This is a thread",
        replies: [],
        isActive: false,
      }),
      MockSuggestionThread({
        author: "Foo Bar",
        text: "This is a thread",
        replies: [],
        isActive: true,
      }),
      MockSuggestionThread({
        author: "Foo Bar",
        text: "This is a thread",
        replies: [],
        isActive: false,
      }),
    ].join("\n");

    // In a real Google Doc, only one thread should be active at a time.
    // Here we want to make the filter works for comments as well as
    // suggestions.
    const activeCount = 2;
    const col = ParseForThreads(document.getElementsByTagName("body")[0]);
    const f = new SelectedThreadFilter();
    expect(f.use(col).elements.length).toEqual(activeCount);
  });
});
