import { CommentThread } from "../thread/comment-thread";
import { SelectedThreadFilter, Filter } from "../filter/filter";
import { FiltrationRecord } from "../filter/filtration-record";
import { ThreadCollection } from "../thread/thread-collection";

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

/**
 * NavButton is a button that changes the active thread.
 * Obvious uses are for a "previous" and "next" button that
 * move the user sequentially through a ThreadCollection, but
 * other implementations could, for example, bring the user
 * to a random thread, the next-most-commented thread, the final
 * or first thread in a ThreadCollection, and so on.
 *
 */
export class NavButton extends NavigatorControl {
  private nextTarget: (tc: ThreadCollection) => CommentThread;

  private targetThread: CommentThread;

  private element: HTMLElement;

  // Allows read-only access to the target thread
  public target(): CommentThread {
    return this.targetThread;
  }

  // Allows read-only access to the element
  public controlElement(): HTMLElement {
    return this.element;
  }

  /**
   *
   * @param targetFunc is a function that identifies the next thread
   * to navigate to. It accepts a ThreadCollection and returns a
   * CommentThread. Implementations may end up using
   * the SelectedThreadFilter(), but don't need to. Note that there's
   * no way to pass filters _into_ the NavButton--ThreadCollections
   * should already be filtered.
   */
  constructor(targetFunc: (tc: ThreadCollection) => CommentThread) {
    super();
    this.nextTarget = targetFunc;
  }

  public refresh(fr: FiltrationRecord): void {
    this.targetThread = this.nextTarget(fr.after);
  }

  public render(): HTMLElement {
    this.element = document.createElement("button");
    this.element.addEventListener("click", () => {
      // The clickable outer wrapper of the CommentThread element
      // is two levels of parentage up from the CommentThread element
      // and has the class ".docos-docoview-tesla-conflict"
      this.targetThread.element.parentElement.parentElement.dispatchEvent(
        new MouseEvent("click")
      );
    });
    return this.element;
  }
}

/** NextButton creates a NavButton that moves the user to the next
 * CommentThread in a sequence.
 */
export function NextButton(): NavButton {
  return new NavButton(
    (tc: ThreadCollection): CommentThread => {
      const selected = new SelectedThreadFilter().use(tc).elements[0];
      const i = tc.elements.indexOf(selected);
      return tc.elements[Math.min(tc.elements.length, i + 1)];
    }
  );
}

/** PrevButton navigates to CommentThread immediately before
 * the currently selected CommentThread.
 */
export function PrevButton(): NavButton {
  return new NavButton(
    (tc: ThreadCollection): CommentThread => {
      const selected = new SelectedThreadFilter().use(tc).elements[0];
      const i = tc.elements.indexOf(selected);
      return tc.elements[Math.max(0, i - 1)];
    }
  );
}

/** FirstButton navigates to the first CommentThread in a
 * ThreadCollection
 */
export function FirstButton(): NavButton {
  return new NavButton(
    (tc: ThreadCollection): CommentThread => {
      return tc.elements[0];
    }
  );
}

/** LastButton navigates to the final CommentThread in a
 * ThreadCollection
 */
export function LastButton(): NavButton {
  return new NavButton(
    (tc: ThreadCollection): CommentThread => {
      return tc.elements[Math.max(0, tc.elements.length - 1)];
    }
  );
}
