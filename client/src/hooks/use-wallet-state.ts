/**
 * Innovative Wallet State Manager - Reactive wallet state with automatic synchronization
 * This ensures wallet state is always consistent across the entire app
 */

import { useState, useEffect, useCallback } from "react";
import { web3Service } from "@/lib/web3";
import { apiRequest } from "@/lib/queryClient";
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

// Global wallet state - innovative singleton pattern for consistent state
let globalWalletState: WalletState = {
  isConnected: false,
  address: null,
  isVerified: false,
  verificationDetails: null,
  isLoading: false,
};

// State change listeners
const listeners: Set<(state: WalletState) => void> = new Set();

// Notify all listeners of state changes
const notifyListeners = (newState: WalletState) => {
  globalWalletState = { ...newState };
  localStorage.setItem('walletState', JSON.stringify(globalWalletState));
  listeners.forEach(listener => listener(globalWalletState));
};

// Wallet State Manager
export class WalletStateManager {
  static getState(): WalletState {
    return { ...globalWalletState };
  }
  
  static setState(newState: Partial<WalletState>) {
    const updatedState = { ...globalWalletState, ...newState };
    notifyListeners(updatedState);
  }
  
  static subscribe(listener: (state: WalletState) => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }
  
  static async initialize() {
    try {
      // Restore from localStorage
      const saved = localStorage.getItem('walletState');
      if (saved) {
        const parsedState = JSON.parse(saved);
        globalWalletState = parsedState;
      }
      
      // Check actual connection
      const address = await web3Service.getConnectedAddress();
      if (address) {
        WalletStateManager.setState({
          isConnected: true,
          address: address
        });
      }
    } catch (error) {
      console.log('No wallet connected');
    }
  }
  
  static async connectWallet(): Promise<string> {
    WalletStateManager.setState({ isLoading: true });
    
    try {
      const address = await web3Service.connectWallet();
      
      WalletStateManager.setState({
        isConnected: true,
        address,
        isVerified: false,
        verificationDetails: null,
        isLoading: false
      });
      
      return address;
    } catch (error: any) {
      WalletStateManager.setState({ isLoading: false });
      throw error;
    }
  }
  
  static async verifyWallet(address?: string): Promise<any> {
    const currentAddress = address || globalWalletState.address;
    if (!currentAddress) {
      throw new Error("No wallet address available");
    }
    
    WalletStateManager.setState({ isLoading: true });
    
    try {
      const response = await apiRequest('POST', '/api/wallet/verify', {
        walletAddress: currentAddress
      });
      
      if (!response.ok) {
        throw new Error('Verification failed');
      }
      
      const verification = await response.json();
      const isEligible = verification.transactionCount >= 5 && 
                        verification.accountAge >= 15 && 
                        !verification.isBlacklisted;
      
      const verificationDetails = {
        transactionCount: verification.transactionCount,
        accountAge: verification.accountAge,
        isBlacklisted: verification.isBlacklisted,
        details: isEligible 
          ? "Wallet meets all eligibility requirements"
          : verification.transactionCount < 5 
            ? `Insufficient transaction history. Found ${verification.transactionCount} transactions, minimum 5 required.`
            : verification.accountAge < 15
              ? `Account too new. Age: ${verification.accountAge} days, minimum 15 days required.`
              : "Wallet address is blacklisted."
      };
      
      WalletStateManager.setState({
        isVerified: isEligible,
        verificationDetails,
        isLoading: false
      });
      
      return {
        isEligible,
        ...verificationDetails
      };
    } catch (error: any) {
      WalletStateManager.setState({ isLoading: false });
      throw error;
    }
  }
  
  static disconnect() {
    WalletStateManager.setState({
      isConnected: false,
      address: null,
      isVerified: false,
      verificationDetails: null,
      isLoading: false
    });
    localStorage.removeItem('walletState');
  }
}

// React Hook for Wallet State
export function useWalletState() {
  const [walletState, setWalletState] = useState<WalletState>(WalletStateManager.getState());
  const { toast } = useToast();
  
  useEffect(() => {
    // Subscribe to global state changes
    const unsubscribe = WalletStateManager.subscribe(setWalletState);
    
    // Initialize on mount
    WalletStateManager.initialize();
    
    return unsubscribe;
  }, []);
  
  const connectWallet = useCallback(async () => {
    try {
      const address = await WalletStateManager.connectWallet();
      toast({
        title: "Wallet Connected",
        description: `Successfully connected to ${address.slice(0, 6)}...${address.slice(-4)}`,
      });
      return address;
    } catch (error: any) {
      toast({
        title: "Connection Failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  }, [toast]);
  
  const verifyWallet = useCallback(async () => {
    try {
      const result = await WalletStateManager.verifyWallet();
      
      if (result.isEligible) {
        toast({
          title: "Wallet Verified",
          description: "Your wallet meets all eligibility requirements",
        });
      } else {
        toast({
          title: "Verification Failed",
          description: result.details,
          variant: "destructive",
        });
      }
      
      return result;
    } catch (error: any) {
      toast({
        title: "Verification Error",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  }, [toast]);
  
  const disconnect = useCallback(() => {
    WalletStateManager.disconnect();
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected",
    });
  }, [toast]);
  
  return {
    ...walletState,
    connectWallet,
    verifyWallet,
    disconnect
  };
}