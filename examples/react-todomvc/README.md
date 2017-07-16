# TodoMVC using Deep Storage

## Introduction

This is an implementation of the TodoMVC app using React + TypeScript + Deep Storage. Many thanks
to the [tastejs implementation](https://github.com/tastejs/todomvc/tree/gh-pages/examples/react) which this
very much inspired by.

The biggest architectural change was to use Deep Storage as backing for the [todoModel.ts](https://github.com/deep-storage/deep-storage/blob/master/examples/react-todomvc/src/todoModel.ts).

## Running

    # clone this repo
    git clone git@github.com:deep-storage/deep-storage.git

    # install the deep-storage packages
    yarn install

    # change directory to react-todomvc and install it's packages
    cd examples/react-todomvc/
    yarn install

    # run the app
    yarn start

    # browse to http://localhost:8081

