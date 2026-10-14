export interface ComputeOrderDocumentParams {
  status: string;
  paymentMethod?: string | null;
  totalAmount: number;
  notes?: string | null;
  createdAt?: string | Date;
}

export interface DocumentPayment {
  label: string;
  amount: number;
  reference?: string | null;
  paidAt?: Date | string;
}

export interface OrderDocumentDetails {
  invoiceType: string;
  challanTitle: string;
  paidAmount: number;
  balanceDue: number;
  payments: DocumentPayment[];
  displayNotes: string | null;
}

export function computeOrderDocumentDetails(
  params: ComputeOrderDocumentParams,
): OrderDocumentDetails {
  const { status, paymentMethod, totalAmount, notes, createdAt } = params;
  const normalizedStatus = (status || "").toLowerCase().trim();
  const normalizedMethod = (paymentMethod || "cod").toLowerCase().trim();

  const isDeliveredOrCompleted =
    normalizedStatus === "delivered" ||
    normalizedStatus === "completed" ||
    normalizedStatus === "paid";

  const isPrepaid =
    normalizedMethod !== "cod" &&
    normalizedMethod !== "cash_on_delivery" &&
    normalizedMethod !== "cash on delivery";

  let paidAmount = 0;
  if (isDeliveredOrCompleted || isPrepaid) {
    paidAmount = totalAmount;
  }

  const balanceDue = Math.max(0, totalAmount - paidAmount);

  const payments: DocumentPayment[] = [];
  if (paidAmount > 0) {
    let methodLabel = "Cash";
    if (normalizedMethod.includes("bkash")) methodLabel = "bKash";
    else if (normalizedMethod.includes("nagad")) methodLabel = "Nagad";
    else if (normalizedMethod.includes("rocket")) methodLabel = "Rocket";
    else if (normalizedMethod.includes("card")) methodLabel = "Card";
    else if (normalizedMethod.includes("bank")) methodLabel = "Bank Transfer";
    else if (normalizedMethod.includes("cod")) methodLabel = "Cash On Delivery";

    payments.push({
      label: methodLabel,
      amount: paidAmount,
      reference: null,
      paidAt: createdAt || new Date().toISOString(),
    });
  }

  return {
    invoiceType: "SALES INVOICE",
    challanTitle: "DELIVERY CHALLAN",
    paidAmount,
    balanceDue,
    payments,
    displayNotes: notes || null,
  };
}
