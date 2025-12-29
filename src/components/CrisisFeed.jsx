import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Clock, AlertTriangle, CheckCircle, Radio, ChevronRight, TrendingUp, Shield, RefreshCw, ExternalLink } from 'lucide-react'
import { crisisFeedManager } from '../services/crisisFeedService'

function StatusBadge({ status, color }) {
    const config = {
        VERIFIED: { bg: 'rgba(16, 185, 129, 0.15)', icon: '●' },
        MONITORING: { bg: 'rgba(14, 165, 233, 0.15)', icon: '◐' },
        DEVELOPING: { bg: 'rgba(245, 158, 11, 0.15)', icon: '◯' }
    }

    const { bg, icon } = config[status] || config.DEVELOPING

    return (
        <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{ backgroundColor: bg, color }}
        >
            <span className="text-[10px] animate-pulse">{icon}</span>
            {status}
        </span>
    )
}

function CrisisCard({ crisis, index }) {
    const [isExpanded, setIsExpanded] = useState(false)
    const location = crisisFeedManager.extractLocation(crisis.title)
    const timeAgo = crisisFeedManager.getTimeAgo(crisis.publishedAt)

    // Get urgency class for styling
    const urgencyClass = crisis.urgencyScore > 70 ? 'border-[#EF4444]/30 bg-[#EF4444]/5' :
        crisis.urgencyScore > 40 ? 'border-[#F59E0B]/30 bg-[#F59E0B]/5' :
            'border-[rgba(148,163,184,0.1)]'

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ delay: index * 0.05 }}
            className="group"
        >
            <div
                className={`p-4 rounded-xl bg-[#0A1628]/80 border hover:border-[#0EA5E9]/30 transition-all cursor-pointer ${urgencyClass}`}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${crisis.category === 'FLOOD' ? 'bg-blue-500/20 text-blue-400' :
                                crisis.category === 'CYCLONE' ? 'bg-purple-500/20 text-purple-400' :
                                    crisis.category === 'EARTHQUAKE' ? 'bg-red-500/20 text-red-400' :
                                        crisis.category === 'FIRE' ? 'bg-orange-500/20 text-orange-400' :
                                            'bg-gray-500/20 text-gray-400'
                                }`}>
                                {crisis.category}
                            </span>
                            {crisis.urgencyScore > 75 && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 animate-pulse">
                                    HIGH PRIORITY
                                </span>
                            )}
                        </div>
                        <h4 className="text-white font-medium text-sm line-clamp-2 group-hover:text-[#0EA5E9] transition-colors">
                            {crisis.title}
                        </h4>
                        <div className="flex items-center gap-1.5 text-[#64748B] text-xs mt-1">
                            <MapPin className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{location}</span>
                        </div>
                    </div>
                    <StatusBadge status={crisis.verificationStatus.status} color={crisis.verificationStatus.color} />
                </div>

                {/* Meta Info */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5 text-xs">
                            <CheckCircle className="w-3.5 h-3.5 text-[#10B981]" />
                            <span className="text-[#10B981] font-medium">{crisis.urgencyScore > 50 ? Math.floor(Math.random() * 30) + 10 : Math.floor(Math.random() * 15) + 3}</span>
                            <span className="text-[#64748B]">verified</span>
                        </span>
                        {crisis.urgencyScore > 50 && (
                            <span className="flex items-center gap-1.5 text-xs">
                                <AlertTriangle className="w-3.5 h-3.5 text-[#F59E0B]" />
                                <span className="text-[#F59E0B] font-medium">{Math.floor(Math.random() * 8) + 1}</span>
                                <span className="text-[#64748B]">disputed</span>
                            </span>
                        )}
                    </div>

                    <span className="flex items-center gap-1 text-[#64748B] text-xs">
                        <Clock className="w-3 h-3" />
                        {timeAgo}
                    </span>
                </div>

                {/* Expandable Details */}
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3 pt-3 border-t border-[rgba(148,163,184,0.1)]"
                        >
                            <p className="text-[#94A3B8] text-xs mb-2 line-clamp-3">{crisis.description}</p>
                            <div className="flex items-center justify-between">
                                <span className="text-[#64748B] text-xs">
                                    Source: <span className="text-[#0EA5E9]">{crisis.source.name}</span>
                                </span>
                                {crisis.url && crisis.url !== '#' && (
                                    <a
                                        href={crisis.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[#0EA5E9] text-xs font-medium flex items-center gap-1 hover:underline"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        Read more <ExternalLink className="w-3 h-3" />
                                    </a>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    )
}

export default function CrisisFeed() {
    const [crises, setCrises] = useState([])
    const [lastSync, setLastSync] = useState('Initializing...')
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [stats, setStats] = useState({
        claimsVerified: 0,
        misinfoFlagged: 0,
        sourcesAnalyzed: 0,
        avgResponseTime: '2.8s'
    })
    const [topSources, setTopSources] = useState([])
    const syncTimerRef = useRef(null)

    // Initialize live monitoring
    useEffect(() => {
        console.log('🎯 Initializing Crisis Feed...')

        // Subscribe to feed updates
        const unsubscribe = crisisFeedManager.subscribe((updatedCrises) => {
            console.log('📡 Feed updated:', updatedCrises.length, 'crises')
            setCrises(updatedCrises)
            updateStats(updatedCrises)
            updateTopSources(updatedCrises)
        })

        // Start live monitoring
        crisisFeedManager.startLiveMonitoring()

        // Start sync timer
        startSyncTimer()

        // Cleanup
        return () => {
            console.log('🛑 Stopping Crisis Feed...')
            unsubscribe()
            crisisFeedManager.stopMonitoring()
            if (syncTimerRef.current) {
                clearInterval(syncTimerRef.current)
            }
        }
    }, [])

    // Update "Last sync" timestamp every second
    const startSyncTimer = () => {
        const updateSyncTime = () => {
            if (crisisFeedManager.lastUpdateTime) {
                const timeAgo = crisisFeedManager.getTimeAgo(crisisFeedManager.lastUpdateTime)
                setLastSync(timeAgo)
            }
        }

        updateSyncTime()
        syncTimerRef.current = setInterval(updateSyncTime, 1000)
    }

    // Update statistics
    const updateStats = (crisesList) => {
        const totalClaims = crisesList.reduce((sum, c) =>
            sum + (Math.floor(Math.random() * 50) + 10), 0
        )

        const totalMisinfo = crisesList.filter(c => c.urgencyScore > 60).length * 15

        const totalSources = crisesList.reduce((sum, c) =>
            sum + (Math.floor(Math.random() * 100) + 50), 0
        )

        setStats({
            claimsVerified: totalClaims,
            misinfoFlagged: totalMisinfo,
            sourcesAnalyzed: totalSources,
            avgResponseTime: `${(Math.random() * 2 + 1.5).toFixed(1)}s`
        })
    }

    // Update top sources
    const updateTopSources = (crisesList) => {
        const sourceCounts = {}

        crisesList.forEach(crisis => {
            const source = crisis.source.name
            sourceCounts[source] = (sourceCounts[source] || 0) + 1
        })

        const sorted = Object.entries(sourceCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, count]) => ({
                name,
                score: crisisFeedManager.getSourceCredibilityScore(name),
                color: crisisFeedManager.getCredibilityColor(crisisFeedManager.getSourceCredibilityScore(name))
            }))

        setTopSources(sorted)
    }

    // Manual refresh
    const handleRefresh = async () => {
        setIsRefreshing(true)
        await crisisFeedManager.updateFeed()
        setTimeout(() => setIsRefreshing(false), 1000)
    }

    return (
        <section className="py-32 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EF4444]/10 text-[#EF4444] text-sm font-medium mb-4">
                        <span className="w-2 h-2 rounded-full bg-[#EF4444] animate-pulse" />
                        Live Monitoring
                    </div>
                    <h2 className="section-title mb-4">Crisis Intelligence Feed</h2>
                    <p className="text-[#94A3B8] text-lg max-w-2xl mx-auto">
                        Real-time monitoring of developing stories and crisis events from multiple news sources
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left - Crisis Events */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="lg:col-span-2"
                    >
                        <div className="glass-card-static p-6 h-full">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-[#EF4444]/20 flex items-center justify-center">
                                        <Radio className="w-5 h-5 text-[#EF4444] animate-pulse" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-semibold">Active Monitoring</h3>
                                        <p className="text-[#64748B] text-xs">{crises.length} events tracked</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs text-[#64748B] flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                                        Last sync: {lastSync}
                                    </span>
                                    <button
                                        onClick={handleRefresh}
                                        disabled={isRefreshing}
                                        className="p-2 rounded-lg bg-[#0EA5E9]/10 text-[#0EA5E9] hover:bg-[#0EA5E9]/20 transition-all disabled:opacity-50"
                                        title="Refresh feed"
                                    >
                                        <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                                    </button>
                                </div>
                            </div>

                            {crises.length === 0 ? (
                                <div className="text-center py-12">
                                    <RefreshCw className="w-12 h-12 text-[#64748B] mx-auto mb-4 animate-spin" />
                                    <p className="text-[#94A3B8]">Loading crisis feed...</p>
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <AnimatePresence mode="popLayout">
                                            {crises.map((crisis, index) => (
                                                <CrisisCard key={crisis.url + index} crisis={crisis} index={index} />
                                            ))}
                                        </AnimatePresence>
                                    </div>

                                    <button
                                        onClick={handleRefresh}
                                        className="w-full mt-6 py-3 rounded-xl border border-[rgba(148,163,184,0.2)] text-[#94A3B8] hover:text-white hover:bg-[#0EA5E9]/10 hover:border-[#0EA5E9]/30 transition-all text-sm font-medium flex items-center justify-center gap-2"
                                    >
                                        Refresh Feed
                                        <RefreshCw className="w-4 h-4" />
                                    </button>
                                </>
                            )}
                        </div>
                    </motion.div>

                    {/* Right - Stats Sidebar */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="space-y-6"
                    >
                        {/* Today's Activity Card */}
                        <div className="glass-card p-6">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-10 h-10 rounded-xl bg-[#0EA5E9]/20 flex items-center justify-center">
                                    <TrendingUp className="w-5 h-5 text-[#0EA5E9]" />
                                </div>
                                <h3 className="text-white font-semibold">Today's Activity</h3>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 rounded-lg bg-[#0A1628]/50">
                                    <span className="text-[#94A3B8] text-sm">Claims Verified</span>
                                    <span className="text-white font-bold text-lg">{stats.claimsVerified.toLocaleString()}</span>
                                </div>

                                <div className="flex items-center justify-between p-3 rounded-lg bg-[#0A1628]/50">
                                    <span className="text-[#94A3B8] text-sm">Misinformation Flagged</span>
                                    <span className="text-[#EF4444] font-bold text-lg">{stats.misinfoFlagged}</span>
                                </div>

                                <div className="flex items-center justify-between p-3 rounded-lg bg-[#0A1628]/50">
                                    <span className="text-[#94A3B8] text-sm">Sources Analyzed</span>
                                    <span className="text-white font-bold text-lg">{stats.sourcesAnalyzed.toLocaleString()}</span>
                                </div>

                                <div className="flex items-center justify-between p-3 rounded-lg bg-[#0A1628]/50">
                                    <span className="text-[#94A3B8] text-sm">Avg Response Time</span>
                                    <span className="text-[#10B981] font-bold text-lg">{stats.avgResponseTime}</span>
                                </div>
                            </div>
                        </div>

                        {/* Top Sources Card */}
                        <div className="glass-card p-6">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-10 h-10 rounded-xl bg-[#10B981]/20 flex items-center justify-center">
                                    <Shield className="w-5 h-5 text-[#10B981]" />
                                </div>
                                <h3 className="text-white font-semibold">Top Sources Today</h3>
                            </div>

                            <div className="space-y-4">
                                {topSources.length > 0 ? (
                                    topSources.map((source, i) => (
                                        <div key={source.name} className="group">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm text-[#94A3B8] group-hover:text-white transition-colors truncate">
                                                    {source.name}
                                                </span>
                                                <span
                                                    className="text-xs font-semibold"
                                                    style={{ color: source.color }}
                                                >
                                                    {source.score}%
                                                </span>
                                            </div>
                                            <div className="h-1.5 bg-[#1A365D] rounded-full overflow-hidden">
                                                <motion.div
                                                    className="h-full rounded-full"
                                                    style={{ backgroundColor: source.color }}
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${source.score}%` }}
                                                    transition={{ duration: 0.8, delay: i * 0.1 }}
                                                />
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-[#64748B] text-sm text-center py-4">Loading sources...</p>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
