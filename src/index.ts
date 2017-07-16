type StateUpdateCallback = <DeepState>(path: Path, oldState: DeepState, newState: DeepState) => void;

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

function isPrefix<T>(full: T[], partial: T[]) {
    if (partial.length > full.length) return false;
    for (let i = 0; i < partial.length; i++) {
        if (partial[i] !== full[i]) return false;
    }
    return true;
}

export interface Subscription {
    subscribeTo: (...path: Path) => void;
    cancel: () => void;
}

export type stringOrNumber = string | number;
export type Path = stringOrNumber[];

export class DeepStorage<State> implements Storage<State> {

    private id: number = 0;
    public path: Path;

    private subscriptions: { [key: number]: { paths: Path[], callback: StateUpdateCallback } } = {};
    constructor(public state: State, ...path: Path) {
        this.path = path;
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
            for(let key in partial) {
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
        const fullPath = this.path.concat(path);
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
        for (let p of this.path.concat(path)) {
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
    deep = <DeepState>(...path: Path): Storage<DeepState> => {
        return new DeepStorage<DeepState>(this.stateIn<DeepState>(...path), ...this.path);
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