import { ThreadCollection } from "../thread/thread-collection";
import { FilterCollection } from "./filter-collection";

/**
 * FiltrationRecord contains information about
 * the filtering of ThreadCollections. UI componets
 * use it to get information about the ThreadCollections
 * processed through a FilterCollection without mutating
 * any of these other classes.
 *
 * FiltrationRecord publishes metadata _about_ a filtration
 * without callers having to re-apply the filters.
 * @property {ThreadCollection} before - the state of discussions
 * in the document prior to applying the filters
 * @property {ThreadCollection} after - the state of discussions
 * in the document after applying the filters
 * @property {FilterCollection} filters - the filters to apply
 */
export class FiltrationRecord {
  public before: ThreadCollection;
  public after: ThreadCollection;
  public filters: FilterCollection;

  /**
   *
   * @param before ThreadCollection prior to applying
   * the filters
   * @param after ThreadCollection after applying the
   * filters
   * @param filters The filters applied to "before"
   */
  constructor(
    before: ThreadCollection,
    after: ThreadCollection,
    filters: FilterCollection
  ) {
    // TODO: Determine whether to perform validation here
    this.before = before;
    this.after = after;
    this.filters = filters;
  }
}
