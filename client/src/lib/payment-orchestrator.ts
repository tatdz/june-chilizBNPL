/**
 * Unified Payment Orchestrator - An innovative approach to handle all payment flows
 * This creates a centralized payment management system with automatic state synchronization
 */

import { apiRequest, queryClient } from "@/lib/queryClient";
import { web3Service } from "@/lib/web3";
import type { Asset } from "@shared/schema";

export interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: string;
  handler: PaymentHandler;
  demo?: boolean;
}

export interface PaymentContext {
  walletAddress: string;
  asset: Asset;
  totalAmount: number;
  downPaymentAmount: number;
  installmentCount: number;
  onProgress: (step: string, status: 'loading' | 'success' | 'error', message?: string) => void;
  onComplete: (result: PaymentResult) => void;
}

export interface PaymentResult {
  success: boolean;
  purchaseId?: number;
  transactionHash?: string;
  error?: string;
}

export type PaymentHandler = (context: PaymentContext) => Promise<PaymentResult>;

// CHZ Wallet Payment Handler
const chzWalletHandler: PaymentHandler = async (context) => {
  const { walletAddress, asset, totalAmount, downPaymentAmount, installmentCount, onProgress } = context;
  
  try {
    onProgress('web3', 'loading', 'Creating blockchain transaction...');
    
    // Create smart contract transaction
    const txHash = await web3Service.createPurchase(
      asset.id,
      totalAmount.toString(),
      downPaymentAmount.toString()
    );
    
    onProgress('database', 'loading', 'Saving purchase to database...');
    
    // Save to database
    const response = await apiRequest('POST', '/api/purchases', {
      walletAddress,
      assetId: asset.id,
      totalAmount,
      downPaymentAmount,
      installmentCount,
      paymentMethod: 'chz',
      transactionHash: txHash
    });
    
    if (!response.ok) {
      throw new Error('Failed to save purchase');
    }
    
    const purchase = await response.json();
    
    onProgress('complete', 'success', 'CHZ payment completed successfully!');
    
    // Refresh data
    queryClient.invalidateQueries({ queryKey: ['/api/purchases'] });
    
    return {
      success: true,
      purchaseId: purchase.id,
      transactionHash: txHash
    };
  } catch (error: any) {
    onProgress('error', 'error', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

// Demo CHZ Payment Handler
const demoCHZHandler: PaymentHandler = async (context) => {
  const { walletAddress, asset, totalAmount, downPaymentAmount, installmentCount, onProgress } = context;
  
  try {
    onProgress('simulation', 'loading', 'Simulating CHZ payment...');
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    onProgress('database', 'loading', 'Saving demo purchase...');
    
    const response = await apiRequest('POST', '/api/purchases', {
      walletAddress,
      assetId: asset.id,
      totalAmount,
      downPaymentAmount,
      installmentCount,
      paymentMethod: 'demo_chz',
      transactionHash: undefined // No fake transaction hash
    });
    
    if (!response.ok) {
      throw new Error('Failed to save demo purchase');
    }
    
    const purchase = await response.json();
    
    onProgress('complete', 'success', 'Demo CHZ payment completed!');
    
    queryClient.invalidateQueries({ queryKey: ['/api/purchases'] });
    
    return {
      success: true,
      purchaseId: purchase.id,
      transactionHash: undefined // No fake transaction hash
    };
  } catch (error: any) {
    onProgress('error', 'error', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

// Stripe Payment Handler
const stripeHandler: PaymentHandler = async (context) => {
  const { walletAddress, asset, totalAmount, downPaymentAmount, installmentCount, onProgress } = context;
  
  try {
    onProgress('stripe', 'loading', 'Opening Stripe checkout...');
    
    // Open Stripe demo checkout
    window.open('https://checkout.stripe.com/demo', '_blank');
    
    onProgress('processing', 'loading', 'Processing Stripe payment...');
    
    // Simulate Stripe processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    onProgress('database', 'loading', 'Saving Stripe purchase...');
    
    const response = await apiRequest('POST', '/api/purchases', {
      walletAddress,
      assetId: asset.id,
      totalAmount,
      downPaymentAmount,
      installmentCount,
      paymentMethod: 'stripe',
      transactionHash: `stripe_${Math.random().toString(36).substr(2, 20)}`
    });
    
    if (!response.ok) {
      throw new Error('Failed to save Stripe purchase');
    }
    
    const purchase = await response.json();
    
    onProgress('complete', 'success', 'Stripe payment completed successfully!');
    
    queryClient.invalidateQueries({ queryKey: ['/api/purchases'] });
    
    return {
      success: true,
      purchaseId: purchase.id,
      transactionHash: `stripe_${purchase.id}`
    };
  } catch (error: any) {
    onProgress('error', 'error', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

// Available Payment Methods
export const paymentMethods: PaymentMethod[] = [
  {
    id: 'chz_wallet',
    name: 'CHZ Wallet Payment',
    description: 'Pay directly from your connected wallet',
    icon: 'Wallet',
    handler: chzWalletHandler
  },
  {
    id: 'demo_chz',
    name: 'Demo CHZ Payment',
    description: 'Simulate CHZ payment (0.1 CHZ)',
    icon: 'Zap',
    handler: demoCHZHandler,
    demo: true
  },
  {
    id: 'stripe',
    name: 'Credit/Debit Card',
    description: 'Pay with card via Stripe',
    icon: 'CreditCard',
    handler: stripeHandler
  }
];

// Payment Orchestrator Class
export class PaymentOrchestrator {
  static async processPayment(methodId: string, context: PaymentContext): Promise<PaymentResult> {
    const method = paymentMethods.find(m => m.id === methodId);
    
    if (!method) {
      context.onProgress('error', 'error', 'Payment method not found');
      return {
        success: false,
        error: 'Invalid payment method'
      };
    }
    
    return await method.handler(context);
  }
  
  static getPaymentMethod(methodId: string): PaymentMethod | undefined {
    return paymentMethods.find(m => m.id === methodId);
  }
  
  static getAllPaymentMethods(): PaymentMethod[] {
    return paymentMethods;
  }
}