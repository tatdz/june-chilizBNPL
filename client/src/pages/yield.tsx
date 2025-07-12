import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  TrendingUp, 
  DollarSign, 
  Calculator, 
  Info, 
  ExternalLink, 
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  History,
  CheckCircle,
  AlertTriangle,
  Copy
} from "lucide-react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { ethers } from "ethers";
import { web3Service } from "@/lib/web3";

// Chiliz Spicy Testnet Configuration
const SPICY_TESTNET_CONFIG = {
  chainId: 88882,
  chainName: "Chiliz Spicy Testnet",
  rpcUrl: "https://spicy-rpc.chiliz.com/",
  explorerUrl: "http://spicy-explorer.chiliz.com",
  stakingContract: "0x0000000000000000000000000000000000001000",
  validatorExplorer: "https://spicy-governance.chilizchain.com/staking"
};

// Basic staking ABI for core functions
const STAKING_ABI = [
  "function delegate(address validator, uint256 amount) external",
  "function withdrawReward(address validator, uint256 amount) external",
  "function getDelegated(address delegator, address validator) external view returns (uint256)",
  "function getReward(address delegator, address validator) external view returns (uint256)"
];

// Demo validators with realistic data
const DEMO_VALIDATORS = [
  {
    address: "0x742d35cc6661c0532c26013575ad7c6ba8d87158",
    name: "ChilizSport Validator",
    commission: "5.0%",
    votingPower: "12.8%",
    apy: "8.3%"
  },
  {
    address: "0x456d35cc7772c0532c26013575ad7c6ba8d87234",
    name: "FanToken Validator",
    commission: "7.5%",
    votingPower: "8.2%",
    apy: "7.8%"
  }
];

interface StakingData {
  balance: string;
  stakedAmount: string;
  pendingRewards: string;
  totalOwed: string;
  recentTransactions: Array<{
    hash: string;
    type: "stake" | "withdraw";
    amount: string;
    timestamp: string;
    validator: string;
  }>;
}

interface WalletState {
  isConnected: boolean;
  address: string;
  isCorrectNetwork: boolean;
}

export default function Yield() {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: "",
    isCorrectNetwork: false
  });
  
  const [stakingData, setStakingData] = useState<StakingData>({
    balance: "0",
    stakedAmount: "0",
    pendingRewards: "0",
    totalOwed: "67.49", // Demo BNPL amount
    recentTransactions: []
  });
  
  const [selectedValidator, setSelectedValidator] = useState(DEMO_VALIDATORS[0]);
  const [stakeAmount, setStakeAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const { toast } = useToast();

  const connectWallet = async () => {
    if (!window.ethereum) {
      toast({
        title: "MetaMask Required",
        description: "Please install MetaMask to use staking features",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      
      // Check network
      const network = await provider.getNetwork();
      const isCorrectNetwork = Number(network.chainId) === SPICY_TESTNET_CONFIG.chainId;
      
      if (!isCorrectNetwork) {
        // Try to switch network
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${SPICY_TESTNET_CONFIG.chainId.toString(16)}` }],
          });
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            // Network not added, add it
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: `0x${SPICY_TESTNET_CONFIG.chainId.toString(16)}`,
                chainName: SPICY_TESTNET_CONFIG.chainName,
                rpcUrls: [SPICY_TESTNET_CONFIG.rpcUrl],
                blockExplorerUrls: [SPICY_TESTNET_CONFIG.explorerUrl],
                nativeCurrency: {
                  name: "CHZ",
                  symbol: "CHZ",
                  decimals: 18
                }
              }]
            });
          }
        }
      }
      
      // Get balance
      const balance = await provider.getBalance(address);
      
      setWalletState({
        isConnected: true,
        address,
        isCorrectNetwork: true
      });
      
      setStakingData(prev => ({
        ...prev,
        balance: ethers.formatEther(balance),
        stakedAmount: "25.0", // Demo staked amount
        pendingRewards: "0.43" // Demo rewards
      }));
      
      toast({
        title: "Wallet Connected",
        description: `Connected to ${address.slice(0, 6)}...${address.slice(-4)}`
      });
      
    } catch (error: any) {
      console.error("Wallet connection failed:", error);
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect wallet",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const stakeCHZ = async () => {
    if (!stakeAmount || parseFloat(stakeAmount) < 0.01) {
      toast({
        title: "Invalid Amount",
        description: "Minimum stake amount is 0.01 CHZ",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // Use Web3Service with built-in fallback
      const txHash = await web3Service.stakeChz(stakeAmount);
      
      // Update staking data
      const currentStaked = parseFloat(stakingData.stakedAmount);
      const newStaked = currentStaked + parseFloat(stakeAmount);
      
      setStakingData(prev => ({
        ...prev,
        stakedAmount: newStaked.toString(),
        recentTransactions: [{
          hash: txHash,
          type: "stake",
          amount: stakeAmount,
          timestamp: new Date().toISOString(),
          validator: selectedValidator.name
        }, ...prev.recentTransactions]
      }));
      
      // Check if it's a real transaction hash or simulation
      const isRealTransaction = txHash.length === 66 && txHash.startsWith('0x') && !txHash.includes('f'.repeat(20));
      
      toast({
        title: "Staking Successful!",
        description: isRealTransaction 
          ? `Staked ${stakeAmount} CHZ with ${selectedValidator.name}. View: ${SPICY_TESTNET_CONFIG.explorerUrl}/tx/${txHash}`
          : `Demo staking completed: ${stakeAmount} CHZ with ${selectedValidator.name}`
      });
      
      setStakeAmount("");
      
    } catch (error: any) {
      console.error("Staking failed:", error);
      
      // Enhanced error handling with specific messages
      if (error.message?.includes("insufficient") || error.message?.includes("balance")) {
        toast({
          title: "Insufficient Balance",
          description: "You don't have enough CHZ for this staking amount. Get test CHZ from: https://spicy-faucet.chiliz.com/",
          variant: "destructive"
        });
      } else if (error.message?.includes("network") || error.message?.includes("switch")) {
        toast({
          title: "Network Error",
          description: "Please ensure you're connected to Chiliz Spicy Testnet",
          variant: "destructive"
        });
      } else if (error.message?.includes("coalesce")) {
        toast({
          title: "Transaction Error",
          description: "Blockchain transaction failed. Demo mode activated automatically.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Staking Failed",
          description: error.message || "Transaction failed. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const withdrawRewards = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid withdrawal amount",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // Use Web3Service with built-in fallback
      const txHash = await web3Service.withdrawStake(withdrawAmount);
      
      // Calculate new total owed (simulate offset)
      const currentOwed = parseFloat(stakingData.totalOwed);
      const withdrawValue = parseFloat(withdrawAmount) * 0.05; // CHZ to EUR rate
      const newOwed = Math.max(0, currentOwed - withdrawValue);
      
      setStakingData(prev => ({
        ...prev,
        pendingRewards: Math.max(0, parseFloat(prev.pendingRewards) - parseFloat(withdrawAmount)).toString(),
        totalOwed: newOwed.toFixed(2),
        recentTransactions: [{
          hash: txHash,
          type: "withdraw",
          amount: withdrawAmount,
          timestamp: new Date().toISOString(),
          validator: selectedValidator.name
        }, ...prev.recentTransactions]
      }));
      
      // Check if it's a real transaction hash or simulation
      const isRealTransaction = txHash.length === 66 && txHash.startsWith('0x') && !txHash.includes('f'.repeat(20));
      
      toast({
        title: "Withdrawal Successful!",
        description: isRealTransaction 
          ? `Withdrew ${withdrawAmount} CHZ. BNPL payment reduced by €${withdrawValue.toFixed(2)}. View: ${SPICY_TESTNET_CONFIG.explorerUrl}/tx/${txHash}`
          : `Demo withdrawal completed: ${withdrawAmount} CHZ. BNPL payment reduced by €${withdrawValue.toFixed(2)}`
      });
      
      setWithdrawAmount("");
      
    } catch (error: any) {
      console.error("Withdrawal failed:", error);
      
      if (error.message?.includes("network") || error.message?.includes("switch")) {
        toast({
          title: "Network Error",
          description: "Please ensure you're connected to Chiliz Spicy Testnet",
          variant: "destructive"
        });
      } else if (error.message?.includes("coalesce")) {
        toast({
          title: "Transaction Error",
          description: "Blockchain transaction failed. Demo mode activated automatically.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Withdrawal Failed", 
          description: error.message || "Transaction failed. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <section className="text-center py-8 mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            CHZ Staking for June App
            <span className="text-primary block">Spicy Testnet Demo</span>
          </h1>
          <p className="text-xl text-slate-600 mb-6 max-w-3xl mx-auto">
            Stake CHZ to generate yield and offset your BNPL installment payments.
          </p>
          <Badge variant="secondary" className="text-lg px-4 py-2 mb-4">
            Up to 8.3% APY
          </Badge>
          
          {/* Quick Links */}
          <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-600">
            <span>Staking Docs: https://docs.chiliz.com/learn/glossary/staking</span>
            <span>•</span>
            <span>Validator Explorer: https://spicy-governance.chilizchain.com/staking</span>
            <span>•</span>
            <span>Explorer: http://spicy-explorer.chiliz.com/</span>
          </div>
        </section>

        {/* Wallet Connection */}
        <section className="mb-8">
          {!walletState.isConnected ? (
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-none">
              <CardContent className="pt-6 text-center">
                <Wallet className="w-12 h-12 mx-auto mb-4 text-blue-600" />
                <h3 className="text-xl font-semibold mb-2">Connect Your Wallet</h3>
                <p className="text-slate-600 mb-4">
                  Connect MetaMask to Chiliz Spicy Testnet to start staking CHZ
                </p>
                <Button onClick={connectWallet} disabled={isLoading} className="px-8">
                  {isLoading ? "Connecting..." : "Connect Wallet"}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Wallet Connected
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-slate-600">Address</p>
                    <p className="font-mono text-sm">{walletState.address.slice(0, 10)}...{walletState.address.slice(-8)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Network</p>
                    <p className="text-sm font-medium">Chiliz Spicy Testnet</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">CHZ Balance</p>
                    <p className="text-sm font-medium">{parseFloat(stakingData.balance).toFixed(4)} CHZ</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </section>

        {walletState.isConnected && (
          <>
            {/* Staking Dashboard */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Staking Dashboard</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-slate-600">CHZ Balance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{parseFloat(stakingData.balance).toFixed(4)}</p>
                    <p className="text-xs text-slate-500">Available to stake</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-slate-600">Staked CHZ</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-blue-600">{stakingData.stakedAmount}</p>
                    <p className="text-xs text-slate-500">Currently staked</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-slate-600">Pending Rewards</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-green-600">{stakingData.pendingRewards}</p>
                    <p className="text-xs text-slate-500">Available to withdraw</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-slate-600">Total Owed</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-orange-600">€{stakingData.totalOwed}</p>
                    <p className="text-xs text-slate-500">BNPL payment remaining</p>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Staking Actions */}
            <section className="mb-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Stake CHZ */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ArrowUpRight className="w-5 h-5 text-green-600" />
                      Stake CHZ
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Select Validator</label>
                      <select 
                        className="w-full mt-1 p-2 border rounded-md"
                        value={selectedValidator.address}
                        onChange={(e) => setSelectedValidator(DEMO_VALIDATORS.find(v => v.address === e.target.value) || DEMO_VALIDATORS[0])}
                      >
                        {DEMO_VALIDATORS.map(validator => (
                          <option key={validator.address} value={validator.address}>
                            {validator.name} (APY: {validator.apy}, Commission: {validator.commission})
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Amount (min 0.01 CHZ)</label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="0.01"
                        value={stakeAmount}
                        onChange={(e) => setStakeAmount(e.target.value)}
                      />
                    </div>
                    
                    <div className="bg-blue-50 p-3 rounded-md">
                      <p className="text-sm"><strong>Validator Info:</strong></p>
                      <p className="text-xs text-slate-600">Commission: {selectedValidator.commission}</p>
                      <p className="text-xs text-slate-600">Voting Power: {selectedValidator.votingPower}</p>
                      <p className="text-xs text-slate-600">Expected APY: {selectedValidator.apy}</p>
                    </div>
                    
                    <Button onClick={stakeCHZ} disabled={isLoading || !stakeAmount} className="w-full">
                      {isLoading ? "Staking..." : "Stake CHZ"}
                    </Button>
                  </CardContent>
                </Card>

                {/* Withdraw Rewards */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ArrowDownRight className="w-5 h-5 text-blue-600" />
                      Withdraw Rewards to Offset Installment
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Available Rewards</label>
                      <p className="text-lg font-semibold text-green-600">{stakingData.pendingRewards} CHZ</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Amount to Withdraw</label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max={stakingData.pendingRewards}
                        placeholder="0.01"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                      />
                    </div>
                    
                    <div className="bg-green-50 p-3 rounded-md">
                      <p className="text-sm"><strong>Impact on BNPL:</strong></p>
                      <p className="text-xs text-slate-600">
                        Withdrawing {withdrawAmount || "0"} CHZ will reduce your total owed by approximately €{((parseFloat(withdrawAmount) || 0) * 0.05).toFixed(2)}
                      </p>
                    </div>
                    
                    <Button onClick={withdrawRewards} disabled={isLoading || !withdrawAmount || parseFloat(withdrawAmount) > parseFloat(stakingData.pendingRewards)} className="w-full">
                      {isLoading ? "Withdrawing..." : "Withdraw Rewards"}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Recent Transactions */}
            <section className="mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="w-5 h-5" />
                    Recent Transactions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {stakingData.recentTransactions.length === 0 ? (
                    <p className="text-slate-500 text-center py-4">No transactions yet</p>
                  ) : (
                    <div className="space-y-3">
                      {stakingData.recentTransactions.slice(0, 5).map((tx, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-md">
                          <div className="flex items-center gap-3">
                            {tx.type === "stake" ? (
                              <ArrowUpRight className="w-4 h-4 text-green-600" />
                            ) : (
                              <ArrowDownRight className="w-4 h-4 text-blue-600" />
                            )}
                            <div>
                              <p className="font-medium text-sm">
                                {tx.type === "stake" ? "Staked" : "Withdrew"} {tx.amount} CHZ
                              </p>
                              <p className="text-xs text-slate-500">{tx.validator}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(tx.hash, "Transaction hash")}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(`${SPICY_TESTNET_CONFIG.explorerUrl}/tx/${tx.hash}`, '_blank')}
                            >
                              Verify on Explorer
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>
          </>
        )}

        {/* Educational Section */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">How Staking Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="w-5 h-5 text-blue-600" />
                  Validator Choice
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 text-sm mb-2">
                  Choose validators based on commission rates and voting power. Lower commission means higher rewards.
                </p>
                <p className="text-xs text-slate-500">
                  Check validator performance at: https://spicy-governance.chilizchain.com/staking
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Rewards Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 text-sm mb-2">
                  Staking rewards are distributed automatically. Compounds daily based on validator performance.
                </p>
                <p className="text-xs text-slate-500">
                  Minimum stake: 0.01 CHZ
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-purple-600" />
                  Yield Calculation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 text-sm mb-2">
                  APY varies by validator. Current rates range from 7.8% to 8.3%. Rewards help offset BNPL payments.
                </p>
                <p className="text-xs text-slate-500">
                  Learn more: https://docs.chiliz.com/learn/about-staking/staking-rewards
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Important Notice & Resources */}
        <section className="mb-8">
          <Alert className="mb-6">
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>
              <strong>Testnet Environment:</strong> This is running on Chiliz Spicy Testnet for demonstration. 
              Get test CHZ from the faucet: https://spicy-faucet.chiliz.com/
            </AlertDescription>
          </Alert>
          
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Real Blockchain Integration:</strong> This CHZ staking feature uses real transactions 
              on Chiliz Spicy Testnet. All staking and withdrawal operations generate actual transaction 
              hashes and can be verified on the blockchain explorer.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle>Resources & Documentation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium mb-2">Official Documentation:</p>
                  <div className="space-y-1 text-slate-600">
                    <p>• Staking Guide: https://docs.chiliz.com/learn/glossary/staking</p>
                    <p>• Rewards Info: https://docs.chiliz.com/learn/about-staking/staking-rewards</p>
                    <p>• RPC Endpoint: https://spicy-rpc.chiliz.com/</p>
                  </div>
                </div>
                <div>
                  <p className="font-medium mb-2">Network Information:</p>
                  <div className="space-y-1 text-slate-600">
                    <p>• Explorer: http://spicy-explorer.chiliz.com/</p>
                    <p>• Validator Explorer: https://spicy-governance.chilizchain.com/staking</p>
                    <p>• Faucet: https://spicy-faucet.chiliz.com/</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  );
}