Deep Storage provides observable state for reactive applications in JavaScript.

## Key features

* Simple to use observable state management
* Optimised for use with React
* No global state
* Simple way to manage shared state with or without a fully fledged flux pattern

## Documentation

[The Deep Storage user manual](https://deep-storage.gitbooks.io/deep-storage/content/)

## Real World Example

See a [Real World Example](https://github.com/deep-storage/examples/tree/master/react-saas) of
deep storage react.

[Demo](http://react-saas.surge.sh/) here.

## TodoMVC

See an [implementation of TodoMVC that uses Deep Storage](https://github.com/deep-storage/examples/tree/master/react-todomvc).

## Installing

```bash
npm install deep-storage # or yarn add deep-storage
```

## The gist of Deep Storage

### 1. Create a new Deep Storage instance and initialise its state

```javascript
import { deepStorage } from 'deep-storage';

const storage = deepStorage({
    timer: 0
});
```

### 2. Create a view that responds to changes in state

```javascript
import { connect } from 'deep-storage-react';

class TimerView extends React.Component {
    render() {
        return (
            <button onClick={this.onReset.bind(this)}>
                Seconds passed: {this.props.timer}
            </button>
        );
    }
    onReset () {
        this.props.resetTimer();
    }
};

const DeepTimerView = connect({timer: storage.deep('timer')})(TimerView);

ReactDOM.render((
    <DeepTimerView resetTimer={resetTimer}/>
), document.body);
```

### 3. Modify the State

```javascript
function resetTimer() {
    storage.setIn('timer')(0);
}

setInterval(function tick() {
    storage.deep('timer').update(prev => prev + 1);
}, 1000);
```