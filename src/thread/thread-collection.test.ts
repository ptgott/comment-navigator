import { ThreadCollection, ParseForThreads } from "./thread-collection";
import { MockCommentThread } from "../test-utils/mock-html";
// This a test file for use with Jest

beforeEach(() => {
  // Each test should start with a clean slate
  document.body.innerHTML = "";
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
    document.body.innerHTML = threads.join("\n");

    const coll = ParseForThreads(document.getElementsByTagName("body")[0]);
    expect(coll.elements.length).toEqual(elCount);
  });

  test("returns names of authors for the final comments within comment threads", () => {
    document.body.innerHTML = [
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
    ].join("\n");
    const expected: Array<string> = ["Bar Baz", "Blah Blah"];
    const coll = ParseForThreads(document.getElementsByTagName("body")[0]);
    const actual: Array<string> = coll.finalCommentAuthorNames();
    expect(actual).toEqual(expect.arrayContaining(expected));
    expect(actual.length).toEqual(expected.length);
  });
});
