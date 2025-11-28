# 💎 StakePool - Web3 Staking & Yield Farming Platform

Decentralized staking platform for earning rewards through token locking and liquidity provision.

## ✨ Features

### 🔒 **Staking Pools**
- Multiple pools with different APY rates
- Single-asset and LP token staking
- Flexible lock periods (7, 30, 90, 180 days)
- Auto-compounding options

### 💰 **Rewards System**
- Real-time rewards calculation
- Multiple reward tokens support
- Instant or vested claiming
- Compound interest calculator

### 📊 **Analytics Dashboard**
- Portfolio overview and statistics
- Historical earnings charts
- Pool performance comparison
- TVL and APY tracking
- Impermanent loss calculator

### 🎯 **Advanced Features**
- Delegate staking rights
- Emergency withdrawal
- Pool migration tools
- Governance token integration

## 🏗️ Tech Stack

### Protocol (Backend)
- **Hono** - Fast web framework
- **SQLite** - Local database
- **Math Libraries** - Precise calculations (bignumber.js, decimal.js, mathjs)
- **Auth** - JWT, Passport, bcrypt
- **Validation** - Joi, Validator
- **Testing** - Jest, Supertest
- **Utils** - winston, morgan, uuid, lodash

### App (Frontend)
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Wagmi v3** - Ethereum interactions
- **WalletConnect AppKit** - Wallet connection
- **Charts** - Recharts, Chart.js, D3, Victory, Nivo
- **Forms** - React Hook Form, Zod, Yup, Formik
- **State** - Redux, Zustand, Jotai, Recoil
- **UI** - Material-UI, Chakra UI, Mantine
- **Tables** - TanStack Table
- **Date** - date-fns, dayjs, luxon, moment
- **Math** - bignumber.js, decimal.js, mathjs
- **Testing** - Jest, Vitest, Playwright, Cypress
- **Utils** - lodash, ramda, axios, ky

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MetaMask or compatible wallet

### Installation

```bash
# Install protocol dependencies
cd protocol
npm install

# Install app dependencies
cd ../app
npm install
```

### Development

```bash
# Start protocol server (port 3000)
cd protocol
npm run dev

# Start app (port 5173)
cd app
npm run dev
```

## 📁 Project Structure

```
stakepool/
├── protocol/          # Backend staking logic
│   ├── src/
│   │   ├── pools/     # Pool management
│   │   ├── rewards/   # Rewards calculation
│   │   ├── staking/   # Staking operations
│   │   └── index.js   # Server entry
│   └── package.json
│
├── app/              # Frontend application
│   ├── src/
│   │   ├── modules/  # Feature modules
│   │   ├── hooks/    # Custom React hooks
│   │   ├── utils/    # Utilities
│   │   └── App.tsx   # Main component
│   └── package.json
│
└── README.md
```

## 🤖 Automated Updates

Dependabot configured for daily dependency updates at 7:00 AM (Warsaw timezone).

## 📄 License

MIT

