import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PayPalMeButton from '../PayPalMeButton';

// Mock window.open
const mockWindowOpen = jest.fn();
Object.defineProperty(window, 'open', {
  writable: true,
  value: mockWindowOpen,
});

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock navigator.sendBeacon
const mockSendBeacon = jest.fn();
Object.defineProperty(navigator, 'sendBeacon', {
  writable: true,
  value: mockSendBeacon,
});

// Mock fetch
global.fetch = jest.fn();

describe('PayPalMeButton', () => {
  const defaultProps = {
    amount: 25,
    itemName: 'Qigong Session',
    itemId: 'raffle-item-123',
    quantity: 2,
    buyerEmail: 'test@example.com',
    buyerName: 'John Doe',
    onPaymentInitiated: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue('[]');
    mockSendBeacon.mockReturnValue(true);
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ _id: 'test-purchase-id' }),
    });
  });

  it('renders payment details correctly', () => {
    render(<PayPalMeButton {...defaultProps} />);
    
    expect(screen.getByText(/• Item:/)).toBeInTheDocument();
    expect(screen.getByText(/• Quantity:/)).toBeInTheDocument();
    expect(screen.getByText(/• Total:/)).toBeInTheDocument();
    expect(screen.getByText(/• Name:/)).toBeInTheDocument();
    expect(screen.getByText(/• Email:/)).toBeInTheDocument();
  });

  it('displays reference code for PayPal payment note', () => {
    render(<PayPalMeButton {...defaultProps} />);
    
    const expectedReference = 'raffle-item-123|Qigong Session|2|test@example.com|John Doe';
    expect(screen.getByText(expectedReference)).toBeInTheDocument();
    expect(screen.getByText('Reference Code (include in PayPal note):')).toBeInTheDocument();
  });

  it('handles payment initiation correctly', async () => {
    render(<PayPalMeButton {...defaultProps} />);
    
    const payButton = screen.getByRole('button', { name: /Pay €50\.00 with PayPal/ });
    fireEvent.click(payButton);

    // Check that purchase intent is stored in localStorage
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'paypalMePurchaseIntents',
      expect.any(String)
    );
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'currentPurchaseIntent',
      expect.any(String)
    );

    // Check that PayPal.Me URL is opened
    expect(mockWindowOpen).toHaveBeenCalledWith(
      'https://www.paypal.me/BiancaHeuser/50.00EUR',
      '_blank',
      'width=800,height=600'
    );

    // Check that callback is called
    expect(defaultProps.onPaymentInitiated).toHaveBeenCalled();
  });

  it('creates correct purchase data structure', async () => {
    render(<PayPalMeButton {...defaultProps} />);
    
    const payButton = screen.getByRole('button', { name: /Pay €50\.00 with PayPal/ });
    fireEvent.click(payButton);

    // Check that PayPal.Me URL is opened
    expect(mockWindowOpen).toHaveBeenCalledWith(
      'https://www.paypal.me/BiancaHeuser/50.00EUR',
      '_blank',
      'width=800,height=600'
    );
  });

  it('handles missing buyer information gracefully', () => {
    const propsWithoutBuyer = {
      ...defaultProps,
      buyerEmail: undefined,
      buyerName: undefined,
    };
    
    render(<PayPalMeButton {...propsWithoutBuyer} />);
    
    // Should not show name and email when not provided
    expect(screen.queryByText(/• Name:/)).not.toBeInTheDocument();
    expect(screen.queryByText(/• Email:/)).not.toBeInTheDocument();
  });

  it('calculates total amount correctly for different quantities', () => {
    const propsWithDifferentQuantity = {
      ...defaultProps,
      quantity: 3,
    };
    
    render(<PayPalMeButton {...propsWithDifferentQuantity} />);
    
    expect(screen.getByText(/• Total: €75\.00/)).toBeInTheDocument();
  });

  it('shows processing state during payment initiation', async () => {
    render(<PayPalMeButton {...defaultProps} />);
    
    const payButton = screen.getByRole('button', { name: /Pay €50\.00 with PayPal/ });
    fireEvent.click(payButton);

    expect(screen.getByText('Processing...')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('handles localStorage errors gracefully', () => {
    mockLocalStorage.setItem.mockImplementation(() => {
      throw new Error('Storage error');
    });
    
    render(<PayPalMeButton {...defaultProps} />);
    
    const payButton = screen.getByRole('button', { name: /Pay €50\.00 with PayPal/ });
    fireEvent.click(payButton);

    // Should not crash and should still open PayPal
    expect(mockWindowOpen).toHaveBeenCalled();
  });

  it('handles API errors gracefully', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('API error'));
    
    render(<PayPalMeButton {...defaultProps} />);
    
    const payButton = screen.getByRole('button', { name: /Pay €50\.00 with PayPal/ });
    fireEvent.click(payButton);

    // Should still open PayPal even if API call fails
    expect(mockWindowOpen).toHaveBeenCalled();
  });

  it('uses sendBeacon when available', async () => {
    render(<PayPalMeButton {...defaultProps} />);
    
    const payButton = screen.getByRole('button', { name: /Pay €50\.00 with PayPal/ });
    fireEvent.click(payButton);

    await waitFor(() => {
      expect(mockSendBeacon).toHaveBeenCalledWith(
        '/api/purchases',
        expect.any(Blob)
      );
    });
  });

  it('falls back to fetch when sendBeacon is not available', async () => {
    mockSendBeacon.mockReturnValue(false);
    
    render(<PayPalMeButton {...defaultProps} />);
    
    const payButton = screen.getByRole('button', { name: /Pay €50\.00 with PayPal/ });
    fireEvent.click(payButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  it('displays clear instructions for users', () => {
    render(<PayPalMeButton {...defaultProps} />);
    
    expect(screen.getByText(/include the reference code in your paypal payment note/i)).toBeInTheDocument();
    expect(screen.getByText(/copy this code and paste it in the paypal payment note field/i)).toBeInTheDocument();
  });
});
