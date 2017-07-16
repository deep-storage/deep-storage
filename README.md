Deep Storage provides observable state for reactive applications in JavaScript.

## Key features

* Simple to use observable state management
* Optimised for use with React
* No global state

## The gist of Deep Storage

### 1. Create a new Deep Storage instance and initialise its state

    const storage = new DeepStorage({
        timer: 0
    });

### 2. Create a view that responds to changes in state

    import {DeepObserver} from 'deep-storage/react';

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

    ReactDOM.render((
        <DeepObserver storage={storage} paths={{timer: ['timer']}}>
            <TimerView resetTimer={resetTimer}/>
        </DeepObserver>
    ), document.body);

### 3. Modify the State

    function resetTimer() {
        storage.setIn('timer')(0);
    }

    setInterval(function tick() {
        storage.updateIn('timer')(prev => prev + 1);
    }, 1000);
