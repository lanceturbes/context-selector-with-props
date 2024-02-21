import { Reducer } from "./Store";
import { createStoreContext } from "./createStoreContext";

export default function App() {
  return (
    // Could theoretically pass props to initialState and reducer
    <GlobalStoreProvider initialState={state} reducer={reducer}>
      {/* Any component here can subscribe to the global store */}
      <Counter />
    </GlobalStoreProvider>
  );
}

export function Counter() {
  const count = useGlobalStoreSelector((state) => state.count);
  const dispatch = useGlobalStoreDispatch();

  return (
    <>
      <button onClick={() => dispatch({ type: "INCREMENT", payload: 1 })}>
        {count}
      </button>
      <button onClick={() => dispatch({ type: "EFFECT" })}>EFFECT</button>
    </>
  );
}

type GlobalState = { count: number };

const state: GlobalState = { count: 0 };

type GlobalAction = { type: "INCREMENT"; payload: number } | { type: "EFFECT" };

const reducer: Reducer<GlobalState, GlobalAction> = (state, action) => {
  switch (action.type) {
    case "INCREMENT":
      return [{ ...state, count: state.count + 1 }];

    case "EFFECT":
      return [
        { ...state, count: state.count - 1 },
        (dispatch) => {
          setTimeout(() => dispatch({ type: "INCREMENT", payload: 1 }), 1000);
        },
      ];
  }
};

const {
  StoreProvider: GlobalStoreProvider,
  useStoreDispatch: useGlobalStoreDispatch,
  useStoreSelector: useGlobalStoreSelector,
} = createStoreContext<GlobalState, GlobalAction>();
