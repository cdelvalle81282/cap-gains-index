'use client'

import { useState } from 'react'
import { SignalConfigPanel } from './signal-config-panel'
import { BacktestRunner } from './backtest-runner'
import type { BacktestConfig } from '@/lib/backtest'

interface SignalsPageClientProps {
  initialConfig: BacktestConfig
}

export function SignalsPageClient({ initialConfig }: SignalsPageClientProps) {
  const [config, setConfig] = useState<BacktestConfig>(initialConfig)

  return (
    <div className="signals-layout">
      {/* Left column: Signal Configuration */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h2
          style={{
            fontSize: '14px',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: '12px',
          }}
        >
          Indicator Settings
        </h2>
        <SignalConfigPanel initialConfig={initialConfig} onConfigChange={setConfig} />
      </div>

      {/* Right column: Backtest Runner */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h2
          style={{
            fontSize: '14px',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: '12px',
          }}
        >
          Backtest
        </h2>
        <BacktestRunner config={config} />
      </div>
    </div>
  )
}
