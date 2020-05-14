import { CommentThread } from "../thread/comment-thread";
import { SelectedThreadFilter, Filter } from "../filter/filter";
import { FiltrationRecord } from "../filter/filtration-record";

/** Each NavigatorControl represents a single
 * switch/button/etc you can manipulate within
 * the UI.
 */
export class NavigatorControl {
  constructor() {}

  /**
   * This needs to return an HTMLElement so its parent
   * can append the element to the right place. Since
   * NavigatorControls can have child
   * NavigatorControls, it's not enough to have the parent
   * simply append the element.
   *
   * To share state with refresh(), it should probably
   * assign the returned element to an "element"
   * property or similar.
   */
  public render(): HTMLElement {
    throw new Error("render() is not implemented");
  }

  /**
   * Update any stateful data shown/handled within the component.
   * We apply the filters here so child components can access
   * the original ThreadCollection as well.
   * @param fr FiltrationRecord
   */
  public refresh(fr: FiltrationRecord): void {
    throw new Error("render() is not implemented");
  }
}

/** ThreadCount counts the number of comment threads.
 */
export class ThreadCount extends NavigatorControl {
  constructor() {
    super();
  }

  private element: HTMLElement;

  public render(): HTMLElement {
    this.element = document.createElement("span");
    return this.element;
  }

  public refresh(fr: FiltrationRecord): void {
    // This assumes the "before" in the FiltrationRecord is the original
    // ThreadCollection.
    this.element.textContent = `${fr.after.elements.length}/${fr.before.elements.length}`;
  }
}

/** NextButton navigates to CommentThread immediately after
 * the currently selected CommentThread.
 *
 * You'll need to call refresh() before using!
 */
export class NextButton extends NavigatorControl {
  constructor() {
    super();
  }

  private targetThread: CommentThread;

  private element: HTMLElement;

  public render(): HTMLElement {
    this.element = document.createElement("button");
    this.element.addEventListener("click", (ev) => {
      // The clickable outer wrapper of the CommentThread element
      // is two levels of parentage up from the CommentThread element
      // and has the class ".docos-docoview-tesla-conflict"
      this.targetThread.element.parentElement.parentElement.dispatchEvent(
        new MouseEvent("click")
      );
    });
    return this.element;
  }

  public refresh(fr: FiltrationRecord) {
    // SelectedThreadFilter should only return one element in its
    // ThreadCollection.
    const selected = new SelectedThreadFilter().use(fr.after).elements[0];
    const i = fr.after.elements.indexOf(selected);
    this.targetThread =
      fr.after.elements[Math.min(fr.after.elements.length, i + 1)];
  }
}

/** PrevButton navigates to CommentThread immediately before
 * the currently selected CommentThread.
 *
 * You'll need to call refresh() before using!
 *
 * TODO: This is nearly a complete copy of NextButton, so consider
 * refactoring once we have a better idea of what kind of
 * interface we want.
 */
export class PrevButton extends NavigatorControl {
  constructor() {
    super();
  }

  private targetThread: CommentThread;

  private element: HTMLElement;

  public render(): HTMLElement {
    this.element = document.createElement("button");
    this.element.addEventListener("click", (ev) => {
      // The clickable outer wrapper of the CommentThread element
      // is two levels of parentage up from the CommentThread element
      // and has the class ".docos-docoview-tesla-conflict"
      this.targetThread.element.parentElement.parentElement.dispatchEvent(
        new MouseEvent("click")
      );
    });
    return this.element;
  }

  public refresh(fr: FiltrationRecord): void {
    // SelectedThreadFilter should only return one element in its
    // ThreadCollection.
    const selected = new SelectedThreadFilter().use(fr.after).elements[0];
    const i = fr.after.elements.indexOf(selected);
    this.targetThread = fr.after.elements[Math.max(0, i - 1)];
  }
}
