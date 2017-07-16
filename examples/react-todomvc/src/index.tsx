import * as React from 'react';
import * as ReactDOM from 'react-dom';

import 'todomvc-common/base.css';
import 'todomvc-app-css/index.css';

import { DeepStorage, Path, Subscription } from '../../../src/index';
import { DeepObserver } from '../../../src/react/index';

import TodoApp from './app';
import { Todos, DeepTodoModel } from "./todoModel";

const storage = new DeepStorage({
    todos: {}
} as Todos);

const model = new DeepTodoModel(storage);

ReactDOM.render(
    (<DeepObserver paths={{todos: ['todos']}} storage={storage}><TodoApp model={model}/></DeepObserver>)
    , document.getElementById('root'));
