export class EventBus {
  listeners: Set<() => void>;

  constructor() {
    this.listeners = new Set();
  }

  addListener(listener: () => void): () => void {
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
