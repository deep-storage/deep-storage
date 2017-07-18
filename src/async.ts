import { DeepStorage } from "./index";

export enum AsyncStatus {
    Created,
    Running,
    Failed,
    Succeeded
}

export interface DeepAsyncData<Request, Response> {
    status: AsyncStatus;
    completed: boolean;
    request?: Request;
    response?: Response;
    error?: any
}

export interface DeepAsync<Request, Response> extends DeepAsyncData<Request, Response> {
    run(request: Request): Promise<DeepAsyncData<Request, Response>>;
    rerun(): Promise<DeepAsyncData<Request, Response>>;
}

export class AlreadyRunningError extends Error {
}

export class DefaultDeepAsync<Request, Response> implements DeepAsync<Request, Response> {
    constructor(
        public storage: DeepStorage<DeepAsyncData<Request, Response>>,
        public process: (request: Request) => Promise<Response>
    ) {
    }
    run = async (request: Request): Promise<DeepAsyncData<Request, Response>> => {
        // todo: probably want to queue this
        if (this.status === AsyncStatus.Running) throw new AlreadyRunningError();
        this.storage.update(state => ({ ...state, status: AsyncStatus.Running, request, response: undefined, error: undefined }));
        try {
            const response = await this.process(request);
            this.storage.update(state => ({ ...state, status: AsyncStatus.Succeeded, response, error: undefined }));
            return this.storage.state;
        } catch (error) {
            this.storage.update(state => ({ ...state, status: AsyncStatus.Failed, error, response: undefined }));
            return this.storage.state;
        }
    }
    rerun(): Promise<DeepAsyncData<Request, Response>> {
        return this.run(this.request);
    }
    get status() { return this.storage.state.status; }
    get completed() { return this.storage.state.status === AsyncStatus.Failed || this.storage.state.status == AsyncStatus.Succeeded }
    get request() { return this.storage.state.request };
    get response() { return this.storage.state.response };
    get error() { return this.storage.state.error };
}

export default <Request, Response>(
    storage: DeepStorage<DeepAsyncData<Request, Response>>,
    process: (request: Request) => Promise<Response>
) => {
    return new DefaultDeepAsync(storage, process);
}
