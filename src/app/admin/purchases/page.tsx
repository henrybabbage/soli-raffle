"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface Purchase {
  _id: string;
  buyerEmail: string;
  buyerName: string;
  raffleItem: {
    _id: string;
    title: string;
    instructor: string;
    image?: string;
  };
  quantity: number;
  totalAmount: number;
  paypalTransactionId?: string;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  purchaseDate: string;
  notes?: string;
}

export default function PurchasesAdmin() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'failed' | 'refunded'>('all');

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/purchases');
      if (!response.ok) {
        throw new Error('Failed to fetch purchases');
      }
      const data = await response.json();
      setPurchases(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const filteredPurchases = filter === 'all' 
    ? purchases 
    : purchases.filter(p => p.paymentStatus === filter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAmount = (amount: number) => {
    return `€${(amount / 100).toFixed(2)}`;
  };

  const calculateTotals = () => {
    const totals = {
      all: purchases.length,
      pending: purchases.filter(p => p.paymentStatus === 'pending').length,
      completed: purchases.filter(p => p.paymentStatus === 'completed').length,
      failed: purchases.filter(p => p.paymentStatus === 'failed').length,
      refunded: purchases.filter(p => p.paymentStatus === 'refunded').length,
      totalRevenue: purchases
        .filter(p => p.paymentStatus === 'completed')
        .reduce((sum, p) => sum + p.totalAmount, 0),
      pendingRevenue: purchases
        .filter(p => p.paymentStatus === 'pending')
        .reduce((sum, p) => sum + p.totalAmount, 0),
    };
    return totals;
  };

  const totals = calculateTotals();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading purchases...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Purchase Records</h1>
          <p className="text-gray-600">Manage and track raffle ticket purchases</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Total Purchases</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">{totals.all}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Pending</div>
            <div className="text-2xl font-bold text-yellow-600 mt-1">{totals.pending}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Completed Revenue</div>
            <div className="text-2xl font-bold text-green-600 mt-1">{formatAmount(totals.totalRevenue)}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Pending Revenue</div>
            <div className="text-2xl font-bold text-yellow-600 mt-1">{formatAmount(totals.pendingRevenue)}</div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b">
            <nav className="flex -mb-px">
              {(['all', 'pending', 'completed', 'failed', 'refunded'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`
                    py-2 px-6 text-sm font-medium capitalize transition-colors
                    ${filter === status
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                    }
                  `}
                >
                  {status} ({status === 'all' ? totals.all : totals[status]})
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Purchases Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Buyer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Qty
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction ID
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPurchases.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      No purchases found
                    </td>
                  </tr>
                ) : (
                  filteredPurchases.map((purchase) => (
                    <tr key={purchase._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(purchase.purchaseDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {purchase.buyerName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {purchase.buyerEmail}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {purchase.raffleItem?.image && (
                            <div className="h-10 w-10 flex-shrink-0 mr-3">
                              <Image
                                src={purchase.raffleItem.image}
                                alt={purchase.raffleItem.title}
                                width={40}
                                height={40}
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {purchase.raffleItem?.title || 'Unknown Item'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {purchase.raffleItem?.instructor}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {purchase.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatAmount(purchase.totalAmount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(purchase.paymentStatus)}`}>
                          {purchase.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="max-w-xs truncate" title={purchase.paypalTransactionId}>
                          {purchase.paypalTransactionId || '-'}
                        </div>
                        {purchase.notes && (
                          <div className="text-xs text-gray-400 mt-1 max-w-xs truncate" title={purchase.notes}>
                            {purchase.notes}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Payment Reconciliation Instructions</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• Purchases with {`"pending"`} status have been initiated but not confirmed</li>
            <li>• Check your PayPal account for matching transactions using the Transaction ID</li>
            <li>• Update the status in Sanity Studio once payment is confirmed</li>
            <li>• The Transaction ID format {`"PPLME_..."`} indicates a PayPal.Me payment</li>
            <li>• Check the notes field for the PayPal.Me URL and reference details</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
