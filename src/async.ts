import { DeepStorage } from "./index";

export enum AsyncStatus {
    Created,
    Running,
    Failed,
    Succeeded
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

export class AlreadyRunningError extends Error {
}

export class DefaultDeepAsync<Response> implements DeepAsync<Response> {
    constructor(
        public storage: DeepStorage<DeepAsyncState<Response>>,
        public process: () => Promise<Response>
    ) {
    }
    run = async (): Promise<DeepAsyncState<Response>> => {
        // todo: probably want to queue this
        if (this.status === AsyncStatus.Running) throw new AlreadyRunningError();
        await this.storage.update(state => ({ ...state, status: AsyncStatus.Running, data: undefined, error: undefined }));
        try {
            const data = await this.process();
            await this.storage.update(state => ({ ...state, status: AsyncStatus.Succeeded, data, error: undefined }));
            return this.storage.state;
        } catch (error) {
            await this.storage.update(state => ({ ...state, status: AsyncStatus.Failed, error, data: undefined }));
            return this.storage.state;
        }
    }
    update = async (updater: (prevState: Response) => Response): Promise<DeepAsyncState<Response>> => {
        await this.storage.update(
            (state: DeepAsyncState<Response>) =>
                ({
                    ...state,
                    status: AsyncStatus.Succeeded,
                    data: updater(state.data),
                    error: undefined
                }));
        return this.storage.state;
    }
    get status() { return this.storage.state.status; }
    get running() { return this.storage.state.status === AsyncStatus.Running }
    get started() { return this.storage.state.status !== AsyncStatus.Created }
    get succeeded() { return this.storage.state.status === AsyncStatus.Succeeded }
    get failed() { return this.storage.state.status === AsyncStatus.Failed }
    get completed() { return this.storage.state.status === AsyncStatus.Failed || this.storage.state.status == AsyncStatus.Succeeded }
    get data() { return this.storage.state.data };
    get error() { return this.storage.state.error };
}

export const deepAsync = async <Response>(
    storage: DeepStorage<DeepAsyncState<Response>>,
    process: () => Promise<Response>
) => {
    await storage.set({
        status: AsyncStatus.Created
    });
    return new DefaultDeepAsync(storage, process);
}

export default deepAsync;