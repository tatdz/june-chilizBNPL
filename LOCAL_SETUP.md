# Local Development Setup

This guide ensures the June BNPL app runs identically on your local machine as it does on Replit.

## Prerequisites

- Node.js 18+ 
- npm or yarn
- MetaMask wallet extension

## Quick Start

```bash
# Clone the repository
git clone https://github.com/tatdz/june-chilizBNPLnew.git
cd june-chilizBNPLnew

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5000`

## Key Configuration Files

### 1. Package.json Scripts
- `npm run dev` - Starts development server
- `npm run build` - Builds for production
- `npm run start` - Runs production build

### 2. Required Assets
- `client/public/psg-jersey.avif` - Custom PSG jersey image
- `client/public/jersey.svg` - Fallback jersey SVG

### 3. Environment Variables (Optional)
Create `.env` file in root directory:

```env
# Database (defaults to in-memory storage)
DATABASE_URL=postgresql://username:password@localhost:5432/june_bnpl

# APIs (all work in demo mode without keys)
MORALIS_API_KEY=your_moralis_api_key
VITE_STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
TRUELAYER_CLIENT_ID=your_truelayer_client_id
```

## Features That Work Identically

### ✅ Full Functionality (Same on Replit & Local)
- Real CHZ staking on Chiliz Spicy Testnet
- Wallet connection with MetaMask
- Real blockchain transactions via ethers.js
- FanX Protocol V2 Router integration
- BNPL createPurchase smart contract calls
- Transaction verification on Chiliz Spicy Explorer
- Custom PSG jersey image display
- All navigation and UI components

### ✅ Demo Mode Features
- KYC verification simulation (Stripe sandbox)
- Affordability check simulation (TrueLayer sandbox)
- Skip buttons for demo flow
- In-memory storage for development

## Network Configuration

### Chiliz Spicy Testnet
- **Network Name**: Chiliz Spicy Testnet
- **RPC URL**: https://spicy-rpc.chiliz.com/
- **Chain ID**: 88882
- **Currency**: CHZ
- **Explorer**: https://spicy-explorer.chiliz.com/

### Smart Contracts
- **JuneBNPL**: `0x2C85616cAE23Bd11D7b07F5B3aDd64c8E77796B2`
- **MintableToken**: `0xF8254343793b168Fb25315A400BdAEEA8Ea90A18`
- **FanX Protocol V2 Router**: `0x94448122c3F4276CDFA8C190249da4C1c736eEab`
- **CHZ Staking**: `0x0000000000000000000000000000000000001000`

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Or use different port
PORT=3000 npm run dev
```

### Image Not Loading
Ensure `client/public/psg-jersey.avif` exists:
```bash
ls -la client/public/psg-jersey.avif
```

### Wallet Connection Issues
1. Ensure MetaMask is installed
2. Switch to Chiliz Spicy Testnet
3. Have sufficient CHZ balance for gas fees

## File Structure
```
├── client/           # React frontend
│   ├── public/       # Static assets
│   └── src/          # Source code
├── server/           # Express backend
├── shared/           # Shared types/schemas
└── package.json      # Dependencies and scripts
```

## Production Build
```bash
npm run build
npm run start
```

This creates a production-optimized build in `dist/` directory.