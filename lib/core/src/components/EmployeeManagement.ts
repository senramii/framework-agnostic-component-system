import { DebouncedObservable, Observable } from "../states";
import { DataTable, type DataState } from "./DataTable";
import { SearchBox } from "./SearchBox";
import { APIToggle } from "./APIToggle";
import { employeeAPI } from "../api";

export interface EmployeeManagementProps {
  debounceDelay?: number;
}

export class EmployeeManagement {
  debounceDelay: number;

  searchQuery: DebouncedObservable<string>;
  dataState: Observable<DataState>;
  isFetching: Observable<boolean>;
  shouldAPIFail: Observable<boolean>;

  apiToggleComponent: APIToggle;
  searchBoxComponent: SearchBox;
  tableComponent: DataTable;

  mountedInstance: {
    wrapperElement: HTMLDivElement;
    unsubscribeSearchQuery: (() => void);
  } | null;

  constructor(config: EmployeeManagementProps = {}) {
    // Configuration
    this.debounceDelay = config.debounceDelay || 500;

    // Observable States
    this.searchQuery = new DebouncedObservable("", this.debounceDelay);
    this.dataState = new Observable<DataState>({ type: "pending" });
    this.isFetching = new Observable(false);
    this.shouldAPIFail = new Observable(false);

    // Components
    this.apiToggleComponent = new APIToggle(this.shouldAPIFail);
    this.searchBoxComponent = new SearchBox(this.searchQuery, this.isFetching);
    this.tableComponent = new DataTable(this.dataState, this.searchQuery);

    this.mountedInstance = null;
  }

  private async fetch(query: string) {
    if (query.length === 1) return;

    this.isFetching.set(true);

    try {
      const data = await employeeAPI({ query: query === "" ? undefined : query });

      if (this.shouldAPIFail.get()) throw Error; // Mock API Failure

      this.dataState.set({ type: "success", data });
    } catch (error: unknown) {
      this.dataState.set({ type: "error" });
    } finally {
      this.isFetching.set(false);
    }
  }

  mount(container: HTMLElement) {
    const wrapperElement = document.createElement("div");
    wrapperElement.className = 'employee-management'

    this.apiToggleComponent.mount(wrapperElement);
    this.searchBoxComponent.mount(wrapperElement);
    this.tableComponent.mount(wrapperElement);

    container.appendChild(wrapperElement);

    this.mountedInstance = {
      wrapperElement,
      unsubscribeSearchQuery: this.searchQuery.subscribe((query) => this.fetch(query))
    };
  }

  destroy() {
    this.mountedInstance?.unsubscribeSearchQuery();
    this.mountedInstance?.wrapperElement.remove();
    this.mountedInstance = null;
    this.apiToggleComponent.destroy();
    this.searchBoxComponent.destroy();
    this.tableComponent.destroy();
  }
}