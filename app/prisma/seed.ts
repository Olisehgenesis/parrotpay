import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.paymentLink.upsert({
    where: { slug: 'demo-payments' },
    create: {
      slug: 'demo-payments',
      title: 'Checkout Demo',
      amount: '10.00',
      currency: 'USD',
      recipientAddress: '0x53eaF4CD171842d8144e45211308e5D90B4b0088',
      type: 'ONE_TIME',
      memo: 'parrot-pay-demo',
      active: true,
    },
    update: {
      recipientAddress: '0x53eaF4CD171842d8144e45211308e5D90B4b0088',
      title: 'Checkout Demo',
      amount: '10.00',
    },
  })
  console.log('Seeded demo-payments payment link')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
