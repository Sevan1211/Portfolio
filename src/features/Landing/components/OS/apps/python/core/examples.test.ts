import { describe, expect, it } from "vitest";
import { CUSTOM_EXAMPLE_ID, DEFAULT_EXAMPLE, EXAMPLES } from "./examples";

describe("Python IDE examples", () => {
  it("includes a true blank workspace without replacing the starter program", () => {
    expect(EXAMPLES[0]).toMatchObject({
      id: "blank",
      label: "Blank file",
      code: "",
    });
    expect(DEFAULT_EXAMPLE.id).toBe("mandelbrot");
    expect(DEFAULT_EXAMPLE.code.trim()).not.toBe("");
  });

  it("keeps example identifiers unique and separate from custom code", () => {
    const ids = EXAMPLES.map((example) => example.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).not.toContain(CUSTOM_EXAMPLE_ID);
  });
});
