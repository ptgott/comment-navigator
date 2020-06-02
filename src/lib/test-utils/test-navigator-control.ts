import { NavigatorControl } from "../ui/navigator-control";
import { FiltrationRecord } from "../filter/filtration-record";
import { FilterCollection } from "../filter/filter-collection";
import { TestFilter } from "../test-utils/test-filter";

// So we can test components that implement (or not)
// different methods of NavigatorControl, we'll
// configure TestNavigatorControl on init
interface TestNavigatorControlConfig {
  implementRefresh: boolean;
  implementReadFilters: boolean;
}

/**
 * TestNavigatorControl is used for testing
 * CommentNavigator without needing to also
 * test actual NavigatorControls and their filters.
 * Its element is a div containing either "Test"
 * (before refresh) or "Refreshed" (after refresh)
 */
export class TestNavigatorControl extends NavigatorControl {
  element: HTMLElement;

  constructor(conf: TestNavigatorControlConfig) {
    super();
    this.element = document.createElement("div");
    this.element.textContent = "Test";

    if (conf.implementReadFilters) {
      this.readFilters = () => {
        return new FilterCollection(
          [
            new TestFilter("one"),
            new TestFilter("two"),
            new TestFilter("three"),
          ],
          "OR"
        );
      };
    }

    if (conf.implementRefresh) {
      // Takes a FiltrationRecord to satisfy the TestNavigatorControl
      // interface, but otherwise doens't use it. All real
      // NavigatorControls do, though, so there's no use in changing
      // the function signature to accommodate this test class.
      this.refresh = (fr: FiltrationRecord): void => {
        this.element.textContent = "Refreshed";
      };
    }
  }

  render(): HTMLElement {
    return this.element;
  }
}
