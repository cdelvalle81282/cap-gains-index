import { prisma } from '@/lib/db'
import { DEFAULT_BACKTEST_CONFIG } from '@/lib/backtest'
import type { BacktestConfig } from '@/lib/backtest'
import { SignalsPageClient } from '@/components/admin/signals-page-client'

export const dynamic = 'force-dynamic'

export default async function SignalsPage() {
  let initialConfig: BacktestConfig = DEFAULT_BACKTEST_CONFIG

  try {
    const activeConfig = await prisma.signalConfig.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    })

    if (activeConfig) {
      initialConfig = JSON.parse(activeConfig.parameters) as BacktestConfig
    }
  } catch {
    // Use default config if DB query fails
  }

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1
          style={{
            fontSize: '24px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: '4px',
          }}
        >
          Signal Configuration
        </h1>
        <p
          style={{
            fontSize: '14px',
            color: 'var(--text-secondary)',
          }}
        >
          Configure technical indicator parameters and backtest strategies against historical data.
        </p>
      </div>

      <SignalsPageClient initialConfig={initialConfig} />
    </div>
  )
}
