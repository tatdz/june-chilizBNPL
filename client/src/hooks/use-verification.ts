import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface VerificationStatus {
  isVerifying: boolean;
  isVerified: boolean;
  error: string | null;
  details: {
    transactionCount: number;
    accountAge: number;
    isBlacklisted: boolean;
  } | null;
}

export function useVerification(walletAddress: string | null) {
  const [status, setStatus] = useState<VerificationStatus>({
    isVerifying: false,
    isVerified: false,
    error: null,
    details: null
  });
  
  const { toast } = useToast();

  const verifyWallet = useCallback(async () => {
    if (!walletAddress) {
      toast({
        title: "No Wallet Connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return false;
    }

    setStatus(prev => ({ ...prev, isVerifying: true, error: null }));

    try {
      const response = await fetch('/api/wallet/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ walletAddress })
      });

      if (!response.ok) {
        throw new Error(`Verification failed: ${response.status}`);
      }

      const verification = await response.json();
      
      // Check eligibility criteria
      const isEligible = verification.transactionCount >= 5 && 
                        verification.accountAge >= 15 && 
                        !verification.isBlacklisted;

      const details = {
        transactionCount: verification.transactionCount,
        accountAge: verification.accountAge,
        isBlacklisted: verification.isBlacklisted
      };

      setStatus({
        isVerifying: false,
        isVerified: isEligible,
        error: null,
        details
      });

      if (isEligible) {
        toast({
          title: "Wallet Verified ✓",
          description: `${verification.transactionCount} transactions, ${verification.accountAge} days old`,
        });
      } else {
        const reason = verification.transactionCount < 5 
          ? `Only ${verification.transactionCount} transactions (need 5+)`
          : verification.accountAge < 15
          ? `Only ${verification.accountAge} days old (need 15+)`
          : "Wallet is blacklisted";
          
        toast({
          title: "Verification Failed",
          description: reason,
          variant: "destructive",
        });
      }

      return isEligible;
    } catch (error: any) {
      setStatus(prev => ({ 
        ...prev, 
        isVerifying: false, 
        error: error.message 
      }));
      
      toast({
        title: "Verification Error",
        description: error.message,
        variant: "destructive",
      });
      
      return false;
    }
  }, [walletAddress, toast]);

  // Reset status when wallet changes
  useEffect(() => {
    setStatus({
      isVerifying: false,
      isVerified: false,
      error: null,
      details: null
    });
  }, [walletAddress]);

  return {
    ...status,
    verifyWallet
  };
}