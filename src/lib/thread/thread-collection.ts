import * as selectors from "../constants/selectors";
import { CommentThread } from "./comment-thread";

/**
 * ParseForThreads is used to extract comment threads
 * from the document body. We create ThreadCollections this way
 * so we can parse the body periodically to check for updates.
 * There are other ways to create ThreadCollections too, such
 * as by using a Filter.
 * @param bod is the document body.
 */
export function ParseForThreads(bod: HTMLElement): ThreadCollection {
  const elements: Array<Element> = [...bod.querySelectorAll(selectors.thread)];
  const threads: Array<CommentThread> = elements.map((el) => {
    return new CommentThread(el);
  });
  return new ThreadCollection(threads);
}

/**
 * Used to read the state of a Google Doc's comment threads
 * from the DOM and provide metadata about all the
 * comment threads at once.
 *
 * Use CommentThread to return metadata for a specific
 * thread. Use Filter when you want to return a subset of
 * threads.
 */
// TODO: consider renaming ThreadCollection to something more
// descriptive of what this is and why you'd use it.
// Maybe ThreadState or something similar Or GlobalThreadState?
export class ThreadCollection {
  public elements: Array<CommentThread>;

  /**
   * Create a new ThreadCollection to read the state of
   * a Google Doc's comment threads.
   * @param elements An array of CommentThreads, created
   * through various means.
   */
  constructor(elements: Array<CommentThread>) {
    this.elements = elements;
  }

  /**
   * orderByAppearanceInPage orders the elements array
   * according to where each CommentThread appears in the DOM
   * in relation to its sibling CommentThreads. This is to prevent
   * the elements array from losing the original sequence
   * of its CommentThreads to, for example, enable
   * navigation.
   */
  orderByAppearanceInPage(): void {
    // TODO: We may also consider adding other orderBy... functions
    // for qualities like body text length and number of replies.
    // TODO: consider having this output a ThreadCollection, rather than
    // mutating the original ThreadCollection, for more predictable
    // code.
    const threadsOnPage = [...document.body.querySelectorAll(selectors.thread)];
    this.elements = this.elements.sort((a, b) => {
      const indexA = threadsOnPage.indexOf(a.element);
      const indexB = threadsOnPage.indexOf(b.element);
      return indexA - indexB;
    });
  }

  /**
   * authorNames returns the names of all unique authors
   * who've written the final comments within comment threads.
   */
  finalCommentAuthorNames(): Array<string> {
    const allAuths = this.elements.map((el) => {
      return el.finalComment().querySelector(selectors.author).textContent;
    });
    return [...new Set(allAuths)]; // Get unique names but still return an array
  }
}
