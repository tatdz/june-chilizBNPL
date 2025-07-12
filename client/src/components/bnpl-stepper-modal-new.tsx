import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Check, Clock, X, AlertCircle, Star, CreditCard, DollarSign, Calendar, Gift, Wallet, Loader2, PartyPopper, CheckCircle } from "lucide-react";
import { useBNPL } from "@/hooks/use-bnpl";
import { useWalletConnection } from "@/hooks/use-wallet-connection";
import { useToast } from "@/hooks/use-toast";
import { UnifiedPaymentSystem } from "@/lib/unified-payment-system";
import YieldGenerationModal from "./yield-generation-modal";
import type { Asset } from "@shared/schema";

interface BNPLStepperModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAsset: Asset | null;
}

export default function BNPLStepperModal({ isOpen, onClose, selectedAsset }: BNPLStepperModalProps) {
  const wallet = useWalletConnection();
  const { toast } = useToast();
  const [isYieldModalOpen, setIsYieldModalOpen] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [paymentProgress, setPaymentProgress] = useState<string>('');
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  
  const {
    currentStep,
    steps,
    purchaseCalculations,
    yieldEnabled,
    stakedAmount,
    estimatedYield,
    kycStatus,
    affordabilityStatus,
    createPurchase,

    resetBNPL,
    selectAsset,
    isProcessing,
    setBNPLState,
    updateStepStatus
  } = useBNPL(wallet.address);

  // Select asset when modal opens
  React.useEffect(() => {
    if (selectedAsset && isOpen) {
      selectAsset(selectedAsset);
    }
  }, [selectedAsset, isOpen, selectAsset]);

  // Update wallet verification step when wallet is verified
  React.useEffect(() => {
    if (wallet.isVerified && wallet.address) {
      updateStepStatus(1, 'completed');
      toast({
        title: "Step 1 Complete",
        description: "Wallet verification successful! Proceeding to next step.",
      });
    }
  }, [wallet.isVerified, wallet.address, updateStepStatus, toast]);

  const getStepIcon = (step: any) => {
    switch (step.status) {
      case 'completed':
        return <Check className="w-5 h-5 text-green-600" />;
      case 'in_progress':
        return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />;
      case 'failed':
        return <X className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'in_progress':
        return 'secondary';
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const handleClose = () => {
    setShowSuccessPopup(false);
    setPaymentProgress('');
    setIsPaymentProcessing(false);
    onClose();
  };

  const progressPercentage = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-4xl h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              June BNPL - Buy Now Pay Later
            </DialogTitle>
            <DialogDescription>
              Complete your purchase with flexible payment options and yield generation opportunities.
            </DialogDescription>
          </DialogHeader>

          {/* Success Popup */}
          {showSuccessPopup && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-8 max-w-md mx-4 text-center">
                <div className="flex justify-center mb-4">
                  <PartyPopper className="w-16 h-16 text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-green-600 mb-2">
                  🎉 Payment Successful!
                </h3>
                <p className="text-gray-600 mb-4">
                  Congratulations—your down payment is successful and your purchase is finalized! 
                  Please ensure you pay the remaining amount within 60 days.
                </p>
                <div className="space-y-2 mb-4">
                  <p className="text-sm"><strong>Asset:</strong> {selectedAsset?.name}</p>
                  <p className="text-sm"><strong>Down Payment:</strong> ${purchaseCalculations?.downPaymentAmount.toFixed(2)}</p>
                  <p className="text-sm"><strong>Remaining:</strong> ${((purchaseCalculations?.totalAmount || 0) - (purchaseCalculations?.downPaymentAmount || 0)).toFixed(2)}</p>
                </div>
                <Button 
                  onClick={() => setShowSuccessPopup(false)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Progress</span>
                <span>{Math.round(progressPercentage)}% Complete</span>
              </div>
              <Progress value={progressPercentage} className="w-full" />
            </div>

            {/* Asset Information */}
            {selectedAsset && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Gift className="w-5 h-5 text-purple-600" />
                  {selectedAsset.name} *
                </h3>
                <p className="text-gray-600 text-sm mt-1">{selectedAsset.description}</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-2xl font-bold text-green-600">${selectedAsset.price}</span>
                  <Badge variant="secondary">{selectedAsset.category}</Badge>
                </div>
              </div>
            )}

            {/* Payment Progress */}
            {paymentProgress && (
              <Alert>
                <Loader2 className="w-4 h-4 animate-spin" />
                <AlertDescription>{paymentProgress}</AlertDescription>
              </Alert>
            )}

            {/* Purchase Calculations */}
            {purchaseCalculations && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Payment Breakdown
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Total Amount:</span>
                    <p className="font-semibold">${purchaseCalculations.totalAmount.toFixed(2)}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Down Payment (20%):</span>
                    <p className="font-semibold text-green-600">${purchaseCalculations.downPaymentAmount.toFixed(2)}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Installments (2x):</span>
                    <p className="font-semibold">${purchaseCalculations.installmentAmount.toFixed(2)} each</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Final Payment:</span>
                    <p className="font-semibold">${purchaseCalculations.finalPaymentAmount.toFixed(2)}</p>
                  </div>
                </div>
                
                {yieldEnabled && (
                  <div className="mt-3 p-3 bg-yellow-50 rounded border">
                    <p className="text-sm text-yellow-800">
                      <Star className="w-4 h-4 inline mr-1" />
                      Yield Generation Enabled: {stakedAmount} CHZ staked
                    </p>
                    <p className="text-xs text-yellow-700">
                      Estimated yield: {estimatedYield} CHZ (reduces final payment)
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Steps */}
            <div className="space-y-4">
              {steps.map((step) => (
                <div key={step.id} className="flex items-start gap-4 p-4 border rounded-lg">
                  <div className="flex-shrink-0">
                    {getStepIcon(step)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{step.title}</h4>
                      <Badge variant={getBadgeVariant(step.status)}>
                        {step.status.replace('_', ' ')}
                      </Badge>
                      {step.optional && (
                        <Badge variant="outline" className="text-xs">Optional</Badge>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{step.description}</p>

                    {/* Step 1: Wallet Verification */}
                    {step.id === 1 && (
                      <div>
                        {step.status === 'pending' && (
                          <div className="space-y-2">
                            {!wallet.address ? (
                              <div className="text-red-600 text-sm mb-2">
                                Please connect your wallet first
                              </div>
                            ) : (
                              <div className="text-green-600 text-sm mb-2">
                                ✓ Wallet connected: {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                              </div>
                            )}
                            <Button 
                              onClick={async () => {
                                if (!wallet.address) {
                                  // Try to connect wallet first
                                  try {
                                    await wallet.connectWallet();
                                  } catch (error: any) {
                                    toast({
                                      title: "Connection Failed",
                                      description: "Please install MetaMask or connect your wallet manually",
                                      variant: "destructive",
                                    });
                                    return;
                                  }
                                }
                                
                                updateStepStatus(1, 'in_progress');
                                try {
                                  const result = await wallet.verifyWallet();
                                  if (result && result.isEligible) {
                                    updateStepStatus(1, 'completed');
                                    toast({
                                      title: "Wallet Verified",
                                      description: "Your wallet meets all eligibility requirements!",
                                    });
                                  } else {
                                    updateStepStatus(1, 'failed');
                                    toast({
                                      title: "Verification Failed",
                                      description: result?.details || "Wallet doesn't meet requirements",
                                      variant: "destructive",
                                    });
                                  }
                                } catch (error: any) {
                                  updateStepStatus(1, 'failed');
                                  toast({
                                    title: "Verification Error",
                                    description: error.message,
                                    variant: "destructive",
                                  });
                                }
                              }}
                              disabled={wallet.isLoading}
                              className="bg-blue-600 hover:bg-blue-700 text-white w-full disabled:opacity-50"
                            >
                              <Wallet className="w-4 h-4 mr-2" />
                              {wallet.isLoading ? "Verifying..." : wallet.address ? "Verify Wallet" : "Connect & Verify Wallet"}
                            </Button>
                          </div>
                        )}
                        {step.status === 'completed' && (
                          <div className="text-green-600 text-sm flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            Wallet verified successfully! Meets all eligibility requirements.
                          </div>
                        )}
                        {step.status === 'failed' && (
                          <div className="text-red-600 text-sm flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            Wallet verification failed. Please try again or use a different wallet.
                          </div>
                        )}
                      </div>
                    )}

                    {/* Step 2: KYC Verification */}
                    {step.id === 2 && step.status === 'pending' && (
                      <div className="space-y-3">
                        <p className="text-sm text-gray-600">
                          Complete identity verification to proceed with your purchase.
                        </p>
                        <Button 
                          onClick={async () => {
                            updateStepStatus(2, 'in_progress');
                            // Simulate KYC processing
                            await new Promise(resolve => setTimeout(resolve, 2000));
                            updateStepStatus(2, 'completed');
                            toast({
                              title: "KYC Complete",
                              description: "Identity verification successful!",
                            });
                          }}
                          className="bg-green-600 hover:bg-green-700 text-white"
                          disabled={isProcessing}
                        >
                          {step.status === 'in_progress' ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Processing KYC...
                            </>
                          ) : (
                            'Complete KYC (Demo)'
                          )}
                        </Button>
                      </div>
                    )}

                    {/* Step 3: Affordability Check */}
                    {step.id === 3 && step.status === 'pending' && (
                      <div className="space-y-3">
                        <p className="text-sm text-gray-600">
                          Complete financial assessment to verify your ability to make payments.
                        </p>
                        <Button 
                          onClick={async () => {
                            updateStepStatus(3, 'in_progress');
                            // Simulate affordability check processing
                            await new Promise(resolve => setTimeout(resolve, 1500));
                            updateStepStatus(3, 'completed');
                            toast({
                              title: "Affordability Check Complete",
                              description: "Financial assessment passed!",
                            });
                          }}
                          className="bg-purple-600 hover:bg-purple-700 text-white"
                          disabled={isProcessing}
                        >
                          {step.status === 'in_progress' ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Processing Assessment...
                            </>
                          ) : (
                            'Complete Affordability Check (Demo)'
                          )}
                        </Button>
                      </div>
                    )}

                    {/* Step 4: Down Payment */}
                    {step.id === 4 && step.status === 'pending' && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm text-gray-600">
                            Down Payment: ${purchaseCalculations?.downPaymentAmount.toFixed(2)} (20% of total)
                          </span>
                        </div>
                        
                        <div className="space-y-3">
                          <h4 className="font-medium">Choose your payment method:</h4>
                          <div className="grid grid-cols-1 gap-3">
                            <Button
                              onClick={async () => {
                                if (!wallet.address || !selectedAsset || !purchaseCalculations) return;
                                setIsPaymentProcessing(true);
                                
                                const paymentRequest = {
                                  walletAddress: wallet.address,
                                  asset: selectedAsset,
                                  totalAmount: purchaseCalculations.totalAmount,
                                  downPaymentAmount: purchaseCalculations.downPaymentAmount,
                                  installmentCount: 2
                                };
                                
                                await UnifiedPaymentSystem.processPayment(
                                  'chz_wallet',
                                  paymentRequest,
                                  (progress) => {
                                    setPaymentProgress(progress.message);
                                    if (progress.status === 'loading') {
                                      updateStepStatus(4, 'in_progress');
                                    }
                                  },
                                  (result) => {
                                    setIsPaymentProcessing(false);
                                    setPaymentProgress('');
                                    
                                    if (result.success) {
                                      updateStepStatus(4, 'completed');
                                      setShowSuccessPopup(true);
                                      toast({
                                        title: "CHZ Payment Successful",
                                        description: "Down payment completed using CHZ wallet!",
                                      });
                                      
                                      // Force refresh My Payments page data
                                      try {
                                        import("@/lib/queryClient").then(({ queryClient }) => {
                                          queryClient.invalidateQueries({ 
                                            queryKey: [`/api/purchases/wallet/${wallet.address}`] 
                                          });
                                        });
                                      } catch (error) {
                                        console.log('Query refresh error:', error);
                                      }
                                    } else {
                                      updateStepStatus(4, 'failed');
                                      toast({
                                        title: "CHZ Payment Failed",
                                        description: result.error || "Unknown error",
                                        variant: "destructive",
                                      });
                                    }
                                  }
                                );
                              }}
                              className="flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white"
                              disabled={isPaymentProcessing}
                            >
                              <Wallet className="w-4 h-4" />
                              Pay with CHZ Wallet (Recommended)
                              {isPaymentProcessing && (
                                <Loader2 className="w-4 h-4 animate-spin ml-2" />
                              )}
                            </Button>
                            <Button 
                              onClick={async () => {
                                if (!wallet.address || !selectedAsset || !purchaseCalculations) return;
                                setIsPaymentProcessing(true);
                                
                                const paymentRequest = {
                                  walletAddress: wallet.address,
                                  asset: selectedAsset,
                                  totalAmount: purchaseCalculations.totalAmount,
                                  downPaymentAmount: purchaseCalculations.downPaymentAmount,
                                  installmentCount: 2
                                };
                                
                                await UnifiedPaymentSystem.processPayment(
                                  'demo_chz',
                                  paymentRequest,
                                  (progress) => {
                                    setPaymentProgress(progress.message);
                                    if (progress.status === 'loading') {
                                      updateStepStatus(4, 'in_progress');
                                    }
                                  },
                                  (result) => {
                                    setIsPaymentProcessing(false);
                                    setPaymentProgress('');
                                    
                                    if (result.success) {
                                      updateStepStatus(4, 'completed');
                                      setShowSuccessPopup(true);
                                      toast({
                                        title: "Demo Payment Successful",
                                        description: "Down payment completed and saved to My Payments!",
                                      });
                                      
                                      // Force refresh My Payments page data
                                      try {
                                        import("@/lib/queryClient").then(({ queryClient }) => {
                                          queryClient.invalidateQueries({ 
                                            queryKey: [`/api/purchases/wallet/${wallet.address}`] 
                                          });
                                        });
                                      } catch (error) {
                                        console.log('Query refresh error:', error);
                                      }
                                    } else {
                                      updateStepStatus(4, 'failed');
                                      toast({
                                        title: "Demo Payment Failed",
                                        description: result.error || "Unknown error",
                                        variant: "destructive",
                                      });
                                    }
                                  }
                                );
                              }}
                              variant="outline"
                              className="w-full text-xs"
                            >
                              Demo: Simulate CHZ Payment (0.1 CHZ)
                            </Button>
                          </div>
                          <div className="text-center">
                            <span className="text-sm text-gray-600">or</span>
                          </div>
                          <div className="grid grid-cols-1 gap-3">
                            <Button
                              onClick={async () => {
                                if (!wallet.address || !selectedAsset || !purchaseCalculations) return;
                                setIsPaymentProcessing(true);
                                
                                const paymentRequest = {
                                  walletAddress: wallet.address,
                                  asset: selectedAsset,
                                  totalAmount: purchaseCalculations.totalAmount,
                                  downPaymentAmount: purchaseCalculations.downPaymentAmount,
                                  installmentCount: 2
                                };
                                
                                await UnifiedPaymentSystem.processPayment(
                                  'stripe',
                                  paymentRequest,
                                  (progress) => {
                                    setPaymentProgress(progress.message);
                                    if (progress.status === 'loading') {
                                      updateStepStatus(4, 'in_progress');
                                    }
                                  },
                                  (result) => {
                                    setIsPaymentProcessing(false);
                                    setPaymentProgress('');
                                    
                                    if (result.success) {
                                      updateStepStatus(4, 'completed');
                                      setShowSuccessPopup(true);
                                      toast({
                                        title: "Card Payment Successful",
                                        description: "Down payment completed with Stripe!",
                                      });
                                    } else {
                                      updateStepStatus(4, 'failed');
                                      toast({
                                        title: "Card Payment Failed",
                                        description: result.error || "Unknown error",
                                        variant: "destructive",
                                      });
                                    }
                                  }
                                );
                              }}
                              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                              disabled={isPaymentProcessing}
                            >
                              <CreditCard className="w-4 h-4" />
                              Pay with Card (Stripe)
                              {isPaymentProcessing && (
                                <Loader2 className="w-4 h-4 animate-spin ml-2" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 5: Yield Generation (Optional) */}
                    {step.id === 5 && step.status === 'pending' && (
                      <div className="space-y-3">
                        <p className="text-sm text-gray-600 mb-2">
                          Enable yield generation to earn CHZ tokens and reduce your final payment amount.
                        </p>
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => setIsYieldModalOpen(true)}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white"
                          >
                            <Star className="w-4 h-4 mr-2" />
                            Enable Yield Generation
                          </Button>
                          <Button 
                            onClick={() => {
                              updateStepStatus(5, 'completed');
                              toast({
                                title: "Step Skipped",
                                description: "Yield generation disabled for this purchase.",
                              });
                            }}
                            variant="outline"
                          >
                            Skip (No Yield)
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between pt-4 border-t">
              <Button variant="outline" onClick={handleClose}>
                {currentStep === steps.length ? "Close" : "Cancel"}
              </Button>
              <div className="text-sm text-gray-500">
                * NFTs and Fan Tokens only
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Yield Generation Modal */}
      <YieldGenerationModal 
        isOpen={isYieldModalOpen}
        onClose={() => setIsYieldModalOpen(false)}
        purchaseAmount={purchaseCalculations?.totalAmount || 0}
      />
    </>
  );
}