import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { 
  BookOpen, 
  Users, 
  ArrowRight, 
  Building, 
  Code, 
  Shield, 
  ScrollText, 
  TrendingUp, 
  CreditCard, 
  Store, 
  Target, 
  AlertTriangle,
  ExternalLink,
  CheckCircle,
  DollarSign,
  Calendar,
  AlertCircle
} from "lucide-react";
import Header from "@/components/header";
import Footer from "@/components/footer";

export default function Documentation() {
  const [activeSection, setActiveSection] = useState("mission");

  const sections = [
    { id: "mission", label: "Mission", icon: Target },
    { id: "benefits", label: "Benefits for Users", icon: Users },
    { id: "user-flow", label: "User Flow", icon: ArrowRight },
    { id: "merchant-onboarding", label: "Merchant Onboarding", icon: Building },
    { id: "tech-stack", label: "Tech Stack", icon: Code },
    { id: "kyc-credit", label: "KYC & Credit History", icon: Shield },
    { id: "smart-contract", label: "Smart Contract", icon: ScrollText },
    { id: "yield-generation", label: "Yield Generation", icon: TrendingUp },
    { id: "user-fees", label: "Fees & Conditions for Users", icon: CreditCard },
    { id: "merchant-conditions", label: "Conditions for Merchants", icon: Store },
    { id: "product-strategy", label: "Product Strategy", icon: Target },
    { id: "troubleshooting", label: "Troubleshooting", icon: AlertTriangle },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "mission":
        return (
          <div>
            <h2 className="text-3xl font-bold mb-6">Mission</h2>
            <Card>
              <CardContent className="pt-6">
                <p className="text-lg text-slate-700 leading-relaxed">
                  June's mission is to democratize access to exclusive sports assets, fan tokens, and digital goods 
                  by providing flexible, transparent, and on-chain Buy Now, Pay Later solutions specifically designed 
                  for the Socios and Chiliz ecosystem.
                </p>
                <Separator className="my-6" />
                <p className="text-slate-600">
                  We believe that financial flexibility should not be a barrier to participating in the sports 
                  economy. By leveraging blockchain technology and yield generation, we make premium assets 
                  accessible while maintaining full transparency and user control.
                </p>
              </CardContent>
            </Card>
          </div>
        );

      case "benefits":
        return (
          <div>
            <h2 className="text-3xl font-bold mb-6">Benefits for Users</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    Flexible Payments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600">
                    Pay just 25% upfront and spread the remaining cost over 60 days with manageable installments.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-600" />
                    On-Chain Transparency
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600">
                    All transactions and agreements are recorded on Chiliz Chain, ensuring complete transparency.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                    Yield Generation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600">
                    Stake CHZ to generate yield that automatically reduces your final payment amount.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-orange-600" />
                    Exclusive Access
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600">
                    Access to premium sports assets, fan tokens, and exclusive merchandise with flexible terms.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case "user-flow":
        return (
          <div>
            <h2 className="text-3xl font-bold mb-6">User Flow</h2>
            
            <Alert className="mb-6">
              <CheckCircle className="w-4 h-4" />
              <AlertDescription>
                <strong>Prerequisites:</strong> Socios or MetaMask wallet, minimum 5 transactions, wallet age 15+ days
              </AlertDescription>
            </Alert>

            <div className="space-y-6">
              {[
                { step: 1, title: "Connect Wallet", description: "Connect your Socios or MetaMask wallet to the platform" },
                { step: 2, title: "Wallet Verification", description: "Automatic verification of transaction history and wallet age via Moralis API" },
                { step: 3, title: "KYC Verification", description: "Identity verification through Stripe Identity (sandbox mode)" },
                { step: 4, title: "Affordability Check", description: "Financial assessment via TrueLayer Open Banking (sandbox mode)" },
                { step: 5, title: "Select Asset", description: "Browse and select from available sports assets and fan tokens" },
                { step: 6, title: "Configure BNPL", description: "Review payment terms and optionally enable yield generation" },
                { step: 7, title: "Pay Down Payment", description: "Pay the 25% down payment to initiate the purchase" },
                { step: 8, title: "Pay Installments", description: "Make scheduled payments over the 60-day period" },
                { step: 9, title: "Asset Release", description: "Receive your digital asset upon completion of payments" }
              ].map((item) => (
                <Card key={item.step}>
                  <CardContent className="flex items-center gap-4 pt-6">
                    <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-semibold">
                      {item.step}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{item.title}</h3>
                      <p className="text-slate-600 text-sm">{item.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case "tech-stack":
        return (
          <div>
            <h2 className="text-3xl font-bold mb-6">Tech Stack</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Blockchain</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li>• Chiliz Spicy Testnet</li>
                    <li>• Solidity Smart Contracts</li>
                    <li>• ethers.js Integration</li>
                    <li>• MetaMask & Socios Wallets</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Frontend</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li>• React with TypeScript</li>
                    <li>• Tailwind CSS</li>
                    <li>• shadcn/ui Components</li>
                    <li>• Vite Build Tool</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Backend & APIs</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li>• Node.js with Express</li>
                    <li>• Moralis API (Blockchain Data)</li>
                    <li>• Stripe Identity (KYC)</li>
                    <li>• TrueLayer (Open Banking)</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case "kyc-credit":
        return (
          <div>
            <h2 className="text-3xl font-bold mb-6">KYC & Credit History</h2>
            
            <Alert className="mb-6">
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>
                <strong>Demo Mode:</strong> Stripe Identity and TrueLayer APIs are simulated until production keys are purchased. 
                Demo buttons are available to skip verification steps for demonstration purposes.
              </AlertDescription>
            </Alert>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Stripe Identity Integration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 mb-4">
                    <strong>Demo Integration:</strong> KYC verification will be integrated with Stripe Identity's verification system:
                  </p>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li>• Document verification (ID, passport, driver's license)</li>
                    <li>• Selfie verification for identity matching</li>
                    <li>• Real-time verification status updates</li>
                    <li>• Compliance with global KYC requirements</li>
                  </ul>
                  <a 
                    href="https://stripe.com/docs/identity" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm flex items-center gap-1 mt-4"
                  >
                    View Stripe Identity Documentation <ExternalLink className="w-3 h-3" />
                  </a>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    TrueLayer Open Banking
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 mb-4">
                    <strong>Demo Integration:</strong> Affordability assessment will use secure bank account analysis:
                  </p>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li>• Secure bank account connection</li>
                    <li>• Income and expense analysis</li>
                    <li>• Credit score assessment</li>
                    <li>• Recommended spending limits</li>
                  </ul>
                  <a 
                    href="https://truelayer.com/docs" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm flex items-center gap-1 mt-4"
                  >
                    View TrueLayer Documentation <ExternalLink className="w-3 h-3" />
                  </a>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case "smart-contract":
        return (
          <div>
            <h2 className="text-3xl font-bold mb-6">Smart Contract</h2>
            
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Contract Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600">Contract Address:</label>
                    <div className="space-y-2 mt-1">
                      <div>
                        <p className="text-sm font-medium text-slate-700">JuneBNPL Contract:</p>
                        <code className="block bg-slate-100 p-2 rounded text-sm font-mono">
                          0x2C85616cAE23Bd11D7b07F5B3aDd64c8E77796B2
                        </code>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700">MintableToken Contract:</p>
                        <code className="block bg-slate-100 p-2 rounded text-sm font-mono">
                          0xF8254343793b168Fb25315A400BdAEEA8Ea90A18
                        </code>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700">FanX Protocol V2 Router:</p>
                        <code className="block bg-slate-100 p-2 rounded text-sm font-mono">
                          0x94448122c3F4276CDFA8C190249da4C1c736eEab
                        </code>
                        <p className="text-xs text-slate-500 mt-1">
                          <em>Note: The previous contracts are no longer used. All liquidity operations now route through the official FanX Protocol V2 Router.</em>
                        </p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Network:</label>
                    <p className="mt-1">Chiliz Spicy Testnet</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">ABI Location:</label>
                    <p className="mt-1">Available in <code>client/src/lib/web3.ts</code></p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contract Functionality</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-slate-600">
                  <li>• <strong>Purchase Creation:</strong> Create BNPL agreements with payment schedules</li>
                  <li>• <strong>Payment Processing:</strong> Handle installment payments and tracking</li>
                  <li>• <strong>Asset Management:</strong> Manage digital asset transfers upon completion</li>
                  <li>• <strong>Yield Integration:</strong> CHZ staking and yield calculation</li>
                  <li>• <strong>Security:</strong> Multi-signature validation and access controls</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        );

      case "troubleshooting":
        return (
          <div>
            <h2 className="text-3xl font-bold mb-6">Troubleshooting</h2>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-red-600">Sandbox KYC Failures</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 mb-2"><strong>Issue:</strong> "User doesn't exist" errors during KYC</p>
                  <p className="text-slate-600 mb-4"><strong>Cause:</strong> Stripe Identity sandbox limitation</p>
                  <div className="bg-green-50 border border-green-200 rounded p-4">
                    <p className="text-green-800 text-sm">
                      <strong>Solution:</strong> This is expected behavior in sandbox mode. The integration works correctly - 
                      it's simulating the verification process for demo purposes.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-red-600">TrueLayer Connection Issues</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 mb-2"><strong>Issue:</strong> "User not found" during affordability check</p>
                  <p className="text-slate-600 mb-4"><strong>Cause:</strong> TrueLayer sandbox environment limitation</p>
                  <div className="bg-green-50 border border-green-200 rounded p-4">
                    <p className="text-green-800 text-sm">
                      <strong>Solution:</strong> Expected sandbox behavior. The system falls back to simulated 
                      affordability data for demonstration purposes.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-red-600">Wallet Not Eligible</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 mb-2"><strong>Issue:</strong> Wallet doesn't meet eligibility requirements</p>
                  <p className="text-slate-600 mb-4"><strong>Requirements:</strong> Minimum 5 transactions, 15+ days old</p>
                  <div className="bg-blue-50 border border-blue-200 rounded p-4">
                    <p className="text-blue-800 text-sm">
                      <strong>Solution:</strong> Use a wallet with sufficient transaction history or use the testnet 
                      faucet to create transaction history: https://spicy-faucet.chiliz.com/
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case "merchant-onboarding":
        return (
          <div>
            <h2 className="text-3xl font-bold mb-6">Merchant Onboarding</h2>
            <p className="text-lg text-slate-700 mb-6">
              June's merchant onboarding is designed to be secure, efficient, and compliant with industry standards. 
              Here's how merchants can join and start offering BNPL:
            </p>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="w-5 h-5 text-blue-600" />
                    1. Application Submission
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-slate-600">
                    <li>• Complete a digital application via the June merchant portal</li>
                    <li>• Provide business details (legal entity, registration number, country, contact info)</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-600" />
                    2. Compliance & Risk Review
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-slate-600">
                    <li>• June verifies business legitimacy and ownership</li>
                    <li>• AML (Anti-Money Laundering) and KYC (Know Your Customer) checks are performed</li>
                    <li>• Merchants agree to June's terms of service and compliance standards</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="w-5 h-5 text-purple-600" />
                    3. Integration & Testing
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-slate-600">
                    <li>• Approved merchants receive access to the June merchant dashboard</li>
                    <li>• Technical support is provided for integrating June's BNPL API or checkout widget</li>
                    <li>• Test transactions are conducted to ensure seamless operation</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                    4. Go Live & Support
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-slate-600">
                    <li>• Merchants can start offering BNPL to customers</li>
                    <li>• Ongoing support and training are available</li>
                  </ul>
                  <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <p className="text-emerald-800 text-sm font-medium">
                      This streamlined onboarding helps merchants quickly unlock new customers and boost sales with June's DeFi-powered BNPL.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case "user-fees":
        return (
          <div>
            <h2 className="text-3xl font-bold mb-6">Fees & Conditions for Users</h2>
            <p className="text-lg text-slate-700 mb-6">
              June's BNPL is transparent and user-friendly. Here's what users can expect:
            </p>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    Down Payment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600">
                    Pay an initial down payment (typically 25% of the purchase price) at checkout, using either 
                    fiat (via Stripe) or CHZ from your wallet.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-purple-600" />
                    Installments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600">
                    The remaining amount is split into equal installments over a fixed schedule (e.g., 3 payments over 60 days). 
                    Payment reminders and due dates are clearly communicated.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    Yield Generation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600">
                    Users can enable yield by staking CHZ during repayment. Earned yield can offset the final installment, 
                    reducing your total cost.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                    Late Fees
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600">
                    Late payments may incur a fixed fee or percentage penalty, always disclosed in advance.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-600" />
                    Eligibility Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-slate-600">
                    <li>• Must be 18+ and legally able to contract</li>
                    <li>• Pass KYC (Stripe Identity) and affordability checks (TrueLayer)</li>
                    <li>• Use a supported wallet (Socios or MetaMask) with at least 5 transactions and 15+ days history</li>
                  </ul>
                </CardContent>
              </Card>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 font-medium">
                  All fees and repayment conditions are disclosed before purchase. There are no hidden fees or interest for on-time payments.
                </p>
              </div>
            </div>
          </div>
        );

      case "merchant-conditions":
        return (
          <div>
            <h2 className="text-3xl font-bold mb-6">Conditions for Merchants</h2>
            <p className="text-lg text-slate-700 mb-6">
              Merchants benefit from June's BNPL by increasing conversion and order value, while accepting the following conditions:
            </p>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    Merchant Fees
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600">
                    Merchants pay a transaction fee to June for each BNPL purchase, typically ranging from 3% to 6% of the order value, 
                    depending on volume and agreement. This is in line with industry standards (e.g., Klarna).
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    Payout Timing
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600">
                    Merchants receive the full order value (minus fees) within 24–48 hours of purchase, supporting healthy cash flow.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="w-5 h-5 text-purple-600" />
                    Integration Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600">
                    Merchants must integrate June's BNPL checkout or API. Technical support is provided during the integration process.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-orange-600" />
                    Compliance & Support
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-slate-600">
                    <li>• Merchants must comply with AML/KYC regulations and June's terms of service</li>
                    <li>• Provide accurate product info, timely fulfillment, and support for BNPL customers</li>
                    <li>• June mediates payment disputes or chargebacks per industry best practices</li>
                  </ul>
                </CardContent>
              </Card>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 font-medium">
                  June's merchant program is designed for growth, transparency, and minimal operational overhead.
                </p>
              </div>
            </div>
          </div>
        );

      case "product-strategy":
        return (
          <div>
            <h2 className="text-3xl font-bold mb-6">Product Strategy</h2>
            <p className="text-lg text-slate-700 mb-6">
              June's strategy is to set the standard for transparent, flexible, and DeFi-powered BNPL:
            </p>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    User-Centric BNPL
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600">
                    Seamless, on-chain BNPL with instant eligibility, flexible repayments, and optional yield generation.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Store className="w-5 h-5 text-green-600" />
                    Merchant Empowerment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600">
                    Fast onboarding, transparent fees (3%–6%), and rapid payouts to help merchants grow.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                    DeFi Integration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600">
                    Leverage Chiliz Chain and staking to enable yield on repayments—users can "pay as they earn."
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-orange-600" />
                    Growth Roadmap
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-slate-600">
                    <li>• Launch with digital goods, Fan Tokens, NFTs, and event tickets</li>
                    <li>• Expand to travel, hospitality, and more</li>
                    <li>• Introduce loyalty and rewards for responsible repayment</li>
                    <li>• Enable real-time merchant search and deal discovery</li>
                    <li>• Continuously improve KYC/affordability flows as APIs mature</li>
                  </ul>
                </CardContent>
              </Card>

              <div className="bg-gradient-to-r from-primary/10 to-purple-50 border border-primary/20 rounded-lg p-6">
                <h3 className="font-semibold text-slate-900 mb-2">Vision</h3>
                <p className="text-slate-700">
                  June aims to redefine BNPL for the web3 era, making flexible payments accessible and rewarding for all.
                </p>
              </div>
            </div>
          </div>
        );

      case "yield-generation":
        return (
          <div>
            <h2 className="text-3xl font-bold mb-6">Yield Generation</h2>
            <p className="text-lg text-slate-700 mb-6">
              June's innovative yield generation feature allows users to stake CHZ and earn returns that reduce their final payment amount.
            </p>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    How It Works
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-slate-600">
                    <li>• Stake CHZ tokens during your BNPL repayment period</li>
                    <li>• Earn up to 8.3%* APY through Chiliz Chain staking</li>
                    <li>• Yield automatically reduces your final payment amount</li>
                    <li>• Optional feature - you choose whether to enable yield generation</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                    Yield Calculation Example
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span>Purchase Amount:</span>
                        <span className="font-semibold">€400</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Down Payment (25%):</span>
                        <span>€100</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Remaining Balance:</span>
                        <span>€300</span>
                      </div>
                      <div className="flex justify-between">
                        <span>CHZ Staked:</span>
                        <span>500 CHZ</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Yield Earned (60 days):</span>
                        <span className="text-green-600 font-semibold">~€15</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between font-semibold">
                        <span>Final Payment:</span>
                        <span className="text-green-600">€285 (€15 savings)</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-purple-600" />
                    Security & Transparency
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-slate-600">
                    <li>• All staking transactions are recorded on Chiliz Chain</li>
                    <li>• Smart contracts ensure automatic yield distribution</li>
                    <li>• You maintain control of your staked CHZ tokens</li>
                    <li>• Real-time yield tracking in your dashboard</li>
                  </ul>
                </CardContent>
              </Card>

              <Alert className="bg-blue-50 border-blue-200">
                <AlertCircle className="w-4 h-4 text-blue-600" />
                <AlertDescription className="text-blue-700">
                  <strong>Note:</strong> *APY rates are variable and based on current Chiliz Chain staking rewards. 
                  Rates may fluctuate based on network conditions. For current rates, see{" "}
                  <a 
                    href="https://docs.chiliz.com/staking" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="underline hover:no-underline"
                  >
                    Chiliz documentation
                  </a>.
                </AlertDescription>
              </Alert>

              <Alert className="bg-amber-50 border-amber-200">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <AlertDescription className="text-amber-700">
                  <strong>Asset Release:</strong> Digital asset transfer (marked with *) applies to NFTs and Fan Tokens only. 
                  Physical items like jerseys and event tickets are shipped after down payment using standard fulfillment processes.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        );

      default:
        return (
          <div>
            <h2 className="text-3xl font-bold mb-6">Coming Soon</h2>
            <Card>
              <CardContent className="pt-6">
                <p className="text-slate-600">This section is currently being developed.</p>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <section className="text-center py-8 mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Documentation
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Complete guide to June BNPL platform, integrations, and technical specifications.
          </p>
        </section>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Navigation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <nav className="space-y-2">
                  {sections.map((section) => {
                    const Icon = section.icon;
                    return (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full text-left p-2 rounded-lg text-sm flex items-center gap-2 transition-colors ${
                          activeSection === section.id
                            ? "bg-primary text-white"
                            : "hover:bg-slate-100 text-slate-700"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {section.label}
                      </button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {renderContent()}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}