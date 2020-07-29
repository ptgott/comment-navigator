import { CommentNavigator } from "./lib/ui/comment-navigator";
import { ParseForThreads } from "./lib/thread/thread-collection";
import { FiltrationRecord } from "./lib/filter/filtration-record";
import {
  ThreadCount,
  NextButton,
  PrevButton,
  AuthorSelectBox,
  RegexpSearchBox,
  ThreadTypeCheckBoxes,
  FirstButton,
  LastButton,
} from "./lib/ui/navigator-control";

// TODO: Move this into a library
function readAndRefresh(n: CommentNavigator) {
  const threadsBefore = ParseForThreads(document.body);
  const fc = n.readFilters();
  const threadsAfter = fc.use(threadsBefore);
  n.refresh(new FiltrationRecord(threadsBefore, threadsAfter, fc));
}

// The script is designed to use the "@run-at document-end" user script header
// which runs on or after the the DOMContentLoaded event was dispatched.
// https://www.tampermonkey.net/documentation.php#_run_at
(() => {
  const waitTimeMs = 100;

  const n = new CommentNavigator([
    new ThreadCount(),
    new AuthorSelectBox(),
    new ThreadTypeCheckBoxes(),
    new RegexpSearchBox(),
    FirstButton(),
    PrevButton(),
    NextButton(),
    LastButton(),
  ]);
  n.render(document.body);
  readAndRefresh(n);

  /**
   * In a loop:
   *   - Read the menus of the navigator
   *   - Apply the filters to create a FiltrationRecord
   *   - Refresh the navigator
   */
  window.setInterval(() => {
    readAndRefresh(n);
  }, waitTimeMs);
})();
