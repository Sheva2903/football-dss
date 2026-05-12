import test from "node:test";
import assert from "node:assert/strict";
import app from "../../src/app.js";

let server;
let baseUrl;

test.before(async () => {
  server = app.listen(0);

  await new Promise((resolve, reject) => {
    server.once("listening", resolve);
    server.once("error", reject);
  });

  const { port } = server.address();
  baseUrl = `http://127.0.0.1:${port}`;
});

test.after(async () => {
  if (!server) {
    return;
  }

  await new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
});

test("players endpoint respects maxAge filter", async () => {
  const response = await fetch(`${baseUrl}/api/v1/players?maxAge=50&limit=5`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.ok(body.pagination.total > 0, "expected at least one player to match maxAge=50");
  assert.ok(body.items.length > 0, "expected non-empty items for maxAge=50");

  for (const item of body.items) {
    assert.equal(typeof item.age, "number");
    assert.ok(item.age <= 50, `expected age <= 50, got ${item.age}`);
  }
});
