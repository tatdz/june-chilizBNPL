/**
 * Innovative Wallet Connection Manager - Comprehensive solution for wallet state synchronization
 * This addresses the root cause of wallet verification issues with real-time state management
 */

import { useState, useEffect, useCallback } from "react";
import { web3Service } from "@/lib/web3";
import { useToast } from "@/hooks/use-toast";

export interface WalletConnectionState {
  isConnected: boolean;
  address: string | null;
  isVerified: boolean;
  verificationDetails: any;
  isLoading: boolean;
  connectionError: string | null;
}

// Global state for wallet connection
let globalConnectionState: WalletConnectionState = {
  isConnected: false,
  address: null,
  isVerified: false,
  verificationDetails: null,
  isLoading: false,
  connectionError: null,
};

// Listeners for state changes
const connectionListeners = new Set<(state: WalletConnectionState) => void>();

// Broadcast state changes to all components
const broadcastConnectionState = (newState: WalletConnectionState) => {
  globalConnectionState = { ...newState };
  localStorage.setItem('walletConnection', JSON.stringify(globalConnectionState));
  connectionListeners.forEach(listener => listener(globalConnectionState));
};

export class WalletConnectionManager {
  static getState(): WalletConnectionState {
    return { ...globalConnectionState };
  }
  
  static setState(updates: Partial<WalletConnectionState>) {
    const newState = { ...globalConnectionState, ...updates };
    broadcastConnectionState(newState);
  }
  
  static subscribe(listener: (state: WalletConnectionState) => void): () => void {
    connectionListeners.add(listener);
    return () => connectionListeners.delete(listener);
  }
  
  static async initialize() {
    try {
      // Restore previous state
      const saved = localStorage.getItem('walletConnection');
      if (saved) {
        const parsedState = JSON.parse(saved);
        globalConnectionState = { ...globalConnectionState, ...parsedState };
      }
      
      // Check current connection
      try {
        const address = await web3Service.getConnectedAddress();
        if (address) {
          WalletConnectionManager.setState({
            isConnected: true,
            address,
            connectionError: null
          });
          return address;
        }
      } catch (error) {
        // Wallet not connected, this is normal
        console.log('No wallet connected initially');
      }
    } catch (error) {
      WalletConnectionManager.setState({
        isConnected: false,
        address: null,
        connectionError: null
      });
    }
    return null;
  }
  
  static async connectWallet(): Promise<string> {
    WalletConnectionManager.setState({ isLoading: true, connectionError: null });
    
    try {
      const address = await web3Service.connectWallet();
      
      WalletConnectionManager.setState({
        isConnected: true,
        address,
        isLoading: false,
        connectionError: null,
        isVerified: false, // Reset verification when reconnecting
        verificationDetails: null
      });
      
      return address;
    } catch (error: any) {
      WalletConnectionManager.setState({
        isLoading: false,
        connectionError: error.message
      });
      throw error;
    }
  }
  
  static async verifyWallet(): Promise<any> {
    const currentState = WalletConnectionManager.getState();
    if (!currentState.address) {
      throw new Error("No wallet connected");
    }
    
    WalletConnectionManager.setState({ isLoading: true });
    
    try {
      const response = await fetch('/api/wallet/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: currentState.address })
      });
      
      if (!response.ok) {
        throw new Error('Verification request failed');
      }
      
      const verification = await response.json();
      const isEligible = verification.transactionCount >= 5 && 
                        verification.accountAge >= 15 && 
                        !verification.isBlacklisted;
      
      const verificationDetails = {
        transactionCount: verification.transactionCount,
        accountAge: verification.accountAge,
        isBlacklisted: verification.isBlacklisted,
        isEligible,
        details: isEligible 
          ? "Wallet meets all eligibility requirements"
          : verification.transactionCount < 5 
            ? `Insufficient transactions: ${verification.transactionCount}/5 required`
            : verification.accountAge < 15
              ? `Account too new: ${verification.accountAge} days old, 15+ required`
              : "Wallet address is blacklisted"
      };
      
      WalletConnectionManager.setState({
        isVerified: isEligible,
        verificationDetails,
        isLoading: false
      });
      
      return verificationDetails;
    } catch (error: any) {
      WalletConnectionManager.setState({ 
        isLoading: false,
        connectionError: error.message 
      });
      throw error;
    }
  }
  
  static disconnect() {
    // Clear localStorage first
    localStorage.removeItem('walletConnectionState');
    localStorage.removeItem('walletConnection');
    
    // Reset global state
    WalletConnectionManager.setState({
      isConnected: false,
      address: null,
      isVerified: false,
      verificationDetails: null,
      connectionError: null,
      isLoading: false
    });
    
    // Also disconnect from web3 service
    try {
      web3Service.disconnect();
    } catch (error) {
      console.log('Web3 disconnect error:', error);
    }
  }
}

export function useWalletConnection() {
  const [connectionState, setConnectionState] = useState<WalletConnectionState>(
    WalletConnectionManager.getState()
  );
  const { toast } = useToast();
  
  useEffect(() => {
    // Subscribe to global state changes
    const unsubscribe = WalletConnectionManager.subscribe(setConnectionState);
    
    // Initialize connection on mount
    WalletConnectionManager.initialize();
    
    return unsubscribe;
  }, []);
  
  const connectWallet = useCallback(async () => {
    try {
      const address = await WalletConnectionManager.connectWallet();
      toast({
        title: "Wallet Connected",
        description: `Connected to ${address.slice(0, 6)}...${address.slice(-4)}`,
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
      const result = await WalletConnectionManager.verifyWallet();
      
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
    WalletConnectionManager.disconnect();
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected",
    });
    // Force page reload to ensure clean state
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  }, [toast]);
  
  return {
    ...connectionState,
    connectWallet,
    verifyWallet,
    disconnect
  };
}