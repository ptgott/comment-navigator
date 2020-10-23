import * as selectors from "../constants/selectors";
import { CommentThread } from "./comment-thread";

/**
 * ParseForThreads is used to extract comment threads
 * from the document. We create ThreadCollections this way
 * so we can parse the document periodically to check for updates.
 * There are other ways to create ThreadCollections too, such
 * as by using a Filter.
 * @param {HTMLElement} context is the immediate parent of each discussion element (i.e., the
 *  element that encloses all discussions)
 * @returns {ThreadCollection}
 */
export function ParseForThreads(context: HTMLElement): ThreadCollection {
  if(!context){
    // to avoid a slightly more mysterious error when we define discussionElements
    throw new Error("the context given to ParseForThreads is null or undefined");
  }

  const discussionElements = [...context.querySelectorAll(selectors.thread)];
  const threads: Array<CommentThread> = discussionElements.map((el) => {
    return new CommentThread(el, context);
  });
  return new ThreadCollection(threads);
}

/**
 * ThreadCollection represents the global the state of a Google Doc's
 * comment threads within the DOM at a particular moment.
 * @property {CommentThread[]} elements - the comment threads (including
 * those that begin with a suggestion) in this state of the document.
 */
export class ThreadCollection {
  public elements: Array<CommentThread>;

  /**
   * Create a new ThreadCollection to read the state of
   * a Google Doc's comment threads.
   * @param {CommentThread[]} elements - the CommentThreads to gather
   * within the ThreadCollection
   */
  constructor(elements: Array<CommentThread>) {
    // ensure elements are sorted with the highest Y coordinate first,
    // making earlier items in the list higher on the page.
    this.elements = elements.sort((a, b)=>{
      return a.getPagePosition() - b.getPagePosition();
    });
  }

  /**
   * finalCommentAuthorNames returns the names of all unique authors
   * who've written the final comments within comment threads.
   * @returns {Array<string>} - the names of the final authors within
   * each thread, as displayed within their comments.
   */
  finalCommentAuthorNames(): Array<string> {
    const allAuths = this.elements.map((el) => {
      return el.finalComment().querySelector(selectors.author).textContent;
    });
    return [...new Set(allAuths)]; // Get unique names but still return an array
  }

  /**
   * getSelectedThread returns the thread that is currently active.
   */
  getSelectedThread(): CommentThread {
    return this.elements.find((el) => {
      return el.element.parentElement.parentElement.matches(
        selectors.activeThread
      );
    });
  }

}
