import { NavigatorControl } from "./navigator-control";
import { FiltrationRecord } from "../filter/filtration-record";
import { FilterCollection } from "../filter/filter-collection";
import { ParseForThreads } from "../thread/thread-collection";

/**
 * CommentNavigator represents the UI component for the
 * comment navigator. Note that it's up to the caller of the constructor
 * to also call refresh() and render(). This means that the
 * caller should call window.setInterval (or some other means)
 * to periodically refresh the state of the component.
 *
 * @property {HTMLElement} element - The HTML component itself.
 * @property {HTMLElement} minButton - Component used for minimizing the navigator
 * @property {HTMLElement} context - the Comment Navigator will render itself
 * as a child of this element, and search this element for discussion threads.
 */
export class CommentNavigator {
  public element: HTMLElement;
  public context: HTMLElement;
  public minButton: HTMLElement;
  public minimized: boolean;
  private refreshInterval: number;

  /**
   * previouslySelectedThreadIndex is the zero-based position of the previously
   * selected comment thread within all threads in the document, ordered from
   * first to last displayed.
   * We need to store this so users can deselect all discussion threads in
   * the doc but continue navigating where it would be reasonable, without
   * having to go back to the beginning of the doc.
   */
  previouslySelectedThreadIndex: number;

  /**
   * For rendering and refreshing, CommentNavigator
   * just calls render() or refresh() for each
   * subcomponent. CommentNavigator doesn't know
   * if its subcomponents have children.
   */
  private subcomponents: Array<NavigatorControl>;

  /**
   *
   * @param {Array<NavigatorControl>} subcomponents are the NavigatorControls to
   * render within the CommentNavigator. These will be
   * rendered in the order given in the array.
   * @param {number} refreshInterval how often to parse the DOM, apply
   * filters, and update the NavigatorControl
   */
  constructor(subcomponents: Array<NavigatorControl>, refreshInterval: number) {
    this.refreshInterval = refreshInterval;

    this.element = document.createElement("div");

    // Set style properties that won't change between
    // rendering states.
    this.element.style.transitionProperty = "transform";
    this.element.style.transitionDuration = "1s";
    // Width at which elements wrap appropriately
    this.element.style.width = "535px";
    this.element.style.position = "fixed";
    this.element.style.left = "50%";
    // To make room for absolutely positioned elements at the top
    this.element.style.padding = "30px 15px 15px 15px";
    this.element.style.border = "solid rgb(50,50,50) 3px";
    this.element.style.borderRadius = "8px 8px 0px 0px";
    this.element.style.backgroundColor = "white";
    this.element.style.fontFamily = "sans-serif";
    this.element.style.fontSize = "14px";
    this.element.style.top = "100%";
    this.element.style.boxShadow = "rgba(0, 0, 0, 0.75) 3px 0px 10px -5px";

    // Make sure the element is visible above the z-index
    // used for content within Google Docs.
    this.element.style.zIndex = "10000";

    this.minButton = document.createElement("span");
    this.minButton.textContent = "—";
    this.minButton.style.cursor = "pointer";
    this.minButton.style.position = "absolute";
    this.minButton.style.top = "-10px";
    this.minButton.style.left = "532px";
    this.minButton.style.fontSize = "30px";
    this.minButton.style.fontWeight = "bold";

    this.minButton.addEventListener(
      "click",
      this.toggleMinimize.bind(this, refreshInterval)
    );

    document.addEventListener("keydown", (ev) => {
      if (ev.key === "Escape") {
        this.minimize(refreshInterval);
      }
    });

    this.element.id = "googleDocsCommentNavigator";
    this.subcomponents = subcomponents;
  }

  /**
   * renderSubcomponents renders content that's intended
   * to be dynamic. Can call after render() or
   * maximize(), for example.
   */
  public renderSubcomponents(): void {
    if (!this.subcomponents) {
      // This error shouldn't ever reach users
      throw new Error("The Navigator has null or undefined subcomponents.");
    }

    this.subcomponents.forEach((sc) => {
      this.element.appendChild(sc.render());
    });
  }

  /**
   * render adds the component to the context.
   * @param {HTMLElement} context - where to append the component
   */
  public render(context: HTMLElement): void {
    const minimizeHint = document.createElement("span");
    minimizeHint.textContent = "Esc to minimize";
    minimizeHint.style.fontStyle = "italic";
    minimizeHint.style.fontSize = ".8em";
    minimizeHint.style.position = "absolute";
    minimizeHint.style.top = "2px";
    minimizeHint.style.left = "7px";
    minimizeHint.style.width = "100px";

    this.context = context;
    context.appendChild(this.element);
    this.element.appendChild(minimizeHint);
    this.element.appendChild(this.minButton);

    this.renderSubcomponents();

    // Begin with the component minimized by default. Don't animate
    // the minimization since it's the first sight of the component.
    this.minimize(0);

    this.readAndRefresh();

    // Start the readAndRefresh loop
    window.setInterval(() => {
      this.readAndRefresh();
    }, this.refreshInterval);
  }

  /**
   * readAndRefresh goes through one full update cycle of the
   * CommentNavigator. It parses the context for discussion threads,
   * filters them with filters from the component, and uses the filters
   * to refresh the Comment Navigator.
   *
   * You should call render() first, otherwise readAndRefresh will throw
   * an exception.
   *
   * Intended to be used with window.setInterval.
   */
  public readAndRefresh(): void {
    const threadsBefore = ParseForThreads(this.context);
    // Take this from threadsBefore since a thread can be filtered out
    // but still selected.
    const st = threadsBefore.getSelectedThreadIndex();

    if (st >= 0) {
      this.previouslySelectedThreadIndex = st;
    }

    const fc = this.readFilters();
    const threadsAfter = fc.use(threadsBefore);
    this.refresh(
      new FiltrationRecord(threadsBefore, threadsAfter, fc),
      this.previouslySelectedThreadIndex
    );
  }

  /**
   * maximize brings the navigator component to full visibility
   * and renders subcomponents.
   */
  public maximize(): void {
    this.minimized = false;
    this.element.style.transform = "translate(-50%,-100%)";
  }

  /**
   * minimize minimizes the element, letting the user see more of the
   * document.
   * @param {number} duration - the number of milliseconds to wait before
   * the element is fully minimized.
   * @param {()=>any} callback - a function to call after minimizing
   * the CommentNavigator.
   */
  public minimize(duration: number, callback?: () => any): void {
    this.minimized = true;
    this.element.style.transform = `translate(-50%,-${this.element.style.paddingTop})`;

    // Destroy the subcomponents only after the element has minimized
    // TODO: The duration isn currently defined independently of the actual
    // duration used in the CSS transition on the "translate" property
    setTimeout(() => {
      if (callback) {
        callback();
      }
    }, duration);
  }

  /**
   * toggleMinimize alternates between minimizing and maximizing
   * the CommentNavigator depending on its current state.
   * @param {number} duration the number of milliseconds it takes to
   * minimize
   */
  public toggleMinimize(duration: number) {
    if (this.minimized == false) {
      this.minimize(duration);
    } else {
      this.maximize();
    }
  }

  /**
   * refresh updates the data within element without re-rendering.
   * @param {FiltrationRecord} fr You'll need to apply
   * filters before calling refresh.
   * @param {CommentThread} prevSelectedIndex The position of the previously
   * selected comment thread within all threads in the doc, ordered by
   * appearance on the page.
   */
  public refresh(fr: FiltrationRecord, prevSelectedIndex?: number): void {
    this.subcomponents.forEach((sc) => {
      sc.refresh(fr, prevSelectedIndex);
    });
  }

  /**
   * readFilters read NavigatorControls for user-selected filter options.
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
