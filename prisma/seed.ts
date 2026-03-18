import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client.js'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || 'file:./dev.db',
})
const prisma = new PrismaClient({ adapter })

const sectors = [
  {
    name: 'Defense, Drones & Defense AI',
    slug: 'defense',
    description: 'Defense contractors, drone manufacturers, and defense AI companies',
    color: '#4d7cff',
  },
  {
    name: 'Energy',
    slug: 'energy',
    description: 'Traditional energy, nuclear, renewables, and energy infrastructure',
    color: '#f59e0b',
  },
  {
    name: 'Commodities',
    slug: 'commodities',
    description: 'Mining, rare earths, lithium, gold, and raw materials',
    color: '#00d4aa',
  },
  {
    name: 'Crypto & Finance',
    slug: 'crypto-finance',
    description: 'Cryptocurrency-related companies and financial services',
    color: '#a855f7',
  },
  {
    name: 'AI Tech / Networking / Semis',
    slug: 'ai-tech-semis',
    description: 'Semiconductors, AI technology, networking, and tech infrastructure',
    color: '#06b6d4',
  },
  {
    name: 'Broad Market ETFs',
    slug: 'broad-etfs',
    description: 'Politically-themed and broad market exchange-traded funds',
    color: '#8b8da3',
  },
]

// Defense, Drones & Defense AI - 21 stocks
const defenseStocks = [
  { ticker: 'AISP', name: 'Airship Holdings' },
  { ticker: 'RCAT', name: 'Red Cat Holdings' },
  { ticker: 'RTX', name: 'Raytheon' },
  { ticker: 'RFL', name: 'Rafael Advanced Defense Systems' },
  { ticker: 'AVAV', name: 'AeroVironment' },
  { ticker: 'KTOS', name: 'Kratos Defense & Security Solutions' },
  { ticker: 'LHX', name: 'L3Harris Technologies' },
  { ticker: 'BAE', name: 'BAE Systems' },
  { ticker: 'ITA', name: 'iShares US Aerospace & Defense ETF' },
  { ticker: 'POWW', name: 'AMMO Inc' },
  { ticker: 'CMTL', name: 'Comtech Telecommunications' },
  { ticker: 'BBAI', name: 'BigBear.ai' },
  { ticker: 'KAMN', name: 'Kaman Corporation' },
  { ticker: 'VVX', name: 'V2X Inc' },
  { ticker: 'MRCY', name: 'Mercury Systems' },
  { ticker: 'ESLT', name: 'Elbit Systems' },
  { ticker: 'NOC', name: 'Northrop Grumman' },
  { ticker: 'TDY', name: 'Teledyne Technologies' },
  { ticker: 'UMAC', name: 'Unusual Machines' },
  { ticker: 'KBR', name: 'KBR Inc' },
  { ticker: 'GEO', name: 'GEO Group' },
]

// Energy - 40 stocks
const energyStocks = [
  { ticker: 'NXE', name: 'NexGen Energy' },
  { ticker: 'NNE', name: 'Nano Nuclear Energy' },
  { ticker: 'LEU', name: 'Centrus Energy' },
  { ticker: 'EE', name: 'Excelerate Energy' },
  { ticker: 'NFE', name: 'New Fortress Energy' },
  { ticker: 'BWXT', name: 'BWX Technologies' },
  { ticker: 'CEG', name: 'Constellation Energy' },
  { ticker: 'EXC', name: 'Exelon Corporation' },
  { ticker: 'SMR', name: 'NuScale Power' },
  { ticker: 'XOM', name: 'ExxonMobil' },
  { ticker: 'SHEL', name: 'Shell PLC' },
  { ticker: 'APA', name: 'APA Corporation' },
  { ticker: 'GLNG', name: 'Golar LNG' },
  { ticker: 'YPF', name: 'YPF SA' },
  { ticker: 'EQT', name: 'EQT Corporation' },
  { ticker: 'SWN', name: 'Southwestern Energy' },
  { ticker: 'BTU', name: 'Peabody Energy' },
  { ticker: 'ARCH', name: 'Arch Resources' },
  { ticker: 'ARLP', name: 'Alliance Resource Partners' },
  { ticker: 'AEP', name: 'American Electric Power' },
  { ticker: 'CEIX', name: 'CONSOL Energy' },
  { ticker: 'FRO', name: 'Frontline PLC' },
  { ticker: 'GNRC', name: 'Generac Holdings' },
  { ticker: 'EQNR', name: 'Equinor ASA' },
  { ticker: 'BEP', name: 'Brookfield Renewable Partners' },
  { ticker: 'ENPH', name: 'Enphase Energy' },
  { ticker: 'FSLR', name: 'First Solar' },
  { ticker: 'SEDG', name: 'SolarEdge Technologies' },
  { ticker: 'AMRC', name: 'Ameresco' },
  { ticker: 'TAN', name: 'Invesco Solar ETF' },
  { ticker: 'NOG', name: 'Northern Oil and Gas' },
  { ticker: 'FLR', name: 'Fluor Corporation' },
  { ticker: 'CCJ', name: 'Cameco Corporation' },
  { ticker: 'TXNM', name: 'TXNM Energy' },
  { ticker: 'CVE', name: 'Cenovus Energy' },
  { ticker: 'UUUU', name: 'Energy Fuels' },
  { ticker: 'HAL', name: 'Halliburton' },
  { ticker: 'BP', name: 'BP PLC' },
  { ticker: 'BE', name: 'Bloom Energy' },
  { ticker: 'NXT', name: 'Nextracker' },
]

// Commodities - 17 stocks
const commoditiesStocks = [
  { ticker: 'RIO', name: 'Rio Tinto' },
  { ticker: 'ALB', name: 'Albemarle Corporation' },
  { ticker: 'MP', name: 'MP Materials' },
  { ticker: 'LYSCF', name: 'Lynas Rare Earths' },
  { ticker: 'NEM', name: 'Newmont Mining' },
  { ticker: 'LAC', name: 'Lithium Americas' },
  { ticker: 'ALTM', name: 'Arcadium Lithium' },
  { ticker: 'PLL', name: 'Piedmont Lithium' },
  { ticker: 'GLD', name: 'SPDR Gold Trust' },
  { ticker: 'USAR', name: 'USA Rare Earth' },
  { ticker: 'AREC', name: 'American Resources Corp' },
  { ticker: 'THM', name: 'International Tower Hill Mines' },
  { ticker: 'SA', name: 'Seabridge Gold' },
  { ticker: 'PPTA', name: 'Perpetua Resources' },
  { ticker: 'FCX', name: 'Freeport-McMoRan' },
  { ticker: 'VALE', name: 'Vale SA' },
  { ticker: 'CAT', name: 'Caterpillar' },
]

// Crypto & Finance - 8 stocks
const cryptoStocks = [
  { ticker: 'MSTR', name: 'MicroStrategy' },
  { ticker: 'HOOD', name: 'Robinhood Markets' },
  { ticker: 'XYZ', name: 'Block Inc' },
  { ticker: 'BAC', name: 'Bank of America' },
  { ticker: 'BITO', name: 'ProShares Bitcoin Strategy ETF' },
  { ticker: 'GBTC', name: 'Grayscale Bitcoin Trust' },
  { ticker: 'SOFI', name: 'SoFi Technologies' },
  { ticker: 'CB', name: 'Chubb Limited' },
]

// AI Tech / Networking / Semis - 18 stocks
const aiTechStocks = [
  { ticker: 'TXN', name: 'Texas Instruments' },
  { ticker: 'TSM', name: 'Taiwan Semiconductor' },
  { ticker: 'AMD', name: 'Advanced Micro Devices' },
  { ticker: 'ADI', name: 'Analog Devices' },
  { ticker: 'AVGO', name: 'Broadcom' },
  { ticker: 'MCHP', name: 'Microchip Technology' },
  { ticker: 'NVDA', name: 'NVIDIA' },
  { ticker: 'SMH', name: 'VanEck Semiconductor ETF' },
  { ticker: 'UBER', name: 'Uber Technologies' },
  { ticker: 'LYFT', name: 'Lyft Inc' },
  { ticker: 'CSCO', name: 'Cisco Systems' },
  { ticker: 'ANET', name: 'Arista Networks' },
  { ticker: 'IBM', name: 'IBM' },
  { ticker: 'PLTR', name: 'Palantir Technologies' },
  { ticker: 'TSLA', name: 'Tesla' },
  { ticker: 'FTNT', name: 'Fortinet' },
  { ticker: 'ASML', name: 'ASML Holding' },
  { ticker: 'QS', name: 'QuantumScape' },
]

// Broad Market ETFs - 3 stocks
const broadEtfStocks = [
  { ticker: 'MAGA', name: 'Point Bridge America First ETF' },
  { ticker: 'YALL', name: 'God Bless America ETF' },
  { ticker: 'DEMZ', name: 'Democratic Large Cap Core ETF' },
]

const stocksBySector: Record<string, { ticker: string; name: string }[]> = {
  defense: defenseStocks,
  energy: energyStocks,
  commodities: commoditiesStocks,
  'crypto-finance': cryptoStocks,
  'ai-tech-semis': aiTechStocks,
  'broad-etfs': broadEtfStocks,
}

async function main() {
  console.log('Seeding database...')

  // Verify stock counts before seeding
  const totalStocks =
    defenseStocks.length +
    energyStocks.length +
    commoditiesStocks.length +
    cryptoStocks.length +
    aiTechStocks.length +
    broadEtfStocks.length

  console.log(`Defense: ${defenseStocks.length}`)
  console.log(`Energy: ${energyStocks.length}`)
  console.log(`Commodities: ${commoditiesStocks.length}`)
  console.log(`Crypto & Finance: ${cryptoStocks.length}`)
  console.log(`AI Tech / Networking / Semis: ${aiTechStocks.length}`)
  console.log(`Broad Market ETFs: ${broadEtfStocks.length}`)
  console.log(`Total: ${totalStocks}`)

  if (totalStocks !== 107) {
    throw new Error(`Expected 107 stocks, got ${totalStocks}`)
  }

  await prisma.$transaction(async (tx) => {
    // Delete all existing data in reverse dependency order
    await tx.backtestResult.deleteMany()
    await tx.signalConfig.deleteMany()
    await tx.priceCache.deleteMany()
    await tx.stock.deleteMany()
    await tx.sector.deleteMany()

    // Create sectors
    const createdSectors: Record<string, string> = {}
    for (const sector of sectors) {
      const created = await tx.sector.create({
        data: sector,
      })
      createdSectors[sector.slug] = created.id
    }

    console.log(`Created ${Object.keys(createdSectors).length} sectors`)

    // Create all stocks
    let stockCount = 0
    for (const [sectorSlug, stocks] of Object.entries(stocksBySector)) {
      const sectorId = createdSectors[sectorSlug]
      if (!sectorId) {
        throw new Error(`Sector not found: ${sectorSlug}`)
      }

      for (const stock of stocks) {
        await tx.stock.create({
          data: {
            ticker: stock.ticker,
            name: stock.name,
            sectorId,
          },
        })
        stockCount++
      }
    }

    console.log(`Created ${stockCount} stocks`)
  })

  console.log('Seeding complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
