import { useState, useEffect, useCallback } from "react";
import { web3Service } from "@/lib/web3";
import { moralisService } from "@/lib/moralis";
import { useToast } from "@/hooks/use-toast";

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  isVerified: boolean;
  verificationDetails: {
    transactionCount: number;
    accountAge: number;
    isBlacklisted: boolean;
    details: string;
  } | null;
  isLoading: boolean;
}

export function useWallet() {
  const [walletState, setWalletState] = useState<WalletState>(() => {
    // Initialize from localStorage if available
    const saved = localStorage.getItem('walletState');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (error) {
        console.error('Failed to parse saved wallet state:', error);
      }
    }
    return {
      isConnected: false,
      address: null,
      isVerified: false,
      verificationDetails: null,
      isLoading: false,
    };
  });

  const { toast } = useToast();

  const connectWallet = useCallback(async () => {
    setWalletState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const address = await web3Service.connectWallet();
      
      // Immediately update wallet state
      const newState = {
        isConnected: true,
        address,
        isVerified: false,
        verificationDetails: null,
        isLoading: false
      };
      
      setWalletState(newState);
      
      // Store in localStorage for persistence
      localStorage.setItem('walletState', JSON.stringify(newState));

      toast({
        title: "Wallet Connected",
        description: `Successfully connected to ${address.slice(0, 6)}...${address.slice(-4)}`,
      });
      
      return address;
    } catch (error: any) {
      setWalletState(prev => ({ ...prev, isLoading: false }));
      toast({
        title: "Connection Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [toast]);

  const verifyWallet = useCallback(async (address: string) => {
    setWalletState(prev => ({ ...prev, isLoading: true }));
    
    try {
      // Call backend API for wallet verification
      const response = await fetch('/api/wallet/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ walletAddress: address })
      });

      if (!response.ok) {
        throw new Error('Failed to verify wallet');
      }

      const verification = await response.json();
      
      // Check if wallet meets eligibility criteria (15+ days, 5+ transactions)
      const isEligible = verification.transactionCount >= 5 && verification.accountAge >= 15 && !verification.isBlacklisted;
      
      setWalletState(prev => ({
        ...prev,
        isVerified: isEligible,
        verificationDetails: {
          transactionCount: verification.transactionCount,
          accountAge: verification.accountAge,
          isBlacklisted: verification.isBlacklisted,
          details: isEligible 
            ? "Wallet meets all eligibility requirements"
            : verification.transactionCount < 5 
              ? `Insufficient transaction history. Found ${verification.transactionCount} transactions, minimum 5 required.`
              : verification.accountAge < 15
                ? `Account too new. Age: ${verification.accountAge} days, minimum 15 days required.`
                : "Wallet address is blacklisted.",
        },
        isLoading: false,
      }));

      if (!isEligible) {
        toast({
          title: "Wallet Not Eligible",
          description: verification.transactionCount < 5 
            ? `Insufficient transaction history. Found ${verification.transactionCount} transactions, minimum 5 required.`
            : verification.accountAge < 15
              ? `Account too new. Age: ${verification.accountAge} days, minimum 15 days required.`
              : "Wallet address is blacklisted.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Wallet Verified",
          description: "Your wallet meets all eligibility requirements",
        });
      }
    } catch (error: any) {
      setWalletState(prev => ({ ...prev, isLoading: false }));
      toast({
        title: "Verification Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [toast]);

  const manualVerifyWallet = useCallback(async () => {
    // Set loading state immediately
    setWalletState(prev => ({ ...prev, isLoading: true }));
    
    try {
      // First try to get current address from state
      let address = walletState.address;
      
      // If no address in state, try to get it from web3 service
      if (!address) {
        try {
          address = await web3Service.getConnectedAddress();
        } catch (error) {
          console.log('No connected address, trying to connect...');
        }
      }
      
      // If still no address, try connecting
      if (!address) {
        try {
          address = await web3Service.connectWallet();
          setWalletState(prev => ({ 
            ...prev, 
            isConnected: true, 
            address 
          }));
        } catch (connectError) {
          toast({
            title: "Wallet Connection Failed",
            description: "Please connect your wallet to continue",
            variant: "destructive",
          });
          return;
        }
      }
      
      // Final check
      if (!address) {
        toast({
          title: "No Wallet Connected",
          description: "Please connect your wallet first",
          variant: "destructive",
        });
        return;
      }
      
      console.log('Verifying wallet:', address);
      
      // Proceed with verification
      await verifyWallet(address);
    } catch (error: any) {
      console.error('Verification error:', error);
      toast({
        title: "Verification Failed",
        description: error.message || "Failed to verify wallet",
        variant: "destructive",
      });
    } finally {
      // Clear loading state
      setWalletState(prev => ({ ...prev, isLoading: false }));
    }
  }, [walletState.address, verifyWallet, toast]);

  const disconnectWallet = useCallback(() => {
    setWalletState({
      isConnected: false,
      address: null,
      isVerified: false,
      verificationDetails: null,
      isLoading: false,
    });
    
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected",
    });
  }, [toast]);

  // Check for existing connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      if (web3Service.isConnected()) {
        const address = await web3Service.getConnectedAddress();
        if (address) {
          setWalletState(prev => ({
            ...prev,
            isConnected: true,
            address,
          }));
          await verifyWallet(address);
        }
      }
    };

    checkConnection();
  }, [verifyWallet]);

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          const newAddress = accounts[0];
          setWalletState(prev => ({
            ...prev,
            address: newAddress,
            isVerified: false,
            verificationDetails: null,
          }));
          verifyWallet(newAddress);
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, [disconnectWallet, verifyWallet]);

  return {
    ...walletState,
    connectWallet,
    disconnectWallet,
    verifyWallet: () => walletState.address ? verifyWallet(walletState.address) : Promise.resolve(),
    manualVerifyWallet,
  };
}
