import deepStorage from '../';

test('stateIn', () => {
  const storage = deepStorage({
    todos: { abc: { id: 'abc', title: 'do something' } }
  });
  expect(storage.stateIn('todos', 'abc', 'title')).toBe('do something');
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
