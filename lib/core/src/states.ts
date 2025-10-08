type StateListener<T> = (value: T) => void;

export class Observable<T> {
  value: T;
  subscribers: Set<StateListener<T>>;

  constructor(value: T) {
    this.value = value;
    this.subscribers = new Set();
  }

  protected notify() {
    this.subscribers.forEach((callback) => callback(this.value));
  }

  subscribe(callback: StateListener<T>) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  set(newValue: T) {
    this.value = newValue;
    this.notify();
  }

  get(): T {
    return this.value;
  }
}

type TimeoutType = ReturnType<typeof setTimeout>;

export class DebouncedObservable<T> extends Observable<T> {
  timeoutId: TimeoutType | undefined;
  delayMs: number;

  constructor(value: T, delayMs: number) {
    super(value);
    this.delayMs = delayMs;
    this.timeoutId = undefined;
  }

  set(newValue: T) {
    clearTimeout(this.timeoutId);

    this.timeoutId = setTimeout(() => {
      this.value = newValue;
      this.notify();
    }, this.delayMs);
  }
}