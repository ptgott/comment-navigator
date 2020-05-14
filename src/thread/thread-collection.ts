import * as selectors from "../constants/selectors";
import { CommentThread } from "./comment-thread";

/**
 * ParseBodyForThreads is used to extract comment threads
 * from the document body. We create ThreadCollections this way
 * so we can parse the body periodically to check for updates.
 * There are other ways to create ThreadCollections too, such
 * as by using a Filter.
 * @param bod is the document body.
 */
export function ParseBodyForThreads(bod: HTMLBodyElement): ThreadCollection {
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
