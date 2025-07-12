import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { web3Service } from "@/lib/web3";
import { stripeIdentityService } from "@/lib/stripe";
import { trueLayerService } from "@/lib/truelayer";
import { apiRequest } from "@/lib/queryClient";
import type { Asset } from "@shared/schema";

export interface BNPLStep {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  optional?: boolean;
}

export interface BNPLState {
  currentStep: number;
  steps: BNPLStep[];
  selectedAsset: Asset | null;
  purchaseCalculations: {
    totalAmount: number;
    downPaymentAmount: number;
    installmentAmount: number;
    finalPaymentAmount: number;
  } | null;
  kycStatus: 'pending' | 'in_progress' | 'verified' | 'failed';
  affordabilityStatus: 'not_checked' | 'in_progress' | 'verified' | 'failed';
  yieldEnabled: boolean;
  stakedAmount: string;
  estimatedYield: string;
}

const initialSteps: BNPLStep[] = [
  {
    id: 1,
    title: "Wallet Verification",
    description: "Verify wallet eligibility (5+ transactions, 15+ days old)",
    status: 'pending'
  },
  {
    id: 2,
    title: "Identity Verification (KYC)",
    description: "Stripe Identity verification for compliance",
    status: 'pending'
  },
  {
    id: 3,
    title: "Affordability Check",
    description: "TrueLayer Open Banking verification",
    status: 'pending'
  },
  {
    id: 4,
    title: "Down Payment (25%)",
    description: "Pay 25% now to secure your purchase",
    status: 'pending'
  },
  {
    id: 5,
    title: "Installment Payments",
    description: "Two equal payments over 60 days",
    status: 'pending'
  },
  {
    id: 6,
    title: "Yield Generation",
    description: "Stake CHZ to potentially reduce your final payment",
    status: 'pending',
    optional: true
  },
  {
    id: 7,
    title: "Final Payment & Asset Release*",
    description: "Asset transferred to your wallet after final payment (*NFTs and Fan Tokens only)",
    status: 'pending'
  }
];

export function useBNPL(walletAddress: string | null) {
  const [bnplState, setBNPLState] = useState<BNPLState>({
    currentStep: 1,
    steps: initialSteps,
    selectedAsset: null,
    purchaseCalculations: null,
    kycStatus: 'pending',
    affordabilityStatus: 'not_checked',
    yieldEnabled: false,
    stakedAmount: '0',
    estimatedYield: '0'
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const calculatePayments = useCallback((totalAmount: number) => {
    const downPaymentAmount = totalAmount * 0.25; // 25%
    const remainingAmount = totalAmount - downPaymentAmount;
    const installmentAmount = remainingAmount / 3; // 3 equal payments
    const finalPaymentAmount = installmentAmount;

    return {
      totalAmount,
      downPaymentAmount,
      installmentAmount,
      finalPaymentAmount
    };
  }, []);

  const selectAsset = useCallback((asset: Asset) => {
    const calculations = calculatePayments(parseFloat(asset.price));
    
    setBNPLState(prev => ({
      ...prev,
      selectedAsset: asset,
      purchaseCalculations: calculations
    }));
  }, [calculatePayments]);

  const updateStepStatus = useCallback((stepId: number, status: BNPLStep['status']) => {
    setBNPLState(prev => ({
      ...prev,
      steps: prev.steps.map(step => 
        step.id === stepId ? { ...step, status } : step
      ),
      currentStep: status === 'completed' ? Math.min(stepId + 1, 7) : prev.currentStep
    }));
  }, []);

  // KYC Verification
  const verifyKYC = useMutation({
    mutationFn: async () => {
      if (!walletAddress) throw new Error("No wallet connected");
      
      setBNPLState(prev => ({ ...prev, kycStatus: 'in_progress' }));
      updateStepStatus(2, 'in_progress');

      // Use backend API endpoint that properly handles sandbox simulation
      const response = await apiRequest('POST', '/api/kyc/verify', {
        walletAddress
      });
      
      return response;
    },
    onSuccess: (response) => {
      setBNPLState(prev => ({ ...prev, kycStatus: 'verified' }));
      updateStepStatus(2, 'completed');
      toast({
        title: "KYC Verified",
        description: response.message || "Your identity has been successfully verified",
      });
    },
    onError: (error: any) => {
      setBNPLState(prev => ({ ...prev, kycStatus: 'failed' }));
      updateStepStatus(2, 'failed');
      toast({
        title: "KYC Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Affordability Check
  const checkAffordability = useMutation({
    mutationFn: async () => {
      if (!walletAddress || !bnplState.purchaseCalculations) {
        throw new Error("Missing wallet or purchase data");
      }

      setBNPLState(prev => ({ ...prev, affordabilityStatus: 'in_progress' }));
      updateStepStatus(3, 'in_progress');

      // Use backend API endpoint that properly handles sandbox simulation
      const response = await apiRequest('POST', '/api/affordability/check', {
        walletAddress,
        amount: bnplState.purchaseCalculations.totalAmount
      });

      return response;
    },
    onSuccess: (response) => {
      const status = response.canAfford ? 'verified' : 'failed';
      setBNPLState(prev => ({ ...prev, affordabilityStatus: status }));
      updateStepStatus(3, response.canAfford ? 'completed' : 'failed');
      
      toast({
        title: response.canAfford ? "Affordability Verified" : "Affordability Check Failed",
        description: response.message || (response.canAfford 
          ? "You qualify for this purchase amount" 
          : "Purchase amount exceeds recommended limit"),
        variant: response.canAfford ? "default" : "destructive",
      });
    },
    onError: (error: any) => {
      setBNPLState(prev => ({ ...prev, affordabilityStatus: 'failed' }));
      updateStepStatus(3, 'failed');
      toast({
        title: "Affordability Check Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Create Purchase
  const createPurchase = useMutation({
    mutationFn: async () => {
      if (!walletAddress || !bnplState.selectedAsset || !bnplState.purchaseCalculations) {
        throw new Error("Missing required data for purchase");
      }

      updateStepStatus(4, 'in_progress');

      // Create smart contract transaction
      const txHash = await web3Service.createPurchase(
        bnplState.selectedAsset.id,
        bnplState.purchaseCalculations.totalAmount.toString(),
        bnplState.purchaseCalculations.downPaymentAmount.toString()
      );

      // Get user ID
      const userResponse = await apiRequest('GET', `/api/users/wallet/${walletAddress}`);
      let userId;
      
      if (!userResponse.ok) {
        // Create user if doesn't exist
        const createUserResponse = await apiRequest('POST', '/api/users', {
          walletAddress,
          isVerified: true,
          kycStatus: bnplState.kycStatus,
          affordabilityStatus: bnplState.affordabilityStatus
        });
        const newUser = await createUserResponse.json();
        userId = newUser.id;
      } else {
        const user = await userResponse.json();
        userId = user.id;
      }

      // Create purchase record
      const purchaseResponse = await apiRequest('POST', '/api/purchases', {
        walletAddress,
        assetId: bnplState.selectedAsset.id,
        totalAmount: bnplState.purchaseCalculations.totalAmount,
        downPaymentAmount: bnplState.purchaseCalculations.downPaymentAmount,
        installmentCount: 2,
        paymentMethod: 'chz',
        transactionHash: txHash
      });

      return { txHash, purchase: await purchaseResponse.json() };
    },
    onSuccess: (data) => {
      updateStepStatus(4, 'completed');
      toast({
        title: "Purchase Created",
        description: `Down payment successful. Transaction: ${data.txHash.slice(0, 10)}...`,
      });
      
      // Invalidate purchases query to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/purchases'] });
    },
    onError: (error: any) => {
      updateStepStatus(4, 'failed');
      toast({
        title: "Purchase Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Enable Yield Generation
  const enableYieldGeneration = useMutation({
    mutationFn: async (stakeAmount: string) => {
      if (!walletAddress) throw new Error("No wallet connected");

      updateStepStatus(6, 'in_progress');

      // Stake CHZ tokens
      const txHash = await web3Service.stakeChz(stakeAmount);

      // Update purchase with staking info (would need purchaseId in real implementation)
      const response = await apiRequest('POST', '/api/staking/stake', {
        purchaseId: 1, // Would be actual purchase ID
        amount: stakeAmount
      });

      return { txHash, stakingData: await response.json() };
    },
    onSuccess: (data) => {
      setBNPLState(prev => ({
        ...prev,
        yieldEnabled: true,
        stakedAmount: data.stakingData.stakedAmount
      }));
      updateStepStatus(6, 'completed');
      
      toast({
        title: "Yield Generation Enabled",
        description: `Successfully staked ${data.stakingData.stakedAmount} CHZ`,
      });
    },
    onError: (error: any) => {
      updateStepStatus(6, 'failed');
      toast({
        title: "Staking Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });



  const resetBNPL = useCallback(() => {
    setBNPLState({
      currentStep: 1,
      steps: initialSteps,
      selectedAsset: null,
      purchaseCalculations: null,
      kycStatus: 'pending',
      affordabilityStatus: 'not_checked',
      yieldEnabled: false,
      stakedAmount: '0',
      estimatedYield: '0'
    });
  }, []);

  return {
    ...bnplState,
    selectAsset,
    verifyKYC,
    checkAffordability,
    createPurchase,
    enableYieldGeneration,

    resetBNPL,
    updateStepStatus,
    setBNPLState,
    isProcessing: verifyKYC.isPending || checkAffordability.isPending || 
                  createPurchase.isPending || enableYieldGeneration.isPending
  };
}
