/** Each NavigatorControl represents a single
 * switch/button/etc you can manipulate within
 * the UI.
 */
export class NavigatorControl{

    constructor(){}

    /**
     * This needs to return an HTMLElement so its parent
     * can append the element to the right place. Since
     * NavigatorControls can have child 
     * NavigatorControls, it's not enough to have the parent
     * simply append the element.
     * 
     * To share state with refresh(), it should probably
     * assign the returned element to an "element"
     * property or similar.
     */
    public render(): HTMLElement{
        throw new Error("render() is not implemented");
    }

    /**
     * Update any stateful data shown/handled within the component.
     * @param originalThreads An array of comment thread elements prior
     * to any filtering
     * @param filteredThreads An array of comment threads reflecting all
     * filters.
     */
    public refresh(originalThreads: Array<Element>, 
        filteredThreads: Array<Element>): void{
        throw new Error("render() is not implemented");
    }
}

/** ThreadCount counts the number of comment threads.
 */
export class ThreadCount extends NavigatorControl{
    constructor(){
        super();
    }

    private element: HTMLElement;

    public render(): HTMLElement{
        this.element = document.createElement("span");        
        return this.element;
    }

    public refresh(
        originalThreads: Array<Element>,
        filteredThreads: Array<Element>
    ): void{
        this.element.textContent = `${filteredThreads.length}/${originalThreads.length}`
    }
}