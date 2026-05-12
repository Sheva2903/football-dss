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

test("health endpoint reports database connectivity", async () => {
  const response = await fetch(`${baseUrl}/api/v1/health`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.status, "ok");
  assert.equal(body.database, "connected");
  assert.ok(body.now);
});

test("clubs and positions lookup endpoints return lists", async () => {
  const clubsResponse = await fetch(`${baseUrl}/api/v1/clubs`);
  const clubsBody = await clubsResponse.json();

  const positionsResponse = await fetch(`${baseUrl}/api/v1/lookups/positions`);
  const positionsBody = await positionsResponse.json();

  assert.equal(clubsResponse.status, 200);
  assert.ok(Array.isArray(clubsBody.items));
  assert.ok(clubsBody.items.length > 0);

  assert.equal(positionsResponse.status, 200);
  assert.ok(Array.isArray(positionsBody.items));
  assert.ok(positionsBody.items.length > 0);
});
