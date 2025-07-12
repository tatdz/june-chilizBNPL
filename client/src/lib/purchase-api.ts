import { apiRequest } from "./queryClient";

interface CreatePurchaseData {
  walletAddress: string;
  assetId: number;
  totalAmount: number;
  downPaymentAmount: number;
  installmentCount: number;
  paymentMethod: string;
  transactionHash?: string;
}

export async function createPurchase(data: CreatePurchaseData) {
  const response = await fetch('/api/purchases', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw new Error('Failed to create purchase');
  }

  return response.json();
}

export async function getPurchasesByWallet(walletAddress: string) {
  const response = await fetch(`/api/purchases/wallet/${walletAddress}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch purchases');
  }

  return response.json();
}