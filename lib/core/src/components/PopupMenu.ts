import type { Employee } from "../types";
import { Toast } from "./Toast";
import { Modal } from "./Modal";

/**
 * Improvement: separate component into 
 * - Popup, Base UI Component
 * - MenuOption, Feature Component implements the Popup component
 */

export class PopupMenu {
  private static activePopup: {
    element: HTMLDivElement;
    clearEventListeners: (() => void);
  } | null;

  static show(scrollContainer: HTMLElement, data: Employee, position: { left: number, bottom: number }) {
    if (this.activePopup) { this.hide() }

    // Construct Menu Element
    const menuElement = document.createElement("div");
    menuElement.className = "popup-menu"
    menuElement.style.top = `${position.bottom + 5}px`;
    menuElement.style.left = `${position.left - 100}px`;

    // Construct Copy Item Option
    const copyItem = document.createElement("div");
    copyItem.className = "popup-menu__copy-item"
    copyItem.innerHTML = `<span>📋</span><span>Copy Name</span>`;

    copyItem.addEventListener('click', (event: MouseEvent) => {
      event.stopPropagation();
      navigator.clipboard.writeText(data.name);
      Toast.show(`✔️ Copied "${data.name}" to clipboard`);
      this.hide();
    });

    // Construct View Item Option
    const viewItem = document.createElement("div");
    viewItem.className = "popup-menu__view-detail"
    viewItem.innerHTML = `<span>👁️</span><span>View Details</span>`;

    viewItem.addEventListener('click', (e) => {
      e.stopPropagation();
      Modal.show(this.createModalContent(data));
      this.hide();
    });

    // Assemble Menu Element
    menuElement.appendChild(copyItem);
    menuElement.appendChild(viewItem);

    // Mount Menu Element to Document
    document.body.appendChild(menuElement);

    // Manage event listeners
    const closeMenu = () => this.hide();

    document.addEventListener("click", closeMenu); // Close menu when clicking outside
    scrollContainer.addEventListener("scroll", closeMenu); // Close menu when scrolling

    const clearEventListeners = () => {
      document.removeEventListener("click", closeMenu);
      scrollContainer.removeEventListener("scroll", closeMenu);
    };

    // Persist local variable to object's property
    this.activePopup = { element: menuElement, clearEventListeners };
  }

  private static hide() {
    this.activePopup?.element.remove();
    this.activePopup?.clearEventListeners();
    this.activePopup = null;
  }

  private static createModalContent(data: Employee) {
    const employeeDetailElement = document.createElement("div");
    employeeDetailElement.className = "employee-detail"

    const employeeInfoElement = document.createElement("div");

    const projectsHTML = data.projects.length > 0
      ? data.projects.map(p => `
          <div class="employee-detail__project-card">
            <div class="employee-detail__project-name">${p.projectName}</div>
            <div class="employee-detail__project-meta">
              Start Date: ${p.startDate} • ${p.tasks.length} task(s)
            </div>
          </div>
        `).join('')
      : '<div class="employee-detail__no-projects">No projects assigned</div>';

    employeeInfoElement.innerHTML = `
      <h2 class="employee-detail__title">Employee Details</h2>

      <div class="employee-detail__section">
        <h3 class="employee-detail__section-title">Personal Information</h3>
        <p class="employee-detail__field"><strong>Name:</strong> ${data.name}</p>
        <p class="employee-detail__field"><strong>Email:</strong> ${data.email}</p>
        <p class="employee-detail__field"><strong>ID:</strong> ${data.id}</p>
        <p class="employee-detail__field"><strong>Position:</strong> ${data.position}</p>
      </div>

      <div class="employee-detail__section">
        <h3 class="employee-detail__section-title">Department</h3>
        <p class="employee-detail__field"><strong>Name:</strong> ${data.department.name}</p>
        <p class="employee-detail__field"><strong>Manager:</strong> ${data.department.manager.name}</p>
        <p class="employee-detail__field"><strong>Manager Contact:</strong> ${data.department.manager.contact.email}</p>
      </div>

      <div class="employee-detail__projects">
        <h3 class="employee-detail__section-title">Projects (${data.projects.length})</h3>
        ${projectsHTML}
      </div>
    `;

    // Construct Close Button
    const closeButtonElement = document.createElement("button");
    closeButtonElement.className = "employee-detail__close-button"
    closeButtonElement.textContent = "Close";
    closeButtonElement.addEventListener("click", () => Modal.hide());

    // Assemble Modal Content
    employeeDetailElement.appendChild(employeeInfoElement);
    employeeDetailElement.appendChild(closeButtonElement);

    return employeeDetailElement;
  }
}