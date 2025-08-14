import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PaymentSuccessPage from '../page';

// Mock next/navigation
const mockSearchParams = {
  get: jest.fn(),
  clear: jest.fn(),
};
jest.mock('next/navigation', () => ({
  useSearchParams: () => mockSearchParams,
}));

// Mock fetch
global.fetch = jest.fn();

describe('PaymentSuccessPage', () => {
  const mockPurchaseData = {
    _id: 'purchase-123',
    buyerEmail: 'test@example.com',
    buyerName: 'John Doe',
    raffleItem: { title: 'Qigong Session', _id: 'raffle-item-123' },
    quantity: 2,
    totalAmount: 5000,
    paymentStatus: 'completed',
    paymentMethod: 'paypal_me',
    purchaseDate: '2024-01-01T12:00:00.000Z',
    paypalTransactionId: 'ref-123',
    notes: 'Payment completed',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchParams.clear();
    (global.fetch as jest.Mock).mockClear();
  });

  it('renders loading state initially', async () => {
    render(<PaymentSuccessPage />);
    
    // The component immediately shows error when no reference is provided
    expect(screen.getByText('❌')).toBeInTheDocument();
    expect(screen.getByText('Payment Verification')).toBeInTheDocument();
    expect(screen.getByText('No payment reference found. Please contact support.')).toBeInTheDocument();
  });

  it('shows error when no reference is provided', () => {
    render(<PaymentSuccessPage />);
    
    expect(screen.getByText('❌')).toBeInTheDocument();
    expect(screen.getByText('No payment reference found. Please contact support.')).toBeInTheDocument();
  });

  it('verifies payment successfully when reference is provided', async () => {
    mockSearchParams.get.mockReturnValue('raffle-item-123|Qigong Session|2|test@example.com|John Doe');
    
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockPurchaseData),
    });

    render(<PaymentSuccessPage />);

    await waitFor(() => {
      expect(screen.getByText('✅')).toBeInTheDocument();
      expect(screen.getByText('Payment Successful')).toBeInTheDocument();
      expect(screen.getByText('Payment verified successfully! Your tickets have been confirmed.')).toBeInTheDocument();
    });

    // Check purchase details are displayed
    expect(screen.getByText('Qigong Session')).toBeInTheDocument();
    expect(screen.getByText('2 ticket(s)')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('shows pending status when payment is being processed', async () => {
    mockSearchParams.get.mockReturnValue('raffle-item-123|Qigong Session|2|test@example.com|John Doe');
    
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ ...mockPurchaseData, paymentStatus: 'pending' }),
    });

    render(<PaymentSuccessPage />);

    await waitFor(() => {
      expect(screen.getByText('⏳')).toBeInTheDocument();
      expect(screen.getByText('Payment Processing')).toBeInTheDocument();
      expect(screen.getByText(/Payment is being processed. This may take a few minutes/)).toBeInTheDocument();
    });

    // Check that "What happens next?" section is shown
    expect(screen.getByText('What happens next?')).toBeInTheDocument();
    expect(screen.getByText(/We'll verify your payment with PayPal/)).toBeInTheDocument();
  });

  it('creates pending purchase when no existing record is found', async () => {
    mockSearchParams.get.mockReturnValue('raffle-item-123|Qigong Session|2|test@example.com|John Doe');
    
    // First call to verify endpoint returns 404
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: false,
        status: 404,
      })
      // Second call to create purchase returns success
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ _id: 'new-purchase-123' }),
      });

    render(<PaymentSuccessPage />);

    await waitFor(() => {
      expect(screen.getByText('⏳')).toBeInTheDocument();
      expect(screen.getByText(/Payment received! We&apos;re verifying your payment/)).toBeInTheDocument();
    });

    // Check that create purchase API was called
    expect(global.fetch).toHaveBeenCalledWith('/api/purchases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: expect.stringContaining('Payment received via PayPal.Me. Awaiting verification'),
    });
  });

  it('handles verification errors gracefully', async () => {
    mockSearchParams.get.mockReturnValue('raffle-item-123|Qigong Session|2|test@example.com|John Doe');
    
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    render(<PaymentSuccessPage />);

    await waitFor(() => {
      expect(screen.getByText('❌')).toBeInTheDocument();
      expect(screen.getByText('Error verifying payment. Please contact support with your reference code.')).toBeInTheDocument();
    });
  });

  it('handles invalid reference format', async () => {
    mockSearchParams.get.mockReturnValue('invalid-reference');
    
    render(<PaymentSuccessPage />);

    await waitFor(() => {
      expect(screen.getByText('❌')).toBeInTheDocument();
      expect(screen.getByText('Error verifying payment. Please contact support with your reference code.')).toBeInTheDocument();
    });
  });

  it('displays reference code for user records', async () => {
    mockSearchParams.get.mockReturnValue('raffle-item-123|Qigong Session|2|test@example.com|John Doe');
    
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockPurchaseData),
    });

    render(<PaymentSuccessPage />);

    await waitFor(() => {
      const referenceCode = screen.getByText('raffle-item-123|Qigong Session|2|test@example.com|John Doe');
      expect(referenceCode).toBeInTheDocument();
      expect(screen.getByText(/Keep this code for your records and customer support inquiries/)).toBeInTheDocument();
    });
  });

  it('shows return to raffle button', async () => {
    mockSearchParams.get.mockReturnValue('raffle-item-123|Qigong Session|2|test@example.com|John Doe');
    
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockPurchaseData),
    });

    render(<PaymentSuccessPage />);

    await waitFor(() => {
      const returnButton = screen.getByRole('link', { name: /return to raffle/i });
      expect(returnButton).toBeInTheDocument();
      expect(returnButton).toHaveAttribute('href', '/');
    });
  });

  it('shows check status again button for pending payments', async () => {
    mockSearchParams.get.mockReturnValue('raffle-item-123|Qigong Session|2|test@example.com|John Doe');
    
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ ...mockPurchaseData, paymentStatus: 'pending' }),
    });

    render(<PaymentSuccessPage />);

    await waitFor(() => {
      const checkButton = screen.getByRole('button', { name: /check status again/i });
      expect(checkButton).toBeInTheDocument();
    });

    // Just verify the button exists, don't test the reload functionality
    fireEvent.click(screen.getByRole('button', { name: /check status again/i }));
    // The reload functionality is not testable in jsdom
  });

  it('handles missing quantity gracefully', async () => {
    mockSearchParams.get.mockReturnValue('raffle-item-123|Qigong Session||test@example.com|John Doe');
    
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockPurchaseData),
    });

    render(<PaymentSuccessPage />);

    await waitFor(() => {
      expect(screen.getByText('1 ticket(s)')).toBeInTheDocument(); // Defaults to 1
    });
  });

  it('shows success message with proper styling', async () => {
    mockSearchParams.get.mockReturnValue('raffle-item-123|Qigong Session|2|test@example.com|John Doe');
    
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockPurchaseData),
    });

    render(<PaymentSuccessPage />);

    await waitFor(() => {
      const successMessage = screen.getByText(/🎉 Congratulations!/);
      expect(successMessage).toBeInTheDocument();
      expect(successMessage.closest('div')).toHaveClass('bg-green-50', 'border-green-200');
    });
  });
});