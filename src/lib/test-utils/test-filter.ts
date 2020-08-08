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

  /**
   * matches does the bare minimum to satisfy the Filter interface.
   * It accepts all CommentThreads.
   */
  matches(): boolean {
    return true;
  }
}
