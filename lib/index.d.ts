export declare type StateUpdateCallback = <DeepState>(path: Path, newState: DeepState, oldState: DeepState) => void;
export interface DeepSubscriptions {
    subscription: (callback: StateUpdateCallback) => Subscription;
}
export interface Storage<State> extends DeepSubscriptions {
    setIn: (...path: Path) => <DeepState>(newValue: DeepState) => void;
    update: (callback: (s: State) => State) => void;
    updateIn: (...path: Path) => <DeepState>(callback: (s: DeepState) => DeepState) => void;
    updateProperty: <Key extends keyof State>(key: Key, callback: (s: State[Key]) => State[Key]) => void;
    state: State;
    stateIn: <DeepState>(...path: Path) => Storage<DeepState>;
    deep: <DeepState>(...path: Path) => Storage<DeepState>;
}
export interface Subscription {
    subscribeTo: (...path: Path) => void;
    cancel: () => void;
}
export declare type stringOrNumber = string | number;
export declare type Path = stringOrNumber[];
export declare class DeepStorage<State> implements Storage<State> {
    state: State;
    private id;
    path: Path;
    private subscriptions;
    constructor(state: State, ...path: Path);
    update: (callback: (s: State) => State) => void;
    updateProperty: <Key extends keyof State>(key: Key, callback: (s: State[Key]) => State[Key]) => void;
    setIn: (...path: (string | number)[]) => <DeepState>(newValue: DeepState) => void;
    merge: (partial: {
        [P in keyof State]?: State[P];
    }) => void;
    updateIn: (...path: (string | number)[]) => <DeepState>(callback: (s: DeepState) => DeepState) => void;
    stateIn: <DeepState>(...path: (string | number)[]) => any;
    deep: <DeepState>(...path: (string | number)[]) => Storage<DeepState>;
    subscription: (callback: StateUpdateCallback) => {
        subscribeTo: (...path: (string | number)[]) => void;
        cancel: () => void;
    };
}
export declare function parsePath(path: Path | stringOrNumber): Path;
export declare function parsePaths(paths: {
    [key: string]: Path | stringOrNumber;
}): {
    [key: string]: Path;
};
