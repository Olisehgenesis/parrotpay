# Gasless Setup for Parrot Pay

This app uses **gasless transactions** so users never need native tokens for gas. Two systems work together:

1. **Tempo Fee Sponsor** – Covers gas for token transfers (AlphaUSD, etc.) via `https://sponsor.moderato.tempo.xyz`
2. **Privy Gas Sponsorship** – Covers gas for embedded wallet creation and Privy operations

## Error: "Your gas balance isn't enough to cover the network gas fee"

This usually means **Privy gas sponsorship** is not enabled for your app. Follow the steps below.

---

## 1. Enable Privy Gas Sponsorship (Required)

1. Go to [Privy Dashboard](https://dashboard.privy.io/apps?page=gas_sponsorship)
2. Open the **Gas Sponsorship** tab
3. **Enable** gas sponsorship for your app
4. Add **Tempo Testnet** to the list of supported chains
5. Enable **"Allow transactions from the client"** if you want client-side sponsored transactions

> **Note:** Privy's native gas sponsorship requires **TEE execution**. If prompted, request TEE migration in the [Privy Dashboard → Wallets → Advanced](https://dashboard.privy.io/apps?tab=advanced&page=wallets) tab.

---

## 2. Tempo Fee Sponsor (Already Configured)

The app uses Tempo's public testnet fee sponsor at `https://sponsor.moderato.tempo.xyz` for:

- Token transfers (AlphaUSD, BetaUSD, etc.)
- All payment flows (home demo, pay page, checkout widget)

No extra setup needed – it's built into the app.

---

## 3. What's Already Done in Code

- `useGaslessTransfer` hook – All token transfers use `feePayer: true`
- Wagmi config – Transport uses `withFeePayer` for chain operations
- Privy config – Embedded wallets created for email users (`createOnLogin: 'users-without-wallets'`)
- Better error messages – Gas-related errors point to this guide

---

## Troubleshooting

| Error | Fix |
|-------|-----|
| "Your gas balance isn't enough" | Enable Privy gas sponsorship (step 1) |
| "Fail to create" | Often from wallet creation; enable Privy gas sponsorship |
| "Transaction was cancelled" | User rejected the wallet prompt; they can try again |
| "No wallet found" | User must connect with Privy (wallet or email) |

---

## References

- [Privy Gas Sponsorship Setup](https://docs.privy.io/wallets/gas-and-asset-management/gas/setup)
- [Tempo Sponsor User Fees](https://docs.tempo.xyz/guide/payments/sponsor-user-fees)
