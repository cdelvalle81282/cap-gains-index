import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { DEFAULT_BACKTEST_CONFIG } from '@/lib/backtest'

// GET: Return the active signal config, or default if none exists
export async function GET() {
  const config = await prisma.signalConfig.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
  })

  if (config) {
    return NextResponse.json({
      id: config.id,
      name: config.name,
      parameters: JSON.parse(config.parameters),
      isActive: config.isActive,
    })
  }

  return NextResponse.json({
    id: null,
    name: 'Default',
    parameters: DEFAULT_BACKTEST_CONFIG,
    isActive: false,
  })
}

// PUT: Save or update signal config
export async function PUT(request: Request) {
  const body = await request.json()
  const { name, parameters } = body

  // Deactivate all existing configs
  await prisma.signalConfig.updateMany({
    where: { isActive: true },
    data: { isActive: false },
  })

  // Create new active config
  const config = await prisma.signalConfig.create({
    data: {
      name: name || 'Custom Config',
      parameters: JSON.stringify(parameters),
      isActive: true,
    },
  })

  return NextResponse.json(config)
}
