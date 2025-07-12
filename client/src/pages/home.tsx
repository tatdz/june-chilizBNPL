import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, TrendingUp, Users, DollarSign, ShoppingCart, Calendar, Coins } from "lucide-react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import FeaturedAssets from "@/components/featured-assets";
import BNPLStepperModal from "@/components/bnpl-stepper-modal";
import type { Asset } from "@shared/schema";

export default function Home() {
  const [isBNPLModalOpen, setIsBNPLModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  const handleSelectAsset = (asset: Asset) => {
    setSelectedAsset(asset);
    setIsBNPLModalOpen(true);
  };

  const handleStartShopping = () => {
    document.getElementById("featured-assets")?.scrollIntoView({ 
      behavior: 'smooth' 
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <section className="py-12 mb-12">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div className="text-center lg:text-left lg:w-1/2">
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                June BNPL<br />
                <span className="text-primary">On Chiliz Chain</span>
              </h1>
              <p className="text-xl text-slate-600 mb-8 max-w-2xl">
                Buy Fan Tokens, event tickets and more now—pay at your pace and earn yield as you repay!
              </p>
              <Button 
                onClick={handleStartShopping}
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-4 text-lg"
              >
                <span>Start Shopping</span>
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
            
            {/* Wallet Logo */}
            <div className="lg:w-1/2 flex justify-center lg:justify-end mt-8 lg:mt-0">
              <img 
                src="/wallet-logo.png" 
                alt="June BNPL Wallet" 
                className="w-80 h-80 md:w-96 md:h-96 lg:w-[28rem] lg:h-[28rem] opacity-80"
              />
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Up to 4000 EUR</h3>
              <p className="text-slate-600 text-sm">User purchase power</p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Fully transparent</h3>
              <p className="text-slate-600 text-sm">DeFi-powered repayments</p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Up to 8.3%* APY</h3>
              <p className="text-slate-600 text-sm">On your repayments</p>
            </CardContent>
          </Card>
        </section>

        {/* APY Disclaimer */}
        <div className="text-center mb-12">
          <p className="text-xs text-slate-500">
            *APY varies by validator and network conditions. See <a href="https://docs.chiliz.com/" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">https://docs.chiliz.com/</a> for current rates.
          </p>
        </div>

        {/* Featured Assets Section */}
        <div id="featured-assets">
          <FeaturedAssets onSelectAsset={handleSelectAsset} />
        </div>

        {/* How It Works Section */}
        <section className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-8 md:p-12 text-white mb-12">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">How June BNPL Works</h2>
            <p className="text-xl opacity-90 mb-8">
              Simple, flexible payments for sports fans on Chiliz Chain
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart className="w-8 h-8" />
                </div>
                <h3 className="font-semibold mb-2">1. Shop & Select</h3>
                <p className="text-sm opacity-90">Browse fan tokens and choose BNPL at checkout</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8" />
                </div>
                <h3 className="font-semibold mb-2">2. Pay in Installments</h3>
                <p className="text-sm opacity-90">25% down, then 3 flexible payments over 60 days</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Coins className="w-8 h-8" />
                </div>
                <h3 className="font-semibold mb-2">3. Earn Yield</h3>
                <p className="text-sm opacity-90">Stake CHZ to earn up to 8.3%* APY and reduce final payment</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* BNPL Stepper Modal */}
      <BNPLStepperModal
        isOpen={isBNPLModalOpen}
        onClose={() => setIsBNPLModalOpen(false)}
        selectedAsset={selectedAsset}
      />
    </div>
  );
}
