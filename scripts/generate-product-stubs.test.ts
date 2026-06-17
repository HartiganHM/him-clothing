import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { generateStub, runStubGenerator } from "./generate-product-stubs";

describe("generateStub", () => {
  it("produces YAML with required fields and TODO photo marker", () => {
    const yaml = generateStub({
      slug: "cthulhu-calls",
      name: "Cthulhu Calls",
      line: "Denver Artist Series",
      category: "bow tie",
      year: 2016,
    });
    expect(yaml).toContain("slug: cthulhu-calls");
    expect(yaml).toContain("name: Cthulhu Calls");
    expect(yaml).toContain("line: Denver Artist Series");
    expect(yaml).toContain("category: bow tie");
    expect(yaml).toContain("year: 2016");
    expect(yaml).toContain("hero: false");
    expect(yaml).toContain("TODO-upload-and-paste-id");
  });
});

describe("runStubGenerator", () => {
  let tmp: string;

  beforeEach(() => {
    tmp = mkdtempSync(join(tmpdir(), "him-stubs-"));
  });

  afterEach(() => {
    rmSync(tmp, { recursive: true, force: true });
  });

  it("writes one YAML per input record", () => {
    const inputPath = join(tmp, "input.json");
    const outDir = join(tmp, "out");
    writeFileSync(
      inputPath,
      JSON.stringify([
        { slug: "a", name: "A", line: "L", category: "bow tie", year: 2016 },
        { slug: "b", name: "B", line: "L", category: "necktie", year: 2017 },
      ])
    );
    const result = runStubGenerator({ inputJsonPath: inputPath, force: false, outDir });
    expect(result.written).toHaveLength(2);
    expect(result.skipped).toHaveLength(0);
    expect(readFileSync(join(outDir, "a.yaml"), "utf-8")).toContain("slug: a");
  });

  it("skips existing files unless force is true", () => {
    const inputPath = join(tmp, "input.json");
    const outDir = join(tmp, "out");
    writeFileSync(
      inputPath,
      JSON.stringify([
        { slug: "a", name: "A", line: "L", category: "bow tie", year: 2016 },
      ])
    );

    const first = runStubGenerator({ inputJsonPath: inputPath, force: false, outDir });
    expect(first.written).toHaveLength(1);

    const second = runStubGenerator({ inputJsonPath: inputPath, force: false, outDir });
    expect(second.written).toHaveLength(0);
    expect(second.skipped).toHaveLength(1);

    const third = runStubGenerator({ inputJsonPath: inputPath, force: true, outDir });
    expect(third.written).toHaveLength(1);
    expect(third.skipped).toHaveLength(0);
  });

  it("rejects malformed records", () => {
    const inputPath = join(tmp, "input.json");
    const outDir = join(tmp, "out");
    writeFileSync(inputPath, JSON.stringify([{ slug: "a" }]));
    expect(() => runStubGenerator({ inputJsonPath: inputPath, force: false, outDir }))
      .toThrow(/invalid records/);
  });
});
