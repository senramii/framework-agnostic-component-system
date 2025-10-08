import type { TimeoutType } from "../types";

export class Toast {
  private static activeToast: {
    toast: HTMLDivElement;
    timeoutId: TimeoutType;
  } | null;

  static show(message: string) {
    if (this.activeToast) {
      this.hide();
    }

    // Construct Toast Element
    const toastElement = document.createElement("div");
    toastElement.className = "toast"

    // Construct Toast Message Element
    const toastMessageElement = document.createElement("span")
    toastMessageElement.className = "toast__message"
    toastMessageElement.textContent = message

    toastElement.appendChild(toastMessageElement)

    // Mount Toast Element to Document
    document.body.appendChild(toastElement);

    // Trigger animation
    requestAnimationFrame(() => toastElement.classList.add("toast--show"));

    // Set timeout to hide toast
    const timeoutId = setTimeout(() => this.hide(), 3000)

    // Store toast element and timeout id
    this.activeToast = {
      toast: toastElement,
      timeoutId
    };
  }

  private static hide() {
    if (!this.activeToast) return;

    clearTimeout(this.activeToast.timeoutId);
    this.activeToast.toast.remove();
    this.activeToast = null;
  }
}