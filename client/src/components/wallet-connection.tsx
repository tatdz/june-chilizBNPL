import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  Wallet, 
  CheckCircle, 
  AlertCircle, 
  ExternalLink, 
  Loader2,
  Shield,
  Activity,
  Clock
} from "lucide-react";
import { useWalletConnection } from "@/hooks/use-wallet-connection";
import { useToast } from "@/hooks/use-toast";
import { web3Service, CHILIZ_SPICY_TESTNET } from "@/lib/web3";

interface WalletConnectionProps {
  onConnect?: (address: string) => void;
  showDetails?: boolean;
  compact?: boolean;
}

export default function WalletConnection({ 
  onConnect, 
  showDetails = true, 
  compact = false 
}: WalletConnectionProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [networkStatus, setNetworkStatus] = useState<'checking' | 'correct' | 'wrong'>('checking');
  
  const { 
    isConnected, 
    address, 
    isVerified, 
    verificationDetails, 
    connectWallet, 
    disconnect,
    isLoading,
    verifyWallet
  } = useWalletConnection();
  
  const { toast } = useToast();

  // Check network status
  useEffect(() => {
    const checkNetwork = async () => {
      if (window.ethereum && isConnected) {
        try {
          const chainId = await window.ethereum.request({ method: 'eth_chainId' });
          const currentChainId = parseInt(chainId, 16);
          setNetworkStatus(currentChainId === CHILIZ_SPICY_TESTNET.chainId ? 'correct' : 'wrong');
        } catch (error) {
          console.error('Failed to check network:', error);
        }
      }
    };

    checkNetwork();
  }, [isConnected]);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await connectWallet();
      if (address && onConnect) {
        onConnect(address);
      }
    } catch (error: any) {
      toast({
        title: "Connection Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSwitchNetwork = async () => {
    try {
      await web3Service.switchToChilizNetwork();
      setNetworkStatus('correct');
      toast({
        title: "Network Switched",
        description: "Successfully switched to Chiliz Spicy Testnet",
      });
    } catch (error: any) {
      toast({
        title: "Network Switch Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getVerificationProgress = () => {
    if (!verificationDetails) return 0;
    
    let score = 0;
    if (verificationDetails.transactionCount >= 5) score += 33;
    if (verificationDetails.accountAge >= 60) score += 33;
    if (!verificationDetails.isBlacklisted) score += 34;
    
    return score;
  };

  // Compact version for header
  if (compact) {
    return (
      <div className="flex items-center space-x-4">
        {isConnected && address ? (
          <div className="flex items-center space-x-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-green-700 text-sm font-medium">
              {address.slice(0, 6)}...{address.slice(-4)}
            </span>
            <Button
              onClick={disconnect}
              size="sm"
              variant="ghost"
              className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1 h-auto"
            >
              ×
            </Button>
            {isVerified ? (
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-3 h-3 text-green-600" />
                <span className="text-green-600 text-xs">Verified</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1">
                <AlertCircle className="w-3 h-3 text-amber-600" />
                <span className="text-amber-600 text-xs">Unverified</span>
              </div>
            )}
          </div>
        ) : (
          <Button 
            onClick={handleConnect}
            disabled={isConnecting || isLoading}
            className="bg-primary hover:bg-primary/90 text-white font-medium"
          >
            {isConnecting || isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Wallet className="w-4 h-4 mr-2" />
            )}
            {isConnecting ? "Connecting..." : "Connect Wallet"}
          </Button>
        )}
      </div>
    );
  }

  // Full detailed version
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Wallet className="w-5 h-5" />
          <span>Wallet Connection</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isConnected ? (
          <>
            <div className="text-center py-6">
              <Wallet className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="font-semibold text-slate-900 mb-2">Connect Your Wallet</h3>
              <p className="text-slate-600 text-sm mb-4">
                Connect MetaMask or Socios wallet to get started with BNPL on Chiliz Chain
              </p>
              <Button 
                onClick={handleConnect}
                disabled={isConnecting}
                className="w-full bg-primary hover:bg-primary/90 text-white"
              >
                {isConnecting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Wallet className="w-4 h-4 mr-2" />
                )}
                {isConnecting ? "Connecting..." : "Connect Wallet"}
              </Button>
            </div>
            
            <div className="text-xs text-slate-500 text-center">
              <p>Supported wallets: MetaMask, Socios</p>
              <p>Network: Chiliz Spicy Testnet</p>
            </div>
          </>
        ) : (
          <>
            {/* Connected Wallet Info */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-900">Wallet Connected</span>
              </div>
              <div className="text-green-800 text-sm font-mono break-all">
                {address}
              </div>
              <div className="flex items-center justify-between mt-2">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </Badge>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(`${CHILIZ_SPICY_TESTNET.blockExplorer}/address/${address}`, '_blank')}
                  >
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                  <Button
                    onClick={disconnect}
                    size="sm"
                    variant="destructive"
                    className="text-xs"
                  >
                    Disconnect
                  </Button>
                </div>
              </div>
            </div>

            {/* Network Status */}
            {networkStatus === 'wrong' && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span>Wrong network. Please switch to Chiliz Spicy Testnet.</span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleSwitchNetwork}
                    className="ml-2"
                  >
                    Switch
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {/* Verification Status */}
            {showDetails && verificationDetails && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">Verification Status</span>
                  <div className="flex items-center space-x-2">
                    <Badge className={isVerified ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}>
                      {isVerified ? "Verified" : "Unverified"}
                    </Badge>
                    {!isVerified && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={verifyWallet}
                        disabled={isLoading}
                        className="text-xs"
                      >
                        {isLoading ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          "Verify"
                        )}
                      </Button>
                    )}
                  </div>
                </div>
                
                <Progress value={getVerificationProgress()} className="h-2" />
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {verificationDetails.transactionCount >= 5 ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                      )}
                      <span className="text-slate-700">Transaction History</span>
                    </div>
                    <span className="text-slate-600">
                      {verificationDetails.transactionCount} txns
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {verificationDetails.accountAge >= 15 ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <Clock className="w-4 h-4 text-amber-600" />
                      )}
                      <span className="text-slate-700">Account Age</span>
                    </div>
                    <span className="text-slate-600">
                      {verificationDetails.accountAge} days
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Shield className={`w-4 h-4 ${verificationDetails.isBlacklisted ? 'text-red-600' : 'text-green-600'}`} />
                      <span className="text-slate-700">Security Status</span>
                    </div>
                    <span className={verificationDetails.isBlacklisted ? "text-red-600" : "text-green-600"}>
                      {verificationDetails.isBlacklisted ? "Flagged" : "Clean"}
                    </span>
                  </div>
                </div>

                {!isVerified && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      {verificationDetails.details}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open(CHILIZ_SPICY_TESTNET.blockExplorer, '_blank')}
              >
                <Activity className="w-4 h-4 mr-2" />
                Explorer
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={disconnect}
                className="text-red-600 hover:text-red-700"
              >
                Disconnect
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
