import { validateRegExpLiteral } from "regexpp"
import * as selectors from "./selectors"

/**
 * filterFunc is the signature for filters used
 * in ThreadCollection
 */
type filterFunc = (input?: string)=>Array<Element>

/**
 * Used to read the state of a Google Doc's comment threads 
 * from the DOM.
 * 
 * Most methods are filters, which process user input and
 * return an array of comment thread elements. We should 
 * assume that if there's an error processing the input,
 * the filter will return an empty array. Bad queries lead to
 * no results, not error messages.
 * 
 * Note that each filter differs just enough in terms of filter
 * criteria--and logic preceding the filter--that it doesn't make
 * sense yet to refactor filters into a generic filterBy(selector)
 * function. I.e. the selector has bearing on the logic of the function.
 */
export class ThreadCollection {

    public elements: Array<Element>
    
    /**
     * Create a new ThreadCollection to read the state of 
     * a Google Doc's comment threads.
     * @param bod The body element within a Google Doc's HTML
     */
    constructor(bod: HTMLBodyElement){
        this.elements = [...bod.querySelectorAll(selectors.thread)]
    }

    /**
     * authorNames returns the names of all unique authors
     * who've written the final comments within comment threads.
     */
    finalCommentAuthorNames(): Array<string> {
        const allAuths = this.elements.map(el =>{
            // Assumes that the final author element in the comment thread
            // indicates the author of the final, unanswered comment.
            const authorElements: Array<Element> = [...el.querySelectorAll(selectors.author)]
            return authorElements[authorElements.length - 1].textContent;
        })
        return [...new Set(allAuths)] // Get unique names but still return an array
    }

    /**
     * filterByAuthor returns the comment thread elements whose
     * final comments were written by the author with the given
     * name. This is usually a string of the format 
     * "<FIRST_NAME> <LAST_NAME"
     * @param name 
     */
    public filterByAuthor(name: string): Array<Element>{
        return this.elements.filter(el =>{
            // Assumes that the final author element in the comment thread
            // indicates the author of the final, unanswered comment.
            const authorElements: Array<Element> = [...el.querySelectorAll(selectors.author)]
            return authorElements[authorElements.length - 1].textContent == name;
        })
    }

    /**
     * filterTextByRegExp returns the thread elements whose final 
     * comments match the given regexp. The regexp is a standard
     * ECMAscript regexp. 
     * @param regexp the regexp as a string. 
     * 
     * Note that while the standard library RegExp constructor
     * expects strings _not_ to include the solidus ("/"),
     * the validation function _does_. This method will accept
     * a string with or without a solidus pair.
     * See: https://github.com/mysticatea/regexpp/blob/3ab3e246ab990d5328aae69d3cf4013196e28301/src/validator.ts#L447
     */
    public filterByRegExp(regexp: string): Array<Element>{
        // Handle an empty regexp as though it matches everything.
        // No user would enter an empty filter to match nothing.
        if (regexp == "//" || regexp == ""){
            return this.elements;
        }
        
        // regexp may include a solidus pair. trimmedRe never does.
        let trimmedRe: string;
        // By this point, we already know the regexp has a length
        // of at least one.
        if (regexp[0] == "/" && regexp[regexp.length-1]){
            trimmedRe = regexp.match(/^\/(.*)\/$/)[1];
        }
        else {
            trimmedRe = regexp;
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
            // The caller probably can't do anything with the error, so return
            // an empty array.
            return [];
        }

        // For each thread element, filter to the final text element that
        // matches the regexp.
        return this.elements.filter(el =>{
            const bodyTextElements: Array<Element> = [...el.querySelectorAll(selectors.commentBody)];
            if(bodyTextElements == null || bodyTextElements.length == 0){
                return false;
            }
            const lastBodyText: string = bodyTextElements[bodyTextElements.length - 1].textContent
            const re = new RegExp(trimmedRe);
            return re.test(lastBodyText);
        })
    }

    /**
     * filterToSuggestions shows only comment threads that accompany
     * suggestions.
     */
    public filterToSuggestions(): Array<Element>{
        return this.elements.filter(el =>{
            const suggestionEls: Element = el.querySelector(selectors.suggestionThread);
            return suggestionEls !== null;
        })
    }

    /**
     * filterToComments shows only comment threads that accompany
     * comments.
     */
    public filterToComments(): Array<Element>{
        return this.elements.filter(el =>{
            const commentEls: Element = el.querySelector(selectors.commentThread);
            return commentEls !== null;
        })
    } 

    /**
     * chain handles multiple filter functions. The alternative would be to
     * implement chaining by making the input type of each filter be
     * the same as its output type, allowing successive method calls.
     * But since the ThreadCollection stores its elements in a property,
     * we can't take these elements as an input. Plus, chain() allows us
     * to implement standard logic between each "link" of the chain.
     * 
     * @param filters an array of tuples. The first element
     *  is a ThreadCollection.filter*() function. The second element is its input.
     * 
     * TODO: Rather than the ornate tuple used as a pararm, consider
     * an array of filterFuncs called with args using bind().
     */
    public chain(filters: Array<[filterFunc, any]>): Array<Element>{
        return filters.reduce((accum, filter)=>{
            const results: Array<Element> = filter[0].call(this,filter[1]);

            // Don't find a set intersection is the accumulator is empty.
            // Instead, populate it with the results of the filter.
            if(accum.length == 0){
                return results;
            }

            const newEls: Set<Element> = new Set(results);
            const intersection: Set<Element> = new Set(
                accum.filter(el => { return newEls.has(el)})
            );

            return [...intersection];

        }, [])
    }

}
