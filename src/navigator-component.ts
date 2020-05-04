import { NavigatorControl, ThreadCount } from "./navigator-control"
import { ThreadCollection } from "./thread-collection"

/**
 * Represents the UI component for the comment navigator.
 * Note that it's up to the caller of the constructor
 * to also call refresh() and render(). This means that the
 * caller should call window.setInterval (or some other means)
 * to periodically refresh the state of the component.
 */
export class NavigatorComponent{

    /**
     * The HTML component itself.
     * render() adds it to the DOM.
     * refresh() updats its information without
     * re-rendering.
     */
    public element: HTMLElement;

    /**
     * For rendering and refreshing, NavigatorComponent
     * just calls render() or refresh() for each
     * subcomponent. NavigatorComponent doesn't know
     * if its subcomponents have children.
     */
    private subcomponents: Array<NavigatorControl>;

    constructor(){
        // Initialize subcomponents in the order they'll be rendered
        this.subcomponents = [
            new ThreadCount()
        ]
    }

    /**
     * Adds the component to the context.
     */
    public render(context: HTMLElement): void{
        context.appendChild(this.element);
        this.subcomponents.forEach(sc=>{
            this.element.appendChild(sc.render());
        })
    }

    /**
     * Removes the component from the document body
     */
    public destroy(): void {
        this.element.remove();
    }

    /**
     * Updates the data within element without re-rendering.
     * @param originalThreads An array of comment thread elements prior
     * to any filtering
     * @param filteredThreads An array of comment threads reflecting all
     * filters.
     * 
     * Components need to access both sets of comment threads to, for
     * example, allow navigation through filtered comment threads as
     * well as populate UI menu options with data from all available
     * comment threads.
     */
    private refresh(
        originalThreads: Array<Element>,
        filteredThreads: Array<Element>
        ): void {
        this.subcomponents.forEach(sc=>{
            sc.refresh(originalThreads, filteredThreads);
        })
    }
}