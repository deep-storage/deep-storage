import { AsyncStatus, deepAsync } from "../";

test("deepAsync", async () => {
  const value = await deepAsync(async () => "test");
  expect(value.started).toBeFalsy();
  expect(value.status).toBe(AsyncStatus.Created);
  await value.run();
  expect(value.started).toBeTruthy();
  expect(value.status).toBe(AsyncStatus.Succeeded);
  expect(value.data).toBe("test");
});
