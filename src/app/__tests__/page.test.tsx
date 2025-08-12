import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RaffleGrid from "../components/RaffleGrid";

const sampleItems = Array.from({ length: 12 }).map((_, idx) => {
  const i = idx + 1;
  return {
    _id: `item-${i}`,
    title: i === 1 ? "Private Qigong Session" : `Item ${i}`,
    description: `Description ${i}`,
    instructor: i === 1 ? "Lingji Hon" : `Instructor ${i}`,
    details: `Details ${i}`,
    value: i % 3 === 0 ? "100€" : `${50 + i}€`,
    contact: [{ label: "Link", href: "https://example.com" }],
    image: undefined as unknown as never,
    slug: { current: `item-${i}` },
    order: i,
  };
});

// Mock PayPal components
jest.mock("../components/PayPalButton", () => {
  return function MockPayPalButton({
    amount,
    quantity,
    onSuccess,
    onError,
  }: {
    amount: string;
    quantity: number;
    onSuccess?: (details: unknown) => void;
    onError?: (error: unknown) => void;
  }) {
    return (
      <div data-testid="paypal-button">
        <button
          data-testid="mock-paypal-button"
          onClick={() => {
            // Simulate successful payment
            onSuccess?.({
              id: "test-payment-id",
              status: "COMPLETED",
              payer: { email_address: "test@example.com" },
              purchase_units: [
                {
                  amount: {
                    currency_code: "EUR",
                    value: (parseFloat(amount) * quantity).toFixed(2),
                  },
                },
              ],
            });
          }}
        >
          Pay with PayPal
        </button>
        <button
          data-testid="mock-paypal-error-button"
          onClick={() => {
            onError?.(new Error("Payment failed"));
          }}
        >
          Simulate Error
        </button>
      </div>
    );
  };
});

// Mock Next.js Image component
jest.mock("next/image", () => {
  return function MockImage({
    src,
    alt,
    ...props
  }: {
    src: string;
    alt: string;
    [key: string]: unknown;
  }) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} {...props} />;
  };
});

describe("RaffleGrid - PayPal Integration", () => {
  beforeEach(() => {
    // Mock environment variables
    process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID = "test-client-id";
    process.env.NEXT_PUBLIC_PAYPAL_BUSINESS_EMAIL =
      "seedsofliberationraffle@proton.me";
    // Provide minimal Sanity env so hooks/pages that import Sanity config don't throw
    process.env.NEXT_PUBLIC_SANITY_DATASET = "aibflqfk";
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID = "production";

    (global.fetch as unknown as jest.Mock) = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => sampleItems,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Header tested at the layout/page level — grid focuses on item interactions

  it('displays "Buy Ticket" buttons for each raffle item', async () => {
    render(<RaffleGrid items={sampleItems} />);

    const buyButtons = await screen.findAllByText("Buy Ticket");
    expect(buyButtons.length).toBe(12);
  });

  it("shows quantity controls for each item", async () => {
    render(<RaffleGrid items={sampleItems} />);

    const minusButtons = await screen.findAllByText("-");
    const plusButtons = await screen.findAllByText("+");

    expect(minusButtons.length).toBeGreaterThan(0);
    expect(plusButtons.length).toBeGreaterThan(0);
  });

  it("allows users to increase quantity", async () => {
    const user = userEvent.setup();
    render(<RaffleGrid items={sampleItems} />);

    const plusButtons = await screen.findAllByText("+");
    const firstPlusButton = plusButtons[0];

    // Get the initial quantity
    const quantityDisplay =
      firstPlusButton.parentElement?.querySelector("span");
    const initialQuantity = parseInt(quantityDisplay?.textContent || "1");

    await user.click(firstPlusButton);

    expect(quantityDisplay?.textContent).toBe((initialQuantity + 1).toString());
  });

  it("allows users to decrease quantity (minimum 1)", async () => {
    const user = userEvent.setup();
    render(<RaffleGrid items={sampleItems} />);

    const plusButtons = await screen.findAllByText("+");
    const minusButtons = await screen.findAllByText("-");
    const firstPlusButton = plusButtons[0];
    const firstMinusButton = minusButtons[0];

    // Increase quantity first
    await user.click(firstPlusButton);

    // Get the quantity display
    const quantityDisplay =
      firstPlusButton.parentElement?.querySelector("span");
    const quantityAfterIncrease = parseInt(quantityDisplay?.textContent || "1");

    // Decrease quantity
    await user.click(firstMinusButton);

    expect(quantityDisplay?.textContent).toBe(
      (quantityAfterIncrease - 1).toString()
    );
  });

  it("prevents quantity from going below 1", async () => {
    const user = userEvent.setup();
    render(<RaffleGrid items={sampleItems} />);

    const minusButtons = await screen.findAllByText("-");
    const firstMinusButton = minusButtons[0];

    // Get the initial quantity
    const quantityDisplay =
      firstMinusButton.parentElement?.querySelector("span");
    const initialQuantity = parseInt(quantityDisplay?.textContent || "1");

    // Try to decrease when already at 1
    if (initialQuantity === 1) {
      await user.click(firstMinusButton);
      expect(quantityDisplay?.textContent).toBe("1");
    }
  });

  it('shows PayPal section when "Buy Ticket" is clicked', async () => {
    const user = userEvent.setup();
    render(<RaffleGrid items={sampleItems} />);

    const buyButtons = await screen.findAllByText("Buy Ticket");
    const firstBuyButton = buyButtons[0];

    await user.click(firstBuyButton);

    expect(
      screen.getByText(/Please fill in your email and name/)
    ).toBeInTheDocument();
  });

  it("shows total amount when PayPal section is displayed", async () => {
    const user = userEvent.setup();
    render(<RaffleGrid items={sampleItems} />);

    const buyButtons = await screen.findAllByText("Buy Ticket");
    const firstBuyButton = buyButtons[0];

    await user.click(firstBuyButton);

    // Should show total amount (5€ * quantity)
    expect(screen.getByText(/Total: €/)).toBeInTheDocument();
  });

  it("calculates total amount correctly based on quantity", async () => {
    const user = userEvent.setup();
    render(<RaffleGrid items={sampleItems} />);

    const buyButtons = await screen.findAllByText("Buy Ticket");
    const firstBuyButton = buyButtons[0];
    const plusButtons = await screen.findAllByText("+");
    const firstPlusButton = plusButtons[0];

    // Increase quantity to 3
    await user.click(firstPlusButton);
    await user.click(firstPlusButton);

    // Click buy ticket
    await user.click(firstBuyButton);

    // Should show total of 15€ (5€ * 3)
    expect(screen.getByText("Total: €15.00")).toBeInTheDocument();
  });

  it("shows cancel button when PayPal section is displayed", async () => {
    const user = userEvent.setup();
    render(<RaffleGrid items={sampleItems} />);

    const buyButtons = await screen.findAllByText("Buy Ticket");
    const firstBuyButton = buyButtons[0];

    await user.click(firstBuyButton);

    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  it("hides PayPal section when cancel is clicked", async () => {
    const user = userEvent.setup();
    render(<RaffleGrid items={sampleItems} />);

    const buyButtons = await screen.findAllByText("Buy Ticket");
    const firstBuyButton = buyButtons[0];

    await user.click(firstBuyButton);
    expect(screen.getByText(/Total: €/)).toBeInTheDocument();

    await user.click(screen.getByText("Cancel"));

    expect(screen.queryByText(/Total: €/)).not.toBeInTheDocument();
  });

  // PayPal.Me flow redirects; no inline success handling to assert

  // No inline error path in PayPal.Me flow

  it("disables quantity controls when PayPal section is displayed", async () => {
    const user = userEvent.setup();
    render(<RaffleGrid items={sampleItems} />);

    const buyButtons = await screen.findAllByText("Buy Ticket");
    const firstBuyButton = buyButtons[0];
    const plusButtons = screen.getAllByText("+");
    const firstPlusButton = plusButtons[0];

    await user.click(firstBuyButton);

    expect(firstPlusButton).toBeDisabled();
  });

  it("logs payment initiated details to console when paying", async () => {
    jest.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    render(<RaffleGrid items={sampleItems} />);

    const buyButtons = await screen.findAllByText("Buy Ticket");
    await user.click(buyButtons[0]);

    const emailInput = screen.getByLabelText("Email *");
    const nameInput = screen.getByLabelText("Name *");
    await user.type(emailInput, "test@example.com");
    await user.type(nameInput, "Test User");

    const payButton = screen.getByRole("button", {
      name: /Pay €5.00 with PayPal/,
    });
    await user.click(payButton);

    await waitFor(() => {
      expect(console.log).toHaveBeenCalledWith(
        "Payment initiated:",
        expect.objectContaining({ itemId: expect.any(String) })
      );
    });

    jest.useRealTimers();
  });

  // No error logging path now

  it("displays raffle items with correct information", async () => {
    render(<RaffleGrid items={sampleItems} />);

    // Wait for items to load
    await screen.findByText("Private Qigong Session");
    await screen.findByText(/Lingji Hon/);
    const valueLabels = await screen.findAllByText("Value:");
    expect(valueLabels).toHaveLength(12);
    const hundredValues = await screen.findAllByText("100€");
    expect(hundredValues.length).toBeGreaterThan(0);
  });
});
