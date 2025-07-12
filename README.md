# June BNPL - Buy Now Pay Later on Chiliz Chain

<div align="center">
  <h3>🏆 Chiliz Chain Hackathon Project</h3>
  <p><strong>Buy Fan Tokens, event tickets and more now—pay at your pace and earn yield as you repay!</strong></p>

</div>

## 🌟 Overview

June BNPL is a revolutionary Buy Now Pay Later platform built specifically for the Chiliz blockchain ecosystem. It enables users to purchase sports assets, fan tokens, and event tickets with flexible payment options while leveraging yield generation through CHZ staking to reduce final payment amounts.

### ✨ Key Features

- **🔗 Web3 Native**: Built on Chiliz Spicy Testnet with smart contract integration
- **💳 Flexible Payments**: Multiple payment options including CHZ and traditional cards
- **📈 Yield Generation**: Stake CHZ via official staking contract (0x0000000000000000000000000000000000001000) to earn up to 8.3% APY and reduce payment amounts
- **🛡️ Secure Verification**: Multi-layer verification with blockchain analysis, planned KYC, and affordability checks
- **🎫 Sports Focus**: Specialized for fan tokens, event tickets, and sports merchandise
- **📱 User-Friendly**: Intuitive interface with real-time payment tracking

## 🚀 Live Demo

Experience June BNPL in action:
- **Network**: Chiliz Spicy Testnet
- **JuneBNPL Contract**: `0x2C85616cAE23Bd11D7b07F5B3aDd64c8E77796B2`
- **MintableToken Contract**: `0xF8254343793b168Fb25315A400BdAEEA8Ea90A18`  
- **FanX Protocol V2 Router**: `0x94448122c3F4276CDFA8C190249da4C1c736eEab`
- **CHZ Staking Contract**: `0x0000000000000000000000000000000000001000` (official Chiliz staking)

### Yield Generation Features
- 🏦 **Live CHZ Staking**: Real transactions on Spicy Testnet via `/yield` page
- 📊 **Validator Selection**: Choose from validators with different commission rates
- 💰 **Reward Withdrawal**: Withdraw staking rewards to offset BNPL installments
- 🔗 **Transaction Verification**: All transactions verified on http://spicy-explorer.chiliz.com
- 📈 **APY up to 8.3%**: Based on current validator performance
### Demo Features
- ⚡ Skip buttons for KYC and affordability checks (demo mode)
- 💰 Demo CHZ payments (0.1 CHZ for testing)
- 🎯 **Real CHZ staking on Spicy Testnet via Yield page**
- 📊 Interactive payment schedules with yield offset calculations
- 🔗 **Live transaction verification with Spicy Explorer links**
- 🔧 **Stripe & TrueLayer integrations shown in demo mode**

## 🏗️ Architecture

### Frontend Stack
- **React 18** with TypeScript
- **Tailwind CSS** + shadcn/ui components
- **Vite** for build tooling
- **Wouter** for routing
- **React Query** for state management

### Backend Stack
- **Node.js** with Express
- **TypeScript** with ES modules
- **Drizzle ORM** with PostgreSQL
- **RESTful API** design

### Blockchain Integration
- **Ethers.js** for Web3 connectivity
- **MetaMask** wallet support
- **Chiliz Spicy Testnet** deployment
- **Smart contracts** for BNPL logic

### Third-Party Integrations (Demo)
- **Moralis API**: Blockchain data and wallet verification
- **Stripe Identity**: Planned KYC compliance and verification (demo mode)
- **TrueLayer**: Planned open banking for affordability assessments (demo mode)

## 🛠️ Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- MetaMask wallet
- Git

### Quick Start

```bash
# Clone the repository
git clone https://github.com/tatdz/june-chilizBNPLnew.git
cd june-bnpl

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5000`

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/june_bnpl

# Blockchain & APIs
MORALIS_API_KEY=your_moralis_api_key
VITE_STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
TRUELAYER_CLIENT_ID=your_truelayer_client_id

# Optional: Production settings
NODE_ENV=development
```

## 🔧 Configuration

### Wallet Setup
1. Install MetaMask browser extension
2. Add Chiliz Spicy Testnet:
   - **Network Name**: Chiliz Spicy Testnet
   - **RPC URL**: https://spicy-rpc.chiliz.com/
   - **Chain ID**: 88882
   - **Currency**: CHZ
   - **Explorer**: https://spicy-explorer.chiliz.com/

### API Keys Setup

#### Moralis API
1. Visit [Moralis.io](https://moralis.io)
2. Create account and get API key
3. Add to `MORALIS_API_KEY` environment variable

#### Stripe (for Planned KYC Integration)
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. Copy publishable key (starts with `pk_`) → `VITE_STRIPE_PUBLIC_KEY`
3. Copy secret key (starts with `sk_`) → `STRIPE_SECRET_KEY`
4. **Note**: Currently in demo mode - showcases planned integration

#### TrueLayer (for Planned Open Banking Integration)
1. Register at [TrueLayer Console](https://console.truelayer.com/)
2. Get client ID → `TRUELAYER_CLIENT_ID`
3. **Note**: Currently in demo mode - showcases planned integration

## 💡 How It Works

### BNPL Purchase Flow

```mermaid
graph TD
    A[Connect Wallet] --> B[Verify Wallet]
    B --> C[KYC Verification]
    C --> D[Affordability Check]
    D --> E[Select Asset]
    E --> F[Configure Payment Plan]
    F --> G[Down Payment]
    G --> H[Optional: Enable Yield]
    H --> I[Purchase Complete]
    I --> J[Manage Payments]
```

### Verification Requirements
- **Wallet Age**: Minimum 15 days old
- **Transaction History**: At least 5 transactions  
- **KYC**: Planned identity verification via Stripe (demo mode)
- **Affordability**: Planned financial assessment via TrueLayer (demo mode)

### Payment Options
- **CHZ Payments**: Direct blockchain transactions
- **Card Payments**: Traditional payment via Stripe
- **Installments**: Flexible 20, 40, or 60-day terms
- **Yield Staking**: Reduce payments through CHZ staking

## 📚 API Documentation

### Core Endpoints

#### Wallet Verification
```http
POST /api/wallet/verify
Content-Type: application/json

{
  "walletAddress": "0x..."
}
```

#### Assets
```http
GET /api/assets
```

#### Purchases
```http
POST /api/purchases
Content-Type: application/json

{
  "assetId": 1,
  "totalAmount": 100,
  "downPaymentAmount": 20,
  "installmentCount": 3
}
```

### Response Format
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

## 🧪 Testing

### Unit Tests
```bash
npm run test
```

### Integration Tests
```bash
npm run test:integration
```

### E2E Tests
```bash
npm run test:e2e
```

### Manual Testing Scenarios
1. **Wallet Connection**: Test MetaMask integration
2. **Verification Flow**: Complete KYC and affordability checks
3. **Purchase Flow**: Buy asset with installment plan
4. **Payment Processing**: Make scheduled payments
5. **Yield Generation**: Stake CHZ and track earnings

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Replit Deployment
1. Connect your GitHub repository to Replit
2. Configure environment variables in Replit Secrets
3. Click "Deploy" to publish your application

### Docker Deployment
```bash
# Build container
docker build -t june-bnpl .

# Run container
docker run -p 5000:5000 --env-file .env june-bnpl
```

## 🛡️ Security

### Smart Contract Security
- Audited payment logic
- Reentrancy protection
- Access control mechanisms

### Data Protection
- Encrypted user data
- Secure API endpoints
- GDPR compliant data handling

### Best Practices
- Input validation on all endpoints
- Rate limiting on API calls
- Secure environment variable management

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write tests for new features
- Update documentation
- Follow conventional commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏆 Hackathon Submission

### Chiliz Chain Integration
- **Smart Contract**: Custom BNPL logic deployed on Chiliz Spicy Testnet
- **CHZ Staking**: Real yield generation using native CHZ tokens
- **Fan Token Support**: Specialized for sports and entertainment assets

### Innovation Highlights
- First BNPL platform on Chiliz Chain
- Yield-earning mechanism to reduce payment burden
- Comprehensive verification system combining Web3 and traditional finance
- Sports-focused asset marketplace


---

<div align="center">
  <p>Built with ❤️ for the Chiliz Chain Hackathon</p>
  <p><strong>Revolutionizing sports finance, one payment at a time.</strong></p>
</div>
