import { DeepStorage } from "./index";
export declare enum AsyncStatus {
    Created = 0,
    Running = 1,
    Failed = 2,
    Succeeded = 3,
}
export interface DeepAsyncState<Data> {
    status: AsyncStatus;
    data?: Data;
    error?: any;
}
export interface DeepAsync<Response> extends DeepAsyncState<Response> {
    completed: boolean;
    succeeded: boolean;
    running: boolean;
    started: boolean;
    failed: boolean;
    run(): Promise<DeepAsyncState<Response>>;
    update(updater: (prevState: Response) => Response): Promise<DeepAsyncState<Response>>;
    storage: DeepStorage<DeepAsyncState<Response>>;
}
export declare class AlreadyRunningError extends Error {
}
export declare class DefaultDeepAsync<Response> implements DeepAsync<Response> {
    storage: DeepStorage<DeepAsyncState<Response>>;
    process: () => Promise<Response>;
    constructor(storage: DeepStorage<DeepAsyncState<Response>>, process: () => Promise<Response>);
    run: () => Promise<DeepAsyncState<Response>>;
    update: (updater: (prevState: Response) => Response) => Promise<DeepAsyncState<Response>>;
    readonly status: AsyncStatus;
    readonly running: boolean;
    readonly started: boolean;
    readonly succeeded: boolean;
    readonly failed: boolean;
    readonly completed: boolean;
    readonly data: Response;
    readonly error: any;
}
export declare const deepAsync: <Response>(storage: DeepStorage<DeepAsyncState<Response>, {}>, process: () => Promise<Response>) => Promise<DefaultDeepAsync<Response>>;
export default deepAsync;
