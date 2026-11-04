import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

it("mounts a React root for the current test", () => {
  render(<div data-testid="isolated-root">Current test</div>);
  expect(screen.queryByTestId("isolated-root")).not.toBeNull();
});

it("unmounts the previous test's React roots", () => {
  expect(screen.queryByTestId("isolated-root")).toBeNull();
});
