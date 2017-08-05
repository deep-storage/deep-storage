import { DeepStorage, UsesDeepStorage } from "./index";
export declare enum AsyncStatus {
    Created = 0,
    Running = 1,
    Failed = 2,
    Succeeded = 3,
}
export interface DeepAsyncData<Request, Response> {
    status: AsyncStatus;
    completed: boolean;
    succeeded: boolean;
    running: boolean;
    started: boolean;
    failed: boolean;
    request?: Request;
    response?: Response;
    error?: any;
}
export interface DeepAsync<Request, Response> extends DeepAsyncData<Request, Response>, UsesDeepStorage<DeepAsyncData<Request, Response>> {
    run(request: Request): Promise<DeepAsyncData<Request, Response>>;
    rerun(): Promise<DeepAsyncData<Request, Response>>;
}
export declare class AlreadyRunningError extends Error {
}
export declare class DefaultDeepAsync<Request, Response> implements DeepAsync<Request, Response> {
    storage: DeepStorage<DeepAsyncData<Request, Response>>;
    process: (request: Request) => Promise<Response>;
    constructor(storage: DeepStorage<DeepAsyncData<Request, Response>>, process: (request: Request) => Promise<Response>);
    run: (request: Request) => Promise<DeepAsyncData<Request, Response>>;
    rerun(): Promise<DeepAsyncData<Request, Response>>;
    readonly status: AsyncStatus;
    readonly running: boolean;
    readonly started: boolean;
    readonly succeeded: boolean;
    readonly failed: boolean;
    readonly completed: boolean;
    readonly request: Request;
    readonly response: Response;
    readonly error: any;
}
declare const _default: <Request, Response>(storage: DeepStorage<DeepAsyncData<Request, Response>, {}>, process: (request: Request) => Promise<Response>) => DefaultDeepAsync<Request, Response>;
export default _default;
