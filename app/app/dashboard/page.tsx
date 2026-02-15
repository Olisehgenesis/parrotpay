'use client'

import { usePrivy } from '@privy-io/react-auth'
import { usePrivyWallet } from '@/app/hooks/use-privy-wallet'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { DisplayAmount } from '@/app/components/display-amount'
import { formatPaymentAmount } from '@/lib/format-payment-amount'
import { AppHeader } from '@/app/components/app-header'

type Payment = {
  id: string
  amount: string
  txHash: string | null
  fromAddress: string
  toAddress: string
  status: string
  customerName?: string | null
  customerEmail?: string | null
  customerPhone?: string | null
  createdAt: string
}

type PaymentLink = {
  id: string
  slug: string
  title: string | null
  amount: string
  currency: string
  type: string
  active: boolean
  createdAt: string
}

function DashboardContent() {
  const { authenticated, login } = usePrivy()
  const { address } = usePrivyWallet()
  const [sent, setSent] = useState<Payment[]>([])
  const [received, setReceived] = useState<Payment[]>([])
  const [links, setLinks] = useState<PaymentLink[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!address) {
      setLoading(false)
      return
    }
    const addr = address.toLowerCase()
    Promise.all([
      fetch(`/api/payments/sent?address=${addr}`).then((r) => r.json()),
      fetch(`/api/payments/received?address=${addr}`).then((r) => r.json()),
      fetch(`/api/payment-links?address=${addr}`).then((r) => r.json()),
    ])
      .then(([s, r, l]) => {
        setSent(Array.isArray(s) ? s : [])
        setReceived(Array.isArray(r) ? r : [])
        setLinks(Array.isArray(l) ? l : [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [address])

  if (!authenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f6f9fc]">
        <AppHeader authenticated={false} onLogin={login} showNavLinks={false} />
        <main className="flex-1 py-24 px-6 text-center">
          <h2 className="text-2xl font-semibold text-[#32325d] mb-2">Connect your wallet to view your dashboard</h2>
          <p className="text-[#6b7c93] mb-8">See payments you&apos;ve sent and received</p>
          <Button onClick={login} className="bg-[#635bff] hover:bg-[#5851ea]">Connect wallet</Button>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f6f9fc]">
      <AppHeader authenticated={authenticated} onLogin={login} showNavLinks />

      <main className="flex-1 py-8 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-xl font-semibold text-[#32325d] mb-6">Dashboard</h1>
          <Tabs defaultValue="paid" className="space-y-6">
            <TabsList className="inline-flex h-10 border border-[#e6e9ec] bg-white p-1">
              <TabsTrigger value="paid" className="data-[state=active]:bg-[#635bff] data-[state=active]:text-white data-[state=active]:shadow-sm">Received</TabsTrigger>
              <TabsTrigger value="pay" className="data-[state=active]:bg-[#635bff] data-[state=active]:text-white data-[state=active]:shadow-sm">Sent</TabsTrigger>
              <TabsTrigger value="links" className="data-[state=active]:bg-[#635bff] data-[state=active]:text-white data-[state=active]:shadow-sm">Payment links</TabsTrigger>
            </TabsList>

            <TabsContent value="links" className="space-y-4 mt-6">
              <Card className="border-[#e6e9ec] shadow-sm">
                <CardHeader>
                  <CardTitle>Your payment links</CardTitle>
                  <CardDescription>Links you created for receiving payments</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <p className="text-muted-foreground">Loading...</p>
                  ) : links.length === 0 ? (
                    <p className="text-muted-foreground">No payment links yet. Create one from the create page.</p>
                  ) : (
                    <div className="space-y-3">
                      {links.map((l) => (
                        <Card key={l.id} className="flex flex-row items-center justify-between p-4">
                          <div>
                            <p className="font-medium">{l.title || 'Payment link'}</p>
                            <p className="text-sm text-muted-foreground">
                              <DisplayAmount usdAmount={l.amount} currency={l.currency || 'usd'} />
                            </p>
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <a href={`/pay/${l.slug}`} target="_blank" rel="noopener noreferrer">
                              /pay/{l.slug}
                            </a>
                          </Button>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="paid" className="space-y-4 mt-6">
              <Card className="border-[#e6e9ec] shadow-sm">
                <CardHeader>
                  <CardTitle>Received</CardTitle>
                  <CardDescription>Payments you received</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <p className="text-muted-foreground">Loading...</p>
                  ) : received.length === 0 ? (
                    <p className="text-muted-foreground">No payments yet.</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Amount</TableHead>
                          <TableHead>From</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {received.map((p) => (
                          <TableRow key={p.id}>
                            <TableCell>${formatPaymentAmount(p.amount)} USD</TableCell>
                            <TableCell className="font-mono text-sm">{p.fromAddress?.slice(0, 8)}...</TableCell>
                            <TableCell className="text-sm">
                              {(p.customerName || p.customerEmail || p.customerPhone) ? (
                                <span>
                                  {p.customerName && <span>{p.customerName}</span>}
                                  {p.customerEmail && <span className="block text-muted-foreground">{p.customerEmail}</span>}
                                  {p.customerPhone && <span className="block text-muted-foreground">{p.customerPhone}</span>}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant={p.status === 'COMPLETED' ? 'default' : 'secondary'}>
                                {p.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{new Date(p.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell>
                              {p.txHash && (
                                <Button variant="link" size="sm" asChild>
                                  <a href={`https://explore.tempo.xyz/tx/${p.txHash}`} target="_blank" rel="noopener noreferrer">
                                    View
                                  </a>
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pay" className="space-y-4 mt-6">
              <Card className="border-[#e6e9ec] shadow-sm">
                <CardHeader>
                  <CardTitle>Sent</CardTitle>
                  <CardDescription>Payments you sent</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <p className="text-muted-foreground">Loading...</p>
                  ) : sent.length === 0 ? (
                    <p className="text-muted-foreground">No payments yet.</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Amount</TableHead>
                          <TableHead>To</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sent.map((p) => (
                          <TableRow key={p.id}>
                            <TableCell>${formatPaymentAmount(p.amount)} USD</TableCell>
                            <TableCell className="font-mono text-sm">{p.toAddress?.slice(0, 8)}...</TableCell>
                            <TableCell>
                              <Badge variant={p.status === 'COMPLETED' ? 'default' : 'secondary'}>
                                {p.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{new Date(p.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell>
                              {p.txHash && (
                                <Button variant="link" size="sm" asChild>
                                  <a href={`https://explore.tempo.xyz/tx/${p.txHash}`} target="_blank" rel="noopener noreferrer">
                                    View
                                  </a>
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

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

  return <DashboardContent />
}
