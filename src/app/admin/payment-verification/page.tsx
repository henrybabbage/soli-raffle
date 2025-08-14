"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface Purchase {
  _id: string;
  buyerEmail: string;
  buyerName: string;
  raffleItem: {
    title: string;
    _id: string;
  };
  quantity: number;
  totalAmount: number;
  paymentStatus: string;
  paymentMethod: string;
  purchaseDate: string;
  paypalTransactionId: string;
  notes: string;
}

export default function PaymentVerificationPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState<string | null>(null);
  const [filter, setFilter] = useState("pending");
  const router = useRouter();

  const fetchPurchases = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/purchases?status=${filter}`);
      if (response.ok) {
        const data = await response.json();
        setPurchases(data);
      }
    } catch (error) {
      console.error("Error fetching purchases:", error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases]);

  const verifyPayment = async (purchaseId: string, paypalTransactionId: string, amount: number) => {
    try {
      setVerifying(purchaseId);
      
      const response = await fetch(`/api/purchases/${purchaseId}/verify`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paypalTransactionId,
          amount,
          verificationMethod: "manual",
        }),
      });

      if (response.ok) {
        // Refresh the purchases list
        await fetchPurchases();
        alert("Payment verified successfully!");
      } else {
        const error = await response.json();
        alert(`Error verifying payment: ${error.message}`);
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
      alert("Error verifying payment");
    } finally {
      setVerifying(null);
    }
  };

  const markAsFailed = async (purchaseId: string) => {
    try {
      setVerifying(purchaseId);
      
      const response = await fetch(`/api/purchases/${purchaseId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentStatus: "failed",
          notes: "Marked as failed by admin verification",
        }),
      });

      if (response.ok) {
        await fetchPurchases();
        alert("Purchase marked as failed");
      } else {
        alert("Error updating purchase status");
      }
    } catch (error) {
      console.error("Error updating purchase status:", error);
      alert("Error updating purchase status");
    } finally {
      setVerifying(null);
    }
  };

  const formatAmount = (amount: number) => {
    return `€${(amount / 100).toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading purchases...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Payment Verification</h1>
            <button
              onClick={() => router.push("/admin")}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Back to Admin
            </button>
          </div>

          {/* Filter Controls */}
          <div className="mb-6">
            <div className="flex space-x-4">
              <button
                onClick={() => setFilter("pending")}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === "pending"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Pending ({purchases.filter(p => p.paymentStatus === "pending").length})
              </button>
              <button
                onClick={() => setFilter("completed")}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === "completed"
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Completed ({purchases.filter(p => p.paymentStatus === "completed").length})
              </button>
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === "all"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                All ({purchases.length})
              </button>
            </div>
          </div>

          {/* Purchases List */}
          <div className="space-y-4">
            {purchases.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No purchases found with the selected filter.
              </div>
            ) : (
              purchases.map((purchase) => (
                <div
                  key={purchase._id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">{purchase.buyerName}</h3>
                      <p className="text-sm text-gray-600">{purchase.buyerEmail}</p>
                      <p className="text-xs text-gray-500">
                        {formatDate(purchase.purchaseDate)}
                      </p>
                    </div>
                    
                    <div>
                      <p className="font-medium text-gray-900">{purchase.raffleItem.title}</p>
                      <p className="text-sm text-gray-600">
                        Quantity: {purchase.quantity} ticket(s)
                      </p>
                      <p className="text-sm text-gray-600">
                        Amount: {formatAmount(purchase.totalAmount)}
                      </p>
                    </div>
                    
                    <div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        purchase.paymentStatus === "completed"
                          ? "bg-green-100 text-green-800"
                          : purchase.paymentStatus === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}>
                        {purchase.paymentStatus.charAt(0).toUpperCase() + purchase.paymentStatus.slice(1)}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        Method: {purchase.paymentMethod}
                      </p>
                    </div>
                    
                    <div className="flex flex-col space-y-2">
                      {purchase.paymentStatus === "pending" && (
                        <>
                          <button
                            onClick={() => {
                              const amount = prompt("Enter the actual amount paid (in EUR):");
                              if (amount) {
                                verifyPayment(purchase._id, purchase.paypalTransactionId, Math.round(parseFloat(amount) * 100));
                              }
                            }}
                            disabled={verifying === purchase._id}
                            className="bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700 disabled:opacity-50 transition-colors"
                          >
                            {verifying === purchase._id ? "Verifying..." : "Verify Payment"}
                          </button>
                          <button
                            onClick={() => markAsFailed(purchase._id)}
                            disabled={verifying === purchase._id}
                            className="bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700 disabled:opacity-50 transition-colors"
                          >
                            Mark as Failed
                          </button>
                        </>
                      )}
                      
                      <button
                        onClick={() => {
                          const notes = prompt("Add notes:", purchase.notes);
                          if (notes !== null) {
                            // Update notes
                            fetch(`/api/purchases/${purchase._id}`, {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ notes }),
                            }).then(() => fetchPurchases());
                          }
                        }}
                        className="bg-gray-600 text-white px-3 py-2 rounded text-sm hover:bg-gray-700 transition-colors"
                      >
                        Edit Notes
                      </button>
                    </div>
                  </div>
                  
                  {purchase.notes && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-sm text-gray-600">
                        <strong>Notes:</strong> {purchase.notes}
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}