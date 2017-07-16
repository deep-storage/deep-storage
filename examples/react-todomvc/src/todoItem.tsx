import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Todo } from "./todoModel";
import * as classNames from 'classnames';

const ESCAPE_KEY = 27;
const ENTER_KEY = 13;

export interface TodoItemState {
    editText: string;
}

export interface TodoItemProps {
    onSave(value: string): void;
    onDestroy(): void;
    onEdit(): void;
    onToggle(): void;
    onCancel(event: React.KeyboardEvent<any>): void;
    todo: Todo
    editing: boolean;
}

export default class TodoItem extends React.Component<TodoItemProps, TodoItemState> {

    state = { editText: this.props.todo.title };

    handleSubmit = (event: React.FormEvent<any>) => {
        const val = this.state.editText.trim();
        if (val) {
            this.props.onSave(val);
            this.setState({ editText: val });
        } else {
            this.props.onDestroy();
        }
    }

    handleEdit = () => {
        this.props.onEdit();
        this.setState({ editText: this.props.todo.title });
    }

    handleKeyDown = (event: React.KeyboardEvent<any>) => {
        if (event.which === ESCAPE_KEY) {
            this.setState({ editText: this.props.todo.title });
            this.props.onCancel(event);
        } else if (event.which === ENTER_KEY) {
            this.handleSubmit(event);
        }
    }

    handleChange = (event: React.ChangeEvent<any>) => {
        if (this.props.editing) {
            this.setState({ editText: event.target.value });
        }
    }

    componentDidUpdate(prevProps: TodoItemProps) {
        if (!prevProps.editing && this.props.editing) {
            this.editField.focus();
            this.editField.setSelectionRange(this.editField.value.length, this.editField.value.length);
        }
    }

    private editField: any; // todo: find out what the right type is here

    setEditField = (c: any) => {
        this.editField = c;
    }

    render() {
        return (
            <li className={classNames({
                completed: this.props.todo.completed,
                editing: this.props.editing
            })}>
                <div className="view">
                    <input
                        className="toggle"
                        type="checkbox"
                        checked={this.props.todo.completed}
                        onChange={this.props.onToggle}
                    />
                    <label onDoubleClick={this.handleEdit}>
                        {this.props.todo.title}
                    </label>
                    <button className="destroy" onClick={this.props.onDestroy} />
                </div>
                <input
                    ref={this.setEditField}
                    className="edit"
                    value={this.state.editText}
                    onBlur={this.handleSubmit}
                    onChange={this.handleChange}
                    onKeyDown={this.handleKeyDown}
                />
            </li>
        );
    }
}