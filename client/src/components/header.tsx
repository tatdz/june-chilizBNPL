import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wallet, Menu, Check, AlertCircle } from "lucide-react";
import { useWallet } from "@/hooks/use-wallet";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function Header() {
  const [location] = useLocation();
  const { isConnected, address, isVerified, connectWallet, disconnectWallet, isLoading } = useWallet();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    { href: "/", label: "Shop" },
    { href: "/my-payments", label: "My Payments" },
    { href: "/yield", label: "Yield" },
    { href: "/liquidity-pool-demo", label: "Liquidity Pool Demo" },
    { href: "/documentation", label: "Documentation" }
  ];

  const NavLinks = ({ mobile = false }) => (
    <>
      {navigationItems.map(item => (
        <Link
          key={item.href}
          href={item.href}
          className={`${
            mobile ? "block py-2" : ""
          } text-slate-600 hover:text-slate-900 font-medium transition-colors ${
            location === item.href ? "text-slate-900" : ""
          }`}
          onClick={() => mobile && setIsMobileMenuOpen(false)}
        >
          {item.label}
        </Link>
      ))}
    </>
  );

  return (
    <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">J</span>
            </div>
            <span className="text-xl font-bold text-slate-800">June BNPL</span>
            <Badge variant="secondary" className="bg-orange-100 text-orange-800 hover:bg-orange-100">
              Chiliz Chain
            </Badge>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <NavLinks />
          </nav>

          {/* Wallet Connection */}
          <div className="flex items-center space-x-4">
            {isConnected && address && typeof address === 'string' ? (
              <div className="hidden sm:flex items-center space-x-3">
                <div className="flex items-center space-x-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-green-700 text-sm font-medium">
                    {address.slice(0, 6)}...{address.slice(-4)}
                  </span>
                  {isVerified ? (
                    <div className="flex items-center space-x-1">
                      <Check className="w-3 h-3 text-green-600" />
                      <span className="text-green-600 text-xs">Verified</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1">
                      <AlertCircle className="w-3 h-3 text-amber-600" />
                      <span className="text-amber-600 text-xs">Unverified</span>
                    </div>
                  )}
                </div>
                <Button 
                  onClick={disconnectWallet}
                  variant="outline"
                  size="sm"
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button 
                onClick={connectWallet}
                disabled={isLoading}
                className="bg-primary hover:bg-primary/90 text-white font-medium"
              >
                <Wallet className="w-4 h-4 mr-2" />
                {isLoading ? "Connecting..." : "Connect Wallet"}
              </Button>
            )}

            {/* Mobile Menu */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col space-y-4 mt-6">
                  <NavLinks mobile />
                  
                  {isConnected && address && typeof address === 'string' && (
                    <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-green-700 text-sm font-medium">
                          {address.slice(0, 10)}...{address.slice(-6)}
                        </span>
                      </div>
                      {isVerified ? (
                        <div className="flex items-center space-x-1 mb-3">
                          <Check className="w-3 h-3 text-green-600" />
                          <span className="text-green-600 text-xs">Wallet Verified</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1 mb-3">
                          <AlertCircle className="w-3 h-3 text-amber-600" />
                          <span className="text-amber-600 text-xs">Wallet Unverified</span>
                        </div>
                      )}
                      <Button 
                        onClick={disconnectWallet}
                        variant="outline"
                        size="sm"
                        className="w-full text-red-600 border-red-200 hover:bg-red-50"
                      >
                        Disconnect Wallet
                      </Button>
                    </div>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
