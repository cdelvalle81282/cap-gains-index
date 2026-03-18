'use client'

import { useState } from 'react'
import type { BacktestConfig } from '@/lib/backtest'

interface SignalConfigPanelProps {
  initialConfig: BacktestConfig
  onConfigChange: (config: BacktestConfig) => void
}

const cardStyle: React.CSSProperties = {
  backgroundColor: 'var(--bg-card)',
  border: '1px solid var(--dash-border)',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '12px',
}

const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '12px',
}

const labelStyle: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: 600,
  color: 'var(--text-primary)',
}

const sliderRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '8px',
  gap: '12px',
}

const sliderLabelStyle: React.CSSProperties = {
  fontSize: '12px',
  color: 'var(--text-secondary)',
  minWidth: '80px',
}

const sliderValueStyle: React.CSSProperties = {
  fontSize: '12px',
  fontWeight: 600,
  fontFamily: 'var(--font-mono)',
  color: 'var(--text-primary)',
  minWidth: '36px',
  textAlign: 'right' as const,
}

const sliderInputStyle: React.CSSProperties = {
  flex: 1,
  accentColor: '#00d4aa',
  cursor: 'pointer',
}

const toggleStyle = (enabled: boolean): React.CSSProperties => ({
  padding: '4px 10px',
  fontSize: '11px',
  fontWeight: 600,
  borderRadius: '4px',
  border: 'none',
  cursor: 'pointer',
  backgroundColor: enabled ? 'rgba(0,212,170,0.15)' : 'rgba(255,77,106,0.1)',
  color: enabled ? '#00d4aa' : '#ff4d6a',
  transition: 'all 150ms ease',
})

export function SignalConfigPanel({ initialConfig, onConfigChange }: SignalConfigPanelProps) {
  const [config, setConfig] = useState<BacktestConfig>(initialConfig)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  function update(newConfig: BacktestConfig) {
    setConfig(newConfig)
    onConfigChange(newConfig)
    setSaved(false)
  }

  async function handleSave() {
    setSaving(true)
    try {
      await fetch('/api/admin/signals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Custom Config',
          parameters: config,
        }),
      })
      setSaved(true)
    } catch (err) {
      console.error('Failed to save config:', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      {/* RSI Section */}
      <div style={cardStyle}>
        <div style={headerStyle}>
          <span style={labelStyle}>RSI</span>
          <button
            style={toggleStyle(config.rsi.enabled)}
            onClick={() => update({ ...config, rsi: { ...config.rsi, enabled: !config.rsi.enabled } })}
          >
            {config.rsi.enabled ? 'Enabled' : 'Disabled'}
          </button>
        </div>
        {config.rsi.enabled && (
          <div>
            <div style={sliderRowStyle}>
              <span style={sliderLabelStyle}>Period</span>
              <input
                type="range"
                min={5}
                max={30}
                step={1}
                value={config.rsi.period}
                onChange={(e) => update({ ...config, rsi: { ...config.rsi, period: Number(e.target.value) } })}
                style={sliderInputStyle}
              />
              <span style={sliderValueStyle}>{config.rsi.period}</span>
            </div>
            <div style={sliderRowStyle}>
              <span style={sliderLabelStyle}>Oversold</span>
              <input
                type="range"
                min={10}
                max={40}
                step={1}
                value={config.rsi.oversold}
                onChange={(e) => update({ ...config, rsi: { ...config.rsi, oversold: Number(e.target.value) } })}
                style={sliderInputStyle}
              />
              <span style={sliderValueStyle}>{config.rsi.oversold}</span>
            </div>
            <div style={sliderRowStyle}>
              <span style={sliderLabelStyle}>Overbought</span>
              <input
                type="range"
                min={60}
                max={90}
                step={1}
                value={config.rsi.overbought}
                onChange={(e) => update({ ...config, rsi: { ...config.rsi, overbought: Number(e.target.value) } })}
                style={sliderInputStyle}
              />
              <span style={sliderValueStyle}>{config.rsi.overbought}</span>
            </div>
            <div style={sliderRowStyle}>
              <span style={sliderLabelStyle}>Weight</span>
              <input
                type="range"
                min={0}
                max={2}
                step={0.1}
                value={config.rsi.weight}
                onChange={(e) => update({ ...config, rsi: { ...config.rsi, weight: Number(e.target.value) } })}
                style={sliderInputStyle}
              />
              <span style={sliderValueStyle}>{config.rsi.weight.toFixed(1)}</span>
            </div>
          </div>
        )}
      </div>

      {/* MA Crossover Section */}
      <div style={cardStyle}>
        <div style={headerStyle}>
          <span style={labelStyle}>MA Crossover</span>
          <button
            style={toggleStyle(config.ma.enabled)}
            onClick={() => update({ ...config, ma: { ...config.ma, enabled: !config.ma.enabled } })}
          >
            {config.ma.enabled ? 'Enabled' : 'Disabled'}
          </button>
        </div>
        {config.ma.enabled && (
          <div>
            <div style={sliderRowStyle}>
              <span style={sliderLabelStyle}>Fast Period</span>
              <input
                type="range"
                min={5}
                max={50}
                step={1}
                value={config.ma.fast}
                onChange={(e) => update({ ...config, ma: { ...config.ma, fast: Number(e.target.value) } })}
                style={sliderInputStyle}
              />
              <span style={sliderValueStyle}>{config.ma.fast}</span>
            </div>
            <div style={sliderRowStyle}>
              <span style={sliderLabelStyle}>Slow Period</span>
              <input
                type="range"
                min={20}
                max={200}
                step={1}
                value={config.ma.slow}
                onChange={(e) => update({ ...config, ma: { ...config.ma, slow: Number(e.target.value) } })}
                style={sliderInputStyle}
              />
              <span style={sliderValueStyle}>{config.ma.slow}</span>
            </div>
            <div style={sliderRowStyle}>
              <span style={sliderLabelStyle}>Weight</span>
              <input
                type="range"
                min={0}
                max={2}
                step={0.1}
                value={config.ma.weight}
                onChange={(e) => update({ ...config, ma: { ...config.ma, weight: Number(e.target.value) } })}
                style={sliderInputStyle}
              />
              <span style={sliderValueStyle}>{config.ma.weight.toFixed(1)}</span>
            </div>
          </div>
        )}
      </div>

      {/* MACD Section */}
      <div style={cardStyle}>
        <div style={headerStyle}>
          <span style={labelStyle}>MACD</span>
          <button
            style={toggleStyle(config.macd.enabled)}
            onClick={() => update({ ...config, macd: { ...config.macd, enabled: !config.macd.enabled } })}
          >
            {config.macd.enabled ? 'Enabled' : 'Disabled'}
          </button>
        </div>
        {config.macd.enabled && (
          <div>
            <div style={sliderRowStyle}>
              <span style={sliderLabelStyle}>Fast</span>
              <input
                type="range"
                min={5}
                max={20}
                step={1}
                value={config.macd.fast}
                onChange={(e) => update({ ...config, macd: { ...config.macd, fast: Number(e.target.value) } })}
                style={sliderInputStyle}
              />
              <span style={sliderValueStyle}>{config.macd.fast}</span>
            </div>
            <div style={sliderRowStyle}>
              <span style={sliderLabelStyle}>Slow</span>
              <input
                type="range"
                min={15}
                max={40}
                step={1}
                value={config.macd.slow}
                onChange={(e) => update({ ...config, macd: { ...config.macd, slow: Number(e.target.value) } })}
                style={sliderInputStyle}
              />
              <span style={sliderValueStyle}>{config.macd.slow}</span>
            </div>
            <div style={sliderRowStyle}>
              <span style={sliderLabelStyle}>Signal</span>
              <input
                type="range"
                min={5}
                max={15}
                step={1}
                value={config.macd.signal}
                onChange={(e) => update({ ...config, macd: { ...config.macd, signal: Number(e.target.value) } })}
                style={sliderInputStyle}
              />
              <span style={sliderValueStyle}>{config.macd.signal}</span>
            </div>
            <div style={sliderRowStyle}>
              <span style={sliderLabelStyle}>Weight</span>
              <input
                type="range"
                min={0}
                max={2}
                step={0.1}
                value={config.macd.weight}
                onChange={(e) => update({ ...config, macd: { ...config.macd, weight: Number(e.target.value) } })}
                style={sliderInputStyle}
              />
              <span style={sliderValueStyle}>{config.macd.weight.toFixed(1)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Volume Spike Section */}
      <div style={cardStyle}>
        <div style={headerStyle}>
          <span style={labelStyle}>Volume Spike</span>
          <button
            style={toggleStyle(config.volumeSpike.enabled)}
            onClick={() => update({ ...config, volumeSpike: { ...config.volumeSpike, enabled: !config.volumeSpike.enabled } })}
          >
            {config.volumeSpike.enabled ? 'Enabled' : 'Disabled'}
          </button>
        </div>
        {config.volumeSpike.enabled && (
          <div>
            <div style={sliderRowStyle}>
              <span style={sliderLabelStyle}>Threshold</span>
              <input
                type="range"
                min={1}
                max={5}
                step={0.1}
                value={config.volumeSpike.threshold}
                onChange={(e) => update({ ...config, volumeSpike: { ...config.volumeSpike, threshold: Number(e.target.value) } })}
                style={sliderInputStyle}
              />
              <span style={sliderValueStyle}>{config.volumeSpike.threshold.toFixed(1)}x</span>
            </div>
            <div style={sliderRowStyle}>
              <span style={sliderLabelStyle}>Weight</span>
              <input
                type="range"
                min={0}
                max={2}
                step={0.1}
                value={config.volumeSpike.weight}
                onChange={(e) => update({ ...config, volumeSpike: { ...config.volumeSpike, weight: Number(e.target.value) } })}
                style={sliderInputStyle}
              />
              <span style={sliderValueStyle}>{config.volumeSpike.weight.toFixed(1)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saving}
        style={{
          width: '100%',
          padding: '10px 16px',
          fontSize: '14px',
          fontWeight: 600,
          color: '#ffffff',
          backgroundColor: saving ? 'rgba(0,212,170,0.4)' : '#00d4aa',
          border: 'none',
          borderRadius: '8px',
          cursor: saving ? 'not-allowed' : 'pointer',
          transition: 'all 150ms ease',
        }}
      >
        {saving ? 'Saving...' : saved ? 'Saved' : 'Save Configuration'}
      </button>
    </div>
  )
}
