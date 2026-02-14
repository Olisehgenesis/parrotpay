import React, { useState } from 'react'
import './styles.css'

export interface CollectCustomerInfo {
  name?: boolean
  email?: boolean
  phone?: boolean
}

export interface ParrotPayConfig {
  merchantId: string
  recipient: `0x${string}`
  amount: string
  token?: `0x${string}`
  memo?: string
  /** Optional: meal, phone, or other custom fields (set in SDK) */
  metadata?: Record<string, string>
  /** Stripe-style: collect full name, email, phone from customer */
  collectCustomerInfo?: CollectCustomerInfo
  onSuccess?: (txHash: string) => void
  onClose?: () => void
}

export interface CheckoutWidgetProps extends ParrotPayConfig {
  isOpen: boolean
  onClose: () => void
  connectWallet: () => void
  sendPayment: (config: {
    to: `0x${string}`
    amount: bigint
    token: `0x${string}`
    memo?: string
    customerName?: string
    customerEmail?: string
    customerPhone?: string
  }) => Promise<string>
  isConnected: boolean
  isSending: boolean
}

export function CheckoutWidget({
  isOpen,
  onClose,
  merchantId,
  recipient,
  amount,
  token = '0x20c0000000000000000000000000000000000001' as `0x${string}`,
  memo,
  metadata,
  collectCustomerInfo,
  onSuccess,
  connectWallet,
  sendPayment,
  isConnected,
  isSending,
}: CheckoutWidgetProps) {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')

  if (!isOpen) return null

  const collect = collectCustomerInfo || {}
  const needsName = !!collect.name
  const needsEmail = !!collect.email
  const needsPhone = !!collect.phone

  const handlePay = async () => {
    if (!isConnected) {
      connectWallet()
      return
    }

    if (needsName && !customerName.trim()) {
      setError('Please enter your full name')
      return
    }
    if (needsEmail && !customerEmail.trim()) {
      setError('Please enter your email')
      return
    }
    if (needsPhone && !customerPhone.trim()) {
      setError('Please enter your phone number')
      return
    }

    setError(null)
    try {
      const amountWei = BigInt(Math.floor(parseFloat(amount) * 1e6))
      const txHash = await sendPayment({
        to: recipient,
        amount: amountWei,
        token,
        memo,
        customerName: needsName ? customerName.trim() : undefined,
        customerEmail: needsEmail ? customerEmail.trim() : undefined,
        customerPhone: needsPhone ? customerPhone.trim() : undefined,
      })
      setSuccess(true)
      setTimeout(() => {
        onSuccess?.(txHash)
        onClose()
      }, 1200)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed')
    }
  }

  return (
    <div className="parrot-pay-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="parrot-pay-modal" onClick={(e) => e.stopPropagation()}>
        <div className="parrot-pay-header" style={{ position: 'relative' }}>
          <button className="parrot-pay-close" onClick={onClose} aria-label="Close">
            ×
          </button>
          <h3>Parrot Pay</h3>
          <p>Tempo Testnet • Secure payment</p>
        </div>
        <div className="parrot-pay-body">
          <div className="parrot-pay-amount">
            {amount} <span>AlphaUSD</span>
          </div>
          {metadata && Object.keys(metadata).length > 0 && (
            <div style={{ marginBottom: 16, fontSize: 13, color: 'var(--parrot-text-secondary)' }}>
              {metadata.meal && <p style={{ margin: '0 0 4px' }}>Meal: {metadata.meal}</p>}
              {metadata.phone && <p style={{ margin: '0 0 4px' }}>Phone: {metadata.phone}</p>}
              {Object.entries(metadata)
                .filter(([k]) => !['meal', 'phone'].includes(k))
                .map(([k, v]) => {
                  const isImageUrl = typeof v === 'string' && /^https?:\/\//.test(v) && /\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(v)
                  return (
                    <div key={k} style={{ margin: '0 0 8px' }}>
                      {isImageUrl ? (
                        <div>
                          <p style={{ margin: '0 0 4px' }}>{k}:</p>
                          <img src={v} alt={k} style={{ maxWidth: '100%', maxHeight: 120, borderRadius: 8 }} />
                        </div>
                      ) : (
                        <p style={{ margin: '0 0 4px' }}>{k}: {v}</p>
                      )}
                    </div>
                  )
                })}
            </div>
          )}
          {(needsName || needsEmail || needsPhone) && (
            <div style={{ marginBottom: 16 }}>
              {(needsName && (
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontSize: 12, marginBottom: 4, color: 'var(--parrot-text-secondary)' }}>Full name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: '1px solid var(--parrot-border, #e5e7eb)',
                      fontSize: 14,
                    }}
                  />
                </div>
              ))}
              {(needsEmail && (
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontSize: 12, marginBottom: 4, color: 'var(--parrot-text-secondary)' }}>Email</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: '1px solid var(--parrot-border, #e5e7eb)',
                      fontSize: 14,
                    }}
                  />
                </div>
              ))}
              {(needsPhone && (
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontSize: 12, marginBottom: 4, color: 'var(--parrot-text-secondary)' }}>Phone number</label>
                  <input
                    type="tel"
                    placeholder="+1234567890"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: '1px solid var(--parrot-border, #e5e7eb)',
                      fontSize: 14,
                    }}
                  />
                </div>
              ))}
            </div>
          )}
          <p style={{ color: 'var(--parrot-text-secondary)', fontSize: 13, marginBottom: 20 }}>
            Pay to: {recipient.slice(0, 6)}...{recipient.slice(-4)}
          </p>
          <button
            className={`parrot-pay-btn ${!isConnected ? 'parrot-pay-connect' : ''} ${isSending ? 'parrot-pay-loading' : ''} ${success ? 'parrot-pay-success' : ''}`}
            onClick={handlePay}
            disabled={isSending || success}
          >
            {success ? (
              <>
                <span className="parrot-pay-tick">✓</span>
                Payment successful!
              </>
            ) : isSending ? (
              <>
                <span className="parrot-pay-spinner" />
                Processing...
              </>
            ) : !isConnected ? (
              'Connect Wallet'
            ) : (
              'Pay with Tempo'
            )}
          </button>
          {error && <p className="parrot-pay-error">{error}</p>}
        </div>
      </div>
    </div>
  )
}
