import {validateRegExpLiteral} from "regexpp"

/**
 * Used to read the state of a Google Doc's comment threads 
 * from the DOM.
 * Most methods are filters, which process user input and
 * return an array of comment thread elements. We should 
 * assume that if there's an error processing the input,
 * the filter will return an empty array. Bad queries lead to
 * no results, not error messages.
 */
export class ThreadCollection {

    public elements: Array<Element>
    
    /**
     * Create a new ThreadCollection to read the state of 
     * a Google Doc's comment threads.
     * @param bod The body element within a Google Doc's HTML
     */
    constructor(bod: HTMLBodyElement){
        // The class used by all suggestion and comment thread elements.
        // All children of this element are replies.
        const threadClass = "docos-anchoreddocoview-content"

        this.elements = [...bod.getElementsByClassName(threadClass)]
    }

    /**
     * filterByAuthor returns the comment thread elements whose
     * final comments were written by the author with the given
     * name. This is usually a string of the format 
     * "<FIRST_NAME> <LAST_NAME"
     * @param name 
     */
    filterByAuthor(name: string): Array<Element>{
        // The class of the element whose text content indicates the author
        // of a comment.
        const AUTHOR_CLASS = ".docos-anchoredreplyview-author.docos-author";
        return this.elements.filter(el =>{
            // Assumes that the final author element in the comment thread
            // indicates the author of the final, unanswered comment.
            const authorElements: Array<Element> = [...el.querySelectorAll(`${AUTHOR_CLASS}`)]
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

        const commentBodySelector = ".docos-replyview-body.docos-anchoredreplyview-body"
        // For each thread element, filter to the final text element that
        // matches the regexp.
        return this.elements.filter(el =>{
            const bodyTextElements: Array<Element> = [...el.querySelectorAll(commentBodySelector)];
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
        // This is a class of an element within the root reply of a
        // suggestion thread.
        const suggestionSelector = ".docos-replyview-suggest";
        return this.elements.filter(el =>{
            const suggestionEls: Element = el.querySelector(suggestionSelector);
            return suggestionEls !== null;
        })
    }

    /**
     * filterToComments shows only comment threads that accompany
     * comments.
     */
    public filterToComments(): Array<Element>{
        // This is a class of an element within the root reply of a
        // suggestion thread.
        const commentSelector = "docos-replyview-comment";
        return this.elements.filter(el =>{
            const suggestionEls: Element = el.querySelector(commentSelector);
            return suggestionEls !== null;
        })
    }

}
