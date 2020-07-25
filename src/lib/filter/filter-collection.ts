import { Filter } from "./filter";
import { ThreadCollection } from "../thread/thread-collection";
import { CommentThread } from "../thread/comment-thread";

/**
 * Filterable is anything that can be used as a filter.
 * Both Filter and FilterCollection have a chainable use()
 * method that both accepts and returns a ThreadCollection.
 */
type Filterable = Filter | FilterCollection;

/**
 * FilterCollection is responsible for chaining filters
 * and reporting metadata about that chain.
 * @property {Filterable[]} filters - the filters in the collection
 */
export class FilterCollection {
  public filters: Array<Filterable>;

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
  constructor(filters: Array<Filterable>, booleanOperator: string) {
    const validBools = ["AND", "OR"];
    if (validBools.indexOf(booleanOperator) == -1) {
      throw new Error("Provided Boolean operator is not valid");
    }
    this.booleanOperator = booleanOperator;

    // TODO: Validate input
    this.filters = filters;
  }

  /**
   * useAnd is the variant of use() that only outputs a CommentThread
   * if all filters in the collection apply to it.
   * @param collection the ThreadCollection to apply the filters to.
   * @returns {ThreadCollection} the result of applying the filters
   */
  private useAnd(collection: ThreadCollection): ThreadCollection {
    // There's no special logic here: just apply each filter
    // to the ThreadCollection returned by the previous filter.
    return this.filters.reduce((accum, fc) => {
      return fc.use(accum);
    }, collection);
  }

  /** useOr is the variant of use() that outputs a CommentThread if
   * any of the filters in the collection apply to it.
   * @param collection the ThreadCollection to apply the filters to.
   * @returns {ThreadCollection} the result of applying the filters.
   */
  private useOr(collection: ThreadCollection): ThreadCollection {
    // Put the results of all filters in a single array. No filter
    // knows about the results of any other filter.
    let allThreads: Array<CommentThread> = this.filters.reduce(
      (accum: Array<CommentThread>, filter) => {
        return accum.concat(filter.use(collection).elements);
      },
      []
    );
    // Remove duplicate CommentThreads
    return new ThreadCollection([...new Set(allThreads)]);
  }

  /**
   * use applies the filter collection. Because individual
   * Filters also have this method, you should be able to
   * chain Filters and FilterCollections.
   * @param {ThreadCollection} collection - the ThreadCollection
   * to apply the filters to.
   * @returns {ThreadCollection} - the result of applying the filters
   */
  public use(collection: ThreadCollection): ThreadCollection {
    // Using a map to allow for simple expansion, but
    // if therere's no expansion we might be better off
    // using an if statement.
    const boolToFunc: Map<
      string,
      (tc: ThreadCollection) => ThreadCollection
    > = new Map();
    boolToFunc.set("AND", this.useAnd.bind(this));
    boolToFunc.set("OR", this.useOr.bind(this));

    return boolToFunc.get(this.booleanOperator)(collection);
  }
}
