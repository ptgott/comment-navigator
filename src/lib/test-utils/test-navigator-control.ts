import { NavigatorControl } from "../ui/navigator-control";
import { FiltrationRecord } from "../filter/filtration-record";
import { FilterCollection } from "../filter/filter-collection";
import { TestFilter } from "../test-utils/test-filter";
import { Filter } from "../filter/filter";

/**
 * TestNavigatorControl is used for testing
 * CommentNavigator without needing to also
 * test actual NavigatorControls and their filters.
 * Its element is a div containing either "Test"
 * (before refresh) or "Refreshed" (after refresh)
 */
export class TestNavigatorControl extends NavigatorControl {
  wrapper: HTMLElement;

  constructor() {
    super();
    this.wrapper = document.createElement("div");
    this.wrapper.textContent = "Test";
  }

  readFilters(): FilterCollection {
    return new FilterCollection(
      [new TestFilter("one"), new TestFilter("two"), new TestFilter("three")],
      "OR"
    );
  }

  // Takes a FiltrationRecord to satisfy the TestNavigatorControl
  // interface, but otherwise doens't use it. All real
  // NavigatorControls do, though, so there's no use in changing
  // the function signature to accommodate this test class.
  refresh(fr: FiltrationRecord): void {
    this.wrapper.textContent = "Refreshed";
  }

  render(): HTMLElement {
    return this.wrapper;
  }
}
