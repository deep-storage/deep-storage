import { deepStorage, isPathMatch } from '../';
import { Subscriber } from '../storage';

test('stateIn', () => {
  const storage = deepStorage({
    todos: { abc: { id: 'abc', title: 'do something' } }
  });
  expect(storage.deep('todos').deep('abc').deep('title').state).toBe('do something');
});

test('props', () => {
  const storage = deepStorage({
    value1: 1,
    value2: 'two'
  });
  const props = storage.props;
  expect(props.value1).toBeTruthy();
  expect(props.value2).toBeTruthy();
  expect(props.value1.state).toEqual(1);
  expect(props.value2.state).toEqual('two');
});

test('deep', () => {
  const storage = deepStorage({
    todos: { abc: { id: 'abc', title: 'do something' } }
  });
  const deep = storage.deep('todos').deep('abc').deep('title');
  expect(deep.state).toBe('do something');
});

test('updateIn', () => {
  const storage = deepStorage({
    todos: { abc: { id: 'abc', title: 'do something' } }
  });
  storage.deep('todos').deep('abc').update(abc => ({ ...abc, title: 'test' }));
  expect(storage.deep('todos').deep('abc').deep('title').state).toBe('test');
});

test('setIn', () => {
  const storage = deepStorage({
    todos: { abc: { id: 'abc', title: 'do something' } }
  });
  storage.deep('todos').deep('abc').deep('title').set('test');
  expect(storage.deep('todos').deep('abc').deep('title').state).toBe('test');
});

test('subscription', (done) => {
  const storage = deepStorage({
    todos: { abc: { id: 'abc', title: 'do something' } }
  });
  const subscriber = new Subscriber();

  subscriber.onChange((path, newState, oldState) => {
    expect(path).toEqual(['todos', 'abc', 'title']);
    expect(newState).toBe('test');
    expect(oldState).toBe('do something');
    done();
  });
  storage.addSubscriber(subscriber);
  storage.deep('todos').deep('abc').deep('title').set('test');
  storage.removeSubscriber(subscriber);
});

test('isPathMatch', () => {
  // state change path of [] and subscription path of ['test']
  expect(isPathMatch([], ['test'])).toBeTruthy();

  expect(isPathMatch(['test'], ['test'])).toBeTruthy();

  expect(isPathMatch(['test', 'something'], ['test'])).toBeTruthy();

  expect(isPathMatch(['test'], ['test', 'something'])).toBeTruthy();

  expect(isPathMatch(['notTest'], ['test'])).toBeFalsy();

  expect(isPathMatch(['app', 'trello'], ['app', 'trello', 'connections'])).toBeTruthy();

});


test('subscription and update', (done) => {
  const storage = deepStorage({
    todos: [] as number[]
  });
  const subscriber = new Subscriber();
  subscriber.onChange((path, newState, oldState) => {
    expect(path).toEqual([]);
    expect(newState).toEqual({ todos: [1] });
    expect(oldState).toEqual({ todos: [] });
    done();
  });
  storage.deep('todos').addSubscriber(subscriber);
  storage.update(prevState => ({ ...prevState, todos: [1] }));
  storage.deep('todos').removeSubscriber(subscriber);
});
