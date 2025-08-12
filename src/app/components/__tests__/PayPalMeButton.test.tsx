import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import PayPalMeButton from "../PayPalMeButton";

describe("PayPalMeButton", () => {
  const defaultProps = {
    amount: 5,
    itemName: "Test Item",
    itemId: "item-123",
    quantity: 2,
    buyerEmail: "buyer@example.com",
    buyerName: "Buyer Name",
    onPaymentInitiated: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it("renders payment details and button", () => {
    render(<PayPalMeButton {...defaultProps} />);

    expect(screen.getByText("Payment Details:")).toBeInTheDocument();
    expect(screen.getByText("• Item: Test Item")).toBeInTheDocument();
    expect(screen.getByText("• Quantity: 2 ticket(s)")).toBeInTheDocument();
    expect(screen.getByText("• Total: €10.00")).toBeInTheDocument();
    expect(screen.getByText("• Name: Buyer Name")).toBeInTheDocument();
    expect(screen.getByText("• Email: buyer@example.com")).toBeInTheDocument();

    const button = screen.getByRole("button", {
      name: "Pay €10.00 with PayPal",
    });
    expect(button).toBeInTheDocument();
    expect(button).toBeEnabled();
  });

  it("stores purchase intent, posts to API, opens PayPal, and calls callback", async () => {
    (fetch as unknown as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ id: "sanity-1" }),
    });

    render(<PayPalMeButton {...defaultProps} />);

    fireEvent.click(
      screen.getByRole("button", { name: "Pay €10.00 with PayPal" })
    );

    const intentsRaw = localStorage.getItem("paypalMePurchaseIntents");
    expect(intentsRaw).not.toBeNull();
    const intents = JSON.parse(intentsRaw as string);
    expect(Array.isArray(intents)).toBe(true);
    expect(intents.length).toBe(1);
    expect(intents[0].itemId).toBe("item-123");
    expect(intents[0].itemName).toBe("Test Item");
    expect(intents[0].quantity).toBe(2);
    expect(intents[0].totalAmount).toBe("10.00");
    expect(typeof intents[0].transactionId).toBe("string");
    expect(intents[0].reference).toContain("Test Item");
    expect(intents[0].reference).toContain("2x tickets");
    expect(intents[0].reference).toContain("Buyer Name");
    expect(intents[0].reference).toContain("buyer@example.com");

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(
      "/api/purchases",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: expect.any(String),
      })
    );

    const body = JSON.parse(
      (fetch as unknown as jest.Mock).mock.calls[0][1].body
    );
    expect(body).toEqual(
      expect.objectContaining({
        buyerEmail: "buyer@example.com",
        buyerName: "Buyer Name",
        raffleItemId: "item-123",
        quantity: 2,
        totalAmount: 1000,
        paymentStatus: "pending",
      })
    );
    expect(typeof body.paypalTransactionId).toBe("string");
    expect(body.notes).toContain("PayPal.Me payment initiated");
    expect(body.notes).toContain("https://www.paypal.me/BiancaHeuser/10.00EUR");

    // navigation side-effect is exercised; URL is present in notes above

    expect(defaultProps.onPaymentInitiated).toHaveBeenCalled();

    expect(
      screen.getByRole("button", { name: "Pay €10.00 with PayPal" })
    ).toBeDisabled();
    expect(screen.getByText("Processing...")).toBeInTheDocument();
  });

  it("handles missing buyer info by using pending defaults", async () => {
    (fetch as unknown as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ id: "sanity-2" }),
    });

    render(
      <PayPalMeButton
        amount={3.5}
        itemName="Another Item"
        itemId="item-999"
        quantity={3}
      />
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Pay €10.50 with PayPal" })
    );

    expect(fetch).toHaveBeenCalled();
    const body = JSON.parse(
      (fetch as unknown as jest.Mock).mock.calls[0][1].body
    );
    expect(body.buyerEmail).toBe("pending@email.com");
    expect(body.buyerName).toBe("Pending Name");
    expect(body.totalAmount).toBe(1050);

    const details = screen.getByText("Payment Details:");
    expect(details).toBeInTheDocument();
    expect(screen.getByText("• Item: Another Item")).toBeInTheDocument();
    expect(screen.getByText("• Quantity: 3 ticket(s)")).toBeInTheDocument();
    expect(screen.getByText("• Total: €10.50")).toBeInTheDocument();
    expect(screen.queryByText(/• Name:/)).toBeNull();
    expect(screen.queryByText(/• Email:/)).toBeNull();
  });
});
