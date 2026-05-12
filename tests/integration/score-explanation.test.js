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

test("score explanation returns structured score context with defaults", async () => {
  const response = await fetch(`${baseUrl}/api/v1/players/${samplePlayerId}/score-explanation`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.item.player.playerId, samplePlayerId);
  assert.equal(body.item.reliability.level, "Medium");
  assert.equal(body.item.reliability.evidenceWindow, "last_3_seasons");
  assert.equal(body.item.formula.reliabilityWindow, "last_3_seasons");
  assert.equal(typeof body.item.score.finalDssScore, "number");
  assert.equal(typeof body.item.components.production.contribution, "number");
});

test("score explanation applies evidence window and reliability inputs", async () => {
  const response = await fetch(
    `${baseUrl}/api/v1/players/${samplePlayerId}/score-explanation?evidenceWindow=last_season&reliabilityLevel=High`
  );
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.item.evidence.selectedWindow.evidenceWindow, "last_season");
  assert.equal(body.item.reliability.level, "High");
  assert.equal(body.item.reliability.thresholdMinutes, 1800);
});

test("score explanation rejects invalid evidence windows", async () => {
  const response = await fetch(
    `${baseUrl}/api/v1/players/${samplePlayerId}/score-explanation?evidenceWindow=invalid-window`
  );
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.equal(body.message, "Invalid query parameters");
  assert.ok(body.errors.evidenceWindow.length > 0);
});

test("score explanation returns not found for missing players", async () => {
  const response = await fetch(`${baseUrl}/api/v1/players/999999999/score-explanation`);
  const body = await response.json();

  assert.equal(response.status, 404);
  assert.equal(body.message, "Player not found");
});
