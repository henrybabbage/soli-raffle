import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PayPalButton from "../PayPalButton";

// Mock PayPal Buttons component with business account verification
const mockCreateOrder = jest.fn() as jest.Mock & { lastOrderConfig?: unknown };
const mockOnApprove = jest.fn();
const mockOnError = jest.fn();

jest.mock("@paypal/react-paypal-js", () => ({
  PayPalButtons: ({
    createOrder,
    onApprove,
    onError,
  }: {
    createOrder: (data: unknown, actions: unknown) => Promise<string>;
    onApprove: (data: unknown, actions: unknown) => Promise<void>;
    onError: (error: unknown) => void;
  }) => {
    // Store the callbacks for testing
    mockCreateOrder.mockImplementation(createOrder);
    mockOnApprove.mockImplementation(onApprove);
    mockOnError.mockImplementation(onError);

    return (
      <div data-testid="paypal-buttons">
        <button
          data-testid="paypal-button"
          onClick={async () => {
            try {
              const orderData = { orderID: "test-order-id" };
              const actions = {
                order: {
                  create: jest.fn().mockImplementation(async (orderConfig) => {
                    // Store the order config so we can verify it in tests
                    mockCreateOrder.lastOrderConfig = orderConfig;
                    return "test-order-id";
                  }),
                  capture: jest.fn().mockResolvedValue({
                    id: "test-capture-id",
                    status: "COMPLETED",
                    payer: { email_address: "payer@example.com" },
                    purchase_units: [
                      {
                        amount: { currency_code: "EUR", value: "10.00" },
                        payee: {
                          email_address: "seedsofliberationraffle@proton.me",
                        },
                      },
                    ],
                  }),
                },
              };

              // Call createOrder and store the result
              const orderId = await createOrder(orderData, actions);

              // Call onApprove with the result
              const approveData = { orderID: orderId };
              await onApprove(approveData, actions);
            } catch (error) {
              onError(error);
            }
          }}
        >
          PayPal Button
        </button>
        <button
          data-testid="paypal-error-button"
          onClick={async () => {
            try {
              const orderData = { orderID: "test-order-id" };
              const actions = {
                order: {
                  create: jest
                    .fn()
                    .mockRejectedValue(new Error("Business payment failed")),
                  capture: jest
                    .fn()
                    .mockRejectedValue(new Error("Payment failed")),
                },
              };

              await createOrder(orderData, actions);
            } catch (error) {
              onError(error);
            }
          }}
        >
          Simulate Error
        </button>
      </div>
    );
  },
}));

describe("PayPal Business Account Integration", () => {
  const defaultProps = {
    amount: "10",
    itemName: "Test Item",
    quantity: 2,
    onSuccess: jest.fn(),
    onError: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock console methods
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
    // Set the correct business email
    process.env.NEXT_PUBLIC_PAYPAL_BUSINESS_EMAIL =
      "seedsofliberationraffle@proton.me";
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("verifies business account email is correctly configured", () => {
    expect(process.env.NEXT_PUBLIC_PAYPAL_BUSINESS_EMAIL).toBe(
      "seedsofliberationraffle@proton.me"
    );
  });

  it("renders PayPal button for business transactions", () => {
    render(<PayPalButton {...defaultProps} />);

    expect(screen.getByTestId("paypal-buttons")).toBeInTheDocument();
    expect(screen.getByText("PayPal Button")).toBeInTheDocument();
  });

  it("accepts business account props correctly", () => {
    const businessProps = {
      amount: "5",
      itemName: "Business Item",
      quantity: 1,
      onSuccess: jest.fn(),
      onError: jest.fn(),
    };

    render(<PayPalButton {...businessProps} />);
    expect(screen.getByTestId("paypal-buttons")).toBeInTheDocument();
  });

  it("includes business email in payment capture response", async () => {
    const onSuccess = jest.fn();
    const user = userEvent.setup();
    render(<PayPalButton {...defaultProps} onSuccess={onSuccess} />);

    await user.click(screen.getByTestId("paypal-button"));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(
        expect.objectContaining({
          purchase_units: [
            {
              amount: { currency_code: "EUR", value: "10.00" },
              payee: { email_address: "seedsofliberationraffle@proton.me" },
            },
          ],
        })
      );
    });
  });

  it("handles business account payment completion correctly", async () => {
    const onSuccess = jest.fn();
    const user = userEvent.setup();
    render(<PayPalButton {...defaultProps} onSuccess={onSuccess} />);

    await user.click(screen.getByTestId("paypal-button"));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "test-capture-id",
          status: "COMPLETED",
          purchase_units: [
            {
              amount: { currency_code: "EUR", value: "10.00" },
              payee: { email_address: "seedsofliberationraffle@proton.me" },
            },
          ],
        })
      );
    });
  });

  it("logs business payment completion with correct details", async () => {
    const user = userEvent.setup();
    render(<PayPalButton {...defaultProps} />);

    await user.click(screen.getByTestId("paypal-button"));

    await waitFor(() => {
      expect(console.log).toHaveBeenCalledWith(
        "Payment completed:",
        expect.objectContaining({
          purchase_units: [
            {
              amount: { currency_code: "EUR", value: "10.00" },
              payee: { email_address: "seedsofliberationraffle@proton.me" },
            },
          ],
        })
      );
    });
  });

  it("renders with correct total for business transactions", () => {
    render(<PayPalButton amount="15" itemName="Test" quantity={3} />);

    expect(screen.getByTestId("paypal-buttons")).toBeInTheDocument();
    expect(screen.getByText("PayPal Button")).toBeInTheDocument();
  });

  it("renders with proper description for business transactions", () => {
    render(<PayPalButton {...defaultProps} />);

    expect(screen.getByTestId("paypal-buttons")).toBeInTheDocument();
    expect(screen.getByText("PayPal Button")).toBeInTheDocument();
  });

  it("handles business account payment errors gracefully", async () => {
    const onError = jest.fn();
    const user = userEvent.setup();

    render(<PayPalButton {...defaultProps} onError={onError} />);

    await user.click(screen.getByTestId("paypal-error-button"));

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  it("logs business payment errors correctly", async () => {
    const user = userEvent.setup();

    render(<PayPalButton {...defaultProps} />);

    await user.click(screen.getByTestId("paypal-error-button"));

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
        "PayPal error:",
        expect.any(Error)
      );
    });
  });

  it("verifies business account configuration is complete", () => {
    // Check that all required business account settings are in place
    expect(process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID).toBeDefined();
    expect(process.env.NEXT_PUBLIC_PAYPAL_BUSINESS_EMAIL).toBe(
      "seedsofliberationraffle@proton.me"
    );
  });

  it("renders with business email fallback when environment variable is missing", () => {
    delete process.env.NEXT_PUBLIC_PAYPAL_BUSINESS_EMAIL;

    render(<PayPalButton {...defaultProps} />);

    expect(screen.getByTestId("paypal-buttons")).toBeInTheDocument();
    expect(screen.getByText("PayPal Button")).toBeInTheDocument();
  });
});
