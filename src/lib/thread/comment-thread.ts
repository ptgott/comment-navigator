import { commentWithinThread, rootReply, thread } from "../constants/selectors";

/**
 * CommentThread represents one discussion component
 * in Google Docs.
 * @property {Element} element the HTML element associated
 * with the discussion. All direct children of this element
 * should be individual comments.
 * @property {number} pagePosition ordinal score for the
 * position of the CommentThread relative to other 
 * CommentThreads in the page, from top to bottom. Used
 * since we need to remember the original position of
 * a discussion after it's been resolved/deleted/etc.
 */
export class CommentThread {
  public element: Element;
  private pagePosition: number;

  /**
   * 
   * @param {Element} el the element containing the discussion thread
   * @param {HTMLElement} discussionContext the HTML element that is the 
   * immediate parent to all discussion threads in the document
   */
  constructor(el: Element, discussionContext: HTMLElement) {
    // TODO: Validate that the Element is actually
    // a CommentThread
    this.element = el;

    // We need to store the ordinal position of each CommentThread with the
    // CommentThread itself, since we need to keep track of where the previously
    // selected discussion was when no discussion is selected.
    // We can't calculate pagePosition from render-based properties like 
    // DOMRect.top or offsetTop, since we need this to work in our test 
    // environment as well (which won't always use a headless browser).
    this.pagePosition = [...discussionContext.querySelectorAll(thread)].indexOf(this.element);
  }

  /**
   * getPagePosition provides read-only access to this property
   */
  getPagePosition(): number {
    return this.pagePosition;
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
