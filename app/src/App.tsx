import { useState, useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import BigNumber from 'bignumber.js'
import { format } from 'date-fns'
import axios from 'axios'

const queryClient = new QueryClient()

interface Pool {
  id: number
  name: string
  token: string
  apy: number
  tvl: string
  min_stake: string
  lock_period: number
}

function PoolCard({ pool }: { pool: Pool }) {
  const tvlFormatted = new BigNumber(pool.tvl).toFormat(2)
  const minStakeFormatted = new BigNumber(pool.min_stake).toFormat(4)
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800">{pool.name}</h3>
          <p className="text-sm text-gray-500">{pool.token}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-purple-600">{pool.apy}%</div>
          <div className="text-xs text-gray-500">APY</div>
        </div>
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">TVL:</span>
          <span className="font-semibold">${tvlFormatted}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Min Stake:</span>
          <span className="font-semibold">{minStakeFormatted} {pool.token}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Lock Period:</span>
          <span className="font-semibold">
            {pool.lock_period === 0 ? 'Flexible' : `${pool.lock_period} days`}
          </span>
        </div>
      </div>
      
      <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded transition-colors">
        Stake Now
      </button>
    </div>
  )
}

function Dashboard() {
  const [pools, setPools] = useState<Pool[]>([])
  const [loading, setLoading] = useState(true)
  const [totalTVL, setTotalTVL] = useState('0')

  useEffect(() => {
    fetchPools()
  }, [])

  const fetchPools = async () => {
    try {
      const response = await axios.get('http://localhost:3000/pools')
      const poolData = response.data.pools
      setPools(poolData)
      
      // Calculate total TVL
      const total = poolData.reduce((sum: BigNumber, pool: Pool) => {
        return sum.plus(new BigNumber(pool.tvl))
      }, new BigNumber(0))
      
      setTotalTVL(total.toFormat(2))
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch pools:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-xl">Loading pools...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            💎 StakePool
          </h1>
          <p className="text-xl text-white/90 mb-6">
            Earn rewards through secure Web3 staking
          </p>
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 inline-block">
            <div className="text-sm text-white/80 mb-1">Total Value Locked</div>
            <div className="text-3xl font-bold text-white">${totalTVL}</div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 text-center">
            <div className="text-4xl mb-2">🔒</div>
            <div className="text-2xl font-bold text-white">{pools.length}</div>
            <div className="text-white/80">Active Pools</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 text-center">
            <div className="text-4xl mb-2">💰</div>
            <div className="text-2xl font-bold text-white">5-25%</div>
            <div className="text-white/80">APY Range</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 text-center">
            <div className="text-4xl mb-2">⚡</div>
            <div className="text-2xl font-bold text-white">Instant</div>
            <div className="text-white/80">Rewards</div>
          </div>
        </div>

        {/* Pools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pools.map((pool) => (
            <PoolCard key={pool.id} pool={pool} />
          ))}
        </div>

        {/* Features */}
        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold text-white mb-8">Why StakePool?</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="font-bold text-white mb-2">Real-time Analytics</h3>
              <p className="text-white/80 text-sm">Track your earnings with live charts</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
              <div className="text-3xl mb-3">🛡️</div>
              <h3 className="font-bold text-white mb-2">Secure & Audited</h3>
              <p className="text-white/80 text-sm">Smart contracts verified by experts</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
              <div className="text-3xl mb-3">⚙️</div>
              <h3 className="font-bold text-white mb-2">Auto-compound</h3>
              <p className="text-white/80 text-sm">Maximize returns automatically</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
              <div className="text-3xl mb-3">🌐</div>
              <h3 className="font-bold text-white mb-2">Multi-chain</h3>
              <p className="text-white/80 text-sm">Stake on multiple networks</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-white/60 text-sm">
          <p>Connected to Protocol API • {format(new Date(), 'PPpp')}</p>
        </div>
      </div>
    </div>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Dashboard />
    </QueryClientProvider>
  )
}

export default App

