// These are various CSS selectors used within Google Docs.
// Ideally, you should be able to fetch the relevant elements
// by calling QuerySelectorAll with one of them.

// The class used by all suggestion and comment thread elements.
// All children of this element are replies.
export const thread: string = ".docos-anchoreddocoview-content";

// The class of the element whose textContent indicates the author
// of a comment.
export const author: string = ".docos-anchoredreplyview-author.docos-author";

// Comment body text
export const commentBody: string = ".docos-replyview-body.docos-anchoredreplyview-body"

// This is a class of an element within the root reply of a
// suggestion thread.
export const suggestionThread: string = ".docos-replyview-suggest";

// This is a class of an element within the root reply of a
// comment thread.
export const commentThread: string = ".docos-replyview-first.docos-replyview-comment";