export declare type StateUpdateCallback = <DeepState>(path: Path, newState: DeepState, oldState: DeepState) => void;
export interface DeepSubscriptions {
    /**
     * Returns a new subscription that can subscribeTo paths in state. Note,
     * the subscription must be cancelled when no longer in use.
     */
    subscription: (callback: StateUpdateCallback) => DeepSubscription;
}
export interface DeepStorage<State> extends DeepSubscriptions {
    /**
     * sets a value in deep storage by path and notifies subscribers. shortcut for
     * updateIn where the old value is ignored
     */
    setIn: (...path: Path) => <DeepState>(newValue: DeepState) => void;
    /**
     * Updates the whole state and notifies subscribers
     */
    update: (callback: (s: State) => State) => void;
    /**
     * Updates a value in deep storage by path and notifies subscribers. Must not
     * mutate the oldValue
     */
    updateIn: (...path: Path) => <DeepState>(callback: (s: DeepState) => DeepState) => void;
    /**
     * Updates a property of the current state and notifies subscribers.
     */
    updateProperty: <Key extends keyof State>(key: Key, callback: (s: State[Key]) => State[Key]) => void;
    /**
     * Returns the state that this deep storage is managing
     */
    state: State;
    /**
     * Returns state by a path
     */
    stateIn: <DeepState>(...path: Path) => DeepState;
    /**
     * Creates a new DeepStorage at this point in the object path
     */
    deep: <DeepState>(...path: Path) => DeepStorage<DeepState>;
}
/**
 * A cancelable way to subscribe to paths in state
 */
export interface DeepSubscription {
    subscribeTo: (...path: Path) => void;
    cancel: () => void;
}
export declare type stringOrNumber = string | number;
export declare type Path = stringOrNumber[];
declare const _default: <State>(s: State) => DeepStorage<State>;
export default _default;
export declare class DefaultDeepStorage<State> implements DeepStorage<State> {
    state: State;
    private id;
    private subscriptions;
    constructor(state: State);
    update: (callback: (s: State) => State) => void;
    updateProperty: <Key extends keyof State>(key: Key, callback: (s: State[Key]) => State[Key]) => void;
    setIn: (...path: (string | number)[]) => <DeepState>(newValue: DeepState) => void;
    merge: (partial: {
        [P in keyof State]?: State[P];
    }) => void;
    updateIn: (...path: (string | number)[]) => <DeepState>(callback: (s: DeepState) => DeepState) => void;
    stateIn: <DeepState>(...path: (string | number)[]) => any;
    deep: <DeepState>(...path: (string | number)[]) => DeepStorage<DeepState>;
    subscription: (callback: StateUpdateCallback) => {
        subscribeTo: (...path: (string | number)[]) => void;
        cancel: () => void;
    };
}
export declare class NestedDeepStorage<RootState, State> implements DeepStorage<State> {
    path: Path;
    root: DeepStorage<RootState>;
    constructor(path: Path, root: DeepStorage<RootState>);
    setIn: (...path: (string | number)[]) => <DeepState>(newValue: DeepState) => void;
    update: (callback: (s: State) => State) => void;
    updateIn: (...path: (string | number)[]) => <DeepState>(callback: (s: DeepState) => DeepState) => void;
    updateProperty: <Key extends keyof State>(key: Key, callback: (s: State[Key]) => State[Key]) => void;
    readonly state: State;
    stateIn: <DeepState>(...path: (string | number)[]) => DeepState;
    deep: <DeepState>(...path: (string | number)[]) => DeepStorage<DeepState>;
    subscription: (callback: StateUpdateCallback) => DeepSubscription;
}
export declare function parsePath(path: Path | stringOrNumber): Path;
export declare function parsePaths(paths: {
    [key: string]: Path | stringOrNumber;
}): {
    [key: string]: Path;
};
