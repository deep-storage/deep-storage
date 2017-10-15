import { DeepStorage, UsesDeepStorage } from "./index";

export enum AsyncStatus {
    Created,
    Running,
    Failed,
    Succeeded
}

export interface DeepAsyncState<Request, Response> {
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

export interface DeepAsync<Request, Response> extends
    DeepAsyncState<Request, Response>,
    UsesDeepStorage<DeepAsyncState<Request, Response>> {
    run(request: Request): Promise<DeepAsyncState<Request, Response>>;
    rerun(): Promise<DeepAsyncState<Request, Response>>;
    updateResponse(updater: (prevState: Response) => Response): Promise<DeepAsyncState<Request, Response>>;
}

export class AlreadyRunningError extends Error {
}

export class DefaultDeepAsync<Request, Response> implements DeepAsync<Request, Response> {
    constructor(
        public storage: DeepStorage<DeepAsyncState<Request, Response>>,
        public process: (request: Request) => Promise<Response>
    ) {
    }
    run = async (request: Request): Promise<DeepAsyncState<Request, Response>> => {
        // todo: probably want to queue this
        if (this.status === AsyncStatus.Running) throw new AlreadyRunningError();
        await this.storage.update(state => ({ ...state, status: AsyncStatus.Running, request, response: undefined, error: undefined }));
        try {
            const response = await this.process(request);
            await this.storage.update(state => ({ ...state, status: AsyncStatus.Succeeded, response, error: undefined }));
            return this.storage.state;
        } catch (error) {
            await this.storage.update(state => ({ ...state, status: AsyncStatus.Failed, error, response: undefined }));
            return this.storage.state;
        }
    }
    rerun = (): Promise<DeepAsyncState<Request, Response>> => {
        return this.run(this.request);
    }
    updateResponse = async (updater: (prevState: Response) => Response): Promise<DeepAsyncState<Request, Response>> => {
        await this.storage.update((state: DeepAsyncState<Request, Response>) => ({ ...state, status: AsyncStatus.Succeeded, updater(state.response), error: undefined }));
        return this.storage.state;
    }
    get status() { return this.storage.state.status; }
    get running() { return this.storage.state.status === AsyncStatus.Running }
    get started() { return this.storage.state.status !== AsyncStatus.Created }
    get succeeded() { return this.storage.state.status === AsyncStatus.Succeeded }
    get failed() { return this.storage.state.status === AsyncStatus.Failed }
    get completed() { return this.storage.state.status === AsyncStatus.Failed || this.storage.state.status == AsyncStatus.Succeeded }
    get request() { return this.storage.state.request };
    get response() { return this.storage.state.response };
    get error() { return this.storage.state.error };
}

export const deepAsync = async <Request, Response>(
    storage: DeepStorage<DeepAsyncState<Request, Response>>,
    process: (request: Request) => Promise<Response>
) => {
    await storage.set({
        status: AsyncStatus.Created,
        
    });
    return new DefaultDeepAsync(storage, process);
}

export default deepAsync;