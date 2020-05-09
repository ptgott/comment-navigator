import { Filter } from "./filter";
import { ThreadCollection } from "../thread/thread-collection";

/**
 * FilterCollection is responsible for chaining filters
 * and reporting metadata about that chain.
 */
export class FilterCollection{

    public filters: Array<Filter>

    constructor(filters: Array<Filter>){
        // TODO: Validate input
        this.filters = filters;
    }

    /**
     * This is the function signature of Filter.use().
     * Theoretically you should be able to apply
     * a FilterChain and use the results to an
     * individual filter.
     */
    use(collection: ThreadCollection): ThreadCollection{

        let lastResult: ThreadCollection;

        // There's no special logic here: just apply each filter
        // to the ThreadCollection returned by the previous filter.
        for(let i = 0; i < this.filters.length; i++){
            if(!lastResult){
                lastResult = this.filters[i].use(collection);
            }
            else{
                lastResult = this.filters[i].use(lastResult);
            }
        }
        return lastResult;
    }

}
