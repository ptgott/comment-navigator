// This is a Jest test suite

import { CommentNavigator } from "./comment-navigator";
import { FiltrationRecord } from "../filter/filtration-record";
import { ThreadCollection } from "../thread/thread-collection";
import { TestNavigatorControl } from "../test-utils/test-navigator-control";
import { CommentThread } from "../thread/comment-thread";

beforeEach(() => {
  document.body.innerHTML = "";
});

describe("CommentNavigator", () => {
  test("render generates HTML", () => {
    const n = new CommentNavigator(null);
    n.render(document.body);
    // In this test, we just want to make sure that CommentNavigator.render()
    // generates HTML, without checking for the specific elements
    // generated.
    expect(document.body.querySelectorAll("*").length).toBeGreaterThan(0);
  });

  test("destroy removes all trace of the navigator", () => {
    const n = new CommentNavigator(null);
    n.render(document.body);
    n.destroy();
    expect(document.body.querySelectorAll("*").length).toEqual(0);
  });

  test("render() adds child component elements to navigator", () => {
    const n = new CommentNavigator([
      new TestNavigatorControl(),
      new TestNavigatorControl(),
      new TestNavigatorControl(),
    ]);
    n.render(document.body);
    // Each TestNavigatorControl creates a single div containing the text
    // "Test" when first rendered.
    const texts = [...n.element.querySelectorAll("div")].map((el) => {
      return el.textContent;
    });
    const expected = ["Test", "Test", "Test"];
    expect(texts).toEqual(expect.arrayContaining(expected));
    expect(texts.length).toEqual(expected.length);
  });

  test("refresh() updates child component elements to navigator", () => {
    const n = new CommentNavigator([
      new TestNavigatorControl(),
      new TestNavigatorControl(),
      new TestNavigatorControl(),
    ]);
    n.render(document.body);
    n.refresh(
      new FiltrationRecord(
        new ThreadCollection([]),
        new ThreadCollection([]),
        null
      )
    );
    // Each TestNavigatorControl creates a single div containing the text
    // "Refresh" when refreshed.
    const texts = [...n.element.querySelectorAll("div")].map((el) => {
      return el.textContent;
    });
    const expected = ["Refreshed", "Refreshed", "Refreshed"];
    expect(texts).toEqual(expect.arrayContaining(expected));
    expect(texts.length).toEqual(expected.length);
  });

  test("readFilters() creates a combined FilterCollection", () => {
    const n = new CommentNavigator([
      new TestNavigatorControl(),
      new TestNavigatorControl(),
    ]);
    // This should result in two FilterCollections, each containing
    // TestFilters
    const fc = n.readFilters();
    console.log(fc);
    const filterTypes = fc.filters.map((filt) => {
      return filt.constructor.name;
    });

    expect(filterTypes).toEqual(
      expect.arrayContaining(["FilterCollection", "FilterCollection"])
    );
  });
});
