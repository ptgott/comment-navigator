import { CommentThread } from "../thread/comment-thread";
import {
  Filter,
  FinalCommentAuthorNameFilter,
  RegexpBodyFilter,
  CommentsFilter,
  SuggestionsFilter,
} from "../filter/filter";
import { FiltrationRecord } from "../filter/filtration-record";
import { FilterCollection } from "../filter/filter-collection";

/** NavigatorControl represents a single
 * switch/button/etc you can manipulate within
 * the UI.
 * @property {HTMLElement} wrapper - the outermost element
 * within the UI component. We should be able to manage
 * all other elements in the UI component by referring to
 * its wrapper.
 */
export abstract class NavigatorControl {
  abstract wrapper: HTMLElement;

  constructor() {}

  /**
   * render produces the DOM element that does the work of the
   * NavigatorControl.
   * @returns {HTMLElement} - the control component, which you'll
   * add to the DOM later.
   */
  public abstract render(): HTMLElement;

  /**
   * readFilters finds out which Filters a user
   * has selected from the NavigatorControl's elements.
   * @returns {FilterCollection}
   */
  public abstract readFilters(): FilterCollection;

  /**
   * refresh updates any stateful data shown/handled within the component.
   * We apply the filters here so child components can access
   * the original ThreadCollection as well.
   * @param {FiltrationRecord} fr
   * @param {CommentThread} prevSelectedIndex The position of the previously
   * selected comment thread within all threads in the doc, ordered by
   * appearance on the page.
   */
  public abstract refresh(
    fr: FiltrationRecord,
    prevSelectedIndex?: number
  ): void;

  /**
   * destroy removes the NavigatorControl from the DOM. It's meant to
   * be reversed via render() while still preserving the
   * NavigatorControl in memory.
   */
  public destroy(): void {
    this.wrapper.remove();
  }
}

/** ThreadCount counts the number of comment threads.
 */
export class ThreadCount extends NavigatorControl {
  constructor() {
    super();
  }

  wrapper: HTMLElement;

  public render(): HTMLElement {
    this.wrapper = document.createElement("span");
    this.wrapper.id = "commentThreadCount";
    this.wrapper.style.fontSize = "1.2em";
    this.wrapper.style.fontWeight = "900";
    this.wrapper.style.display = "inline-block";
    this.wrapper.style.verticalAlign = "middle";
    this.wrapper.style.marginRight = "10px";
    return this.wrapper;
  }

  public refresh(fr: FiltrationRecord): void {
    // This assumes the "before" in the FiltrationRecord is the original
    // ThreadCollection.
    this.wrapper.textContent = `${fr.after.elements.length}/${fr.before.elements.length} discussions shown`;
  }

  public readFilters(): FilterCollection {
    // Returns no filters since it's not an input
    return new FilterCollection([], "AND");
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
  private nextTarget: (fr: FiltrationRecord) => CommentThread;

  private text: string; // For display and direction data attribute

  private targetThread: CommentThread;

  wrapper: HTMLElement;

  // Allows read-only access to the target thread
  public target(): CommentThread {
    return this.targetThread;
  }

  // Allows read-only access to the element
  public controlElement(): HTMLElement {
    return this.wrapper;
  }

  /**
   * @param {string} text - the display text of the button
   * @param targetFunc is a function that identifies the next thread
   * to navigate to. It accepts a ThreadCollection and returns a
   * CommentThread. Implementations may end up using
   * the SelectedThreadFilter(), but don't need to. Note that there's
   * no way to pass filters _into_ the NavButton--ThreadCollections
   * should already be filtered.
   */
  constructor(
    text: string,
    targetFunc: (fr: FiltrationRecord) => CommentThread
  ) {
    super();
    this.text = text;
    this.nextTarget = targetFunc;
  }

  public refresh(fr: FiltrationRecord): void {
    this.targetThread = this.nextTarget(fr);
  }

  public render(): HTMLElement {
    this.wrapper = document.createElement("button");
    this.wrapper.textContent = this.text;
    this.wrapper.dataset.direction = this.text;

    this.wrapper.style.marginTop = "10px";
    this.wrapper.style.marginRight = "5px";
    this.wrapper.style.width = "80px";
    this.wrapper.style.height = "30px";

    this.wrapper.addEventListener("click", () => {
      // this.targetThread can become undefined if the user has resolved, accepted,
      // or rejected all discussions that match the filter criteria.
      if (this.targetThread) {
        // The clickable outer wrapper of the CommentThread element
        // is two levels of parentage up from the CommentThread element
        // and has the class ".docos-docoview-tesla-conflict"
        this.targetThread.element.parentElement.parentElement.dispatchEvent(
          new MouseEvent("click")
        );
      }
    });
    return this.wrapper;
  }

  public readFilters(): FilterCollection {
    // Returns no filters since it's not an input
    return new FilterCollection([], "AND");
  }

  /**
   * startingDiscussionForNavigation returns the CommentThread to take as a reference
   * when navigating. Makes no assumptions about the direction in which the user
   * will navigate. Returns undefined if there is no current or previously active
   * discussion.
   * @param {FiltrationRecord}
   * @returns {CommentThread}
   * */
  public static startingDiscussionForNavigation(
    fr: FiltrationRecord
  ): CommentThread {
    let selected = fr.after.getSelectedThread();

    if (selected) {
      return selected;
    }

    // If the user has just navigated to the Google Doc and entered
    // search criteria, we won't have a reference point for navigation.
    // Leave it to the caller to decide where to go.
    if (!fr.previouslySelectedDiscussion) {
      return undefined;
    }

    // If there's no currently selected discussion but there is a previously
    // selected one, return the previous one, even if it doesn't match all the
    // filters--we'll let the caller determine how to handle this.
    return fr.previouslySelectedDiscussion;
  }
}

/** NextButton creates a NavButton that moves the user to the next
 * CommentThread in a sequence.
 */
export function NextButton(): NavButton {
  return new NavButton(
    "Next",
    (fr: FiltrationRecord): CommentThread => {
      const selected = NavButton.startingDiscussionForNavigation(fr);

      // no element to navigate from
      if (!selected || !fr.after.elements[0]) {
        return fr.after.elements[0]; // okay if this is undefined
      }

      // find the CommentThread in fr.after.elements that has a pagePosition
      // closest to--and after--that of the selected element.
      const targetPos = selected.getPagePosition();

      const discussionsAfter = fr.after.elements.filter((el) => {
        // If you resolve/remove a discussion, the next discussion
        // will have the same pagePosition as the previously selected one.
        // We want to be able to select the next discussion in such a case.
        // We determine equivalence based on each discussion's element property,
        // since the discussion itself will have been created anew during the refresh
        // cycle.
        return (
          el.element !== selected.element && el.getPagePosition() >= targetPos
        );
      });

      // In this sort function, the smallest page position comes earlier
      // in the array.
      const discussionToNavigateTo = discussionsAfter.sort((a, b) => {
        return a.getPagePosition() - b.getPagePosition();
      })[0];
      // If there's nowhere to go, stay put
      if (!discussionToNavigateTo) {
        return selected;
      }

      return discussionToNavigateTo;
    }
  );
}

/** PrevButton navigates to CommentThread immediately before
 * the currently selected CommentThread.
 */
export function PrevButton(): NavButton {
  return new NavButton(
    "Previous",
    (fr: FiltrationRecord): CommentThread => {
      const selected = NavButton.startingDiscussionForNavigation(fr);

      // no element to navigate from
      if (!selected || !fr.after.elements[0]) {
        return fr.after.elements[0]; // okay if this is undefined
      }

      // find the CommentThread in fr.after.elements that has a pagePosition
      // closest to--and prior to--that of the selected element.
      const targetPos = selected.getPagePosition();

      const discussionsBefore = fr.after.elements.filter((el) => {
        // If you resolve/remove a discussion, the next discussion
        // will have the same pagePosition as the previously selected one.
        // We want to be able to select the previous discussion in such a case.
        // We determine equivalence based on each discussion's element property,
        // since the discussion itself will have been created anew during the refresh
        // cycle.
        return (
          el.element !== selected.element && el.getPagePosition() <= targetPos
        );
      });

      // In this sort function, the smallest page position comes earlier
      // in the array.
      const discussionToNavigateTo = discussionsBefore.sort((a, b) => {
        return a.getPagePosition() - b.getPagePosition();
      })[Math.max(discussionsBefore.length - 1, 0)];

      // If there's nowhere to go, stay put
      if (!discussionToNavigateTo) {
        return selected;
      }

      return discussionToNavigateTo;
    }
  );
}

/** FirstButton navigates to the first CommentThread in a
 * ThreadCollection
 */
export function FirstButton(): NavButton {
  return new NavButton(
    "First",
    (fr: FiltrationRecord): CommentThread => {
      return fr.after.elements[0];
    }
  );
}

/** LastButton navigates to the final CommentThread in a
 * ThreadCollection
 */
export function LastButton(): NavButton {
  return new NavButton(
    "Last",
    (fr: FiltrationRecord): CommentThread => {
      return fr.after.elements[Math.max(0, fr.after.elements.length - 1)];
    }
  );
}

/**
 * AuthorSelectBox allows users to choose which authors
 * to use for filtering CommentThreads. It also shows
 * all the authors who have written final comments within
 * CommentThreads.
 */
export class AuthorSelectBox extends NavigatorControl {
  wrapper: HTMLDivElement;
  private input: HTMLSelectElement;

  constructor() {
    super();
  }

  public render(): HTMLElement {
    const outerWidth = 200;
    // the wrapper for the select box and
    // related elements
    this.wrapper = document.createElement("div");
    this.wrapper.style.width = `${outerWidth}px`;
    this.wrapper.style.display = "inline-block";

    // the select box itself
    this.input = document.createElement("select");
    this.input.setAttribute("multiple", "true");
    // A size of 3 allows for the most efficient use of space
    // within the main navigator
    this.input.setAttribute("size", "3");
    this.input.name = "authorSelectBox";
    this.input.style.width = `${outerWidth - 10}px`;

    // label for the select box
    const label = document.createElement("label");
    label.textContent = "Filter by the final author in each discussion";
    label.setAttribute("for", this.input.name);
    label.style.display = "block";
    label.style.marginBottom = "10px";

    this.wrapper.appendChild(label);
    this.wrapper.appendChild(this.input);
    return this.wrapper;
  }

  public refresh(fr: FiltrationRecord): void {
    // We don't want the refresh to erase author selections.
    // Record which authors are selected for later. However,
    // since author selections determine which authors
    // are final authors, we also need to preserve _unselected_
    // author names.
    const selectableAuthorNames = [...this.input.options].map((opt) => {
      return {
        name: opt.textContent,
        selected: opt.selected,
      };
    }, []);

    // If we derive currentAuthorNames from fr.after, then
    // only the selected name will appear in the list of options.
    const currentAuthorNames = fr.before.finalCommentAuthorNames();

    // Delete any author names that aren't in the current threads.
    selectableAuthorNames.forEach((an) => {
      // The name is not within the current author names
      if (currentAuthorNames.indexOf(an.name) == -1) {
        // Delete the name
        const i = selectableAuthorNames.indexOf(an);
        selectableAuthorNames.splice(Math.max(i, 0), 1);
      }
    });

    // Go through the current current threads and see if we need
    // to add any new ones to authorNames.
    currentAuthorNames.forEach((newName) => {
      // Is the new name actually a previous name?
      const match = selectableAuthorNames.find((oldNameObj) => {
        return oldNameObj.name == newName;
      });
      // Is the new name missing from the list of old names?
      if (match == undefined) {
        selectableAuthorNames.push({ name: newName, selected: false });
      }
    });

    // Clear it all and start over for simplicity.
    // If this is too resource-heavy we can delete author name elements
    // selectively and add only new ones.
    this.input.innerHTML = "";

    selectableAuthorNames.forEach((an) => {
      let opt = document.createElement("option");
      opt.textContent = an.name;
      opt.value = an.name;

      // Preserve author selection status from the last refresh
      // cycle.
      opt.selected = an.selected;
      this.input.appendChild(opt);
    });
  }

  public readFilters(): FilterCollection {
    const opts = this.input.getElementsByTagName("option");
    const selectedAuthors: Array<Filter> = [...opts].reduce((accum, opt) => {
      if (opt.selected == true) {
        return accum.concat(new FinalCommentAuthorNameFilter(opt.textContent));
      }
      return accum;
    }, []);

    // Selecting no authors should count as selecting all authors--
    // no one wants to deselect all comments.
    if (selectedAuthors.length == 0) {
      selectedAuthors.push(new FinalCommentAuthorNameFilter(""));
    }
    // Since the final comment in each thread has only a single author,
    // it doesn't make sense to apply multiple filters here. Show all
    // authors that pass through one FinalCommentAuthorNameFilter.
    return new FilterCollection(selectedAuthors, "OR");
  }
}

/**
 * RegexpSearchBox is a text input that lets users
 * enter regular expressions for searching the body of
 * comments in the document.
 */
export class RegexpSearchBox extends NavigatorControl {
  wrapper: HTMLElement;
  private textInput: HTMLInputElement;

  constructor() {
    super();
  }

  /**
   * render returns a div containing an input box and its label
   */
  public render(): HTMLElement {
    this.wrapper = document.createElement("div");
    this.wrapper.style.display = "inline-block";
    this.wrapper.style.verticalAlign = "top";
    this.wrapper.style.width = "200px";

    this.textInput = document.createElement("input");
    this.textInput.setAttribute("type", "text");
    this.textInput.setAttribute("name", "regexpSearch");
    this.textInput.setAttribute("autocomplete", "off");

    const label = document.createElement("label");
    label.innerText = "Search by JS regular expression";
    label.style.display = "block";
    label.style.marginBottom = "10px";

    label.setAttribute("for", "regexpSearch");
    this.wrapper.appendChild(label);
    this.wrapper.appendChild(this.textInput);
    return this.wrapper;
  }

  public readFilters(): FilterCollection {
    return new FilterCollection(
      // We leave it to RegexpBodyFilter to handle unexpected
      // user input.
      [new RegexpBodyFilter(this.textInput.value)],
      // The Boolean operator is notional--so far RegexpSearchBox
      // returns a single Filter.
      "AND"
    );
  }

  /**
   * refresh is no-op here because nothing changes
   * about the input box as the user applies filters.
   */
  public refresh(fr: FiltrationRecord) {
    return;
  }
}

/**
 * ThreadTypeCheckBoxes enable the user to see only
 * comment or suggestion threads by clicking on checkboxes.
 */
export class ThreadTypeCheckBoxes extends NavigatorControl {
  /**
   * boxRules determines how many check boxes to include, one
   * per item in the map. The string is used for DOM presentation.
   * The Filter constructor shouldn't take any arguments. If
   * the box is checked, we use the filter.
   */
  private boxRules: Map<string, Filter>;

  /**
   * A div containing checkboxes. When we refer to element, we
   * shouldn't assume how many checkboxes it contains.
   */
  wrapper: HTMLElement;

  constructor() {
    super();
    this.boxRules = new Map();
    this.boxRules.set("Comments", new CommentsFilter());
    this.boxRules.set("Suggestions", new SuggestionsFilter());
  }

  public render(): HTMLElement {
    this.wrapper = document.createElement("div");
    this.wrapper.style.display = "inline-block";
    this.wrapper.style.width = "100px";
    this.wrapper.style.verticalAlign = "top";
    this.wrapper.style.marginLeft = "10px";
    this.wrapper.style.marginRight = "10px";

    const description = document.createElement("span");
    description.textContent = "Show only:";
    description.style.display = "block";
    description.style.marginBottom = "10px";
    this.wrapper.appendChild(description);

    this.boxRules.forEach((filter, name) => {
      let el = document.createElement("input");
      el.setAttribute("type", "checkbox");
      el.setAttribute("name", name);
      let lab = document.createElement("label");
      lab.setAttribute("for", name);
      lab.innerText = name;

      this.wrapper.appendChild(el);
      this.wrapper.appendChild(lab);
    });
    return this.wrapper;
  }

  public readFilters(): FilterCollection {
    const checks: Array<HTMLInputElement> = [
      ...this.wrapper.getElementsByTagName("input"),
    ];

    let filters: Array<Filter> = checks.reduce((accum, check) => {
      if (check.checked == true) {
        return accum.concat(this.boxRules.get(check.name));
      }
      return accum;
    }, []);

    // If no checkboxes are checked, we treat all of them
    // as checked and return all filters, since
    // users probably won't want to select no threads at all.
    if (filters.length == 0) {
      filters = [...this.boxRules].map((rule) => {
        return rule[1];
      });
    }
    // You can't search for comments within suggestions or vice
    // versa, so we need to make this an "OR" relationship.
    return new FilterCollection(filters, "OR");
  }

  /**
   * refresh is no-op here because nothing changes
   * about the input box as the user applies filters.
   * @param {FiltrationRecord} fr
   */
  public refresh(fr: FiltrationRecord) {
    return;
  }
}
