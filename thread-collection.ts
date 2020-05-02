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
     * @param regexp the regexp as a string. This should start and
     * end with a solidus ("/") to please the validator.
     * See: https://github.com/mysticatea/regexpp/blob/3ab3e246ab990d5328aae69d3cf4013196e28301/src/validator.ts#L447
     */
    public filterByRegExp(regexp: string): Array<Element>{
        try{
            // The regexp will probably come straight
            // from user input. As a result, we validate it first.
            // This raises an error if the validation fails. See:
            // https://github.com/mysticatea/regexpp/blob/3ab3e246ab990d5328aae69d3cf4013196e28301/src/validator.ts#L438
            validateRegExpLiteral(regexp);
        }
        catch(error){
            console.log([
                "It looks like the regular expression you used in your search",
                "is invalid. You provided ",
                regexp,
                ". Maybe you forgot to add a '/' before and after the regexp?"
            ].join(""))
            // The caller probably can't do anything with the error, so return
            // an empty array.
            return [];
        }

        // JavaScript's builtin regexp parser doesn't use solidus characters,
        // so we remove them.
        const trimmedRe = regexp.match(/^\/(.*)\/$/)[1]

        console.log("trimmedRe", trimmedRe);

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
            console.log("re: %o", re);
            return re.test(lastBodyText);
        })
    }

}
