// This is a Jest test suite

import { CommentNavigator } from "./comment-navigator";
import { FiltrationRecord } from "../filter/filtration-record";
import { ThreadCollection } from "../thread/thread-collection";
import { TestNavigatorControl } from "../test-utils/test-navigator-control";

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
      // Sometimes a component won't implement readFilters() or
      // refresh(), and that's okay!
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
      // Some controls don't implement readFilters, and
      // we should skip over them.
      new TestNavigatorControl(),
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

  test("minimize removes subcomponents from the DOM", (done) => {
    const subs = [
      new TestNavigatorControl(),
      new TestNavigatorControl(),
      new TestNavigatorControl(),
    ];
    const n = new CommentNavigator(subs);
    n.render(document.body);
    // Don't pass a duration since we're not waiting for the component
    // to animate.
    n.minimize(0, () => {
      // All TestNavigatorControls have the same wrapper, and we want to
      // make sure not one is left inside the CommentNavigator.
      expect(n.element.innerHTML).not.toContain(subs[0].wrapper.innerHTML);
      done();
    });
  });

  test("toggleMinimize changes minimization based on state", () => {
    const subs = [
      new TestNavigatorControl(),
      new TestNavigatorControl(),
      new TestNavigatorControl(),
    ];
    const n = new CommentNavigator(subs);

    // There's not really a great way to test this. We can't test the actual
    // computed style of the element without some extensive mocking, and this
    // environment isn't set up for Puppeteer (nor should it be). Best to
    // just use the `minimized` property.
    n.render(document.body);
    n.toggleMinimize(0);
    expect(n.minimized).toEqual(true);
    n.toggleMinimize(0);
    expect(n.minimized).toEqual(false);
  });
});
