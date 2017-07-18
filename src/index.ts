export type StateUpdateCallback = <DeepState>(path: Path, newState: DeepState, oldState: DeepState) => void;

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
 * Is one array a prefix on another e.g.
 * 
 * [] is a prefix of any array
 * ['asdf'] is a prefix of ['asdf', ...]
 * 
 * etc.
 * 
 * @param full the full array to check, must not be null
 * @param partial the partial array to check
 */
function isPrefix<T>(full: T[], partial: T[]) {
    if (partial.length > full.length) return false;
    for (let i = 0; i < partial.length; i++) {
        if (partial[i] !== full[i]) return false;
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

export type stringOrNumber = string | number;
export type Path = stringOrNumber[];

export class DefaultDeepStorage<State> implements DeepStorage<State> {

    private id: number = 0;

    private subscriptions: { [key: number]: { paths: Path[], callback: StateUpdateCallback } } = {};
    constructor(public state: State) {
    }
    update = (callback: (s: State) => State): void => {
        return this.updateIn()(callback);
    }
    updateProperty = <Key extends keyof State>(key: Key, callback: (s: State[Key]) => State[Key]): void => {
        return this.updateIn(key)(callback);
    }
    setIn = (...path: Path) => <DeepState>(newValue: DeepState) => {
        this.updateIn(...path)(() => newValue);
    }
    merge = (partial: {[P in keyof State]?: State[P]}) => {
        this.update(oldState => {
            for (let key in partial) {
                oldState[key] = partial[key];
            }
            return oldState;
        });
    }
    updateIn = (...path: Path) => <DeepState>(callback: (s: DeepState) => DeepState): void => {
        const oldState = this.stateIn<DeepState>(...path);
        const newState = callback(oldState);

        if (path.length === 0) {
            this.state = newState as any;
        } else {
            // todo: this will no doubt cause some bugs... better to replace all the 
            // parent objects too so that reference equality checks work in react
            this.stateIn(...path.slice(0, path.length - 1))[path[path.length - 1]] = newState;
        }
        const fullPath = path;
        for (let subscriberId in this.subscriptions) {
            const subscriber = this.subscriptions[subscriberId];
            // check to see if we have any matches
            if (subscriber.paths.some(subscriberPath => isPrefix(fullPath, subscriberPath))) {
                subscriber.callback(fullPath, newState, oldState)
            }
        }
    }
    stateIn = <DeepState>(...path: Path) => {
        let currentState: any = this.state;
        for (let p of path) {
            if (!(p in currentState)) {
                // todo: consider looking ahead to see if the next
                // p is a number and if so, initialize and array
                // instead of an object
                currentState[p] = {};
            }
            currentState = currentState[p];
        }
        return currentState;
    }
    deep = <DeepState>(...path: Path): DeepStorage<DeepState> => {
        return new NestedDeepStorage<State, DeepState>(path, this);
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
}

export class NestedDeepStorage<RootState, State> implements DeepStorage<State> {

    constructor(public path: Path, public root: DeepStorage<RootState>) {
    }

    setIn = (...path: stringOrNumber[]) => <DeepState>(newValue: DeepState): void => {
        return this.root.setIn(...this.path.concat(path))(newValue);
    }

    update = (callback: (s: State) => State): void => {
        return this.root.updateIn(...this.path)(callback);
    }

    updateIn = (...path: stringOrNumber[]) => <DeepState>(callback: (s: DeepState) => DeepState): void => {
        return this.root.updateIn(...this.path.concat(path))(callback);
    }

    updateProperty = <Key extends keyof State>(key: Key, callback: (s: State[Key]) => State[Key]): void => {
        return this.root.updateIn(...this.path.concat(key))(callback);
    }

    get state() { return this.root.stateIn<State>(...this.path); }

    stateIn = <DeepState>(...path: stringOrNumber[]): DeepState => {
        return this.root.stateIn(...this.path.concat(path));
    }
    deep = <DeepState>(...path: stringOrNumber[]): DeepStorage<DeepState> => {
        return this.root.deep(...this.path.concat(path));
    }
    subscription = (callback: StateUpdateCallback): DeepSubscription => {
        const rootSubscription = this.root.subscription((path, newState, oldState) => {
            callback(path.slice(path.length - this.path.length, path.length), newState, oldState);
        });
        return {
            subscribeTo: (...path: Path) => {
                return rootSubscription.subscribeTo(...this.path.concat(path));
            },
            cancel: rootSubscription.cancel
        }
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