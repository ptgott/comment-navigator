import * as selectors from "../lib/constants/selectors";

// Global variables/functions used for debugging and running e2e tests

// Add a global makeActive function so we can manipulate
// which thread containers are active
(window as any).makeActive = function (threadElement: HTMLElement) {
  // TODO: Converting the selector to a classname isn't great, since
  // it assumes too much about what the active thread selector will
  // be like. What if it changes to a set of multiple classnames,
  // for example?
  const activeClass = selectors.activeThread.replace(".", "");
  // Make all comment/suggestion threads as inactive, then
  // activate the chosen thread. This is probably not how
  // Google Docs does it, but it's close enough for our
  // purposes.
  [...document.body.querySelectorAll(selectors.thread)].forEach((cst) => {
    cst.parentElement.parentElement.classList.remove(activeClass);
  });
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
