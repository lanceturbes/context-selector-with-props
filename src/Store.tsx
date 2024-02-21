import { EventBus } from "./EventBus";

export class Store<TState extends object, TAction extends Action> {
  private eventBus: EventBus = new EventBus();

  constructor(
    private state: TState,
    private reducer: Reducer<TState, TAction>
  ) {}

  getState() {
    return this.state;
  }

  dispatch(action: TAction) {
    const [nextState, effect] = this.reducer(this.state, action);
    this.state = nextState;
    if (effect) {
      effect(this.dispatch.bind(this), this.getState.bind(this));
    }
    this.eventBus.emit();
  }

  subscribe(listener: () => void) {
    return this.eventBus.addListener(listener);
  }
}

export type Action = { type: string; payload?: unknown };

export type Dispatch<TAction extends Action> = (action: TAction) => void;

export type Effect<TState extends object, TAction extends Action> = (
  dispatch: Dispatch<TAction>,
  getState: () => TState
) => void;

export type Reducer<TState extends object, TAction extends Action> = (
  state: TState,
  action: TAction
) => [TState, Effect<TState, TAction>?];
