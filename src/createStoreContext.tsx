import React from "react";
import { Action, Reducer, Store } from "./Store";

/**
 * Creates a React component-level store with the specified state and action types.
 * Allows for fine-grained updates to the UI and clean state management.
 * Cases allow for side effects to be dispatched from the reducer.
 *
 * @template TState - The type of the state object.
 * @template TAction - The type of the action object.
 * @returns An object containing the StoreProvider, useStoreSelector, and useStoreDispatch functions.
 */
export function createStoreContext<
  TState extends object,
  TAction extends Action
>() {
  const Context = React.createContext<Store<TState, TAction> | null>(null);

  function StoreProvider(props: StoreProviderProps<TState, TAction>) {
    const { children, initialState, reducer } = props;
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
    return React.useSyncExternalStore(store.subscribe, () => {
      return selector(store.getState());
    });
  }

  function useStoreDispatch() {
    const store = React.useContext(Context);
    if (!store) {
      throw new Error("useStoreDispatch must be used within a StoreProvider");
    }
    return store.dispatch.bind(store);
  }

  return { StoreProvider, useStoreSelector, useStoreDispatch };
}

export type StoreProviderProps<
  TState extends object,
  TAction extends Action
> = {
  children: React.ReactNode;
  initialState: TState;
  reducer: Reducer<TState, TAction>;
};
