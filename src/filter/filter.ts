import { validateRegExpLiteral } from "regexpp"

import { CommentThread } from "../thread/comment-thread";
import { ThreadCollection } from "../thread/thread-collection";
import * as selectors from "../constants/selectors";

/**
 * Filter represents a technique of filtering CommentThreads.
 * It includes metadata about the filter as well as a
 * use() method to do the actual filtering.
 * 
 * Child classes should only _need_ to implement matches(),
 * plus any supporting functions.
 */
export class Filter {

    public criterion: string;

    // We initialize a filter with a criterion so callers
    // can use that criterion when determining the context
    // in which a filter was called.
    constructor(criterion: string){
        this.criterion = criterion;
    }

    /**
     * This is the meat of each Filter implementation. It checks
     * a given CommentThread against the criterion. The return 
     * value indicates whether the thread matches.
     * @param thread the CommentThread to evaluate for a match
     */
    matches(thread: CommentThread): boolean{
        throw new Error("Not implemented")
    }

    /**
     * use both accepts and returns a ThreadCollection to allow chaining.
     * @param collection a ThreadCollection
     */
    public use(collection: ThreadCollection): ThreadCollection{
        return new ThreadCollection(collection.elements.reduce((accum, thread) =>{
            if (this.matches(thread)){
                accum.push(thread);
            }
            return accum;
        }, []))
    }
}

/**
 * filterByAuthor returns the comment thread elements whose
 * final comments were written by the author with the given
 * name. This is usually a string of the format 
 * "<FIRST_NAME> <LAST_NAME"
 */
export class FinalCommentAuthorNameFilter extends Filter{
    /**
     * 
     * @param criterion is the name of the author
     */
    constructor(criterion: string){
        super(criterion);
    }

    matches(thread: CommentThread): boolean{
        return thread.finalComment().querySelector(selectors.author).textContent == this.criterion;
    }
}

/**
 * SuggestionsFilter shows only comment threads that accompany
 * suggestions.
 */
export class SuggestionsFilter extends Filter{
    constructor(){
        super(null); // Doesn't use any user-defined criteria
    }

    matches(thread: CommentThread): boolean{
        const suggestion: Element = thread.element.querySelector(selectors.suggestionThread);
        return suggestion !== null
    }
}

export class CommentsFilter extends Filter{
    constructor(){
        super(null);
    }

    matches(thread: CommentThread): boolean{
        const commentEls: Element = thread.element.querySelector(selectors.commentThread);
        return commentEls !== null;
    }
}

/**
 * RegexpBodyFilter checks _all_ comments in a CommentThread
 * for whether the body text matches a given regular expression.
 * If there's at least one match, it allows that CommentThread.
 * 
 * A user might be looking for all comments responding to a TODO
 * note, for example, so it's important to check all comments in
 * each thread.
 */
export class RegexpBodyFilter extends Filter{

    /**
     * filterTextByRegExp returns the thread elements whose final 
     * comments match the given regexp. 
     * @param regexp is a standard ECMAscript regexp, with or without
     * a solidus pair ("//")
     * 
     * Note that while the standard library RegExp constructor
     * expects strings _not_ to include the solidus ("/"),
     * the validation function _does_.
     * See: https://github.com/mysticatea/regexpp/blob/3ab3e246ab990d5328aae69d3cf4013196e28301/src/validator.ts#L447
     */
    constructor(regexp: string){
        super(regexp)
    }

    matches(thread: CommentThread): boolean{
        // Handle an empty regexp as though it matches everything.
        // No user would enter an empty filter to match nothing.
        if (this.criterion == "//" || this.criterion == ""){
            return true;
        }

        // regexp may include a solidus pair. trimmedRe never does.
        let trimmedRe: string;

        // By this point, we already know the regexp has a length
        // of at least one.
        if (this.criterion[0] == "/" && this.criterion[this.criterion.length-1]){
            trimmedRe = this.criterion.match(/^\/(.*)\/$/)[1];
        }
        else {
            trimmedRe = this.criterion;
        }

        try{
            // The regexp will probably come straight
            // from user input. As a result, we validate it first,
            // making sure it includes a solidus pair.
            // This raises an error if the validation fails. See:
            // https://github.com/mysticatea/regexpp/blob/3ab3e246ab990d5328aae69d3cf4013196e28301/src/validator.ts#L438
            validateRegExpLiteral(`/${trimmedRe}/`);
        }
        catch(error){
            // The caller probably can't do anything with the error, so 
            // reject the thread here.
            return false;
        }
    
        const bodyTextElements: Array<Element> = [...thread.element.querySelectorAll(selectors.commentBody)];
        
        // Is there no text to search?
        if(bodyTextElements == null || bodyTextElements.length == 0){
            return false;
        }
        
        const re = new RegExp(trimmedRe);

        // For each thread element, check whether any comment body text
        // matches the regexp.
        return bodyTextElements.some(el=>{
            return re.test(el.textContent);
        });

    }

}

// SelectedThreadFilter returns the thread that is currently active.
// It's only really useful in the contex of another ThreadCollection.
// We're inheriting from Filter rather than making this a method of
// ThreadCollection because it fits the Filter interface well.
// If this approach starts to get messy, though, we should make
// this a method of ThreadCollection before it's too late. 
export class SelectedThreadFilter extends Filter {
    constructor(){
        super(null);
    }

    matches(thread: CommentThread): boolean{
        // The active thread class is assigned to the element two
        // parent levels up from the CommentThread's element.
        return thread.element.parentElement.parentElement.classList.contains(selectors.activeThread);
    }
}