// These are various CSS selectors used within Google Docs.
// Ideally, you should be able to fetch the relevant elements
// by calling querySelectorAll with one of them.

/**
 * The class used by all suggestion and comment thread elements.
 * All children of this element are replies. Note that
 * in assigned threads, the first child element after
 * <div class="docos-anchoreddocoview-internal">
 * has the classes "docos-anchoreddocoview-content" and
 * "docos-anchoreddocoview-assigneecontainer", so we just use
 * the second classname here.
 */
export const thread: string = ".docos-docoview-replycontainer";

/**
 * The scrollable element containing discussion threads in Google Docs.
 * Note that the document body is not actually scrollable--its height
 * is set to window.innerHeight and its overflow to "hidden." However,
 * discussionScrollContext has a visible overflow. Google Docs sets
 * its height to slightly less than window.innerHeight.
 */
export const discussionScrollContext: string = ".kix-appview-editor";

/**
 * The class of the element whose textContent indicates the author
 * of a comment.
 */
export const author: string = ".docos-anchoredreplyview-author.docos-author";

/**
 * Comment body text
 */
export const commentBody: string =
  ".docos-replyview-body.docos-anchoredreplyview-body";

/**
 * This is a class of an element within the root reply of a
 * suggestion thread.
 */
export const suggestionThread: string = ".docos-replyview-suggest";

/**
 * This is a class of an element within the root reply of a
 * comment thread, **used to distinguish comment threads from
 * suggestion threads**. For a general comment thread, use
 * the "thread" selector.
 */
export const commentThread: string =
  ".docos-replyview-first.docos-replyview-comment";

/**
 * A comment element within a comment thread
 */
export const commentWithinThread: string = ".docos-replyview-comment";

/**
 * The first comment in every thread, including comments indicating that
 * there's been a suggestion.
 */
export const rootReply: string = ".docos-docoview-rootreply";

/**
 * The currently selected comment thread. Some things to note:
 *
 *  - This class is two parents above the thread selector.
 *
 *  - This class isn't the only differentiator between active
 *    and inactive threads. The position of the thread element
 *    changes, and CSS IDs of child elements within the thread
 *    ("dcs-img-<INTEGER>") change as well. Finally, an input
 *    field becomes visible when the thread is active, and
 *    invisible when not.
 *
 *  - About that input field: Google Docs lazy-loads this. When you
 *    first visit the page, the element looks like this:
 *
 *    ```
 *    <div class="docos-input-pane-placeholder" style="display: none;"></div>
 *    ```
 *
 *    When you click on a thread, it becomes this:
 *
 *    ```
 *    <div class="docos-input docos-docoview-input-pane docos-anchoreddocoview-input-pane hide-on-readonly">[...]</div>
 *    ```
 *
 * Regardless of lazy loading, inactive threads _always_ lack
 * this class, and active threads _always_ contain it. This is why
 * we use this class to indicate active threads. And when mocking
 * active threads, we simulate adding and removing this class,
 * rather than the more complex input field behavior (which is out
 * of the scope of this add-on).
 *
 */
export const activeThread: string = ".docos-docoview-active";

/**
 * The selector describing the outermost wrapper div for a comment or suggestion
 * thread
 */
export const conversationWrapper: string = ".docos-docoview-tesla-conflict";
