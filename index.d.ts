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
     * Creates a new DeepStorage at this point in the object path and
     * gives it an initial value if one hasn't already been set
     */
    deepInit: <DeepState>(...path: Path) => (deepState: DeepState) => DeepStorage<DeepState, RootState>;
    init: (state: State) => DeepStorage<State, RootState>;
    /**
     * Gets the root deep storage
     */
    root: () => DeepStorage<RootState>;
    /**
     * The path from the root to this storage
     */
    path: Path;
    /**
     * Returns an object with keys from State and values of
     * DeepStorage for that key
     */
    props: {
        [P in keyof State]: DeepStorage<State[P]>;
    };
}
/**
 * Is one array a prefix on another e.g.
 *
 * [] is a prefix of any array
 * ['asdf'] is a prefix of ['asdf', ...]
 *
 * etc.
 *
 * @param stateChangePath the full array to check, must not be null
 * @param subscriptionPath the partial array to check
 */
export declare function isPathMatch<T>(stateChangePath: T[], subscriptionPath: T[]): boolean;
/**
 * A cancelable way to subscribe to paths in state
 */
export interface DeepSubscription {
    subscribeTo: (...path: Path) => void;
    cancel: () => void;
}
export interface UsesDeepStorage<State> {
    storage: DeepStorage<State>;
}
export declare type stringOrNumber = string | number;
export declare type Path = stringOrNumber[];
export declare class DefaultDeepStorage<State> implements DeepStorage<State, State> {
    state: State;
    private id;
    private initialStates;
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
    init: (state: State) => DeepStorage<State, State>;
    deepInit: <DeepState>(...path: (string | number)[]) => (deepState: DeepState) => DeepStorage<DeepState, State>;
    deep: <DeepState>(...path: (string | number)[]) => DeepStorage<DeepState, {}>;
    subscription: (callback: StateUpdateCallback) => {
        subscribeTo: (...path: (string | number)[]) => void;
        cancel: () => void;
    };
    root: () => this;
    path: Path;
    readonly props: {
        [P in keyof State]: DeepStorage<State[P], {}>;
    };
}
export declare class NestedDeepStorage<State, RootState> implements DeepStorage<State, RootState> {
    path: Path;
    rootStorage: DeepStorage<RootState, RootState>;
    constructor(path: Path, rootStorage: DeepStorage<RootState, RootState>);
    setIn: (...path: (string | number)[]) => <DeepState>(newValue: DeepState) => Promise<DeepState>;
    update: (callback: (s: State) => State) => Promise<State>;
    updateIn: (...path: (string | number)[]) => <DeepState>(callback: (s: DeepState) => DeepState) => Promise<DeepState>;
    updateProperty: <Key extends keyof State>(key: Key, callback: (s: State[Key]) => State[Key]) => Promise<State[Key]>;
    readonly state: State;
    stateIn: <DeepState>(...path: (string | number)[]) => DeepState;
    init: (state: State) => DeepStorage<State, RootState>;
    deepInit: <DeepState>(...path: (string | number)[]) => (deepState: DeepState) => DeepStorage<DeepState, RootState>;
    deep: <DeepState>(...path: (string | number)[]) => DeepStorage<DeepState, {}>;
    subscription: (callback: StateUpdateCallback) => DeepSubscription;
    root: () => DeepStorage<RootState, RootState>;
    readonly props: {
        [P in keyof State]: DeepStorage<State[P], {}>;
    };
}
export declare function parsePath(path: Path | stringOrNumber): Path;
export declare function parsePaths(paths: {
    [key: string]: Path | stringOrNumber;
}): {
    [key: string]: Path;
};
export declare const deepStorage: <State>(s: State) => DeepStorage<State, {}>;
export default deepStorage;
