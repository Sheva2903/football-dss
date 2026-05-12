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

test("rankings endpoint returns ranked candidates with defaults", async () => {
  const response = await fetch(`${baseUrl}/api/v1/rankings?limit=3`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.filters.evidenceWindow, "last_3_seasons");
  assert.equal(body.filters.reliabilityLevel, "Medium");
  assert.equal(body.items.length, 3);
  assert.ok(body.pagination.total > 0);
  assert.equal(body.items[0].rank, 1);
  assert.equal(typeof body.items[0].finalDssScore, "number");
  assert.equal(typeof body.items[0].smartValueIndex, "number");
});

test("shortlists endpoint uses shortlist defaults", async () => {
  const response = await fetch(`${baseUrl}/api/v1/shortlists`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.pagination.limit, 10);
  assert.ok(body.items.length > 0);
  assert.equal(body.items[0].rank, 1);
});

test("rankings endpoint rejects invalid evidence window", async () => {
  const response = await fetch(`${baseUrl}/api/v1/rankings?evidenceWindow=invalid-window`);
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.equal(body.message, "Invalid query parameters");
  assert.ok(body.errors.evidenceWindow.length > 0);
});
