import { NavigatorControl, ThreadCount } from "./navigator-control";
import { FiltrationRecord } from "../filter/filtration-record";
import { FilterCollection } from "../filter/filter-collection";
import { Filter } from "../filter/filter";

/**
 * Represents the UI component for the comment navigator.
 * Note that it's up to the caller of the constructor
 * to also call refresh() and render(). This means that the
 * caller should call window.setInterval (or some other means)
 * to periodically refresh the state of the component.
 */
export class CommentNavigator {
  /**
   * The HTML component itself.
   * render() adds it to the DOM.
   * refresh() updats its information without
   * re-rendering.
   */
  public element: HTMLElement;

  /**
   * For rendering and refreshing, CommentNavigator
   * just calls render() or refresh() for each
   * subcomponent. CommentNavigator doesn't know
   * if its subcomponents have children.
   */
  private subcomponents: Array<NavigatorControl>;

  /**
   *
   * @param subcomponents are the NavigatorControls to
   * render within the CommentNavigator. These will be
   * rendered in the order given in the array.
   */
  constructor(subcomponents: Array<NavigatorControl>) {
    this.element = document.createElement("div");
    this.element.id = "googleDocsCommentNavigator";
    this.subcomponents = subcomponents;
  }

  /**
   * Adds the component to the context.
   */
  public render(context: HTMLElement): void {
    // Width at which elements wrap appropriately
    this.element.style.width = "520px";
    this.element.style.position = "fixed";
    this.element.style.top = "100%";
    this.element.style.left = "50%";
    this.element.style.transform = "translate(-50%,-100%)";
    this.element.style.padding = "20px";
    this.element.style.border = "solid rgb(50,50,50) 3px";
    this.element.style.borderRadius = "8px";
    this.element.style.backgroundColor = "white";
    this.element.style.fontFamily = "sans-serif";
    this.element.style.fontSize = "14px";
    context.appendChild(this.element);

    // Nothing more to render
    if (this.subcomponents == null) {
      return;
    }

    this.subcomponents.forEach((sc) => {
      this.element.appendChild(sc.render());
    });
  }

  /**
   * Removes the component from the document body
   */
  public destroy(): void {
    this.element.remove();
  }

  /**
   * Updates the data within element without re-rendering.
   * @param fr FiltrationRecord. You'll need to apply
   * filters before calling refresh.
   */
  public refresh(fr: FiltrationRecord): void {
    this.subcomponents.forEach((sc) => {
      // We can't expect refresh() to be implemented for
      // all subcomponents.
      try {
        sc.refresh(fr);
      } catch {
        return;
      }
    });
  }

  /**
   * Reads NavigatorControls for user-selected filter options.
   * It exists as a single interface to each NavigatorControl's
   * readFilters() method.
   */
  public readFilters(): FilterCollection {
    return new FilterCollection(
      this.subcomponents.reduce((accum, control) => {
        let f: FilterCollection;
        // We don't expect readFilters to work with every control,
        // since sometimes it's not implemented.
        try {
          f = control.readFilters();
          return accum.concat(f);
        } catch {
          return accum;
        }
      }, []),
      // Each NavigatorComponent is isolated from the others, so
      // we process ThreadCollections through all of them.
      "AND"
    );
  }
}
