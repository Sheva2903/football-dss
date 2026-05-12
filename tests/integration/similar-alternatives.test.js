import test from "node:test";
import assert from "node:assert/strict";
import app from "../../src/app.js";

let server;
let baseUrl;
let samplePlayerId;

test.before(async () => {
  server = app.listen(0);

  await new Promise((resolve, reject) => {
    server.once("listening", resolve);
    server.once("error", reject);
  });

  const { port } = server.address();
  baseUrl = `http://127.0.0.1:${port}`;

  const playersResponse = await fetch(`${baseUrl}/api/v1/players?limit=1`);
  const playersBody = await playersResponse.json();
  samplePlayerId = Number(playersBody.items[0].playerId);
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

test("similar alternatives returns ranked cheaper options with defaults", async () => {
  const response = await fetch(`${baseUrl}/api/v1/players/${samplePlayerId}/similar-alternatives?limit=3`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.item.playerId, samplePlayerId);
  assert.equal(body.filters.evidenceWindow, "last_3_seasons");
  assert.equal(body.filters.reliabilityLevel, "Medium");
  assert.ok(Array.isArray(body.alternatives));

  if (body.alternatives.length > 0) {
    assert.equal(typeof body.alternatives[0].similarityScore, "number");
    assert.equal(typeof body.alternatives[0].affordabilityScore, "number");
    assert.equal(typeof body.alternatives[0].alternativeScore, "number");
  }
});

test("similar alternatives applies evidence window, reliability level, and samePosition override", async () => {
  const response = await fetch(
    `${baseUrl}/api/v1/players/${samplePlayerId}/similar-alternatives?evidenceWindow=last_season&reliabilityLevel=High&samePosition=false&limit=2`
  );
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.filters.evidenceWindow, "last_season");
  assert.equal(body.filters.reliabilityLevel, "High");
  assert.equal(body.filters.samePosition, false);
});

test("similar alternatives returns stable empty results when no candidates match", async () => {
  const response = await fetch(
    `${baseUrl}/api/v1/players/${samplePlayerId}/similar-alternatives?maxBudget=1&limit=3`
  );
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(Array.isArray(body.alternatives), true);
  assert.equal(body.alternatives.length, 0);
});

test("similar alternatives rejects invalid similarity threshold", async () => {
  const response = await fetch(
    `${baseUrl}/api/v1/players/${samplePlayerId}/similar-alternatives?minSimilarity=101`
  );
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.equal(body.message, "Invalid query parameters");
  assert.ok(body.errors.minSimilarity.length > 0);
});

test("similar alternatives returns not found for missing players", async () => {
  const response = await fetch(`${baseUrl}/api/v1/players/999999999/similar-alternatives`);
  const body = await response.json();

  assert.equal(response.status, 404);
  assert.equal(body.message, "Player not found");
});
