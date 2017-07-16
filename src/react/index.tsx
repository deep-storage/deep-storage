import * as React from 'react';
import { DeepStorage, Path, Subscription } from "../index";

export const deep = <State extends {}>(storage: DeepStorage<State>, paths: { [key: string]: Path }) => <P extends {}>(BaseComponent: React.ComponentType<P>) =>
    class extends React.Component<P, {}> {
        subscription: Subscription;
        componentDidMount() {
            this.subscription = storage.subscription((...args: any[]) => {
                this.forceUpdate();
            });
            for (let key in paths) {
                this.subscription.subscribeTo(...paths[key]);
            }
        }
        componentWillUnmount() {
            this.subscription && this.subscription.cancel();
        }
        shouldComponentUpdate(nextProps: P, nextState: {}) {
            const nextPropsAny: any = nextProps;
            for (let key in paths) {
                if(nextPropsAny[key] !== storage.stateIn(...paths[key])) {
                    return true;
                }
            }
            return false;
        }
        render() {
            const newProps: any = Object.assign({}, this.props);
            for (let key in paths) {
                newProps[key] = storage.stateIn(...paths[key])
            }
            return <BaseComponent {...newProps} />;
        }
    };
