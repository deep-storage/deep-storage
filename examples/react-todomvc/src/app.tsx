import * as React from 'react';
import { TodoModel, Todo } from "./todoModel";
import TodoFooter from "./footer";
import TodoItem from "./todoItem";
import { DeepSubscriptions, Subscription } from "../../../src/index";
import { values, sortBy, reverse } from 'lodash';

export enum NowShowing {
    AllTodos,
    ActiveTodos,
    CompletedTodos
}

const ENTER_KEY = 13;

export interface TodoAppState {
    nowShowing: NowShowing;
    editing?: string;
    newTodo: string;
}

export interface TodoAppProps {
    model: TodoModel;
    todos?: {[key: string]: Todo}
}

export default class TodoApp extends React.Component<TodoAppProps, TodoAppState> {
    state = {
        nowShowing: NowShowing.AllTodos,
        editing: null,
        newTodo: ''
    } as TodoAppState;

    constructor(props: TodoAppProps) {
        super(props);
    }

    handleChange = (event: React.ChangeEvent<any>) => {
        this.setState({ newTodo: event.target.value });
    }

    handleNewTodoKeyDown = (event: React.KeyboardEvent<any>) => {
        if (event.keyCode !== ENTER_KEY) {
            return;
        }

        event.preventDefault();

        const val = this.state.newTodo.trim();

        if (val) {
            this.props.model.addTodo(val);
            this.setState({ newTodo: '' });
        }
    }

    toggleAll = (event: React.FormEvent<any>) => {
        const target: any = event.target;
        const checked = target.checked;
        this.props.model.toggleAll(checked);
    }

    toggle = (todoToToggle: Todo) => {
        this.props.model.toggle(todoToToggle.id);
    }

    destroy = (todo: Todo) => {
        this.props.model.destroy(todo.id);
    }

    edit = (todo: Todo) => {
        this.setState({ editing: todo.id });
    }

    save = (todoToSave: Todo, text: string) => {
        this.props.model.save(todoToSave.id, text);
        this.setState({ editing: null });
    }

    cancel = () => {
        this.setState({ editing: null });
    }

    clearCompleted = () => {
        this.props.model.clearCompleted();
    }

    render() {
        let footer: React.ReactElement<any>;
        let main: React.ReactElement<any>;

        const todoValues = reverse(sortBy(values(this.props.todos), 'timestamp'));

        const shownTodos = todoValues.filter(function (todo) {
            switch (this.state.nowShowing) {
                case NowShowing.ActiveTodos:
                    return !todo.completed;
                case NowShowing.CompletedTodos:
                    return todo.completed;
                default:
                    return true;
            }
        }, this);

        const todoItems = shownTodos.map(function (todo) {
            return (
                <TodoItem
                    key={todo.id}
                    todo={todo}
                    onToggle={this.toggle.bind(this, todo)}
                    onDestroy={this.destroy.bind(this, todo)}
                    onEdit={this.edit.bind(this, todo)}
                    editing={this.state.editing === todo.id}
                    onSave={this.save.bind(this, todo)}
                    onCancel={this.cancel}
                />
            );
        }, this);

        const activeTodoCount = todoValues.reduce(function (accum, todo) {
            return todo.completed ? accum : accum + 1;
        }, 0);

        const completedCount = todoValues.length - activeTodoCount;

        if (activeTodoCount || completedCount) {
            footer =
                <TodoFooter
                    count={activeTodoCount}
                    completedCount={completedCount}
                    nowShowing={this.state.nowShowing}
                    onClearCompleted={this.clearCompleted}
                />;
        }

        if (todoValues.length) {
            main = (
                <section className="main">
                    <input
                        className="toggle-all"
                        type="checkbox"
                        onChange={this.toggleAll}
                        checked={activeTodoCount === 0}
                    />
                    <ul className="todo-list">
                        {todoItems}
                    </ul>
                </section>
            );
        }

        return (
            <div>
                <header className="header">
                    <h1>todos</h1>
                    <input
                        className="new-todo"
                        placeholder="What needs to be done?"
                        value={this.state.newTodo}
                        onKeyDown={this.handleNewTodoKeyDown}
                        onChange={this.handleChange}
                        autoFocus={true}
                    />
                </header>
                {main}
                {footer}
            </div>
        );
    }
}
