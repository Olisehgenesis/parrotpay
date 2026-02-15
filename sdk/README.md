# @parrotpay/sdk

Add Tempo payments to any React site in one line. Built for **Tempo Testnet**.

## Install

```bash
npm install @parrotpay/sdk
# or
pnpm add @parrotpay/sdk
```

## Usage

```tsx
import { CheckoutWidget, ALPHA_USD } from '@parrotpay/sdk'
import '@parrotpay/sdk/dist/index.css'

// In your component:
<CheckoutWidget
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  merchantId="your-merchant-id"
  recipient="0x..." // recipient wallet address
  amount="10"
  token={ALPHA_USD}
  memo="order-123"
  connectWallet={login}
  sendPayment={sendPayment}
  isConnected={!!address}
  isSending={isSending}
/>
```

## Peer dependencies

- `react` >= 18
- `react-dom` >= 18

## License

MIT
