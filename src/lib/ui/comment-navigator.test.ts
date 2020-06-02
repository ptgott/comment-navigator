// This is a Jest test suite

import { CommentNavigator } from "./comment-navigator";
import { FiltrationRecord } from "../filter/filtration-record";
import { ThreadCollection } from "../thread/thread-collection";
import { TestNavigatorControl } from "../test-utils/test-navigator-control";
import { NavigatorControl } from "./navigator-control";

beforeEach(() => {
  document.body.innerHTML = "";
});

describe("CommentNavigator", () => {
  const fullImplementation = {
    implementReadFilters: true,
    implementRefresh: true,
  };

  const noReadFilters = {
    implementReadFilters: false,
    implementRefresh: true,
  };

  const noRefresh = {
    implementRefresh: false,
    implementReadFilters: true,
  };

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
      new TestNavigatorControl(fullImplementation),
      new TestNavigatorControl(fullImplementation),
      new TestNavigatorControl(fullImplementation),
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
      // Sometimes a component won't implement readFilters() or
      // refresh(), and that's okay!
      new TestNavigatorControl(fullImplementation),
      new TestNavigatorControl(noReadFilters),
      new TestNavigatorControl(noRefresh),
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
      new TestNavigatorControl(fullImplementation),
      new TestNavigatorControl(fullImplementation),
      // Some controls don't implement readFilters, and
      // we should skip over them.
      new TestNavigatorControl(noReadFilters),
    ]);
    // This should result in two FilterCollections, each containing
    // TestFilters
    const fc = n.readFilters();
    const filterTypes = fc.filters.map((filt) => {
      return filt.constructor.name;
    });

    expect(filterTypes).toEqual(
      expect.arrayContaining(["FilterCollection", "FilterCollection"])
    );
  });
});
