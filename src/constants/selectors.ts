// These are various CSS selectors used within Google Docs.
// Ideally, you should be able to fetch the relevant elements
// by calling querySelectorAll with one of them.

// The class used by all suggestion and comment thread elements.
// All children of this element are replies.
export const thread: string = ".docos-anchoreddocoview-content";

// The class of the element whose textContent indicates the author
// of a comment.
export const author: string = ".docos-anchoredreplyview-author.docos-author";

// Comment body text
export const commentBody: string =
  ".docos-replyview-body.docos-anchoredreplyview-body";

// This is a class of an element within the root reply of a
// suggestion thread.
export const suggestionThread: string = ".docos-replyview-suggest";

// This is a class of an element within the root reply of a
// comment thread, **used to distinguish comment threads
// from suggestion threads**.
// For a general comment thread, use the "thread" selector.
export const commentThread: string =
  ".docos-replyview-first.docos-replyview-comment";

// A comment element within a comment thread
export const commentWithinThread: string = ".docos-replyview-comment";

// The first comment in every thread, including comments indicating
// that there's been a suggestion.
export const rootReply: string = ".docos-docoview-rootreply";

// The currently selected comment thread. Note that the element with
// this class is two parentage levels above the thread selector.
export const activeThread: string = ".docos-docoview-active";
