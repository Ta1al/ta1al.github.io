import assert from "node:assert/strict";
import test from "node:test";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import schema from "../schemas/content.schema.json" with { type: "json" };

const ajv = new Ajv2020({ allErrors: true, strict: true });
addFormats(ajv);
const compile = (definition) =>
  ajv.compile({ $defs: schema.$defs, ...definition });

test("rejects malformed Valorant state", () => {
  const validate = compile(schema.$defs.valorant);
  assert.equal(
    validate({
      accountName: "Player",
      tag: "123",
      region: "EU",
      rank: "Diamond 1",
      rr: 101,
      lastMatchRr: -18,
      shields: -1,
      iconTier: 99,
      updatedAt: "not-a-date",
    }),
    false,
  );
  assert.ok(validate.errors.length >= 4);
});

test("rejects unknown project disciplines and insecure external URLs", () => {
  const validate = compile(schema.$defs.projectFrontmatter);
  assert.equal(
    validate({
      title: "Example",
      date: "2026-01-01T00:00:00Z",
      description: "Example project",
      discipline: "design",
      status: "completed",
      technologies: ["Hugo"],
      featured: false,
      externalURL: "http://example.com",
    }),
    false,
  );
  assert.ok(
    validate.errors.some((error) => error.instancePath === "/discipline"),
  );
  assert.ok(
    validate.errors.some((error) => error.instancePath === "/externalURL"),
  );
});

test("requires maintained resume identity and download fields", () => {
  const validate = compile(schema.$defs.resume);
  assert.equal(
    validate({
      $schema: "https://jsonresume.org/schema",
      basics: {
        name: "Talal",
        label: "Engineer",
        email: "invalid",
        summary: "Summary",
        profiles: [],
      },
      work: [],
      education: [],
      skills: [],
      projects: [],
      certificates: [],
    }),
    false,
  );
  assert.ok(validate.errors.some((error) => error.instancePath === "/basics"));
});
