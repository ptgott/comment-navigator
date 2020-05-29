import { CommentNavigator } from "./ui/comment-navigator";
import { ParseForThreads } from "./thread/thread-collection";
import { FiltrationRecord } from "./filter/filtration-record";
import { FilterCollection } from "./filter/filter-collection";

const n = new CommentNavigator();
n.render(document.body);

/**
 * In a loop:
 *   - Read the menus of the navigator
 *   - Apply the filters to create a FiltrationRecord
 *   - Refresh the navigator
 */
while (true) {
  const threadsBefore = ParseForThreads(document.body);
  const fc = n.readFilters();
  const threadsAfter = fc.use(threadsBefore);
  n.refresh(new FiltrationRecord(threadsBefore, threadsAfter, fc));
  // TODO: This needs to sleep
}
