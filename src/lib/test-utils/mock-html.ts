/**
 * The mock-html package generates HTML for unit tests. Previously,
 * we had be using a single static HTML file that mimicked the state
 * of a Google Doc. While this is okay for simple tests, it becomes
 * tricky when we need to test various conditions that might take
 * hold within the doc (e.g, a thread gets selected).
 */

/** CommentThreadOptions lets you design a comment thread, including
 * its first comment and any child comments.
 */
export interface CommentThreadOptions {
  author: string; // First comment author
  text: string; // First comment text
  replies: Array<ChildCommentOptions>;
  isActive?: boolean;
  isAssigned?: boolean; // We don't care right now who it's assigned to
}

/** SuggestionThreadOptions lets you design a suggestion thread,
 * including its first suggestion and any child comments
 */
export interface SuggestionThreadOptions {
  author: string; // First suggestion author
  text: string; // What happened in the suggestion thread (e.g., "Delete space")
  replies: Array<ChildCommentOptions>;
  isActive?: boolean;
}

/**
 * CommentOptions represents a child comment within a comment thread
 * or suggestion thread.
 */
export interface ChildCommentOptions {
  author: string;
  text: string;
}

/**
 * Creates the header element found within assigned comment threads. Some
 * notes about assigned threads in general:
 * 
 * - You can only assign within a comment thread (not a suggestion thread).
 * - You can only create new assignments from the root comment.
 * - If a discussion is assigned, you can re-assign it within any comment
 *   within the thread. (But you can't assign a discussion from any comment but
 *   the root comment.)
 * - There can only be one assignee.
 * - In assigned threads, the element with classes 
 *  `docos-anchoreddocoview-content docos-docoview-replycontainer` has a first child 
 *   with the class `docos-assigneeview docos-assignee-<other|you>`, rather than 
 *  `docos-docoview-rootreply`.
 * - In assigned threads, the first child of the element with class 
 * `docos-anchoreddocoview-internal` has the class 
 * `docos-anchoreddocoview-content docos-anchoreddocoview-assigneecontainer`,
 *  not `docos-anchoreddocoview-content docos-docoview-replycontainer`.
@param {CommentThreadOptions} options 
 */
export function AssigneeHeader(options: CommentThreadOptions): string {
  return `<div class="docos-assigneeview">
<table>
    <tbody>
    <tr>
        <td class="docos-assigneeview-avatar-container">
        <!--Omitting image-->
        </td>
        <td class="docos-assigneeview-assigneeinfo">
        <div class="docos-assigneeview-label">Assigned to</div>
        <div class="docos-assigneeview-assignee-text">
            ${options.author}
        </div>
        </td>
        <td class="hide-on-readonly">
        <div
            role="button"
            class="goog-inline-block jfk-button jfk-button-flat docos-mark-done-button docos-mark-done-button-black"
            tabindex="0"
            data-tooltip="Mark as done and hide discussion"
            aria-label='Mark as done and hide discussion."'
            style="user-select: none;"
        >
            <div
            class="docs-icon goog-inline-block docs-material docos-icon-checkmark docos-icon-accept-checkmark-size docos-icon-checkmark-black"
            >
            <div
                class="docs-icon-img-container docs-icon-img docs-icon-check-24"
                aria-hidden="true"
            ></div>
            </div>
        </div>
        </td>
    </tr>
    </tbody>
</table>
</div>`;
}

/**
 * MockChildComment Creates an HTML string for use with innerHTML.
 * Don't call this directly unless you really need to, since it's
 * properly wrapped in HTML when you call MockSuggestionThread()
 * or MockCommentThread().
 * @param options ChildCommentOptions
 */
export function MockChildComment(options: ChildCommentOptions): string {
  return `
<div class="docos-anchoredreplyview docos-replyview-comment">
    <div class="docos-anchoredreplyview-header">
        <div class="docos-anchoredreplyview-avatar-holder">
            <!--avatar image omitted-->
        </div>
        <div class="docos-anchoredreplyview-authortimestamp">
            <div class="docos-anchoredreplyview-author docos-author" data-hovercard-id="1111111111111111111111"
                data-name="${options.author}" data-hovercard-owner-id="91">${options.author}</div>
            <div class="docos-anchoredreplyview-timestamp docos-replyview-timestamp">7:51 PM May 1</div>
        </div>
        <div class="docos-anchoredreplyview-buttonholder hide-on-readonly">
            <div class="docos-overflowmenu-outer">
                <div class="goog-inline-block goog-menu-button docos-docomenu-dropdown goog-toolbar-menu-button"
                    role="button" aria-expanded="false" tabindex="0" aria-haspopup="true" data-tooltip="More options..."
                    aria-label="More options..." style="user-select: none;">
                    <div class="goog-inline-block goog-toolbar-menu-button-outer-box">
                        <div class="goog-inline-block goog-toolbar-menu-button-inner-box">
                            <div class="goog-inline-block goog-toolbar-menu-button-caption">
                                <div class="docos-icon goog-inline-block docos-icon-overflow-three-dots-size">
                                    <div class="docos-icon-img docos-icon-img-container docos-icon-overflow-three-dots docos-icon-img-hdpi"
                                        aria-hidden="true"></div>
                                </div>
                            </div>
                            <div class="goog-inline-block goog-toolbar-menu-button-dropdown">&nbsp;</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="docos-collapsible-replyview">
        <div class="docos-replyview-static">
            <div class="docos-replyview-body docos-anchoredreplyview-body" dir="ltr" style="text-align: left;">
                ${options.text}</div>
            <div class="docos-show-more" role="button" tabindex="0">Show more</div>
            <div class="docos-show-less" role="button" tabindex="0" style="display:none">Show less</div>
        </div>
    </div>
    <div class="docos-edit-pane-placeholder" style="display: none"></div>
    <div class="docos-replyview-origin docos-anchoredreplyview-origin" style="display: none;"></div>
</div>`;
}

/**
 * MockSuggestionThread creates an HTML string for use with innerHTML.
 * @param options SuggestionThreadOptions
 */
export function MockSuggestionThread(options: SuggestionThreadOptions): string {
  const activeClass = options.isActive == true ? "docos-docoview-active" : "";
  const concatenatedReplies: string = options.replies
    .map((reply) => {
      return MockChildComment(reply);
    })
    .join("\n");

  return `
<div class="docos-docoview-tesla-conflict docos-anchoreddocoview ${activeClass}" role="listitem"
    aria-label="Comments dialog. Open comment. Author ${options.author}. ${options.replies.length} replies."
    tabindex="0" style="left: -10px; top: 165px;">
    <div class="docos-anchoreddocoview-internal">
        <div class="docos-anchoreddocoview-content docos-docoview-replycontainer">
            <div class="docos-docoview-rootreply">
                <div class="docos-anchoredreplyview docos-replyview-first docos-replyview-suggest">
                    <div class="docos-anchoredreplyview-header">
                        <div class="docos-anchoredreplyview-avatar-holder">
                            <!--author image omitted-->
                            <div class="docos-user-presence" style="background-color: rgb(31, 161, 93);"></div>
                        </div>
                        <div class="docos-anchoredreplyview-authortimestamp">
                            <div class="docos-anchoredreplyview-author docos-author"
                                data-hovercard-id="1111111111111111111111" data-name="${options.author}"
                                data-hovercard-owner-id="91">${options.author}</div>
                            <div class="docos-anchoredreplyview-timestamp docos-replyview-timestamp">7:51 PM May 1</div>
                        </div>
                        <div class="docos-anchoredreplyview-buttonholder hide-on-readonly">
                            <div role="button"
                                class="goog-inline-block jfk-button jfk-button-flat docos-accept-suggestion jfk-button-collapse-right"
                                tabindex="0" aria-label="Accept suggestion" style="user-select: none;"
                                data-tooltip="Accept suggestion"><svg xmlns="http://www.w3.org/2000/svg" width="24"
                                    height="24">
                                    <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"></path>
                                </svg></div>
                            <div role="button"
                                class="goog-inline-block jfk-button jfk-button-flat docos-reject-suggestion jfk-button-collapse-left"
                                tabindex="0" aria-label="Reject suggestion" style="user-select: none;"
                                data-tooltip="Reject suggestion"><svg xmlns="http://www.w3.org/2000/svg" width="24"
                                    height="24">
                                    <path
                                        d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z">
                                    </path>
                                </svg></div>
                        </div>
                    </div>
                    <div class="docos-collapsible-replyview ">
                        <div class="docos-replyview-static">
                            <div class="docos-replyview-body docos-anchoredreplyview-body" dir="ltr"
                                style="text-align: left;">
                                <div style="font-size:13px;color:#333"><span
                                        style="font-weight:bold">${options.text}</span></div>
                            </div>
                            <div class="docos-show-more" role="button" tabindex="0">Show more</div>
                            <div class="docos-show-less" role="button" tabindex="0" style="display:none">Show less</div>
                        </div>
                    </div>
                    <div class="docos-replyview-origin docos-anchoredreplyview-origin" style="display: none;"></div>
                </div>
            </div>
            ${concatenatedReplies}
        </div>
        <div class="docos-input docos-docoview-input-pane docos-anchoreddocoview-input-pane hide-on-readonly"
            style="text-align: left;" dir="ltr"><textarea class="docos-input-textarea" autocomplete="input-area"
                x-webkit-speech="" speech="" role="combobox" aria-autocomplete="list" aria-label="Reply"></textarea>
            <div id="docos-input-assignment-panel" class="docos-input-assignment-panel" style="display: none"><span
                    class="jfk-checkbox goog-inline-block jfk-checkbox-unchecked docos-input-assignment-box docs-material-gm-checkbox docs-material-gm-checkbox-disabled"
                    role="checkbox" aria-checked="false" dir="ltr" aria-labelledby="dtex72:ww.lbl" aria-disabled="true"
                    style="user-select: none;">
                    <div class="jfk-checkbox-checkmark" role="presentation"></div>
                </span>
                <div class="docos-input-assignee-text" id="dtex72:ww.lbl">undefined</div>
                <div class="docos-input-assignee-select goog-inline-block goog-menu-button" role="listbox"
                    aria-expanded="false" tabindex="0" aria-haspopup="true" aria-activedescendant="dtex72:wv"
                    style="user-select: none;">
                    <div class="goog-inline-block goog-menu-button-outer-box">
                        <div class="goog-inline-block goog-menu-button-inner-box">
                            <div class="goog-inline-block goog-menu-button-caption" id="dtex72:wv" role="option"
                                aria-selected="true" aria-setsize="0" aria-posinset="0"></div>
                            <div class="goog-inline-block goog-menu-button-dropdown">&nbsp;</div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="docos-input-at-reply-message" style="display: none" id="dtex72:ws">Your +mention will add people
                to this discussion and send an email.</div>
            <div class="docos-input-acl-fixer-message" style="display: none" aria-live="polite" id="dtex72:wt">Making
                sure people you mentioned have access…</div>
            <div class="docos-input-assignment-message" style="display: none" id="dtex72:wu">The assigned person will be
                notified and responsible for marking as done.</div>
            <div class="docos-input-assign-to-text" style="display: none"></div>
            <div class="docos-focusedpresenceindicator-container"></div>
            <div class="docos-input-buttons">
                <div role="button"
                    class="goog-inline-block jfk-button jfk-button-action docos-input-post docos-input-buttons-post jfk-button-disabled"
                    aria-disabled="true" data-tooltip="Reply to comment" aria-label="Reply to comment"
                    style="user-select: none;">Reply</div>
                <div role="button" class="goog-inline-block jfk-button jfk-button-standard docos-input-cancel"
                    tabindex="0" data-tooltip="Discard comment" aria-label="Discard comment" style="user-select: none;">
                    Cancel</div>
            </div>
        </div>
        <div class="docos-unfocusedpresenceindicator-container"></div>
    </div>
</div>
    `;
}

/**
 * MockCommentThread creates an HTML string for use with innerHTML.
 * @param options CommentThreadOptions
 */
export function MockCommentThread(options: CommentThreadOptions): string {
  const activeClass = options.isActive == true ? "docos-docoview-active" : "";

  const concatenatedReplies: string = options.replies
    .map((reply) => {
      return MockChildComment(reply);
    })
    .join("\n");

  return `
<div class="docos-docoview-tesla-conflict docos-docoview-resolve-button-visible docos-anchoreddocoview ${activeClass}" role="listitem"
    aria-label="Comments dialog. Open comment. Author ${options.author}. ${
    options.replies.length
  } replies." tabindex="0"
    style="left: 25px; top: 105px;">
    <div class="docos-anchoreddocoview-internal">
        ${
          options.isAssigned
            ? '<div class="docos-anchoreddocoview-content docos-anchoreddocoview-assigneecontainer"></div>'
            : ""
        }
        <div class="docos-anchoreddocoview-content docos-docoview-replycontainer">
            ${options.isAssigned ? AssigneeHeader(options) : ""}
            <div class="docos-docoview-rootreply">
                <div class="docos-anchoredreplyview docos-replyview-first docos-replyview-comment">
                    <div class="docos-anchoredreplyview-header">
                        <div class="docos-anchoredreplyview-avatar-holder">
                            <!--avatar image omitted-->
                            <div class="docos-user-presence" style="background-color: rgb(31, 161, 93);"></div>
                        </div>
                        <div class="docos-anchoredreplyview-authortimestamp">
                            <div class="docos-anchoredreplyview-author docos-author"
                                data-hovercard-id="1111111111111111111111" data-name="${
                                  options.author
                                }"
                                data-hovercard-owner-id="91">${
                                  options.author
                                }</div>
                            <div class="docos-anchoredreplyview-timestamp docos-replyview-timestamp">7:50 PM May 1</div>
                        </div>
                        <div class="docos-anchoredreplyview-buttonholder hide-on-readonly">
                            <div role="button"
                                class="goog-inline-block jfk-button jfk-button-standard docos-replyview-resolve-button-original docos-replyview-resolve-button"
                                tabindex="0" data-tooltip="Mark as resolved and hide discussion"
                                aria-label="Mark as resolved and hide discussion" style="user-select: none;">Resolve
                            </div>
                            <div class="docos-overflowmenu-outer">
                                <div class="goog-inline-block goog-menu-button docos-docomenu-dropdown goog-toolbar-menu-button"
                                    role="button" aria-expanded="false" tabindex="0" aria-haspopup="true"
                                    data-tooltip="More options..." aria-label="More options..."
                                    style="user-select: none;">
                                    <div class="goog-inline-block goog-toolbar-menu-button-outer-box">
                                        <div class="goog-inline-block goog-toolbar-menu-button-inner-box">
                                            <div class="goog-inline-block goog-toolbar-menu-button-caption">
                                                <div
                                                    class="docos-icon goog-inline-block docos-icon-overflow-three-dots-size">
                                                    <div class="docos-icon-img docos-icon-img-container docos-icon-overflow-three-dots docos-icon-img-hdpi"
                                                        aria-hidden="true"></div>
                                                </div>
                                            </div>
                                            <div class="goog-inline-block goog-toolbar-menu-button-dropdown">&nbsp;
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="docos-collapsible-replyview">
                        <div class="docos-replyview-static">
                            <div class="docos-replyview-body docos-anchoredreplyview-body" dir="ltr"
                                style="text-align: left;">${options.text}</div>
                            <div class="docos-show-more" role="button" tabindex="0">Show more</div>
                            <div class="docos-show-less" role="button" tabindex="0" style="display:none">Show less</div>
                        </div>
                    </div>
                    <div class="docos-edit-pane-placeholder" style="display: none"></div>
                    <div class="docos-replyview-origin docos-anchoredreplyview-origin" style="display: none;"></div>
                </div>
            </div>
            ${concatenatedReplies}
        </div>
        <div class="docos-input-pane-placeholder" style="display: none"></div>
        <div class="docos-unfocusedpresenceindicator-container"></div>
    </div>
</div>
    `;
}
