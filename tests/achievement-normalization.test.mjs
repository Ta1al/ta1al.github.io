import assert from "node:assert/strict";
import test from "node:test";
import { buildAchievements } from "../scripts/normalize-achievements.mjs";

test("normalizes vendor snapshots into unique stable records", async () => {
  const achievements = await buildAchievements();
  const ids = achievements.map((item) => item.id);

  assert.ok(achievements.length > 50);
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(
    achievements.every((item) =>
      ["distinctions", "credly", "coursera", "tryhackme"].includes(
        item.provider,
      ),
    ),
  );
});

test("keeps the six curated achievements in an explicit order", async () => {
  const curated = (await buildAchievements())
    .filter((item) => item.curated)
    .sort((a, b) => a.curatedOrder - b.curatedOrder);

  assert.deepEqual(
    curated.map((item) => item.curatedOrder),
    [1, 2, 3, 4, 5, 6],
  );
  assert.deepEqual(
    curated.map((item) => item.title),
    [
      "CompTIA Security+",
      "Bronze Medal and 3.8 CGPA",
      "NSCT top 0.2%",
      "SOC Level 1",
      "365 Day Streak",
      "Google Cybersecurity",
    ],
  );
});
