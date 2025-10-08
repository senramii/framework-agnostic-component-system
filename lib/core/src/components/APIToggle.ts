import type { Observable } from "../states";

export class APIToggle {
  private shouldAPIFail: Observable<boolean>;
  private mountedInstance: {
    wrapperElement: HTMLDivElement;
    unsubscribeShouldAPIFail: (() => void);
  } | null;

  constructor(shouldAPIFail: Observable<boolean>) {
    this.shouldAPIFail = shouldAPIFail;
    this.mountedInstance = null;
  }

  mount(container: HTMLElement) {
    if (this.mountedInstance) {
      console.warn("APIToggle is already mounted, destroy previous instance");
      this.destroy();
    }

    // Construct Wrapper Element
    const wrapperElement = document.createElement("div");
    wrapperElement.className = 'api-toggle'

    // Construct Label Element
    const label = document.createElement("span");
    label.className = 'api-toggle__label'
    label.textContent = "API Response Mode:";

    // Construct Slider Element
    const slider = document.createElement("div");
    slider.className = 'api-toggle__slider'

    // Construct Toggle Button Element
    const toggleButton = document.createElement("div");
    toggleButton.className = 'api-toggle__toggle-button'
    toggleButton.appendChild(slider);

    // Construct Status Text Element
    const statusText = document.createElement("span");
    statusText.className = 'api-toggle__status-text'

    // Assemble Elements
    wrapperElement.appendChild(label);
    wrapperElement.appendChild(toggleButton);
    wrapperElement.appendChild(statusText);

    // Trigger Initial Render
    this.toggle(toggleButton, slider, statusText, this.shouldAPIFail.get());

    // Set up Subscription to States
    const unsubscribeShouldAPIFail = this.shouldAPIFail.subscribe((shouldFail) => {
      this.toggle(toggleButton, slider, statusText, shouldFail);
    });

    // Set up Event Listeners
    toggleButton.addEventListener("click", () => {
      this.shouldAPIFail.set(!this.shouldAPIFail.get());
    });

    // Mount Elements to Container Element
    container.appendChild(wrapperElement);

    // Persist local variables to object's property
    this.mountedInstance = {
      wrapperElement,
      unsubscribeShouldAPIFail,
    };
  }

  destroy() {
    this.mountedInstance?.unsubscribeShouldAPIFail();
    this.mountedInstance?.wrapperElement.remove();
    this.mountedInstance = null;
  }

  private toggle(
    toggleButton: HTMLDivElement,
    slider: HTMLDivElement,
    statusText: HTMLSpanElement,
    shouldFail: boolean
  ) {
    if (shouldFail) {
      toggleButton.classList.add('api-toggle__toggle-button--fail')
      toggleButton.classList.remove('api-toggle__toggle-button--success')

      statusText.classList.add('api-toggle__status-text--fail')
      statusText.classList.remove('api-toggle__status-text--success')
      statusText.textContent = "FAIL";

      slider.classList.add('api-toggle__slider--fail');
      slider.classList.remove('api-toggle__slider--success');
      return
    }

    toggleButton.classList.add('api-toggle__toggle-button--success')
    toggleButton.classList.remove('api-toggle__toggle-button--fail')

    statusText.classList.add('api-toggle__status-text--success')
    statusText.classList.remove('api-toggle__status-text--fail')
    statusText.textContent = "SUCCESS";

    slider.classList.add('api-toggle__slider--success');
    slider.classList.remove('api-toggle__slider--fail');
  }
}
