import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Check, 
  Clock, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Star,
  CreditCard,
  Eye,
  Settings,
  ChevronDown,
  ChevronUp,
  ExternalLink
} from "lucide-react";
import { useState } from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { useWallet } from "@/hooks/use-wallet";
import { useToast } from "@/hooks/use-toast";
import { web3Service } from "@/lib/web3";
import type { Purchase, Asset, Payment } from "@shared/schema";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface PurchaseWithDetails extends Purchase {
  asset: Asset;
  payments: Payment[];
  nextPaymentDue?: Date;
  daysUntilNextPayment?: number;
  progressPercentage: number;
}

export default function MyPayments() {
  const [filterStatus, setFilterStatus] = useState("all");
  const [expandedPurchases, setExpandedPurchases] = useState<Set<number>>(new Set());
  const { address: walletAddress, isConnected } = useWallet();
  const { toast } = useToast();

  const toggleExpanded = (purchaseId: number) => {
    setExpandedPurchases(prev => {
      const newSet = new Set(prev);
      if (newSet.has(purchaseId)) {
        newSet.delete(purchaseId);
      } else {
        newSet.add(purchaseId);
      }
      return newSet;
    });
  };

  // Fetch purchases directly by wallet address for real data
  const { data: purchases, isLoading, error, refetch } = useQuery<PurchaseWithDetails[]>({
    queryKey: [`/api/purchases/wallet/${walletAddress}`],
    queryFn: async () => {
      if (!walletAddress) return [];
      const response = await fetch(`/api/purchases/wallet/${walletAddress}`);
      if (!response.ok) return [];
      const data = await response.json();
      
      // The API already returns enhanced data with asset and payments
      // Let's process it for UI display
      return data.map((purchase: any) => {
        // Calculate progress based on payments
        const completedPayments = purchase.payments?.filter((p: any) => p.status === 'completed').length || 0;
        const totalExpectedPayments = 3; // Down payment + 2 installments
        const progressPercentage = (completedPayments / totalExpectedPayments) * 100;

        // Calculate next payment due (installments every 20 days)
        const createdDate = new Date(purchase.createdAt);
        const nextPaymentDate = new Date(createdDate.getTime() + (20 * 24 * 60 * 60 * 1000)); // 20 days later
        const daysUntilNextPayment = Math.ceil(
          (nextPaymentDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );

        return {
          ...purchase,
          progressPercentage,
          nextPaymentDue: nextPaymentDate,
          daysUntilNextPayment: Math.max(0, daysUntilNextPayment)
        };
      });
    },
    enabled: !!walletAddress && isConnected,
    refetchInterval: 3000, // Refresh every 3 seconds to get latest purchases
  });

  const handleEnableYield = async (purchaseId: number) => {
    try {
      if (!walletAddress) {
        throw new Error("Wallet not connected");
      }

      // Stake 0.5 CHZ for demo
      const txHash = await web3Service.stakeChz("0.5");

      // Update purchase to enable yield
      const response = await fetch(`/api/purchases/${purchaseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          yieldEnabled: true,
          stakedAmount: "0.5 CHZ"
        })
      });

      if (!response.ok) {
        throw new Error('Failed to enable yield');
      }

      toast({
        title: "Yield Enabled",
        description: "Successfully staked 0.5 CHZ to earn yield on your remaining payments!",
      });

      // Refresh the data
      window.location.reload();
    } catch (error: any) {
      toast({
        title: "Failed to Enable Yield",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleMakePayment = async (purchaseId: number, paymentId: number, amount: string) => {
    try {
      if (!walletAddress) {
        throw new Error("Wallet not connected");
      }

      // Process payment through smart contract
      const txHash = await web3Service.makePayment(purchaseId, amount);

      // Update payment status in backend
      const response = await fetch(`/api/payments/${paymentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'completed',
          paidAt: new Date().toISOString(),
          transactionHash: txHash
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update payment status');
      }

      toast({
        title: "Payment Successful",
        description: `Payment processed successfully. Transaction: ${txHash.slice(0, 10)}...`,
      });

      // Refresh the data
      window.location.reload();
    } catch (error: any) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Active</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>;
      case 'defaulted':
        return <Badge variant="destructive">Defaulted</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPaymentTypeLabel = (type: string) => {
    switch (type) {
      case 'down_payment':
        return 'Down Payment';
      case 'installment':
        return 'Installment';
      case 'final_payment':
        return 'Final Payment';
      default:
        return type;
    }
  };

  const handleStripePayment = async (purchaseId: number, paymentId: number, amount: string) => {
    try {
      toast({
        title: "Stripe Payment",
        description: "Processing card payment...",
      });
      
      // For demo purposes, simulate Stripe payment
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Card Payment Successful", 
        description: `Paid €${amount} via Stripe`,
      });
      refetch();
      
    } catch (error) {
      toast({
        title: "Stripe Payment Failed",
        description: "Unable to process card payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCHZPayment = async (purchaseId: number, paymentId: number, amount: string) => {
    try {
      if (!walletAddress) {
        toast({
          title: "Wallet Required",
          description: "Please connect your wallet to pay with CHZ.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "CHZ Payment",
        description: "Processing CHZ wallet payment...",
      });
      
      // Convert EUR to CHZ (approximate rate: 1 EUR = 12.5 CHZ)
      const chzAmount = (parseFloat(amount) * 12.5).toFixed(2);
      
      // Simulate CHZ payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "CHZ Payment Successful",
        description: `Paid ${chzAmount} CHZ (€${amount}) for installment`,
      });
      refetch();
      
    } catch (error) {
      toast({
        title: "CHZ Payment Failed",
        description: "Unable to process CHZ payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePaymentMethodChange = async (purchaseId: number, newMethod: string) => {
    try {
      toast({
        title: "Updating Payment Method",
        description: "Changing your default payment method...",
      });

      // Update the payment method for the purchase
      const response = await fetch(`/api/purchases/${purchaseId}/payment-method`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethod: newMethod })
      });

      if (response.ok) {
        toast({
          title: "Payment Method Updated",
          description: `Default method changed to ${newMethod === 'stripe' ? 'Card Payment' : newMethod === 'chz_wallet' ? 'CHZ Wallet' : 'Demo CHZ'}`,
        });
        refetch(); // Refresh the data
      } else {
        throw new Error('Failed to update payment method');
      }
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Unable to change payment method. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredPurchases = Array.isArray(purchases) ? purchases.filter(purchase => {
    if (filterStatus === 'all') return true;
    return purchase.status === filterStatus;
  }) : [];

  if (!isConnected || !walletAddress) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Alert>
            <CreditCard className="h-4 w-4" />
            <AlertDescription>
              Please connect your wallet to view your BNPL purchases and payments.
            </AlertDescription>
          </Alert>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Payments</h1>
            <p className="text-slate-600 mt-1">Track your BNPL purchases and payment schedule</p>
          </div>
          <div className="flex items-center space-x-4">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Purchases</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="defaulted">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Debug Info - Show purchase count */}
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>Debug Info:</strong> Found {purchases?.length || 0} purchase(s) for wallet: {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
          </p>
          {purchases && purchases.length > 0 && (
            <div className="text-xs text-blue-600 mt-1 space-y-1">
              {purchases.map((p, i) => (
                <div key={i}>
                  Purchase {i + 1}: {p.asset?.name} - ${p.totalAmount} (Status: {p.status}, Payments: {p.payments?.length || 0})
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-6">
            {[1, 2].map((i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <Skeleton className="w-16 h-16 rounded-lg" />
                      <div className="space-y-2">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                    <Skeleton className="h-8 w-20" />
                  </div>
                  <Skeleton className="h-2 w-full mb-6" />
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((j) => (
                      <Skeleton key={j} className="h-20" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>
              Failed to load your purchases. Please try again later.
            </AlertDescription>
          </Alert>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredPurchases.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <CreditCard className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No Purchases Found</h3>
              <p className="text-slate-600 mb-4">
                {filterStatus === 'all' 
                  ? "You haven't made any BNPL purchases yet."
                  : `No ${filterStatus} purchases found.`
                }
              </p>
              <Button onClick={() => window.location.href = '/'} className="bg-primary hover:bg-primary/90">
                Start Shopping
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Purchases List */}
        {!isLoading && !error && filteredPurchases.length > 0 && (
          <div className="space-y-6">
            {filteredPurchases.map((purchase) => {
              const completedPayments = purchase.payments.filter(p => p.status === 'completed');
              const pendingPayments = purchase.payments.filter(p => p.status === 'pending');
              const nextPendingPayment = pendingPayments.sort((a, b) => 
                new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime()
              )[0];

              return (
                <Card key={purchase.id} className="overflow-hidden border border-slate-200">
                  <CardContent className="p-6">
                    {/* Purchase Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center space-x-4">
                        <img 
                          src={purchase.asset.imageUrl} 
                          alt={purchase.asset.name}
                          className="w-16 h-16 rounded-lg object-cover" 
                        />
                        <div>
                          <h3 className="font-semibold text-slate-900">{purchase.asset.name}</h3>
                          <p className="text-slate-600 text-sm">
                            Purchased on {new Date(purchase.createdAt!).toLocaleDateString()}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            {getStatusBadge(purchase.status)}
                            {purchase.daysUntilNextPayment !== undefined && purchase.status === 'active' && (
                              <>
                                <span className="text-slate-500 text-xs">•</span>
                                <span className="text-slate-500 text-xs">
                                  Next payment in {purchase.daysUntilNextPayment} days
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-slate-900">€{purchase.totalAmount}</div>
                        <div className="text-sm text-slate-600">Total Amount</div>
                      </div>
                    </div>

                    {/* Payment Progress */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-700">Payment Progress</span>
                        <span className="text-sm text-slate-600">
                          {completedPayments.length} of {purchase.payments.length} payments completed
                        </span>
                      </div>
                      <Progress value={purchase.progressPercentage} className="h-2" />
                    </div>

                    {/* Payment Schedule */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                      {purchase.payments.map((payment, index) => {
                        const isCompleted = payment.status === 'completed';
                        const isPending = payment.status === 'pending';
                        const isOverdue = isPending && payment.dueDate && new Date(payment.dueDate) < new Date();

                        return (
                          <div 
                            key={payment.id} 
                            className={`rounded-lg p-3 border ${
                              isCompleted 
                                ? 'bg-green-50 border-green-200' 
                                : isOverdue
                                ? 'bg-red-50 border-red-200'
                                : isPending
                                ? 'bg-amber-50 border-amber-200'
                                : 'bg-slate-50 border-slate-200'
                            }`}
                          >
                            <div className="flex items-center space-x-2 mb-2">
                              {isCompleted ? (
                                <Check className="w-4 h-4 text-green-600" />
                              ) : isOverdue ? (
                                <Clock className="w-4 h-4 text-red-600" />
                              ) : isPending ? (
                                <Clock className="w-4 h-4 text-amber-600" />
                              ) : (
                                <div className="w-4 h-4 rounded-full bg-slate-400" />
                              )}
                              <span className={`text-sm font-medium ${
                                isCompleted 
                                  ? 'text-green-700' 
                                  : isOverdue
                                  ? 'text-red-700'
                                  : isPending
                                  ? 'text-amber-700'
                                  : 'text-slate-600'
                              }`}>
                                {getPaymentTypeLabel(payment.paymentType)}
                              </span>
                            </div>
                            <div className={`font-semibold ${
                              isCompleted 
                                ? 'text-green-800' 
                                : isOverdue
                                ? 'text-red-800'
                                : isPending
                                ? 'text-amber-800'
                                : 'text-slate-700'
                            }`}>
                              €{payment.amount}
                            </div>
                            <div className={`text-xs ${
                              isCompleted 
                                ? 'text-green-600' 
                                : isOverdue
                                ? 'text-red-600'
                                : isPending
                                ? 'text-amber-600'
                                : 'text-slate-500'
                            }`}>
                              {isCompleted && payment.paidAt
                                ? `Paid ${new Date(payment.paidAt).toLocaleDateString()}`
                                : payment.dueDate
                                ? `Due ${new Date(payment.dueDate).toLocaleDateString()}`
                                : 'Pending'
                              }
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Yield Information */}
                    {purchase.yieldEnabled && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-amber-900 mb-1 flex items-center">
                              <Star className="w-4 h-4 mr-1" />
                              Yield Generation Active
                            </h4>
                            <p className="text-amber-700 text-sm">
                              {purchase.stakedAmount} CHZ staked • 12.5% APY
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-amber-900">€{purchase.yieldEarned || '0.00'}</div>
                            <div className="text-amber-700 text-xs">Earned so far</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-3">
                      {nextPendingPayment && (
                        <Button 
                          onClick={() => handleMakePayment(
                            purchase.id, 
                            nextPendingPayment.id, 
                            nextPendingPayment.amount.toString()
                          )}
                          className="bg-primary hover:bg-primary/90 text-white"
                        >
                          <CreditCard className="w-4 h-4 mr-2" />
                          Make Payment
                        </Button>
                      )}
                      <Collapsible open={expandedPurchases.has(purchase.id)} onOpenChange={() => toggleExpanded(purchase.id)}>
                        <CollapsibleTrigger asChild>
                          <Button variant="outline" size="sm">
                            {expandedPurchases.has(purchase.id) ? (
                              <ChevronUp className="w-4 h-4 mr-2" />
                            ) : (
                              <ChevronDown className="w-4 h-4 mr-2" />
                            )}
                            {expandedPurchases.has(purchase.id) ? 'Hide Details' : 'View Details'}
                          </Button>
                        </CollapsibleTrigger>

                        <CollapsibleContent className="mt-6">
                          <div className="border-t pt-6 space-y-6">
                            {/* Purchase Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <h4 className="font-semibold text-slate-900 mb-3">Purchase Information</h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-slate-600">Asset Price:</span>
                                    <span className="font-medium">€{purchase.asset.price}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-600">Down Payment:</span>
                                    <span className="font-medium">€{purchase.downPayment}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-600">Installment Count:</span>
                                    <span className="font-medium">{purchase.installmentCount} months</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-600">Total Amount:</span>
                                    <span className="font-medium">€{purchase.totalAmount}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-600">Payment Method:</span>
                                    <span className="font-medium">{purchase.paymentMethod}</span>
                                  </div>
                                  {purchase.transactionHash && (
                                    <div className="flex justify-between">
                                      <span className="text-slate-600">Transaction:</span>
                                      <a 
                                        href={`https://testnet.chiliscan.com/tx/${purchase.transactionHash}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
                                      >
                                        {purchase.transactionHash.slice(0, 8)}...{purchase.transactionHash.slice(-6)}
                                        <ExternalLink className="w-3 h-3 ml-1" />
                                      </a>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div>
                                <h4 className="font-semibold text-slate-900 mb-3">Fees & Charges</h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-slate-600">Base Price:</span>
                                    <span className="font-medium">€{purchase.asset.price}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-600">Processing Fee:</span>
                                    <span className="font-medium">€{(parseFloat(purchase.totalAmount) - parseFloat(purchase.asset.price)).toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-600">Interest Rate:</span>
                                    <span className="font-medium">0% APR</span>
                                  </div>
                                  <div className="flex justify-between border-t pt-2">
                                    <span className="text-slate-900 font-medium">Total Fees:</span>
                                    <span className="font-bold">€{(parseFloat(purchase.totalAmount) - parseFloat(purchase.asset.price)).toFixed(2)}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Installment Summary */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                                <div className="text-2xl font-bold text-green-700">{completedPayments.length}</div>
                                <div className="text-sm text-green-600">Payments Completed</div>
                              </div>
                              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
                                <div className="text-2xl font-bold text-amber-700">{pendingPayments.length}</div>
                                <div className="text-sm text-amber-600">Payments Due</div>
                              </div>
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                                <div className="text-2xl font-bold text-blue-700">{purchase.payments.length}</div>
                                <div className="text-sm text-blue-600">Total Installments</div>
                              </div>
                            </div>

                            {/* Installment Schedule */}
                            <div>
                              <div className="flex items-center justify-between mb-4">
                                <h4 className="font-semibold text-slate-900">Payment Schedule</h4>
                                <div className="text-sm text-slate-600">
                                  {completedPayments.length} of {purchase.payments.length} completed
                                </div>
                              </div>
                              <div className="space-y-3">
                                {purchase.payments.map((payment, index) => {
                                  const isOverdue = payment.status === 'overdue' || 
                                    (payment.status === 'pending' && payment.dueDate && new Date(payment.dueDate) < new Date());
                                  const isPending = payment.status === 'pending' && !isOverdue;
                                  const isCompleted = payment.status === 'completed';
                                  
                                  return (
                                    <div key={payment.id} className={`p-4 rounded-lg border ${
                                      isCompleted 
                                        ? 'bg-green-50 border-green-200' 
                                        : isOverdue
                                        ? 'bg-red-50 border-red-200'
                                        : 'bg-amber-50 border-amber-200'
                                    }`}>
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                                            isCompleted 
                                              ? 'bg-green-600' 
                                              : isOverdue
                                              ? 'bg-red-600'
                                              : 'bg-amber-500'
                                          }`}>
                                            {isCompleted ? <Check className="w-5 h-5" /> : index + 1}
                                          </div>
                                          <div>
                                            <div className="font-medium text-slate-900">
                                              Installment {index + 1} of {purchase.payments.length}
                                            </div>
                                            <div className="text-lg font-bold text-slate-800">
                                              €{payment.amount}
                                            </div>
                                            <div className="text-sm text-slate-600">
                                              {isCompleted 
                                                ? `Paid on ${payment.paidAt ? new Date(payment.paidAt).toLocaleDateString() : 'N/A'}`
                                                : `Due: ${payment.dueDate ? new Date(payment.dueDate).toLocaleDateString() : 'TBD'}`
                                              }
                                            </div>
                                            {isOverdue && (
                                              <div className="text-xs text-red-600 font-medium mt-1">
                                                ⚠️ Overdue by {Math.ceil((new Date().getTime() - new Date(payment.dueDate!).getTime()) / (1000 * 60 * 60 * 24))} days
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                        <div className="text-right space-y-2">
                                          <Badge variant={
                                            isCompleted ? 'default' :
                                            isOverdue ? 'destructive' : 'secondary'
                                          }>
                                            {isCompleted ? 'Paid' :
                                             isOverdue ? 'Overdue' : 'Due'}
                                          </Badge>
                                          
                                          {/* Payment Action Buttons */}
                                          {!isCompleted && (
                                            <div className="flex flex-col space-y-2">
                                              <Button 
                                                size="sm" 
                                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                                onClick={() => handleStripePayment(purchase.id, payment.id, payment.amount.toString())}
                                              >
                                                <CreditCard className="w-4 h-4 mr-1" />
                                                Pay with Card
                                              </Button>
                                              <Button 
                                                variant="outline" 
                                                size="sm"
                                                onClick={() => handleCHZPayment(purchase.id, payment.id, payment.amount.toString())}
                                              >
                                                💰 Pay with CHZ
                                              </Button>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                              
                              {/* Payment Method Settings */}
                              <div className="mt-6 p-4 bg-slate-50 rounded-lg border">
                                <h5 className="font-medium text-slate-900 mb-3">Payment Settings</h5>
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="text-sm font-medium text-slate-700">Default Payment Method</div>
                                    <div className="text-sm text-slate-600">{purchase.paymentMethod}</div>
                                  </div>
                                  <Select onValueChange={(value) => handlePaymentMethodChange(purchase.id, value)}>
                                    <SelectTrigger className="w-[160px]">
                                      <SelectValue placeholder="Change Method" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="stripe">💳 Card Payment</SelectItem>
                                      <SelectItem value="chz_wallet">💰 CHZ Wallet</SelectItem>
                                      <SelectItem value="demo_chz">🎮 Demo CHZ</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="mt-3 text-xs text-slate-500">
                                  This will be used for all future payments for this purchase
                                </div>
                              </div>
                            </div>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                      {purchase.yieldEnabled ? (
                        <Button variant="ghost" size="sm" className="text-amber-600 hover:text-amber-700">
                          <Settings className="w-4 h-4 mr-2" />
                          Manage Yield
                        </Button>
                      ) : (
                        <Button 
                          onClick={() => handleEnableYield(purchase.id)}
                          variant="outline" 
                          size="sm" 
                          className="text-green-600 border-green-300 hover:bg-green-50"
                        >
                          <TrendingUp className="w-4 h-4 mr-2" />
                          Earn Yield (8.3% APY*)
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
