import { ParseBodyForThreads } from "../thread/thread-collection";
import {
  FinalCommentAuthorNameFilter,
  RegexpBodyFilter,
  SuggestionsFilter,
  CommentsFilter,
} from "./filter";
import * as fs from "fs";

// This file expects you to be using Jest

const testHTMLPath = "./test.html";

interface testCase {
  input: any;
  results: number;
}

describe("FinalCommentAuthorNameFilter", () => {
  // There shouldn't be any DOM manipulation here since all tests share
  // the same HTML
  beforeAll(() => {
    document.body.innerHTML = fs.readFileSync(testHTMLPath).toString("utf8");
  });

  test("filters threads by the author of the final comment", () => {
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
    ];

    authorCases.forEach((ac) => {
      const tc = ParseBodyForThreads(document.getElementsByTagName("body")[0]);
      const af = new FinalCommentAuthorNameFilter(ac.input);
      const results = af.use(tc);
      expect(results.elements.length).toEqual(ac.results);
    });
  });
});

describe("RegexpBodyFilter", () => {
  test("filters threads by regular expression", () => {
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
        results: 4,
      },
    ];

    regexpCases.forEach((rc) => {
      const tc = ParseBodyForThreads(document.getElementsByTagName("body")[0]);
      const f = new RegexpBodyFilter(rc.input);
      expect(f.use(tc).elements.length).toEqual(rc.results);
    });
  });
});

describe("SuggestionsFilter", () => {
  test("filters threads to show only suggestion threads", () => {
    const sugCount = 2;
    const col = ParseBodyForThreads(document.getElementsByTagName("body")[0]);
    const f = new SuggestionsFilter();
    expect(f.use(col).elements.length).toEqual(sugCount);
  });
});

describe("CommentsFilter", () => {
  test("filters threads to show only comment threads", () => {
    const commentCount = 2;
    const col = ParseBodyForThreads(document.getElementsByTagName("body")[0]);
    const f = new CommentsFilter();
    expect(f.use(col).elements.length).toEqual(commentCount);
  });
});
