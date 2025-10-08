import type { Observable } from "../states";
import type { Employee } from "../types";
import { escapeRegex } from "../utils/escape";
import { PopupMenu } from "./PopupMenu";

const TABLE_HEADERS = ["FULL NAME", "EMAIL ADDRESS", "ID", "START DATE", "MENU"];

const errorFallbackElement = `
  <tr>
    <td colspan="5" class="data-table-error-fallback">
      <div class="data-table-error-fallback__container">
        <h3 class="data-table-error-fallback__title">⚠️ Error Loading Data</h3>
        <p class="data-table-error-fallback__message">Failed to fetch data. Please try again.</p>
      </div>
    </td>
  </tr>
`;

const noResultFallback = `
  <tr>
    <td colspan="5" class="data-table-no-result-fallback">No results found</td>
  </tr>
`;

const pendingFallback = `
  <tr>
    <td colspan="5" class="data-table-pending-fallback">Type at least 2 characters to search</td>
  </tr>
`;

export type DataState =
  | { type: 'pending' }
  | { type: 'error' }
  | { type: 'success', data: Employee[] }

export class DataTable {
  private dataState: Observable<DataState>;
  private searchQuery: Observable<string>;
  private mountedInstance: {
    tableWrapper: HTMLDivElement
    unsubscribeEmployeeCount: (() => void);
    unsubscribeTableContent: (() => void);
    resizeCleanup: (() => void);
  } | null;

  constructor(dataState: Observable<DataState>, searchQuery: Observable<string>) {
    this.dataState = dataState;
    this.searchQuery = searchQuery;
    this.mountedInstance = null;
  }

  mount(container: HTMLElement) {
    // Construct Table Wrapper Element
    const tableWrapper = document.createElement("div")
    tableWrapper.className = "data-table"

    // Construct Table Scroll Container
    const tableScrollContainer = document.createElement("div");
    tableScrollContainer.className = "data-table__scroll-container"

    const { tableElement, columnElements, tbodyElement, resizeHandleElements } = this.createTableElement();

    tableScrollContainer.appendChild(tableElement);

    // Setup resize functionality
    let resizingColumnIndex: number | null = null;
    let startX = 0;
    let startWidths: number[] = [];

    // Resize Using Column Elements
    const handleMouseDown = (index: number) => (e: MouseEvent) => {
      resizingColumnIndex = index;
      startX = e.pageX;
      startWidths = columnElements.map(col => col.getBoundingClientRect().width);

      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";

      e.preventDefault();
    };

    // Mouse Move to Resize Column Width
    const handleMouseMove = (e: MouseEvent) => {
      if (resizingColumnIndex === null) return;

      const diff = e.pageX - startX;
      const tableWidth = tableElement.getBoundingClientRect().width;

      // Calculate new widths
      const currentColWidth = startWidths[resizingColumnIndex]!;
      const nextColWidth = startWidths[resizingColumnIndex + 1]!;

      const newCurrentWidth = currentColWidth + diff;
      const newNextWidth = nextColWidth - diff;

      // Minimum width constraint (50px)
      if (newCurrentWidth > 50 && newNextWidth > 50) {
        const currentPercent = (newCurrentWidth / tableWidth) * 100;
        const nextPercent = (newNextWidth / tableWidth) * 100;

        columnElements[resizingColumnIndex]!.style.width = `${currentPercent}%`;
        columnElements[resizingColumnIndex + 1]!.style.width = `${nextPercent}%`;
      }
    };

    const handleMouseUp = () => {
      if (resizingColumnIndex !== null) {
        resizingColumnIndex = null;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      }
    };

    resizeHandleElements.forEach((resizeHandleElement, index) => {
      resizeHandleElement.addEventListener("mousedown", handleMouseDown(index));
    })

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    const resizeCleanup = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    this.renderTableBodyContent(tableScrollContainer, tbodyElement, this.dataState.get());

    const unsubscribeTableContent = this.dataState.subscribe((dataState) => this.renderTableBodyContent(tableScrollContainer, tbodyElement, dataState))

    // Construct Employee Count Element
    const employeeCountElement = document.createElement("div");
    employeeCountElement.className = "data-table__employee-count";

    this.renderEmployeeCount(employeeCountElement, this.dataState.get());

    const unsubscribeEmployeeCount = this.dataState.subscribe((dataState) =>
      this.renderEmployeeCount(employeeCountElement, dataState)
    );

    // Mount Elements to Table Wrapper Element
    tableWrapper.appendChild(employeeCountElement)
    tableWrapper.appendChild(tableScrollContainer)

    // Mount Elements to Container Element
    container.appendChild(tableWrapper);

    // Store mounted instance
    this.mountedInstance = {
      tableWrapper,
      unsubscribeEmployeeCount,
      unsubscribeTableContent,
      resizeCleanup
    }
  }

  destroy() {
    this.mountedInstance?.tableWrapper.remove();
    this.mountedInstance?.unsubscribeTableContent();
    this.mountedInstance?.unsubscribeEmployeeCount();
    this.mountedInstance?.resizeCleanup();
    this.mountedInstance = null;
  }

  private createTableElement() {
    // Construct Table Element
    const tableElement = document.createElement("table");
    tableElement.className = "data-table__table"

    // Construct Column Group Element
    const colgroupElement = document.createElement("colgroup");
    const columnElements: HTMLElement[] = [];

    Array.from({ length: 5 }, (_, index) => {
      const col = document.createElement("col");
      col.className = `data-table__col-${index}`

      colgroupElement.appendChild(col);
      columnElements.push(col);
    });

    // Construct Table Header Element
    const theadElement = document.createElement("thead");
    const tableHeaderRowElement = document.createElement("tr");
    const resizeHandleElements: HTMLDivElement[] = [];

    TABLE_HEADERS.forEach((headerText, index) => {
      const tableHeaderElement = document.createElement("th");
      tableHeaderElement.className = `data-table__th`
      tableHeaderElement.textContent = headerText;

      // Add resize handle to all columns except the last one
      if (index < TABLE_HEADERS.length - 1) {
        const resizeHandleElement = document.createElement("div");
        resizeHandleElement.className = "data-table__resize-handle"

        tableHeaderElement.appendChild(resizeHandleElement);
        resizeHandleElements.push(resizeHandleElement);
      }

      tableHeaderRowElement.appendChild(tableHeaderElement);
    });

    theadElement.appendChild(tableHeaderRowElement);

    // Construct Table Body Element
    const tbodyElement = document.createElement("tbody");

    // Assemble Table Elements
    tableElement.appendChild(colgroupElement);
    tableElement.appendChild(theadElement);
    tableElement.appendChild(tbodyElement);

    return { tableElement, columnElements, tbodyElement, resizeHandleElements };
  }

  private renderTableBodyContent(scrollContainer: HTMLElement, tbodyElement: HTMLTableSectionElement, state: DataState) {
    const tbodyContent = (() => {
      if (state.type === "pending") return pendingFallback;
      if (state.type === "error") return errorFallbackElement;
      if (state.data.length === 0) return noResultFallback;

      return state.data.map((state) => this.renderTableRow(scrollContainer, state, this.searchQuery.get()));
    })()

    if (typeof tbodyContent === 'string') {
      tbodyElement.innerHTML = tbodyContent;
      return
    }

    tbodyElement.replaceChildren(...tbodyContent);
  }

  private renderTableRow(tableScrollContainer: HTMLElement, data: Employee, query: string) {
    const trowElement = document.createElement('tr');
    trowElement.className = 'data-table__tr'

    // First 4 Cells
    for (const key of [data.name, data.email, data.id, data.projects[0]?.startDate ?? 'N/A']) {
      const td = document.createElement('td');
      td.className = 'data-table__td'
      td.appendChild(this.renderHighlightedText(key, query));
      trowElement.appendChild(td);
    }

    // Final Cell, Menu Button
    const menuButton = document.createElement("button")
    menuButton.className = "data-table__menu-button"
    menuButton.textContent = "⋮"

    menuButton.addEventListener("click", (event: MouseEvent) => {
      event.stopPropagation();

      const eventTarget = event.target as HTMLButtonElement
      const rect = eventTarget.getBoundingClientRect()

      PopupMenu.show(tableScrollContainer, data, { left: rect.left, bottom: rect.bottom })
    })

    const tableCellElement = document.createElement('td');
    tableCellElement.appendChild(menuButton);

    trowElement.appendChild(tableCellElement);
    return trowElement
  }

  private renderHighlightedText(text: string, query: string): HTMLSpanElement {
    const span = document.createElement('span');

    if (!query || query.length < 2) {
      span.textContent = text;
      return span;
    }

    const escapedQuery = escapeRegex(query);
    const regex = new RegExp(`(${escapedQuery})`, 'gi');

    let lastIndex = 0;
    let match;

    // Reset regex lastIndex
    regex.lastIndex = 0;

    while ((match = regex.exec(text)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        span.appendChild(document.createTextNode(text.substring(lastIndex, match.index)));
      }

      // Add highlighted match
      const mark = document.createElement('mark');
      mark.style.background = '#fff59d';
      mark.textContent = match[0];
      span.appendChild(mark);

      lastIndex = regex.lastIndex;
    }

    // Add remaining text after last match
    if (lastIndex < text.length) {
      span.appendChild(document.createTextNode(text.substring(lastIndex)));
    }

    return span;
  }

  private renderEmployeeCount(employeeCountElement: HTMLDivElement, state: DataState) {
    employeeCountElement.classList.toggle("data-table__employee-count--hidden", state.type !== 'success')

    if (state.type === 'success') {
      const dataLength = state.data.length
      employeeCountElement.textContent = `Employee (found ${dataLength} item${dataLength === 1 ? '' : 's'})`
    }
  }
}