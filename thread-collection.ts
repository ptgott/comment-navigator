export class ThreadCollection {

    public elements: Array<Element>

    constructor(bod: HTMLBodyElement){
        // The class used by all suggestion and comment thread elements.
        // All children of this element are replies.
        const threadClass = "docos-anchoreddocoview-content"

        this.elements = [...bod.getElementsByClassName(threadClass)]
    }

    filterByAuthor(name: string): Array<Element>{
        // The class of the element whose text content indicates the author
        // of a comment.
        const AUTHOR_CLASS = "docos-anchoredreplyview-author docos-author"
        return this.elements.filter(el =>{
            // Assumes that the final author element in the comment thread
            // indicates the author of the final, unasnwered comment.
            return el.querySelector(`${AUTHOR_CLASS}:last-child`)
        })
    }

}
