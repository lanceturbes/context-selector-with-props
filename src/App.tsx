import { Reducer } from "./Store";
import { createStoreContext } from "./createStoreContext";

export default function App() {
  return (
    // Could theoretically pass props to initialState and reducer
    <GlobalStoreProvider initialState={state} reducer={reducer}>
      {/* Any component here can subscribe to the global store */}
      <Counter />
      <DogImageResponse />
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

function DogImageResponse() {
  const isLoading = useGlobalStoreSelector((state) => state.isLoading);
  const data = useGlobalStoreSelector((state) => state.data);
  const dispatch = useGlobalStoreDispatch();

  return (
    <>
      <button onClick={() => dispatch({ type: "FETCH_DATA" })}>
        {isLoading ? "Loading..." : "Fetch Data"}
      </button>
      {!!data && <img src={data.message} alt="A random dog" />}
    </>
  );
}

type GlobalState = {
  count: number;
  isLoading: boolean;
  data: DogImageApiResponse | null;
};

const state: GlobalState = { count: 0, isLoading: true, data: null };

type GlobalAction =
  | { type: "INCREMENT"; payload: number }
  | { type: "EFFECT" }
  | { type: "FETCH_DATA" }
  | { type: "DATA_LOADED"; payload: DogImageApiResponse };

type DogImageApiResponse = { message: string; status: string };

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

    case "FETCH_DATA":
      return [
        { ...state, isLoading: true },
        async (dispatch) => {
          const response = await fetch(
            "https://dog.ceo/api/breeds/image/random"
          );
          const data = await response.json();
          dispatch({ type: "DATA_LOADED", payload: data });
        },
      ];

    case "DATA_LOADED":
      return [{ ...state, isLoading: false, data: action.payload }];
  }
};

const {
  StoreProvider: GlobalStoreProvider,
  useStoreDispatch: useGlobalStoreDispatch,
  useStoreSelector: useGlobalStoreSelector,
} = createStoreContext<GlobalState, GlobalAction>();
