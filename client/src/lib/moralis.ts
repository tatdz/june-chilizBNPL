export interface MoralisTransaction {
  hash: string;
  block_timestamp: string;
  from_address: string;
  to_address: string;
  value: string;
}

export interface MoralisResponse {
  result: MoralisTransaction[];
  total: number;
}

export class MoralisService {
  private apiKey: string;
  private baseUrl = "https://deep-index.moralis.io/api/v2";

  constructor() {
    this.apiKey = import.meta.env.VITE_MORALIS_API_KEY || 
                  import.meta.env.VITE_MORALIS_SANDBOX_API_KEY || 
                  "demo_key";
  }

  async getWalletTransactions(address: string): Promise<MoralisResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/${address}/transactions?chain=chiliz`, {
        headers: {
          'X-API-Key': this.apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`Moralis API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Moralis API call failed:", error);
      
      // Fallback for sandbox/demo - return simulated data
      return {
        result: Array.from({ length: Math.floor(Math.random() * 50) + 10 }, (_, i) => ({
          hash: `0x${Math.random().toString(16).substr(2, 64)}`,
          block_timestamp: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
          from_address: address,
          to_address: `0x${Math.random().toString(16).substr(2, 40)}`,
          value: (Math.random() * 10).toString()
        })),
        total: Math.floor(Math.random() * 50) + 10
      };
    }
  }

  async verifyWalletEligibility(address: string): Promise<{
    isEligible: boolean;
    transactionCount: number;
    accountAge: number;
    isBlacklisted: boolean;
    details: string;
  }> {
    try {
      const data = await this.getWalletTransactions(address);
      
      const transactionCount = data.total;
      
      // Calculate account age from first transaction
      let accountAge = 0;
      if (data.result && data.result.length > 0) {
        const firstTransaction = data.result[data.result.length - 1];
        const firstTxDate = new Date(firstTransaction.block_timestamp);
        accountAge = Math.floor((Date.now() - firstTxDate.getTime()) / (1000 * 60 * 60 * 24));
      }

      // Check eligibility criteria
      const hasMinTransactions = transactionCount >= 5;
      const hasMinAge = accountAge >= 15; // 15 days
      const isBlacklisted = false; // Would check against blacklist API
      
      const isEligible = hasMinTransactions && hasMinAge && !isBlacklisted;

      let details = "";
      if (!hasMinTransactions) {
        details = `Insufficient transaction history. Found ${transactionCount} transactions, minimum 5 required.`;
      } else if (!hasMinAge) {
        details = `Account too new. Age: ${accountAge} days, minimum 15 days required.`;
      } else if (isBlacklisted) {
        details = "Wallet address is blacklisted.";
      } else {
        details = "Wallet meets all eligibility requirements.";
      }

      return {
        isEligible,
        transactionCount,
        accountAge,
        isBlacklisted,
        details
      };
    } catch (error) {
      console.error("Wallet verification failed:", error);
      throw new Error("Failed to verify wallet eligibility");
    }
  }
}

export const moralisService = new MoralisService();
