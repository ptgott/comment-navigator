import { CommentNavigator } from "./lib/ui/comment-navigator";
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

// The script is designed to use the "@run-at document-end" user script header
// which runs on or after the the DOMContentLoaded event was dispatched.
// https://www.tampermonkey.net/documentation.php#_run_at
(() => {
  const waitTimeMs = 100;

  const n = new CommentNavigator(
    [
      new ThreadCount(),
      new AuthorSelectBox(),
      new ThreadTypeCheckBoxes(),
      new RegexpSearchBox(),
      FirstButton(),
      PrevButton(),
      NextButton(),
      LastButton(),
    ],
    waitTimeMs
  );
  n.render(document.body);
})();
