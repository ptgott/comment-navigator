import { commentWithinThread, rootReply } from "../constants/selectors"

export class CommentThread{
    public element: Element;
    
    constructor(el: Element){
        // TODO: Validate that the Element is actually
        // a CommentThread
        this.element = el;
    }

    public finalComment(): Element{
        const comments: Array<Element> = [...this.element.querySelectorAll(commentWithinThread)];
        if(comments.length == 0){
            // If there's no final comment, there will definitely
            // be a root reply.
            return this.element.querySelector(rootReply);
        }
        // This should be safe since we already know there are > 0 comments.
        return comments[comments.length - 1];
    }
}