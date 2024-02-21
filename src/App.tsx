import React from "react";

export default function App() {
  return (
    <Provider
      initialState={{ count: 0 }}
      reducer={(state, action) => {
        switch (action.type) {
          case "INCREMENT":
            return { count: state.count + 1 };
          case "DECREMENT":
            return { count: state.count - 1 };
        }
      }}
    >
      <Counter />
    </Provider>
  );
}

function Counter() {
  const count = useStoreSelector((state) => state.count);
  const dispatch = useStoreDispatch();

  return (
    <button onClick={() => dispatch({ type: "INCREMENT" })}>{count}</button>
  );
}

type State = { count: number };
type Action = { type: "INCREMENT" } | { type: "DECREMENT" };

const { Provider, useStoreDispatch, useStoreSelector } = createStoreContext<
  State,
  Action
>();

class EventBus {
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

class Store<
  TState extends object,
  TAction extends { type: string; payload?: unknown }
> {
  private eventBus: EventBus = new EventBus();

  constructor(
    private state: TState,
    private reducer: (state: TState, action: TAction) => TState
  ) {}

  getState() {
    return this.state;
  }

  dispatch(action: TAction) {
    this.state = this.reducer(this.state, action);
    this.eventBus.emit();
  }

  subscribe(listener: () => void) {
    return this.eventBus.addListener(listener);
  }
}

function createStoreContext<
  TState extends object,
  TAction extends { type: string; payload?: unknown }
>() {
  const Context = React.createContext<Store<TState, TAction> | null>(null);

  function Provider({
    children,
    initialState,
    reducer,
  }: {
    children: React.ReactNode;
    initialState: TState;
    reducer: (state: TState, action: TAction) => TState;
  }) {
    const store = React.useRef<Store<TState, TAction>>();
    if (!store.current) {
      store.current = new Store(initialState, reducer);
    }
    return (
      <Context.Provider value={store.current}>{children}</Context.Provider>
    );
  }

  function useStoreSelector<TSnapshot>(selector: (state: TState) => TSnapshot) {
    const store = React.useContext(Context);
    if (!store) {
      throw new Error("useStoreSelector must be used within a StoreProvider");
    }
    const [snapshot, setSnapshot] = React.useState(() =>
      selector(store.getState())
    );

    React.useEffect(() => {
      return store.subscribe(() => {
        setSnapshot(selector(store.getState()));
      });
    }, [store, selector]);

    return snapshot;
  }

  function useStoreDispatch() {
    const store = React.useContext(Context);
    if (!store) {
      throw new Error("useStoreDispatch must be used within a StoreProvider");
    }
    return store.dispatch.bind(store);
  }

  return { Provider, useStoreSelector, useStoreDispatch };
}
