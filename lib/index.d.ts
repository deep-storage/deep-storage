export declare type StateUpdateCallback = <DeepState>(path: Path, newState: DeepState, oldState: DeepState) => void;
export interface DeepSubscriptions {
    /**
     * Returns a new subscription that can subscribeTo paths in state. Note,
     * the subscription must be cancelled when no longer in use.
     */
    subscription: (callback: StateUpdateCallback) => DeepSubscription;
}
export interface DeepStorage<State, RootState = {}> extends DeepSubscriptions {
    /**
     * sets a value in deep storage by path and notifies subscribers. shortcut for
     * updateIn where the old value is ignored
     */
    setIn: (...path: Path) => <DeepState>(newValue: DeepState) => Promise<DeepState>;
    /**
     * Updates the whole state and notifies subscribers
     */
    update: (callback: (s: State) => State) => Promise<State>;
    /**
     * Updates a value in deep storage by path and notifies subscribers. Must not
     * mutate the oldValue
     */
    updateIn: (...path: Path) => <DeepState>(callback: (s: DeepState) => DeepState) => Promise<DeepState>;
    /**
     * Updates a property of the current state and notifies subscribers.
     */
    updateProperty: <Key extends keyof State>(key: Key, callback: (s: State[Key]) => State[Key]) => Promise<State[Key]>;
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
    /**
     * Gets the root deep storage
     */
    root: () => DeepStorage<RootState>;
    /**
     * The path from the root to this storage
     */
    path: Path;
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
export declare class DefaultDeepStorage<State> implements DeepStorage<State, State> {
    state: State;
    private id;
    private subscriptions;
    constructor(state: State);
    update: (callback: (s: State) => State) => Promise<State>;
    updateProperty: <Key extends keyof State>(key: Key, callback: (s: State[Key]) => State[Key]) => Promise<State[Key]>;
    setIn: (...path: (string | number)[]) => <DeepState>(newValue: DeepState) => Promise<DeepState>;
    merge: (partial: {
        [P in keyof State]?: State[P];
    }) => void;
    updateIn: (...path: (string | number)[]) => <DeepState>(callback: (s: DeepState) => DeepState) => Promise<DeepState>;
    stateIn: <DeepState>(...path: (string | number)[]) => any;
    deep: <DeepState>(...path: (string | number)[]) => DeepStorage<DeepState, {}>;
    subscription: (callback: StateUpdateCallback) => {
        subscribeTo: (...path: (string | number)[]) => void;
        cancel: () => void;
    };
    root: () => this;
    path: Path;
}
export declare class NestedDeepStorage<State, RootState> implements DeepStorage<State, RootState> {
    path: Path;
    rootStorage: DeepStorage<RootState>;
    constructor(path: Path, rootStorage: DeepStorage<RootState>);
    setIn: (...path: (string | number)[]) => <DeepState>(newValue: DeepState) => Promise<DeepState>;
    update: (callback: (s: State) => State) => Promise<State>;
    updateIn: (...path: (string | number)[]) => <DeepState>(callback: (s: DeepState) => DeepState) => Promise<DeepState>;
    updateProperty: <Key extends keyof State>(key: Key, callback: (s: State[Key]) => State[Key]) => Promise<State[Key]>;
    readonly state: State;
    stateIn: <DeepState>(...path: (string | number)[]) => DeepState;
    deep: <DeepState>(...path: (string | number)[]) => DeepStorage<DeepState, {}>;
    subscription: (callback: StateUpdateCallback) => DeepSubscription;
    root: () => DeepStorage<RootState, {}>;
}
export declare function parsePath(path: Path | stringOrNumber): Path;
export declare function parsePaths(paths: {
    [key: string]: Path | stringOrNumber;
}): {
    [key: string]: Path;
};
export declare const deepStorage: <State>(s: State) => DeepStorage<State, {}>;
export default deepStorage;
