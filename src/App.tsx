import { Reducer } from "./Store";
import { createStoreContext } from "./createStoreContext";

export default function App() {
  return (
    <GlobalStoreProvider initialState={state} reducer={reducer}>
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

const state: GlobalState = { count: 0 };

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

type GlobalState = { count: number };

type GlobalAction = { type: "INCREMENT"; payload: number } | { type: "EFFECT" };
