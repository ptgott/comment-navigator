import { NavigatorControl, ThreadCount } from "./navigator-control";
import { FiltrationRecord } from "../filter/filtration-record";

/**
 * Represents the UI component for the comment navigator.
 * Note that it's up to the caller of the constructor
 * to also call refresh() and render(). This means that the
 * caller should call window.setInterval (or some other means)
 * to periodically refresh the state of the component.
 */
export class Navigator {
  /**
   * The HTML component itself.
   * render() adds it to the DOM.
   * refresh() updats its information without
   * re-rendering.
   */
  public element: HTMLElement;

  /**
   * For rendering and refreshing, Navigator
   * just calls render() or refresh() for each
   * subcomponent. Navigator doesn't know
   * if its subcomponents have children.
   */
  private subcomponents: Array<NavigatorControl>;

  constructor() {
    // Initialize subcomponents in the order they'll be rendered
    this.subcomponents = [new ThreadCount()];
  }

  /**
   * Adds the component to the context.
   */
  public render(context: HTMLElement): void {
    context.appendChild(this.element);
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
      sc.refresh(fr);
    });
  }
}
