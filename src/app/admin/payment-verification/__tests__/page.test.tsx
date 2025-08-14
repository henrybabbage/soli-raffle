import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PaymentVerificationPage from '../page';

// Mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

// Mock fetch
global.fetch = jest.fn();

// Mock window.alert
const mockAlert = jest.fn();
Object.defineProperty(window, 'alert', {
  value: mockAlert,
  writable: true,
});

// Mock window.prompt
const mockPrompt = jest.fn();
Object.defineProperty(window, 'prompt', {
  value: mockPrompt,
  writable: true,
});

describe('PaymentVerificationPage', () => {
  const mockPurchases = [
    {
      _id: 'purchase-1',
      buyerEmail: 'user1@example.com',
      buyerName: 'John Doe',
      raffleItem: { title: 'Qigong Session', _id: 'raffle-1' },
      quantity: 2,
      totalAmount: 5000,
      paymentStatus: 'pending',
      paymentMethod: 'paypal_me',
      purchaseDate: '2024-01-01T12:00:00.000Z',
      paypalTransactionId: 'ref-1',
      notes: 'Payment pending verification',
    },
    {
      _id: 'purchase-2',
      buyerEmail: 'user2@example.com',
      buyerName: 'Jane Smith',
      raffleItem: { title: 'Personal Training', _id: 'raffle-2' },
      quantity: 1,
      totalAmount: 3000,
      paymentStatus: 'completed',
      paymentMethod: 'paypal_webhook',
      purchaseDate: '2024-01-01T10:00:00.000Z',
      paypalTransactionId: 'ref-2',
      notes: 'Payment completed',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockPurchases),
    });
  });

  it('renders payment verification page with title', async () => {
    render(<PaymentVerificationPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Payment Verification')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /back to admin/i })).toBeInTheDocument();
    });
  });

  it('loads purchases on component mount', async () => {
    render(<PaymentVerificationPage />);
    
    expect(screen.getByText('Loading purchases...')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  it('displays purchase details correctly', async () => {
    render(<PaymentVerificationPage />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('user1@example.com')).toBeInTheDocument();
      expect(screen.getByText('Qigong Session')).toBeInTheDocument();
      expect(screen.getByText(/Quantity: 2 ticket\(s\)/)).toBeInTheDocument();
      expect(screen.getByText(/Amount: €50\.00/)).toBeInTheDocument();
    });
  });

  it('shows correct payment status badges', async () => {
    render(<PaymentVerificationPage />);
    
    await waitFor(() => {
      const pendingBadge = screen.getByText('Pending');
      const completedBadge = screen.getByText('Completed');
      
      expect(pendingBadge).toHaveClass('bg-yellow-100', 'text-yellow-800');
      expect(completedBadge).toHaveClass('bg-green-100', 'text-green-800');
    });
  });

  it('filters purchases by status', async () => {
    // Mock fetch to return filtered results
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPurchases),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([mockPurchases[1]]), // Only completed
      });

    render(<PaymentVerificationPage />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    // Click on completed filter
    const completedFilter = screen.getByRole('button', { name: /completed/i });
    fireEvent.click(completedFilter);

    await waitFor(() => {
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  it('shows verification buttons for pending purchases', async () => {
    render(<PaymentVerificationPage />);
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /verify payment/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /mark as failed/i })).toBeInTheDocument();
    });
  });

  it('verifies payment successfully', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPurchases),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ _id: 'purchase-1' }),
      });

    render(<PaymentVerificationPage />);
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /verify payment/i })).toBeInTheDocument();
    });

    const verifyButton = screen.getByRole('button', { name: /verify payment/i });
    
    mockPrompt.mockReturnValue('50.00');
    fireEvent.click(verifyButton);

    await waitFor(() => {
      expect(mockPrompt).toHaveBeenCalledWith('Enter the actual amount paid (in EUR):');
      expect(global.fetch).toHaveBeenCalledWith('/api/purchases/purchase-1/verify', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paypalTransactionId: 'ref-1',
          amount: 5000,
          verificationMethod: 'manual',
        }),
      });
      expect(mockAlert).toHaveBeenCalledWith('Payment verified successfully!');
    });
  });

  it('marks payment as failed', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPurchases),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ _id: 'purchase-1' }),
      });

    render(<PaymentVerificationPage />);
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /mark as failed/i })).toBeInTheDocument();
    });

    const markFailedButton = screen.getByRole('button', { name: /mark as failed/i });
    fireEvent.click(markFailedButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/purchases/purchase-1/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentStatus: 'failed',
          notes: 'Marked as failed by admin verification',
        }),
      });
      expect(mockAlert).toHaveBeenCalledWith('Purchase marked as failed');
    });
  });

  it('edits purchase notes', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPurchases),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ _id: 'purchase-1' }),
      });

    render(<PaymentVerificationPage />);
    
    await waitFor(() => {
      const editNotesButtons = screen.getAllByRole('button', { name: /edit notes/i });
      expect(editNotesButtons[0]).toBeInTheDocument();
    });

    const editNotesButtons = screen.getAllByRole('button', { name: /edit notes/i });
    const editNotesButton = editNotesButtons[0];
    
    mockPrompt.mockReturnValue('Updated notes');
    fireEvent.click(editNotesButton);

    await waitFor(() => {
      expect(mockPrompt).toHaveBeenCalledWith('Add notes:', 'Payment pending verification');
      expect(global.fetch).toHaveBeenCalledWith('/api/purchases/purchase-1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: 'Updated notes' }),
      });
    });
  });

  it('handles verification errors gracefully', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPurchases),
      })
      .mockRejectedValueOnce(new Error('API error'));

    render(<PaymentVerificationPage />);
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /verify payment/i })).toBeInTheDocument();
    });

    const verifyButton = screen.getByRole('button', { name: /verify payment/i });
    
    mockPrompt.mockReturnValue('50.00');
    fireEvent.click(verifyButton);

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith('Error verifying payment');
    });
  });

  it('handles status update errors gracefully', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPurchases),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

    render(<PaymentVerificationPage />);
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /mark as failed/i })).toBeInTheDocument();
    });

    const markFailedButton = screen.getByRole('button', { name: /mark as failed/i });
    fireEvent.click(markFailedButton);

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith('Error updating purchase status');
    });
  });

  it('navigates back to admin page', async () => {
    render(<PaymentVerificationPage />);
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /back to admin/i })).toBeInTheDocument();
    });

    const backButton = screen.getByRole('button', { name: /back to admin/i });
    fireEvent.click(backButton);

    expect(mockPush).toHaveBeenCalledWith('/admin');
  });

  it('displays notes when available', async () => {
    render(<PaymentVerificationPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/Payment pending verification/)).toBeInTheDocument();
    });
  });

  it('shows no purchases message when filtered list is empty', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });

    render(<PaymentVerificationPage />);
    
    await waitFor(() => {
      expect(screen.getByText('No purchases found with the selected filter.')).toBeInTheDocument();
    });
  });

  it('handles missing amount input gracefully', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPurchases),
      });

    render(<PaymentVerificationPage />);
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /verify payment/i })).toBeInTheDocument();
    });

    const verifyButton = screen.getByRole('button', { name: /verify payment/i });
    
    mockPrompt.mockReturnValue(null); // User cancels prompt
    fireEvent.click(verifyButton);

    // Should not make API call when prompt is cancelled
    expect(global.fetch).not.toHaveBeenCalledWith(
      expect.stringContaining('/verify'),
      expect.any(Object)
    );
  });

  it('formats amounts correctly', async () => {
    render(<PaymentVerificationPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/Amount: €50\.00/)).toBeInTheDocument();
      expect(screen.getByText(/Amount: €30\.00/)).toBeInTheDocument();
    });
  });

  it('formats dates correctly', async () => {
    render(<PaymentVerificationPage />);
    
    await waitFor(() => {
      // Check that dates are formatted (exact format depends on locale)
      const dateElements = screen.getAllByText(/1\/1\/2024/);
      expect(dateElements.length).toBeGreaterThan(0);
    });
  });
});