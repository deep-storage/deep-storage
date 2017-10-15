export * from './async';

export type StateUpdateCallback = <DeepState>(path: Path, newState: DeepState, oldState: DeepState) => void;

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
     * sets a value in deep storage and notifies subscribers. shortcut for
     * update where the old value is ignored
     */
    set: (newValue: State) => Promise<State>;

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
    props: {[P in keyof State]: DeepStorage<State[P]>}
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
export function isPathMatch<T>(stateChangePath: T[], subscriptionPath: T[]) {
    for (let i = 0; i < Math.min(subscriptionPath.length, stateChangePath.length); i++) {
        if (stateChangePath[i] !== subscriptionPath[i]) return false;
    }
    return true;
}

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

export type stringOrNumber = string | number;
export type Path = stringOrNumber[];

export class DefaultDeepStorage<State> implements DeepStorage<State, State> {

    private id: number = 0;
    private initialStates: { [key: string]: any } = {};

    private subscriptions: { [key: number]: { paths: Path[], callback: StateUpdateCallback } } = {};
    constructor(public state: State) {
    }
    update = (callback: (s: State) => State): Promise<State> => {
        return this.updateIn()(callback);
    }
    updateProperty = <Key extends keyof State>(key: Key, callback: (s: State[Key]) => State[Key]): Promise<State[Key]> => {
        return this.updateIn(key)(callback);
    }
    set = (newValue: State) => {
        return this.updateIn()(() => newValue);
    }
    setIn = (...path: Path) => <DeepState>(newValue: DeepState) => {
        return this.updateIn(...path)(() => newValue);
    }
    merge = (partial: {[P in keyof State]?: State[P]}) => {
        this.update(oldState => {
            for (let key in partial) {
                oldState[key] = partial[key];
            }
            return oldState;
        });
    }
    updateIn = (...path: Path) => async <DeepState>(callback: (s: DeepState) => DeepState): Promise<DeepState> => {
        const oldState = this.stateIn<DeepState>(...path);
        const newState = callback(oldState);

        if (path.length === 0) {
            this.state = newState as any;
        } else {
            // todo: this will no doubt cause some bugs... better to replace all the 
            // parent objects too so that reference equality checks work in react
            this.stateIn(...path.slice(0, path.length - 1))[path[path.length - 1]] = newState;
        }
        const stateChangePath = path;
        for (let subscriberId in this.subscriptions) {
            const subscriber = this.subscriptions[subscriberId];
            // check to see if we have any matches
            if (subscriber.paths.some(subscriberPath => isPathMatch(stateChangePath, subscriberPath))) {
                subscriber.callback(stateChangePath, newState, oldState)
            }
        }
        return newState;
    }
    cloneInitialState = (...path: Path) => {
        const initialState = this.initialStates[path.join('.')];
        if(typeof initialState === 'undefined') {
            return undefined;
        } else {
            return JSON.parse(JSON.stringify(initialState));
        }
    }
    stateIn = <DeepState>(...path: Path) => {
        let currentState: any = typeof this.state === 'undefined' ? this.cloneInitialState() : this.state;
        let pathSoFar = [];
        for (let p of path) {
            pathSoFar.push(p);
            if (!(p in currentState)) {
                // todo: consider looking ahead to see if the next
                // p is a number and if so, initialize and array
                // instead of an object
                const init = this.cloneInitialState(...pathSoFar);
                currentState[p] = typeof init === 'undefined' ? {} : init;
            }
            currentState = currentState[p];
        }
        return currentState;
    }
    init = (state: State): DeepStorage<State, State> => {
        return this.deepInit<State>()(state);
    }
    deepInit = <DeepState>(...path: Path) => (deepState: DeepState): DeepStorage<DeepState, State> => {
        this.initialStates[path.join('.')] = deepState;
        return new NestedDeepStorage<DeepState, State>(path, this);
    }
    deep = <DeepState>(...path: Path): DeepStorage<DeepState> => {
        return new NestedDeepStorage<DeepState, State>(path, this);
    }
    subscription = (callback: StateUpdateCallback) => {
        const subscriberId = this.id++;
        this.subscriptions[subscriberId] = {
            callback,
            paths: []
        } as any;
        const cancel = () => {
            delete this.subscriptions[subscriberId];
        }
        return {
            subscribeTo: (...path: Path) => {
                if (subscriberId in this.subscriptions) {
                    this.subscriptions[subscriberId].paths.push(path);
                }
            },
            cancel
        }
    }
    root = () => this;
    path: Path = [];
    get props() {
        const result: any = {};
        for (let key of Object.keys(this.state)) {
            result[key] = this.deep(key);
        }
        return result as {[P in keyof State]: DeepStorage<State[P]>};
    }
}

export class NestedDeepStorage<State, RootState> implements DeepStorage<State, RootState> {

    constructor(public path: Path, public rootStorage: DeepStorage<RootState, RootState>) {
    }

    setIn = (...path: stringOrNumber[]) => <DeepState>(newValue: DeepState): Promise<DeepState> => {
        return this.rootStorage.setIn(...this.path.concat(path))(newValue);
    }

    set = (newValue: State): Promise<State> => {
        return this.rootStorage.setIn(...this.path)(newValue);
    }

    update = (callback: (s: State) => State): Promise<State> => {
        return this.rootStorage.updateIn(...this.path)(callback);
    }

    updateIn = (...path: stringOrNumber[]) => <DeepState>(callback: (s: DeepState) => DeepState): Promise<DeepState> => {
        return this.rootStorage.updateIn(...this.path.concat(path))(callback);
    }

    updateProperty = <Key extends keyof State>(key: Key, callback: (s: State[Key]) => State[Key]): Promise<State[Key]> => {
        return this.rootStorage.updateIn(...this.path.concat(key))(callback);
    }

    get state() { return this.rootStorage.stateIn<State>(...this.path); }

    stateIn = <DeepState>(...path: stringOrNumber[]): DeepState => {
        return this.rootStorage.stateIn(...this.path.concat(path));
    }
    init = (state: State): DeepStorage<State, RootState> => {
        return this.deepInit<State>()(state);
    }
    deepInit = <DeepState>(...path: stringOrNumber[]) => (deepState: DeepState): DeepStorage<DeepState, RootState> => {
        return this.rootStorage.deepInit<DeepState>(...this.path.concat(path))(deepState);
    }
    deep = <DeepState>(...path: stringOrNumber[]): DeepStorage<DeepState> => {
        return this.rootStorage.deep(...this.path.concat(path));
    }
    subscription = (callback: StateUpdateCallback): DeepSubscription => {
        const rootSubscription = this.rootStorage.subscription((path, newState, oldState) => {
            callback(path.slice(path.length - this.path.length, path.length), newState, oldState);
        });
        return {
            subscribeTo: (...path: Path) => {
                return rootSubscription.subscribeTo(...this.path.concat(path));
            },
            cancel: rootSubscription.cancel
        }
    }
    root = () => this.rootStorage;
    get props() {
        const result: any = {};
        for (let key of Object.keys(this.state)) {
            result[key] = this.deep(key);
        }
        return result as {[P in keyof State]: DeepStorage<State[P]>};
    }
}

function numberOrString(value: string): stringOrNumber {
    const parsed = parseInt(value);
    return parsed.toString() === value ? parsed : value;
}

export function parsePath(path: Path | stringOrNumber): Path {
    if (path instanceof Array) {
        return path;
    } else if (typeof path === 'number') {
        return [path];
    } else if (typeof path === 'string') {
        return path.split('/').map(numberOrString);
    }
}

export function parsePaths(paths: { [key: string]: Path | stringOrNumber }): { [key: string]: Path } {
    const result: { [key: string]: Path } = {};
    for (let key in paths) {
        result[key] = parsePath(paths[key]);
    }
    return result;
}

export const deepStorage = <State>(s: State): DeepStorage<State> => new DefaultDeepStorage(s);
export default deepStorage;