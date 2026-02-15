'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePrivy } from '@privy-io/react-auth'
import { usePrivyWallet } from '@/app/hooks/use-privy-wallet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Copy, Check, Wallet, Plus, X } from 'lucide-react'
import { AppHeader } from '@/app/components/app-header'
import { CURRENCIES } from '@/lib/currencies'

export type CustomFieldType = 'text' | 'date' | 'select' | 'image'

export type CustomField = {
  id: string
  name: string
  type: CustomFieldType
  value?: string
  options?: string[]
}

export default function CreatePaymentLinkPage() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const { login, authenticated } = usePrivy()
  const { address } = usePrivyWallet()

  const [linkName, setLinkName] = useState('')
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState('usd')
  const [recurrent, setRecurrent] = useState(false)
  const [collectName, setCollectName] = useState(true)
  const [collectEmail, setCollectEmail] = useState(true)
  const [collectPhone, setCollectPhone] = useState(false)
  const [meal, setMeal] = useState('')
  const [phone, setPhone] = useState('')
  const [redirectUrl, setRedirectUrl] = useState('')
  const [customFields, setCustomFields] = useState<CustomField[]>([])
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [newField, setNewField] = useState<Partial<CustomField>>({ type: 'text', name: '', value: '', options: [] })
  const [newOption, setNewOption] = useState('')
  const [creating, setCreating] = useState(false)
  const [createdLink, setCreatedLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addCustomField = () => {
    const name = (newField.name || '').trim().toLowerCase().replace(/\s+/g, '_')
    if (!name) return
    if (customFields.some((f) => f.name === name)) return
    setCustomFields((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name,
        type: (newField.type || 'text') as CustomFieldType,
        value: newField.value?.trim() || undefined,
        options: newField.type === 'select' && newField.options?.length ? newField.options : undefined,
      },
    ])
    setNewField({ type: 'text', name: '', value: '', options: [] })
    setNewOption('')
    setAddModalOpen(false)
  }

  const removeCustomField = (id: string) => {
    setCustomFields((prev) => prev.filter((f) => f.id !== id))
  }

  const addOption = () => {
    const opt = newOption.trim()
    if (!opt || (newField.options || []).includes(opt)) return
    setNewField((prev) => ({ ...prev, options: [...(prev.options || []), opt] }))
    setNewOption('')
  }

  const removeOption = (opt: string) => {
    setNewField((prev) => ({ ...prev, options: (prev.options || []).filter((o) => o !== opt) }))
  }

  const handleCreate = async () => {
    const recipient = address
    if (!recipient) return
    if (!amount) return
    setCreating(true)
    setError(null)
    try {
      const metadata: Record<string, unknown> = {}
      if (meal) metadata.meal = meal
      if (phone) metadata.phone = phone
      if (redirectUrl.trim()) metadata._redirectUrl = redirectUrl.trim()
      if (customFields.length > 0) {
        metadata._customFields = customFields.map((f) => ({
          name: f.name,
          type: f.type,
          value: f.value,
          options: f.options,
        }))
        customFields.forEach((f) => {
          if (f.value) (metadata as Record<string, string>)[f.name] = f.value
        })
      }

      const res = await fetch('/api/payment-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: linkName || undefined,
          amount,
          currency,
          recipientAddress: recipient,
          creatorAddress: recipient,
          type: recurrent ? 'SUBSCRIPTION' : 'ONE_TIME',
          collectCustomerInfo: { name: collectName, email: collectEmail, phone: collectPhone },
          meal: meal || undefined,
          phone: phone || undefined,
          metadata: Object.keys(metadata).length ? metadata : undefined,
        }),
      })
      const data = await res.json()
      if (data.slug) {
        setCreatedLink(`${typeof window !== 'undefined' ? window.location.origin : ''}/pay/${data.slug}`)
      } else if (data.error) {
        setError(data.error)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create link')
    } finally {
      setCreating(false)
    }
  }

  const copyLink = async () => {
    if (!createdLink) return
    await navigator.clipboard.writeText(createdLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!mounted) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f6f9fc]">
        <AppHeader authenticated={false} showNavLinks={false} />
        <main className="flex-1 py-24 text-center">
          <p className="text-[#6b7c93]">Loading...</p>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f6f9fc]">
      <AppHeader authenticated={authenticated} onLogin={login} showNavLinks />

      <main className="flex-1 py-10 px-6">
        <div className="max-w-[480px] mx-auto">
          <h2 className="text-xl font-semibold text-[#32325d] mb-6">Create payment link</h2>

          <Card className="border-[#e6e9ec] shadow-sm">
            <CardHeader>
              <CardTitle>New payment link</CardTitle>
              <CardDescription>Share the link for customers to pay you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!authenticated ? (
                <div className="border border-dashed border-[#e6e9ec] bg-[#fafbfc] p-6 text-center">
                  <Wallet className="mx-auto h-10 w-10 text-[#6b7c93] mb-3" />
                  <p className="text-sm font-medium text-[#32325d] mb-2">Connect your wallet to create payment links</p>
                  <Button onClick={login} size="lg" className="bg-[#635bff] hover:bg-[#5851ea]">
                    Connect wallet
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-[#6b7c93]">Connected — your wallet will receive payments from this link.</p>
              )}

              <div className="space-y-2">
                <Label htmlFor="linkName">Link name</Label>
                <Input
                  id="linkName"
                  placeholder="e.g. Lunch order"
                  value={linkName}
                  onChange={(e) => setLinkName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <div className="flex gap-2">
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="e.g. 10"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="flex-1"
                  />
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((c) => (
                        <SelectItem key={c.code} value={c.code}>
                          {c.symbol} {c.code.toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-xs text-muted-foreground">Amount stored in USD. Displayed in selected currency.</p>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="recurrent" checked={recurrent} onCheckedChange={(c) => setRecurrent(!!c)} />
                <Label htmlFor="recurrent" className="cursor-pointer font-normal">Recurrent (subscription)</Label>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Collect from customer (Stripe-style)</Label>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="collectName" checked={collectName} onCheckedChange={(c) => setCollectName(!!c)} />
                    <Label htmlFor="collectName" className="cursor-pointer font-normal">Full name</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="collectEmail" checked={collectEmail} onCheckedChange={(c) => setCollectEmail(!!c)} />
                    <Label htmlFor="collectEmail" className="cursor-pointer font-normal">Email</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="collectPhone" checked={collectPhone} onCheckedChange={(c) => setCollectPhone(!!c)} />
                    <Label htmlFor="collectPhone" className="cursor-pointer font-normal">Phone number</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="redirectUrl">Success redirect URL <span className="text-muted-foreground font-normal">(optional)</span></Label>
                <Input
                  id="redirectUrl"
                  type="url"
                  placeholder="https://yoursite.com/thank-you or /thank-you"
                  value={redirectUrl}
                  onChange={(e) => setRedirectUrl(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Where to send the customer after successful payment. Leave empty to show success on this page.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="meal">Order notes <span className="text-muted-foreground font-normal">(optional)</span></Label>
                <Input
                  id="meal"
                  placeholder="e.g. Lunch order, Table 5"
                  value={meal}
                  onChange={(e) => setMeal(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Contact phone <span className="text-muted-foreground font-normal">(optional)</span></Label>
                <Input
                  id="phone"
                  placeholder="e.g. +1234567890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Custom fields <span className="text-muted-foreground font-normal">(optional)</span></Label>
                <div className="flex flex-wrap gap-2 items-center">
                  {customFields.map((f) => (
                    <Badge key={f.id} variant="secondary" className="gap-1 pl-2 pr-1 py-1">
                      <span className="text-xs">
                        {f.name}
                        {f.type !== 'text' && (
                          <span className="text-muted-foreground ml-1">({f.type})</span>
                        )}
                        {f.value && `: ${f.value}`}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeCustomField(f.id)}
                        className="p-0.5 hover:bg-muted"
                        aria-label="Remove"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setAddModalOpen(true)}
                    className="h-8"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add field
                  </Button>
                </div>
              </div>

              {addModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setAddModalOpen(false)}>
                  <div
                    className="max-w-md w-full border bg-background p-6 shadow-lg"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    addCustomField()
                  }}
                  className="space-y-4"
                >
                  <h3 className="font-semibold text-lg">Add custom field</h3>
                  <div className="space-y-2">
                    <Label>Field type</Label>
                    <Select
                      value={newField.type || 'text'}
                      onValueChange={(v) => setNewField((p) => ({ ...p, type: v as CustomFieldType }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="date">Date</SelectItem>
                        <SelectItem value="select">Select (dropdown)</SelectItem>
                        <SelectItem value="image">Image (URL)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newFieldName">Field name</Label>
                    <Input
                      id="newFieldName"
                      placeholder="e.g. delivery_date"
                      value={newField.name || ''}
                      onChange={(e) => setNewField((p) => ({ ...p, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newFieldValue">Default value <span className="text-muted-foreground font-normal">(optional)</span></Label>
                    {newField.type === 'date' ? (
                      <Input
                        id="newFieldValue"
                        type="date"
                        value={newField.value || ''}
                        onChange={(e) => setNewField((p) => ({ ...p, value: e.target.value }))}
                      />
                    ) : (
                      <Input
                        id="newFieldValue"
                        type={newField.type === 'image' ? 'url' : 'text'}
                        placeholder={newField.type === 'image' ? 'https://...' : 'e.g. Leave at door'}
                        value={newField.value || ''}
                        onChange={(e) => setNewField((p) => ({ ...p, value: e.target.value }))}
                      />
                    )}
                  </div>
                  {newField.type === 'select' && (
                    <div className="space-y-2">
                      <Label>Options</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add option"
                          value={newOption}
                          onChange={(e) => setNewOption(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addOption())}
                        />
                        <Button type="button" variant="secondary" onClick={addOption}>
                          Add
                        </Button>
                      </div>
                      {(newField.options || []).length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {(newField.options || []).map((opt) => (
                            <Badge key={opt} variant="outline" className="gap-1">
                              {opt}
                              <button type="button" onClick={() => removeOption(opt)} className="p-0.5 hover:bg-muted">
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  <div className="flex gap-2 justify-end pt-2">
                    <Button type="button" variant="outline" onClick={() => setAddModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={!newField.name?.trim()}>
                      Add field
                    </Button>
                  </div>
                </form>
                  </div>
                </div>
              )}

              <Button
                onClick={handleCreate}
                disabled={!address || !amount || creating}
                className="w-full bg-[#635bff] hover:bg-[#5851ea]"
              >
                {creating ? 'Creating...' : 'Create payment link'}
              </Button>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              {createdLink && (
                <Card className="border border-[#e6e9ec] bg-[#fafbfc]">
                  <CardContent className="pt-4">
                    <p className="text-sm text-muted-foreground mb-2">Your link:</p>
                    <div className="flex items-center gap-2">
                      <a
                        href={createdLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#635bff] text-sm break-all hover:underline flex-1 min-w-0"
                      >
                        {createdLink}
                      </a>
                      <Button variant="outline" size="icon" onClick={copyLink} className="shrink-0">
                        {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">Share this link for customers to pay</p>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
