import * as selectors from "../lib/constants/selectors";

// Global variables/functions used for debugging and running e2e tests.
// Indented to be run with a <script> tag from the HTML returned by the
// e2e test server.

// TODO: Converting the selector to a classname isn't great, since
// it assumes too much about what the active thread selector will
// be like. What if it changes to a set of multiple classnames,
// for example?
const activeClass = selectors.activeThread.replace(".", "");

// makeAllInactive deselects all comment threads. This reproduces
// the Google Docs behavior of deactivating all discussions when you click
// outside of them
(window as any).makeAllInactive = function(){ 
  [...document.body.querySelectorAll(selectors.thread)].forEach((cst) => {
    cst.parentElement.parentElement.classList.remove(activeClass);
  });
 };

// Add a global makeActive function so we can manipulate
// which thread containers are active
(window as any).makeActive = function (threadElement: HTMLElement) {
  // Make all comment/suggestion threads as inactive, then
  // activate the chosen thread. This is probably not how
  // Google Docs does it, but it's close enough for our
  // purposes.
  // @ts-ignore since this will be a global variable
  window.makeAllInactive(); 
  threadElement.parentElement.parentElement.classList.add(activeClass);
};



// As long as we aren't adding any comment/suggestion thread
// elements, we should be able to add an event listener to each
// thread at one time individually.
[...document.body.querySelectorAll(selectors.thread)].forEach((ts) => {
  ts.parentElement.parentElement.addEventListener("click", () => {
    // @ts-ignore since this function will have been declared
    // earlier
    window.makeActive(ts);
  });
});

document.body.addEventListener('click', ()=>{
  // @ts-ignore since this function will have been declared
  // earlier
  window.makeAllInactive();
}, true); // useCapture set to true to prevent overriding other click listeners

// Google Docs sets the height of the document body to window.innerHeight
// and the element enclosing discussion threads to a bit less than
// innerHeight. We reproduce this here to test scrolling more accurately.
document.body.style.height = window.innerHeight + "px";
(document.querySelector(
  selectors.discussionScrollContext
) as HTMLElement).style.height = `${window.innerHeight - 100}px`;

// Delete a discussion thread that has been resolved.
document.querySelectorAll("div.docos-replyview-resolve-button-original").forEach(el=>{
  (el as HTMLElement).style.cursor = "pointer";
  el.addEventListener('click', (e: MouseEvent)=>{
    (e.target as HTMLElement)
    .parentElement // div.docos-anchoredreplyview-buttonholder.hide-on-readonly
    .parentElement // div.docos-anchoredreplyview-header
    .parentElement // div.docos-anchoredreplyview.docos-replyview-first.docos-replyview-comment
    .parentElement // div.docos-docoview-rootreply
    .parentElement // div.docos-anchoreddocoview-content.docos-docoview-replycontainer
    .parentElement // div.docos-anchoreddocoview-internal
    .parentElement // div.docos-docoview-tesla-conflict.docos-docoview-resolve-button-visible.docos-anchoreddocoview
    .remove();
  })
})

// Delete a discussion that has been accepted or rejected
document.querySelectorAll("div.docos-accept-suggestion,div.docos-reject-suggestion").forEach(el=>{
  (el as HTMLElement).style.cursor = "pointer";
  el.addEventListener('click', e=>{
    (e.target as HTMLElement)
    .parentElement // svg
    .parentElement // div.docos-anchoredreplyview-buttonholder.hide-on-readonly
    .parentElement // div.docos-anchoredreplyview-header
    .parentElement // div.docos-anchoredreplyview.docos-replyview-first.docos-replyview-suggest
    .parentElement // div.docos-docoview-rootreply
    .parentElement // div.docos-anchoreddocoview-content.docos-docoview-replycontainer
    .parentElement // div.docos-anchoreddocoview-internal
    .parentElement // div.docos-docoview-tesla-conflict.docos-anchoreddocoview
    .remove();
  })
})
