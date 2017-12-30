import {deepAsync, deepStorage, AsyncStatus} from '../';

test('deepAsync', async () => {
  const storage = deepStorage({});
  const value = await deepAsync(storage.deep('test'), async () => 'test');
  expect(value.started).toBeFalsy();
  expect(value.status).toBe(AsyncStatus.Created);
  await value.run();
  expect(value.started).toBeTruthy();
  expect(value.status).toBe(AsyncStatus.Succeeded);
  expect(value.data).toBe('test');
});