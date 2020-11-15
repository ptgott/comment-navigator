import { ParseForThreads } from "./thread-collection";
import {
  MockCommentThread,
  MockSuggestionThread,
} from "../test-utils/mock-html";
// This a test file for use with Jest

beforeEach(() => {
  // Each test should start with a clean slate
  document.body.innerHTML = "";
});

describe("ParseForThreads", () => {
  test("throws an error if no discussion context is given", () => {
    expect(() => {
      ParseForThreads(null);
    }).toThrowError("context");
  });
});

describe("ThreadCollection", () => {
  interface testCase {
    input: any;
    results: number;
  }

  test("collects all comment threads in a ThreadCollection", () => {
    const elCount = 4;
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
    document.body.innerHTML =
      "<div id='context'>" + threads.join("\n") + "</div>";

    const coll = ParseForThreads(document.querySelector("#context"));
    expect(coll.elements.length).toEqual(elCount);
  });

  test("correctly extracts the element of an assigned thread", () => {
    const expectedText = "This is a comment.";
    const expectedAuth = "Example Author";
    document.body.innerHTML = MockCommentThread({
      author: expectedAuth,
      text: expectedText,
      isAssigned: true,
      replies: [],
    });
    const col = ParseForThreads(document.body);
    expect(col.finalCommentAuthorNames()).toEqual(
      expect.arrayContaining([expectedAuth])
    );
  });

  test("returns names of authors for the final comments within comment threads", () => {
    document.body.innerHTML =
      "<div id='context'>" +
      [
        MockCommentThread({
          author: "Foo Bar",
          text: "This is a thread",
          replies: [
            {
              author: "Foo Bar",
              text: "This is a reply",
            },
            {
              author: "Bar Baz",
              text: "This is a reply",
            },
          ],
        }),
        MockCommentThread({
          author: "Foo Bar",
          text: "This is a thread",
          replies: [
            {
              author: "Blah Blah",
              text: "This is a reply",
            },
          ],
        }),
      ].join("\n") +
      "</div>";
    const expected: Array<string> = ["Bar Baz", "Blah Blah"];
    const coll = ParseForThreads(document.querySelector("#context"));
    const actual: Array<string> = coll.finalCommentAuthorNames();
    expect(actual).toEqual(expect.arrayContaining(expected));
    expect(actual.length).toEqual(expected.length);
  });

  describe("getSelectedThread", () => {
    test("shows active suggestion threads", () => {
      const desiredAuthor = "IM Active";
      document.body.innerHTML =
        "<div id='context'>" +
        [
          MockCommentThread({
            author: "Foo Bar",
            text: "This is a thread",
            replies: [],
            isActive: false,
          }),
          MockSuggestionThread({
            author: desiredAuthor,
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
        ].join("\n") +
        "</div>";

      const col = ParseForThreads(document.querySelector("#context"));
      expect(col.getSelectedThread().element.textContent).toContain(
        desiredAuthor
      );
    });

    test("shows active comment threads", () => {
      const desiredAuthor = "IM Active";
      document.body.innerHTML =
        "<div id='context'>" +
        [
          MockCommentThread({
            author: "Foo Bar",
            text: "This is a thread",
            replies: [],
            isActive: false,
          }),
          MockCommentThread({
            author: desiredAuthor,
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
        ].join("\n") +
        "</div>";

      const col = ParseForThreads(document.querySelector("#context"));
      expect(col.getSelectedThread().element.textContent).toContain(
        desiredAuthor
      );
    });
  });
});
