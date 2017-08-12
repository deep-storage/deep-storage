import deepStorage, { isPathMatch } from '../';

test('stateIn', () => {
  const storage = deepStorage({
    todos: { abc: { id: 'abc', title: 'do something' } }
  });
  expect(storage.stateIn('todos', 'abc', 'title')).toBe('do something');
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

test('init', () => {
  const storage = deepStorage({
  });
  const testStorage = storage.deepInit('test')(1);
  expect(testStorage.state).toEqual(1);
});

test('deep', () => {
  const storage = deepStorage({
    todos: { abc: { id: 'abc', title: 'do something' } }
  });
  const deep = storage.deep('todos', 'abc');
  expect(deep.stateIn('title')).toBe('do something');
});

test('updateIn', () => {
  const storage = deepStorage({
    todos: { abc: { id: 'abc', title: 'do something' } }
  });
  storage.updateIn('todos', 'abc')<{ title: string }>(abc => ({ ...abc, title: 'test' }));
  expect(storage.stateIn('todos', 'abc', 'title')).toBe('test');
});

test('setIn', () => {
  const storage = deepStorage({
    todos: { abc: { id: 'abc', title: 'do something' } }
  });
  storage.setIn('todos', 'abc', 'title')<string>('test');
  expect(storage.stateIn('todos', 'abc', 'title')).toBe('test');
});

test('subscription', (done) => {
  const storage = deepStorage({
    todos: { abc: { id: 'abc', title: 'do something' } }
  });
  const subscription = storage.subscription((path, newState, oldState) => {
    expect(path).toEqual(['todos', 'abc', 'title']);
    expect(newState).toBe('test');
    expect(oldState).toBe('do something');
    done();
  });
  subscription.subscribeTo('todos');
  storage.setIn('todos', 'abc', 'title')<string>('test');
  subscription.cancel();
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
    todos: []
  });
  const subscription = storage.subscription((path, newState, oldState) => {
    expect(path).toEqual([]);
    expect(newState).toEqual({ todos: [1] });
    expect(oldState).toEqual({ todos: [] });
    done();
  });
  subscription.subscribeTo('todos');
  storage.update(prevState => ({ ...prevState, todos: [1] }));
  subscription.cancel();
});
