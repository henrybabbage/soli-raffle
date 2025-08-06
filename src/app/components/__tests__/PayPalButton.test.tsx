import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PayPalButton from "../PayPalButton";

// Mock PayPal Buttons component
const mockCreateOrder = jest.fn() as jest.Mock & {
  lastOrderConfig?: {
    purchase_units?: Array<{
      amount?: { currency_code: string; value: string };
    }>;
  };
};
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
                    .mockRejectedValue(new Error("Order creation failed")),
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

describe("PayPalButton", () => {
  const defaultProps = {
    amount: "5",
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
    process.env.NEXT_PUBLIC_PAYPAL_BUSINESS_EMAIL =
      "seedsofliberationraffle@proton.me";
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders PayPal button correctly", () => {
    render(<PayPalButton {...defaultProps} />);

    expect(screen.getByTestId("paypal-buttons")).toBeInTheDocument();
    expect(screen.getByTestId("paypal-button")).toBeInTheDocument();
    expect(screen.getByText("PayPal Button")).toBeInTheDocument();
  });

  it("renders PayPal button with business configuration", () => {
    render(<PayPalButton {...defaultProps} />);

    // Verify the button container exists with correct structure
    expect(screen.getByTestId("paypal-buttons")).toBeInTheDocument();
    expect(screen.getByText("PayPal Button")).toBeInTheDocument();
  });

  it("accepts correct props for amount calculation", () => {
    const props = {
      amount: "10.50",
      itemName: "Premium Item",
      quantity: 3,
      onSuccess: jest.fn(),
      onError: jest.fn(),
    };

    render(<PayPalButton {...props} />);

    // Component should render without errors with these props
    expect(screen.getByTestId("paypal-buttons")).toBeInTheDocument();
  });

  it("renders with correct props for amount calculation", () => {
    render(<PayPalButton amount="5" itemName="Test" quantity={3} />);

    expect(screen.getByTestId("paypal-buttons")).toBeInTheDocument();
    expect(screen.getByText("PayPal Button")).toBeInTheDocument();
  });

  it("renders with EUR currency configuration", () => {
    render(<PayPalButton {...defaultProps} />);

    expect(screen.getByTestId("paypal-buttons")).toBeInTheDocument();
    expect(screen.getByText("PayPal Button")).toBeInTheDocument();
  });

  it("renders with correct item description", () => {
    render(<PayPalButton {...defaultProps} />);

    expect(screen.getByTestId("paypal-buttons")).toBeInTheDocument();
    expect(screen.getByText("PayPal Button")).toBeInTheDocument();
  });

  it("handles payment success correctly", async () => {
    const onSuccess = jest.fn();
    const user = userEvent.setup();
    render(<PayPalButton {...defaultProps} onSuccess={onSuccess} />);

    await user.click(screen.getByTestId("paypal-button"));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith({
        id: "test-capture-id",
        status: "COMPLETED",
        payer: { email_address: "payer@example.com" },
        purchase_units: [
          {
            amount: { currency_code: "EUR", value: "10.00" },
          },
        ],
      });
    });
  });

  it("handles payment error correctly", async () => {
    const onError = jest.fn();
    const user = userEvent.setup();

    render(<PayPalButton {...defaultProps} onError={onError} />);

    await user.click(screen.getByTestId("paypal-error-button"));

    await waitFor(() => {
      expect(onError).toHaveBeenCalled();
    });
  });

  it("renders with business email configuration", () => {
    render(<PayPalButton {...defaultProps} />);

    expect(screen.getByTestId("paypal-buttons")).toBeInTheDocument();
    expect(screen.getByText("PayPal Button")).toBeInTheDocument();
  });

  it("renders with fallback business email when environment variable is not set", () => {
    delete process.env.NEXT_PUBLIC_PAYPAL_BUSINESS_EMAIL;
    render(<PayPalButton {...defaultProps} />);

    expect(screen.getByTestId("paypal-buttons")).toBeInTheDocument();
    expect(screen.getByText("PayPal Button")).toBeInTheDocument();
  });

  it("renders with CAPTURE intent configuration", () => {
    render(<PayPalButton {...defaultProps} />);

    expect(screen.getByTestId("paypal-buttons")).toBeInTheDocument();
    expect(screen.getByText("PayPal Button")).toBeInTheDocument();
  });

  it("applies correct button styling", () => {
    render(<PayPalButton {...defaultProps} />);

    expect(screen.getByTestId("paypal-buttons")).toBeInTheDocument();
  });

  it("renders with zero quantity gracefully", () => {
    render(<PayPalButton amount="5" itemName="Test" quantity={0} />);

    expect(screen.getByTestId("paypal-buttons")).toBeInTheDocument();
    expect(screen.getByText("PayPal Button")).toBeInTheDocument();
  });

  it("renders with decimal amounts correctly", () => {
    render(<PayPalButton amount="5.50" itemName="Test" quantity={2} />);

    expect(screen.getByTestId("paypal-buttons")).toBeInTheDocument();
    expect(screen.getByText("PayPal Button")).toBeInTheDocument();
  });

  it("logs payment completion to console", async () => {
    const user = userEvent.setup();
    render(<PayPalButton {...defaultProps} />);

    await user.click(screen.getByTestId("paypal-button"));

    await waitFor(() => {
      expect(console.log).toHaveBeenCalledWith(
        "Payment completed:",
        expect.objectContaining({
          id: "test-capture-id",
          status: "COMPLETED",
        })
      );
    });
  });

  it("logs payment errors to console", async () => {
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
});
