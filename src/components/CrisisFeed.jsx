import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Clock, AlertTriangle, CheckCircle, Radio, ChevronRight, TrendingUp, Shield } from 'lucide-react'

const crisisEvents = [
    {
        id: 1,
        name: 'Kerala Floods 2024',
        location: 'Kerala, India',
        status: 'active',
        lastUpdated: '5 mins ago',
        verified: 47,
        disputed: 12,
        severity: 'high',
        description: 'Heavy rainfall causing flooding in multiple districts'
    },
    {
        id: 2,
        name: 'Cyclone Alert - Bay of Bengal',
        location: 'Eastern Coast',
        status: 'monitoring',
        lastUpdated: '12 mins ago',
        verified: 23,
        disputed: 5,
        severity: 'medium',
        description: 'IMD tracking developing cyclonic system'
    },
    {
        id: 3,
        name: 'Election Misinformation Watch',
        location: 'Pan India',
        status: 'active',
        lastUpdated: '2 mins ago',
        verified: 156,
        disputed: 89,
        severity: 'high',
        description: 'Monitoring viral claims during election season'
    },
    {
        id: 4,
        name: 'Stock Market Rumors',
        location: 'Mumbai, India',
        status: 'resolved',
        lastUpdated: '1 hour ago',
        verified: 34,
        disputed: 8,
        severity: 'low',
        description: 'False claims about market manipulation debunked'
    }
]

const topSources = [
    { name: 'PTI', score: 95, color: '#10B981' },
    { name: 'Reuters', score: 92, color: '#10B981' },
    { name: 'PIB India', score: 88, color: '#0EA5E9' },
    { name: 'NDTV', score: 85, color: '#0EA5E9' },
    { name: 'Times of India', score: 82, color: '#F59E0B' }
]

function StatusBadge({ status }) {
    const config = {
        active: { color: '#EF4444', bg: 'rgba(239, 68, 68, 0.15)', text: 'ACTIVE', icon: '●' },
        monitoring: { color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)', text: 'MONITORING', icon: '◐' },
        resolved: { color: '#10B981', bg: 'rgba(16, 185, 129, 0.15)', text: 'RESOLVED', icon: '✓' }
    }

    const { color, bg, text, icon } = config[status]

    return (
        <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{ backgroundColor: bg, color }}
        >
            <span className="text-[10px]">{icon}</span>
            {text}
        </span>
    )
}

function CrisisCard({ event, index }) {
    const [isExpanded, setIsExpanded] = useState(false)

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="group"
        >
            <div
                className="p-4 rounded-xl bg-[#0A1628]/80 border border-[rgba(148,163,184,0.1)] hover:border-[#0EA5E9]/30 transition-all cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                        <h4 className="text-white font-medium text-sm truncate group-hover:text-[#0EA5E9] transition-colors">
                            {event.name}
                        </h4>
                        <div className="flex items-center gap-1.5 text-[#64748B] text-xs mt-1">
                            <MapPin className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{event.location}</span>
                        </div>
                    </div>
                    <StatusBadge status={event.status} />
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5 text-xs">
                            <CheckCircle className="w-3.5 h-3.5 text-[#10B981]" />
                            <span className="text-[#10B981] font-medium">{event.verified}</span>
                            <span className="text-[#64748B]">verified</span>
                        </span>
                        <span className="flex items-center gap-1.5 text-xs">
                            <AlertTriangle className="w-3.5 h-3.5 text-[#F59E0B]" />
                            <span className="text-[#F59E0B] font-medium">{event.disputed}</span>
                            <span className="text-[#64748B]">disputed</span>
                        </span>
                    </div>

                    <span className="flex items-center gap-1 text-[#64748B] text-xs">
                        <Clock className="w-3 h-3" />
                        {event.lastUpdated}
                    </span>
                </div>

                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3 pt-3 border-t border-[rgba(148,163,184,0.1)]"
                        >
                            <p className="text-[#94A3B8] text-xs">{event.description}</p>
                            <button className="mt-2 text-[#0EA5E9] text-xs font-medium flex items-center gap-1 hover:underline">
                                View full report <ChevronRight className="w-3 h-3" />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    )
}

export default function CrisisFeed() {
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
                        Real-time monitoring of developing stories and crisis events with verification status
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
                                        <Radio className="w-5 h-5 text-[#EF4444]" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-semibold">Active Monitoring</h3>
                                        <p className="text-[#64748B] text-xs">4 events tracked</p>
                                    </div>
                                </div>
                                <span className="text-xs text-[#64748B] flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                                    Last sync: Just now
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {crisisEvents.map((event, index) => (
                                    <CrisisCard key={event.id} event={event} index={index} />
                                ))}
                            </div>

                            <button className="w-full mt-6 py-3 rounded-xl border border-[rgba(148,163,184,0.2)] text-[#94A3B8] hover:text-white hover:bg-[#0EA5E9]/10 hover:border-[#0EA5E9]/30 transition-all text-sm font-medium flex items-center justify-center gap-2">
                                View All Active Events
                                <ChevronRight className="w-4 h-4" />
                            </button>
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
                                    <span className="text-white font-bold text-lg">1,247</span>
                                </div>

                                <div className="flex items-center justify-between p-3 rounded-lg bg-[#0A1628]/50">
                                    <span className="text-[#94A3B8] text-sm">Misinformation Flagged</span>
                                    <span className="text-[#EF4444] font-bold text-lg">89</span>
                                </div>

                                <div className="flex items-center justify-between p-3 rounded-lg bg-[#0A1628]/50">
                                    <span className="text-[#94A3B8] text-sm">Sources Analyzed</span>
                                    <span className="text-white font-bold text-lg">3,456</span>
                                </div>

                                <div className="flex items-center justify-between p-3 rounded-lg bg-[#0A1628]/50">
                                    <span className="text-[#94A3B8] text-sm">Avg Response Time</span>
                                    <span className="text-[#10B981] font-bold text-lg">2.8s</span>
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
                                {topSources.map((source, i) => (
                                    <div key={source.name} className="group">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm text-[#94A3B8] group-hover:text-white transition-colors">
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
                                                whileInView={{ width: `${source.score}%` }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 0.8, delay: i * 0.1 }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
