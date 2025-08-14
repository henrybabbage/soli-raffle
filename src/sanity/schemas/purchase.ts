/* eslint-disable @typescript-eslint/no-explicit-any */
const purchase = {
  name: "purchase",
  title: "Purchase",
  type: "document",
  fields: [
    {
      name: "buyerEmail",
      title: "Buyer Email",
      type: "string",
      validation: (Rule: any) => Rule.required().email(),
    },
    {
      name: "buyerName",
      title: "Buyer Name",
      type: "string",
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "raffleItem",
      title: "Raffle Item",
      type: "reference",
      to: [{ type: "raffleItem" }],
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "quantity",
      title: "Quantity",
      type: "number",
      validation: (Rule: any) => Rule.required().min(1),
    },
    {
      name: "totalAmount",
      title: "Total Amount",
      type: "number",
      validation: (Rule: any) => Rule.required().min(0),
      description:
        "Total amount paid in the smallest currency unit (e.g., cents for USD)",
    },
    {
      name: "paypalTransactionId",
      title: "PayPal Transaction ID",
      type: "string",
      description: "Unique identifier from PayPal for this transaction",
    },
    {
      name: "paypalPaymentId",
      title: "PayPal Payment ID",
      type: "string",
      description: "PayPal payment identifier from webhook notifications",
    },
    {
      name: "paypalPayerId",
      title: "PayPal Payer ID",
      type: "string",
      description: "PayPal payer identifier",
    },
    {
      name: "paymentStatus",
      title: "Payment Status",
      type: "string",
      options: {
        list: [
          { title: "Pending", value: "pending" },
          { title: "Completed", value: "completed" },
          { title: "Failed", value: "failed" },
          { title: "Refunded", value: "refunded" },
          { title: "Cancelled", value: "cancelled" },
        ],
      },
      initialValue: "pending",
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "paymentMethod",
      title: "Payment Method",
      type: "string",
      options: {
        list: [
          { title: "PayPal.Me", value: "paypal_me" },
          { title: "PayPal Webhook", value: "paypal_webhook" },
          { title: "Manual Verification", value: "manual" },
        ],
      },
      initialValue: "paypal_me",
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "purchaseDate",
      title: "Purchase Date",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "paymentVerifiedDate",
      title: "Payment Verified Date",
      type: "datetime",
      description: "When the payment was verified as successful",
    },
    {
      name: "verificationMethod",
      title: "Verification Method",
      type: "string",
      options: {
        list: [
          { title: "PayPal Webhook", value: "webhook" },
          { title: "Manual Check", value: "manual" },
          { title: "Return URL", value: "return_url" },
        ],
      },
      description: "How this payment was verified",
    },
    {
      name: "notes",
      title: "Notes",
      type: "text",
      rows: 3,
      description:
        "Additional notes about this purchase (e.g., customer service notes, verification details)",
    },
    {
      name: "webhookData",
      title: "Webhook Data",
      type: "object",
      fields: [
        {
          name: "eventType",
          title: "Event Type",
          type: "string",
        },
        {
          name: "eventId",
          title: "Event ID",
          type: "string",
        },
        {
          name: "receivedAt",
          title: "Received At",
          type: "datetime",
        },
        {
          name: "rawData",
          title: "Raw Webhook Data",
          type: "text",
          rows: 5,
        },
      ],
      description: "Data received from PayPal webhook",
    },
  ],
  preview: {
    select: {
      title: "buyerName",
      subtitle: "buyerEmail",
      media: "raffleItem.image",
      quantity: "quantity",
      totalAmount: "totalAmount",
      purchaseDate: "purchaseDate",
      paymentStatus: "paymentStatus",
      paymentMethod: "paymentMethod",
    },
    prepare(selection: any) {
      const {
        title,
        subtitle,
        media,
        quantity,
        totalAmount,
        purchaseDate,
        paymentStatus,
        paymentMethod,
      } = selection;
      const date = new Date(purchaseDate).toLocaleDateString();
      const amount = (totalAmount / 100).toFixed(2); // Assuming amount is in cents
      return {
        title: `${title} (${quantity}x)`,
        subtitle: `${subtitle} • ${amount}€ • ${date} • ${paymentStatus} • ${paymentMethod}`,
        media: media,
      };
    },
  },
  orderings: [
    {
      title: "Purchase Date (Newest)",
      name: "purchaseDateDesc",
      by: [{ field: "purchaseDate", direction: "desc" }],
    },
    {
      title: "Purchase Date (Oldest)",
      name: "purchaseDateAsc",
      by: [{ field: "purchaseDate", direction: "asc" }],
    },
    {
      title: "Buyer Name A-Z",
      name: "buyerNameAsc",
      by: [{ field: "buyerName", direction: "asc" }],
    },
    {
      title: "Payment Status",
      name: "paymentStatusAsc",
      by: [{ field: "paymentStatus", direction: "asc" }],
    },
    {
      title: "Payment Method",
      name: "paymentMethodAsc",
      by: [{ field: "paymentMethod", direction: "asc" }],
    },
  ],
};

export default purchase;
