import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Coins, TrendingUp, Calculator } from "lucide-react";
import { useBNPL } from "@/hooks/use-bnpl";
import { useWallet } from "@/hooks/use-wallet";
import { useToast } from "@/hooks/use-toast";

interface YieldGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  purchaseAmount: number;
}

export default function YieldGenerationModal({ isOpen, onClose, purchaseAmount }: YieldGenerationModalProps) {
  const [stakeAmount, setStakeAmount] = useState("0.5");
  const { address: walletAddress } = useWallet();
  const { enableYieldGeneration, isProcessing } = useBNPL(walletAddress);
  const { toast } = useToast();

  const recommendedStake = Math.ceil(purchaseAmount * 0.25 / 0.6); // Estimate CHZ needed
  const estimatedApy = 12.5;
  const potentialSavings = (parseFloat(stakeAmount) * estimatedApy / 100 * 60 / 365); // 60 days staking

  const handleStake = async () => {
    try {
      await enableYieldGeneration.mutateAsync(stakeAmount);
      toast({
        title: "Staking Successful",
        description: `Successfully staked ${stakeAmount} CHZ for yield generation`,
      });
      onClose();
    } catch (error: any) {
      toast({
        title: "Staking Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    onClose();
    setStakeAmount("0.5");
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900">
            Enable Yield Generation
          </DialogTitle>
          <DialogDescription>
            Stake CHZ tokens to potentially reduce your final payment through yield earnings
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Coins className="w-8 h-8 text-amber-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Deposit CHZ to Generate Yield
            </h3>
            <p className="text-slate-600 text-sm">
              Stake CHZ tokens to potentially reduce your final payment through yield earnings
            </p>
          </div>

          {/* Recommendation */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-amber-800 font-medium">Recommended Stake</span>
              <span className="text-amber-900 font-bold">{recommendedStake} CHZ</span>
            </div>
            <div className="text-amber-700 text-sm">
              Estimated to cover a significant portion of your final payment
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="w-5 h-5 text-green-600 mr-1" />
                <span className="text-2xl font-bold text-slate-900">{estimatedApy}%</span>
              </div>
              <div className="text-slate-600 text-sm">Annual APY</div>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Calculator className="w-5 h-5 text-green-600 mr-1" />
                <span className="text-2xl font-bold text-green-600">€{potentialSavings.toFixed(2)}</span>
              </div>
              <div className="text-slate-600 text-sm">Potential Savings</div>
            </div>
          </div>

          {/* Stake Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="stake-amount" className="text-sm font-medium text-slate-700">
              CHZ Amount to Stake
            </Label>
            <div className="relative">
              <Input
                id="stake-amount"
                type="number"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                className="pr-12"
                min="0"
                step="1"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 text-sm">
                CHZ
              </span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-slate-500">
              <button
                type="button"
                onClick={() => setStakeAmount(recommendedStake.toString())}
                className="text-amber-600 hover:text-amber-700 underline"
              >
                Use recommended amount
              </button>
            </div>
          </div>

          {/* Real-time calculations */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-2">Staking Summary</h4>
            <div className="space-y-1 text-sm text-green-800">
              <div className="flex justify-between">
                <span>Stake Amount:</span>
                <span className="font-semibold">{stakeAmount} CHZ</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Daily Yield:</span>
                <span className="font-semibold">€{(potentialSavings / 60).toFixed(3)}</span>
              </div>
              <div className="flex justify-between">
                <span>60-Day Yield:</span>
                <span className="font-semibold">€{potentialSavings.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4">
            <Button variant="ghost" onClick={handleClose}>
              Skip for Now
            </Button>
            <Button 
              onClick={handleStake}
              disabled={isProcessing || !stakeAmount || parseFloat(stakeAmount) <= 0}
              className="bg-amber-500 hover:bg-amber-600 text-white"
            >
              {isProcessing ? "Staking..." : "Stake CHZ"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
