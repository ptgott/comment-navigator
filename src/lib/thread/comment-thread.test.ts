import {
  MockCommentThread,
  MockSuggestionThread,
} from "../test-utils/mock-html";
import { ParseForThreads } from "./thread-collection";
import * as selectors from "../constants/selectors";

// This file is intended for Jest

beforeEach(() => {
  // Clean slate each time
  document.body.innerHTML = "";
});

describe("CommentThread", () => {
  test("if there are no replies, return the root reply as the final comment", () => {
    const expectedText = "This is the expected text!";
    const HTMLs: Array<string> = [
      MockCommentThread({
        author: "Foo Bar",
        text: expectedText,
        replies: [],
      }),
      MockSuggestionThread({
        author: "Foo Bar",
        text: expectedText,
        replies: [],
      }),
    ];
    document.body.innerHTML = HTMLs.join("\n");
    const coll = ParseForThreads(document.body);
    coll.elements.forEach((el, i) => {
      expect(
        el
          .finalComment()
          .querySelector(selectors.commentBody) // Focus on the body text for comparison
          .textContent.trim() // Small differences in white space aren't important now
      ).toEqual(expectedText);
    });
  });
});
