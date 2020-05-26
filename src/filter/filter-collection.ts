import { Filter } from "./filter";
import { ThreadCollection } from "../thread/thread-collection";
import { CommentThread } from "../thread/comment-thread";

/**
 * FilterCollection is responsible for chaining filters
 * and reporting metadata about that chain.
 */
export class FilterCollection {
  public filters: Array<Filter>;

  private booleanOperator: string;

  /**
   *
   * @param filters An array of Filters to apply to a given
   * ThreadCollection.
   * @param booleanOperator a string. If it's "AND", the
   * FilterCollection only accepts CommentThreads if all filters
   * in the collection apply. If it's "OR", the FilterCollection
   * only accepts CommentThreads if any filter in the collection applies.
   */
  constructor(filters: Array<Filter>, booleanOperator: string) {
    const validBools = ["AND", "OR"];
    if (validBools.indexOf(booleanOperator) == -1) {
      throw new Error("Provided Boolean operator is not valid");
    }
    this.booleanOperator = booleanOperator;

    // TODO: Validate input
    this.filters = filters;
  }

  /**
   * The variant of use() that only outputs a CommentThread
   * if all filters in the collection apply to it.
   * @param collection the ThreadCollection to apply the filters to.
   */
  private useAnd(collection: ThreadCollection): ThreadCollection {
    let lastResult: ThreadCollection;

    // There's no special logic here: just apply each filter
    // to the ThreadCollection returned by the previous filter.
    for (let i = 0; i < this.filters.length; i++) {
      if (!lastResult) {
        lastResult = this.filters[i].use(collection);
      } else {
        lastResult = this.filters[i].use(lastResult);
      }
    }
    return lastResult;
  }

  /** The variant of use() that outputs a CommentThread if
   * any of the filters in the collection apply to it.
   * @param collection the ThreadCollection to apply the filters to.
   */
  private useOr(collection: ThreadCollection): ThreadCollection {
    // Put the results of all filters in a single array. No filter
    // knows about the results of any other filter.
    let allThreads: Array<CommentThread> = this.filters.reduce(
      (accum, filter) => {
        return accum.concat(filter.use(collection).elements);
      },
      []
    );
    // Remove duplicate CommentThreads
    return new ThreadCollection([...new Set(allThreads)]);
  }

  /**
   * This is the function signature of Filter.use().
   * Theoretically you should be able to apply
   * a FilterChain and use the results to an
   * individual filter.
   */
  public use(collection: ThreadCollection): ThreadCollection {
    const boolToFunc: Map<
      string,
      (tc: ThreadCollection) => ThreadCollection
    > = new Map();
    boolToFunc.set("AND", this.useAnd.bind(this));
    boolToFunc.set("OR", this.useOr.bind(this));

    return boolToFunc.get(this.booleanOperator)(collection);
  }
}
