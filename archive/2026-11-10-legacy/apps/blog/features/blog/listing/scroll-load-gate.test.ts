import { describe, expect, it } from "vitest";
import { createScrollLoadGate } from "./scroll-load-gate";

describe("scroll-triggered loading", () => {
  it("rejects repeated intersection notifications during an active batch", () => {
    const gate = createScrollLoadGate();
    expect(gate.request(100)).toBe(true);
    expect(gate.request(101)).toBe(false);
  });

  it("requires downward progress after completion before allowing another batch", () => {
    const gate = createScrollLoadGate();
    expect(gate.request(100)).toBe(true);
    gate.complete(140);
    expect(gate.request(140)).toBe(false);
    expect(gate.request(120)).toBe(false);
    expect(gate.request(141)).toBe(true);
    gate.complete(160);
    expect(gate.request(160)).toBe(false);
    expect(gate.request(161)).toBe(true);
  });

  it("fills a viewport that cannot scroll yet and recovers after a viewport grows", () => {
    const gate = createScrollLoadGate();
    expect(gate.request(0, 0)).toBe(true);
    gate.complete(0);
    expect(gate.request(0, 0)).toBe(true);
    gate.complete(400);
    expect(gate.request(200, 200)).toBe(true);
    gate.complete(200);
    expect(gate.request(200, 600)).toBe(false);
  });
});
