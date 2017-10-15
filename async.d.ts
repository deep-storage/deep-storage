import { DeepStorage, UsesDeepStorage } from "./index";
export declare enum AsyncStatus {
    Created = 0,
    Running = 1,
    Failed = 2,
    Succeeded = 3,
}
export interface DeepAsyncState<Request, Response> {
    status: AsyncStatus;
    request?: Request;
    response?: Response;
    error?: any;
}
export interface DeepAsync<Request, Response> extends DeepAsyncState<Request, Response>, UsesDeepStorage<DeepAsyncState<Request, Response>> {
    completed: boolean;
    succeeded: boolean;
    running: boolean;
    started: boolean;
    failed: boolean;
    run(request: Request): Promise<DeepAsyncState<Request, Response>>;
    rerun(): Promise<DeepAsyncState<Request, Response>>;
    updateResponse(updater: (prevState: Response) => Response): Promise<DeepAsyncState<Request, Response>>;
}
export declare class AlreadyRunningError extends Error {
}
export declare class DefaultDeepAsync<Request, Response> implements DeepAsync<Request, Response> {
    storage: DeepStorage<DeepAsyncState<Request, Response>>;
    process: (request: Request) => Promise<Response>;
    constructor(storage: DeepStorage<DeepAsyncState<Request, Response>>, process: (request: Request) => Promise<Response>);
    run: (request: Request) => Promise<DeepAsyncState<Request, Response>>;
    rerun: () => Promise<DeepAsyncState<Request, Response>>;
    updateResponse: (updater: (prevState: Response) => Response) => Promise<DeepAsyncState<Request, Response>>;
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
export declare const deepAsync: <Request, Response>(storage: DeepStorage<DeepAsyncState<Request, Response>, {}>, process: (request: Request) => Promise<Response>) => Promise<DefaultDeepAsync<Request, Response>>;
export default deepAsync;
