import { NavigatorControl, ThreadCount } from "./navigator-control";
import { FiltrationRecord } from "../filter/filtration-record";
import { FilterCollection } from "../filter/filter-collection";

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
   * Button used for minimizing the navigator
   */
  public minButton: HTMLElement;

  public minimized: boolean;

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
    this.minimized = false;

    this.element = document.createElement("div");

    // Set style properties that won't change between
    // rendering states.
    this.element.style.transitionProperty = "transform";
    this.element.style.transitionDuration = "1s";
    // Width at which elements wrap appropriately
    this.element.style.width = "520px";
    this.element.style.position = "fixed";
    this.element.style.left = "50%";
    this.element.style.padding = "20px";
    this.element.style.border = "solid rgb(50,50,50) 3px";
    this.element.style.borderRadius = "8px";
    this.element.style.backgroundColor = "white";
    this.element.style.fontFamily = "sans-serif";
    this.element.style.fontSize = "14px";
    this.element.style.top = "100%";

    this.minButton = document.createElement("span");
    this.minButton.textContent = "—";
    this.minButton.style.cursor = "pointer";
    this.minButton.style.position = "absolute";
    this.minButton.style.top = "-10px";
    this.minButton.style.left = "510px";
    this.minButton.style.fontSize = "30px";
    this.minButton.style.fontWeight = "bold";

    this.minButton.addEventListener(
      "click",
      this.toggleMinimize.bind(this, 1000)
    );

    this.element.id = "googleDocsCommentNavigator";
    this.subcomponents = subcomponents;
  }

  /**
   * renderSubcomponents renders content that's intended
   * to be dynamic. Can call after render() or
   * maximize(), for example.
   */
  public renderSubcomponents(): void {
    this.minimized = false;
    // Nothing more to render
    if (this.subcomponents == null) {
      return;
    }

    this.element.style.transform = "translate(-50%,-100%)";

    this.subcomponents.forEach((sc) => {
      this.element.appendChild(sc.render());
    });
  }

  /**
   * Adds the component to the context.
   */
  public render(context: HTMLElement): void {
    context.appendChild(this.element);
    this.element.appendChild(this.minButton);

    this.renderSubcomponents();
  }

  /**
   * Minimizes the element
   * @param {number} duration - the number of milliseconds to wait before
   * the element is fully minimized.
   * @param {()=>any} callback - a function to call after minimizing
   * the CommentNavigator.
   */
  public minimize(duration: number, callback?: () => any): void {
    this.minimized = true;
    this.element.style.transform = `translate(-50%,-${this.element.style.padding})`;

    // Destroy the subcomponents only after the element has minimized
    setTimeout(() => {
      this.subcomponents.forEach((sc) => {
        sc.destroy();
      });
      if (callback) {
        callback();
      }
    }, duration);
  }

  /**
   * toggleMinimize alternates between minimizing and maximizing
   * the CommentNavigator depending on its current state.
   * @param duration {number} the number of milliseconds it takes to
   * minimize
   */
  public toggleMinimize(duration: number) {
    if (this.minimized == false) {
      this.minimize(duration);
    } else {
      this.renderSubcomponents();
    }
  }

  /**
   * Updates the data within element without re-rendering.
   * @param fr FiltrationRecord. You'll need to apply
   * filters before calling refresh.
   */
  public refresh(fr: FiltrationRecord): void {
    this.subcomponents.forEach((sc) => {
      sc.refresh(fr);
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
        f = control.readFilters();
        return accum.concat(f);
      }, []),
      // Each NavigatorComponent is isolated from the others, so
      // we process ThreadCollections through all of them.
      "AND"
    );
  }
}
