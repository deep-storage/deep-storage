export type StateUpdateCallback = <DeepState>(
  path: Path,
  newState: DeepState,
  oldState: DeepState
) => void;

function arraysEqual(a: any, b: any) {
  if (a === b) {
    return true;
  }
  if (a == null || b == null) {
    return false;
  }
  if (a.length !== b.length) {
    return false;
  }

  // If you don't care about the order of the elements inside
  // the array, you should sort both arrays here.

  for (let i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
}

function removePath(pathToRemove: Path, paths: Path[]): Path[] {
  let found = false;
  const result: Path[] = [];
  for (const path of paths) {
    if (arraysEqual(path, pathToRemove) && !found) {
      found = true;
    } else {
      result.push(path);
    }
  }
  return result;
}

export interface DeepStorage<State, RootState = {}> {
  /**
   * sets a value in deep storage and notifies subscribers. shortcut for
   * update where the old value is ignored
   */
  set: (newValue: State) => Promise<DeepStorage<State, RootState>>;

  /**
   * Updates the whole state and notifies subscribers
   */
  update: (
    callback: (s: State) => State
  ) => Promise<DeepStorage<State, RootState>>;

  /**
   * Returns the state that this deep storage is managing
   */
  state: State;

  /**
   * Creates a new DeepStorage at this point in the object path
   */
  deep: <Key extends keyof State>(
    path: Key
  ) => DeepStorage<State[Key], RootState>;

  /**
   * Gets the root deep storage
   */
  root: () => DeepStorage<RootState, RootState>;

  /**
   * The path from the root to this storage
   */
  path: Path;

  /**
   * Returns an object with keys from State and values of
   * DeepStorage for that key
   */
  props: { [P in keyof State]: DeepStorage<State[P]> };

  /**
   * Get the value of a property
   */
  prop: <Key extends keyof State>(name: Key) => State[Key];

  addSubscriber: (subscriber: Subscriber) => void;
  removeSubscriber: (subscriber: Subscriber) => void;
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
  for (
    let i = 0;
    i < Math.min(subscriptionPath.length, stateChangePath.length);
    i++
  ) {
    if (stateChangePath[i] !== subscriptionPath[i]) {
      return false;
    }
  }
  return true;
}

export type stringNumberOrSymbol = string | number | symbol;
export type Path = stringNumberOrSymbol[];

export class Subscriber {
  private static idGenerator: number = 0;
  public id: number;
  private callback: StateUpdateCallback | undefined;
  constructor() {
    this.id = Subscriber.idGenerator++;
  }
  public onChange(callback: StateUpdateCallback) {
    this.callback = callback;
  }
  public change<DeepState>(
    path: Path,
    newState: DeepState,
    oldState: DeepState
  ) {
    if (this.callback) {
      this.callback(path, newState, oldState);
    }
  }
}

// tslint:disable-next-line:max-classes-per-file
export class DefaultDeepStorage<State> implements DeepStorage<State, State> {
  public path: Path = [];
  private subscriptions: {
    [key: number]: { paths: Path[]; subscriber: Subscriber };
  } = {};
  constructor(public state: State) {}
  public update = (
    callback: (s: State) => State
  ): Promise<DeepStorage<State, State>> => {
    return this.updateIn()(callback);
  };
  public set = (newValue: State) => {
    return this.updateIn()(() => newValue);
  };
  public setIn = (...path: Path) => <DeepState>(newValue: DeepState) => {
    return this.updateIn(...path)(() => newValue);
  };
  public merge = (partial: { [P in keyof State]: State[P] }) => {
    this.update(oldState => {
      for (const key in partial) {
        if (partial.hasOwnProperty(key)) {
          oldState[key] = partial[key];
        }
      }
      return oldState;
    });
  };
  public updateIn = (...path: Path) => async <DeepState>(
    callback: (s: DeepState) => DeepState
  ): Promise<DeepStorage<DeepState, State>> => {
    const oldState = this.stateIn<DeepState>(...path);
    const newState = callback(oldState);

    if (path.length === 0) {
      this.state = newState as any;
    } else {
      // todo: this will no doubt cause some bugs... better to replace all the
      // parent objects too so that reference equality checks work in react
      this.stateIn(...path.slice(0, path.length - 1))[
        path[path.length - 1]
      ] = newState;
    }
    const stateChangePath = path;
    for (const subscriberId in this.subscriptions) {
      if (this.subscriptions.hasOwnProperty(subscriberId)) {
        const subscriber = this.subscriptions[subscriberId];
        // check to see if we have any matches
        if (
          subscriber.paths.some(subscriberPath =>
            isPathMatch(stateChangePath, subscriberPath)
          )
        ) {
          subscriber.subscriber.change(stateChangePath, newState, oldState);
        }
      }
    }
    return this.deepIn(...path);
  };
  public stateIn = <DeepState>(...path: Path) => {
    let currentState: any = this.state;
    const pathSoFar = [];
    for (const p of path) {
      pathSoFar.push(p);
      if (!(p in currentState)) {
        currentState[p] = {};
      }
      currentState = currentState[p];
    }
    return currentState;
  };
  public deepIn = <DeepState>(...path: Path): DeepStorage<DeepState, State> => {
    return new NestedDeepStorage<DeepState, State>(path, this);
  };
  public deep = <DeepState>(
    name: stringNumberOrSymbol
  ): DeepStorage<DeepState, State> => {
    return this.deepIn(name);
  };
  public addSubscriber = (subscriber: Subscriber) => {
    this.addSubscriberIn(...this.path)(subscriber);
  };
  public addSubscriberIn = (...path: Path) => (subscriber: Subscriber) => {
    const subscription = this.subscriptions[subscriber.id];
    if (subscription) {
      subscription.paths.push(path);
    } else {
      this.subscriptions[subscriber.id] = {
        paths: [path],
        subscriber
      };
    }
  };
  public removeSubscriber = (subscriber: Subscriber) => {
    this.removeSubscriberIn(...this.path)(subscriber);
  };
  public removeSubscriberIn = (...path: Path) => (subscriber: Subscriber) => {
    const subscription = this.subscriptions[subscriber.id];
    if (subscription) {
      subscription.paths = removePath(path, subscription.paths);
    }
  };
  public root = () => this;
  get props() {
    const result: any = {};
    for (const key of Object.keys(this.state)) {
      result[key] = this.deep(key);
    }
    return result as { [P in keyof State]: DeepStorage<State[P]> };
  }
  public prop = <Key extends keyof State>(name: Key) => {
    return this.deep<State[Key]>(name).state;
  };
}

// tslint:disable-next-line:max-classes-per-file
export class NestedDeepStorage<State, RootState>
  implements DeepStorage<State, RootState> {
  constructor(
    public path: Path,
    public rootStorage: DefaultDeepStorage<RootState>
  ) {}

  public setIn = (...path: stringNumberOrSymbol[]) => <DeepState>(
    newValue: DeepState
  ): Promise<DeepStorage<DeepState, RootState>> => {
    return this.rootStorage.setIn(...this.path.concat(path))(newValue);
  };

  public set = (newValue: State): Promise<DeepStorage<State, RootState>> => {
    return this.rootStorage.setIn(...this.path)(newValue);
  };

  public update = (
    callback: (s: State) => State
  ): Promise<DeepStorage<State, RootState>> => {
    return this.rootStorage.updateIn(...this.path)(callback);
  };

  public updateIn = (...path: stringNumberOrSymbol[]) => <DeepState>(
    callback: (s: DeepState) => DeepState
  ): Promise<DeepStorage<DeepState, RootState>> => {
    return this.rootStorage.updateIn(...this.path.concat(path))(callback);
  };

  get state() {
    return this.rootStorage.stateIn<State>(...this.path);
  }

  public stateIn = <DeepState>(...path: stringNumberOrSymbol[]): DeepState => {
    return this.rootStorage.stateIn(...this.path.concat(path));
  };
  public deep = <DeepState>(
    ...path: stringNumberOrSymbol[]
  ): DeepStorage<DeepState, RootState> => {
    return this.rootStorage.deepIn(...this.path.concat(path));
  };
  public root = () => this.rootStorage;
  get props() {
    const result: any = {};
    for (const key of Object.keys(this.state)) {
      result[key] = this.deep(key);
    }
    return result as { [P in keyof State]: DeepStorage<State[P]> };
  }
  public prop = <Key extends keyof State>(name: Key) => {
    return this.deep<State[Key]>(name).state;
  };
  public addSubscriber = (subscriber: Subscriber) => {
    this.rootStorage.addSubscriberIn(...this.path)(subscriber);
  };
  public removeSubscriber = (subscriber: Subscriber) => {
    this.rootStorage.removeSubscriberIn(...this.path)(subscriber);
  };
}

function numberOrString(value: string): stringNumberOrSymbol {
  const parsed = parseInt(value, 10);
  return parsed.toString() === value ? parsed : value;
}

export function parsePath(path: Path | stringNumberOrSymbol): Path {
  if (path instanceof Array) {
    return path;
  } else if (typeof path === "string") {
    return path.split("/").map(numberOrString);
  } else {
    return [path];
  }
}

export function parsePaths(paths: {
  [key: string]: Path | stringNumberOrSymbol;
}): { [key: string]: Path } {
  const result: { [key: string]: Path } = {};
  for (const key in paths) {
    if (paths.hasOwnProperty(key)) {
      result[key] = parsePath(paths[key]);
    }
  }
  return result;
}

export const deepStorage = <State>(s: State): DeepStorage<State, State> =>
  new DefaultDeepStorage<State>(s);
