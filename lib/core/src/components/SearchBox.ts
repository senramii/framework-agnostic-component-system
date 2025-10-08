import { DebouncedObservable, Observable } from "../states";

export class SearchBox {
  private searchQuery: DebouncedObservable<string>;
  private isFetching: Observable<boolean>;
  private mountedInstance: {
    wrapperElement: HTMLDivElement;
    unsubscribeIsFetching: (() => void);
    unsubscribeQueryWarning: (() => void);
  } | null;

  constructor(searchQuery: DebouncedObservable<string>, isFetching: Observable<boolean>) {
    this.searchQuery = searchQuery;
    this.isFetching = isFetching;
    this.mountedInstance = null;
  }

  mount(containerElement: HTMLElement) {
    if (this.mountedInstance) {
      console.warn("SearchBox is already mounted, destroy previous instance");
      this.destroy();
    }

    // Construct Wrapper Element
    const wrapperElement = document.createElement("div");
    wrapperElement.className = 'search-box'

    // Construct Input Element
    const inputElement = document.createElement("input");
    inputElement.className = 'search-box__input'
    inputElement.type = "text";
    inputElement.placeholder = "Name, Email, ID";

    // Construct Spinner Element
    const spinnerElement = document.createElement("div");
    spinnerElement.className = 'search-box__spinner'

    const spinnerContainerElement = document.createElement("div");
    spinnerContainerElement.className = 'search-box__spinner-container'

    spinnerContainerElement.replaceChildren(spinnerElement);

    // Construct Input Wrapper Element
    const inputWrapperElement = document.createElement("div");
    inputWrapperElement.className = 'search-box__input-wrapper'

    inputWrapperElement.appendChild(inputElement);
    inputWrapperElement.appendChild(spinnerContainerElement);

    // Construct Query Warning Element
    const queryWarningElement = document.createElement("div")
    queryWarningElement.className = 'search-box__query-warning'
    queryWarningElement.textContent = "Query must be at least 2 characters long"

    // Assemble Elements
    wrapperElement.appendChild(inputWrapperElement);
    wrapperElement.appendChild(queryWarningElement);

    // Trigger Initial Render
    this.renderSpinner(spinnerContainerElement, this.isFetching.get())
    this.renderQueryWarning(queryWarningElement, this.searchQuery.get());

    // Set up Subscription to States
    const unsubscribeIsFetching = this.isFetching.subscribe((isFetching) => {
      this.renderSpinner(spinnerContainerElement, isFetching)
    });

    const unsubscribeQueryWarning = this.searchQuery.subscribe((query) => {
      this.renderQueryWarning(queryWarningElement, query);
    });

    // Set up Event Listeners
    inputElement.addEventListener("input", (event: Event) => {
      this.searchQuery.set((event.target as HTMLInputElement).value);
    });

    // Mount Elements to Container Element
    containerElement.appendChild(wrapperElement);

    // Persist local variable to object's property
    this.mountedInstance = {
      wrapperElement,
      unsubscribeIsFetching,
      unsubscribeQueryWarning,
    };
  }

  destroy() {
    this.mountedInstance?.unsubscribeIsFetching(); // Unsubscribe from isLoadingState
    this.mountedInstance?.unsubscribeQueryWarning(); // Unsubscribe from queryWarning
    this.mountedInstance?.wrapperElement.remove(); // Remove the wrapper element from the DOM
    this.mountedInstance = null; // Clean up the mounted instance
  }

  private renderSpinner(spinnerContainerElement: HTMLDivElement, show: boolean) {
    spinnerContainerElement.classList.toggle('search-box__spinner-container--hidden', !show)
  }

  private renderQueryWarning(element: HTMLDivElement, query: string) {
    // Extract logic determining if query length is insufficient
    element.style.visibility = query.length === 1 ? "visible" : "hidden";
  }
}