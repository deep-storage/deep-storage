import * as React from 'react';
import { DeepStorage, Path, Subscription } from "../index";

export interface DeepObserverProps {
    storage: DeepStorage<any>;
    paths: { [key: string]: Path };
}

export class DeepObserver extends React.Component<DeepObserverProps, any> {

    subscription: Subscription;
    componentDidMount() {
        this.subscription = this.props.storage.subscription((...args: any[]) => {
            this.forceUpdate();
        });
        for (let key in this.props.paths) {
            this.subscription.subscribeTo(...this.props.paths[key]);
        }
    }
    componentWillUnmount() {
        this.subscription && this.subscription.cancel();
    }
    render() {
        const newProps = {} as { [key: string]: any };
        for (let key in this.props.paths) {
            newProps[key] = this.props.storage.stateIn(...this.props.paths[key]);
        }
        return React.cloneElement(React.Children.only(this.props.children), newProps);
    }

}