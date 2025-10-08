export class Modal {
  private static activeModal: HTMLDivElement | null;

  static show(content: HTMLElement) {
    if (this.activeModal) {
      this.hide();
    }

    // Construct Modal Backdrop Element
    const modalBackdropElement = document.createElement("div");
    modalBackdropElement.className = 'modal-backdrop'

    // Construct Modal Content Element
    const modalContent = document.createElement("div");
    modalContent.className = 'modal-content'


    // Set up Event Listeners
    modalBackdropElement.addEventListener("click", (e) => {
      if (e.target === modalBackdropElement) {
        this.hide();
      }
    });

    modalContent.addEventListener("click", (e) => {
      e.stopPropagation(); // Prevent clicks inside modal content from closing
    });

    // Assemble Elements
    modalContent.appendChild(content);
    modalBackdropElement.appendChild(modalContent);

    // Mount Elements to Document
    document.body.appendChild(modalBackdropElement);

    // Persist local variable to object's property
    this.activeModal = modalBackdropElement;

    // Freeze page scrolling
    document.body.style.overflow = 'hidden';
  }

  static hide() {
    this.activeModal?.remove();
    this.activeModal = null;

    // Unfreeze page scrolling
    document.body.style.overflow = 'auto';
  }
}