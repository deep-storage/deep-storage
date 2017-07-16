import * as React from 'react';
import { NowShowing } from "./app";
import * as classNames from 'classnames';

export interface TodoFooterProps {
    completedCount: number;
    count: number;
    nowShowing: NowShowing;
    onClearCompleted: () => void;
}

export default class TodoFooter extends React.Component<TodoFooterProps, {}> {
    render() {
        var activeTodoWord = this.props.count == 1 ? 'item' : 'items';
        var clearButton = null;

        if (this.props.completedCount > 0) {
            clearButton = (
                <button
                    className="clear-completed"
                    onClick={this.props.onClearCompleted}>
                    Clear completed
					</button>
            );
        }

        var nowShowing = this.props.nowShowing;
        return (
            <footer className="footer">
                <span className="todo-count">
                    <strong>{this.props.count}</strong> {activeTodoWord} left
					</span>
                <ul className="filters">
                    <li>
                        <a
                            href="#/"
                            className={classNames({ selected: nowShowing === NowShowing.AllTodos })}>
                            All
							</a>
                    </li>
                    {' '}
                    <li>
                        <a
                            href="#/active"
                            className={classNames({ selected: nowShowing === NowShowing.ActiveTodos })}>
                            Active
							</a>
                    </li>
                    {' '}
                    <li>
                        <a
                            href="#/completed"
                            className={classNames({ selected: nowShowing === NowShowing.CompletedTodos })}>
                            Completed
							</a>
                    </li>
                </ul>
                {clearButton}
            </footer>
        );
    }
}