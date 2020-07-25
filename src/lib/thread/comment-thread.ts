import { commentWithinThread, rootReply } from "../constants/selectors";

/**
 * CommentThread represents one discussion component
 * in Google Docs.
 * @property {Element} element - the HTML element associated
 * with the discussion. All direct children of this element
 * should be individual comments.
 */
export class CommentThread {
  public element: Element;

  constructor(el: Element) {
    // TODO: Validate that the Element is actually
    // a CommentThread
    this.element = el;
  }

  /**
   * finalComment returns the DOM element associated
   * with the final reply in a given thread. Could also
   * include the root comment/suggestion if there are no
   * replies.
   * @returns {Element} the final reply
   */
  public finalComment(): Element {
    const comments: Array<Element> = [
      ...this.element.querySelectorAll(commentWithinThread),
    ];
    if (comments.length == 0) {
      // If there's no final comment, there will definitely
      // be a root reply.
      return this.element.querySelector(rootReply);
    }
    // This should be safe since we already know there are > 0 comments.
    return comments[comments.length - 1];
  }
}
