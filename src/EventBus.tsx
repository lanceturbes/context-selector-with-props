export class EventBus {
  listeners: Set<Listener>;

  constructor() {
    this.listeners = new Set();
  }

  addListener(listener: Listener): Unsubscribe {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  emit() {
    for (const listener of this.listeners) {
      listener();
    }
  }
}

export type Listener = () => void;

export type Unsubscribe = () => void;
