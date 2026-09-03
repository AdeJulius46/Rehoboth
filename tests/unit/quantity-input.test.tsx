import * as React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { QuantityInput } from "@/components/ui/quantity-input";

/** Mirrors how the sale form drives the field: parent state, capped at stock. */
function Harness({ max, initial = 1 }: { max?: number; initial?: number }) {
  const [quantity, setQuantity] = React.useState(initial);
  return (
    <div>
      <QuantityInput value={quantity} max={max} onValueChange={setQuantity} />
      <output data-testid="committed">{quantity}</output>
    </div>
  );
}

describe("QuantityInput", () => {
  it("types a smaller quantity over the default without jumping to the stock ceiling", async () => {
    const user = userEvent.setup();
    render(<Harness max={9} />);
    const input = screen.getByRole("spinbutton");

    // Stock is 9 and the field defaults to 1. Typing "4" used to read as "14"
    // and get clamped to 9.
    await user.click(input);
    await user.keyboard("4");
    await user.tab();

    expect(screen.getByTestId("committed")).toHaveTextContent("4");
  });

  it("lets the field be cleared instead of snapping back to 1 mid-edit", async () => {
    const user = userEvent.setup();
    render(<Harness max={9} initial={3} />);
    const input = screen.getByRole("spinbutton");

    await user.clear(input);
    expect(input).toHaveValue(null); // stays empty while editing

    await user.keyboard("5");
    await user.tab();

    expect(screen.getByTestId("committed")).toHaveTextContent("5");
  });

  it("falls back to the minimum when left empty", async () => {
    const user = userEvent.setup();
    render(<Harness max={9} initial={4} />);
    const input = screen.getByRole("spinbutton");

    await user.clear(input);
    await user.tab();

    expect(screen.getByTestId("committed")).toHaveTextContent("1");
  });

  it("still refuses to exceed available stock", async () => {
    const user = userEvent.setup();
    render(<Harness max={9} />);
    const input = screen.getByRole("spinbutton");

    await user.clear(input);
    await user.keyboard("25");
    await user.tab();

    expect(screen.getByTestId("committed")).toHaveTextContent("9");
  });

  it("has no ceiling when max is omitted", async () => {
    const user = userEvent.setup();
    render(<Harness initial={1} />);
    const input = screen.getByRole("spinbutton");

    await user.clear(input);
    await user.keyboard("250");
    await user.tab();

    expect(screen.getByTestId("committed")).toHaveTextContent("250");
  });
});
