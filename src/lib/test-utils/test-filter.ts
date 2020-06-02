import { Filter } from "../filter/filter";
import { CommentThread } from "../thread/comment-thread";

/**
 * TestFilter is used to test code that depends on
 * the Filter class. It has minimal functionality in
 * order to promote separation of concerns within tests.
 */
export class TestFilter extends Filter {
  constructor(criterion: string) {
    // This is used for auditing by tests.
    super(criterion);
  }

  // matches() isn't actually implemented yet.
}
