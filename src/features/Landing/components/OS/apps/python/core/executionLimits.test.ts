import { describe, expect, it } from "vitest";
import {
  OUTPUT_CHARACTER_LIMIT,
  takeOutputWithinBudget,
} from "./executionLimits";

describe("takeOutputWithinBudget", () => {
  it("passes through output that fits", () => {
    expect(takeOutputWithinBudget(5, "hello", 20)).toEqual({
      acceptedText: "hello",
      nextUsed: 10,
      exceeded: false,
    });
  });

  it("truncates the first chunk that exceeds the budget", () => {
    expect(takeOutputWithinBudget(8, "abcdef", 10)).toEqual({
      acceptedText: "ab",
      nextUsed: 10,
      exceeded: true,
    });
  });

  it("accepts no more output after the run budget is exhausted", () => {
    expect(takeOutputWithinBudget(OUTPUT_CHARACTER_LIMIT, "more")).toEqual({
      acceptedText: "",
      nextUsed: OUTPUT_CHARACTER_LIMIT,
      exceeded: true,
    });
  });
});
