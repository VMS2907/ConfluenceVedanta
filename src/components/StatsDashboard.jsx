import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, Radio, Database, Zap } from 'lucide-react'

const stats = [
    {
        icon: CheckCircle,
        label: 'Claims Verified Today',
        value: 12847,
        suffix: '',
        color: '#10B981',
        bgGradient: 'from-[#10B981]/20 to-[#10B981]/5'
    },
    {
        icon: Radio,
        label: 'Active Crisis Events',
        value: 7,
        suffix: '',
        color: '#EF4444',
        bgGradient: 'from-[#EF4444]/20 to-[#EF4444]/5'
    },
    {
        icon: Database,
        label: 'Sources Monitored',
        value: 250,
        suffix: '+',
        color: '#0EA5E9',
        bgGradient: 'from-[#0EA5E9]/20 to-[#0EA5E9]/5'
    },
    {
        icon: Zap,
        label: 'Avg Response Time',
        value: 2.8,
        suffix: 's',
        color: '#F59E0B',
        bgGradient: 'from-[#F59E0B]/20 to-[#F59E0B]/5',
        isDecimal: true
    }
]

function AnimatedCounter({ end, suffix = '', duration = 2000, isDecimal = false }) {
    const [count, setCount] = useState(0)
    const countRef = useRef(null)
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !isVisible) {
                    setIsVisible(true)
                }
            },
            { threshold: 0.5 }
        )

        if (countRef.current) {
            observer.observe(countRef.current)
        }

        return () => observer.disconnect()
    }, [isVisible])

    useEffect(() => {
        if (!isVisible) return

        let startTime = null
        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp
            const progress = Math.min((timestamp - startTime) / duration, 1)

            // Easing function for smooth animation
            const eased = 1 - Math.pow(1 - progress, 3)
            const currentValue = eased * end

            if (isDecimal) {
                setCount(currentValue.toFixed(1))
            } else {
                setCount(Math.floor(currentValue))
            }

            if (progress < 1) {
                requestAnimationFrame(animate)
            }
        }
        requestAnimationFrame(animate)
    }, [isVisible, end, duration, isDecimal])

    return (
        <span ref={countRef} className="tabular-nums">
            {isDecimal ? count : Number(count).toLocaleString()}{suffix}
        </span>
    )
}

function StatCard({ stat, index }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.15, duration: 0.5 }}
            className="relative group"
        >
            {/* Background Glow */}
            <div
                className="absolute inset-0 rounded-3xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500"
                style={{ backgroundColor: stat.color }}
            />

            {/* Card */}
            <div className={`relative glass-card p-8 text-center overflow-hidden`}>
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-50`} />

                {/* Icon */}
                <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="relative w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center"
                    style={{
                        background: `linear-gradient(135deg, ${stat.color}30 0%, ${stat.color}10 100%)`,
                        border: `2px solid ${stat.color}40`
                    }}
                >
                    <stat.icon
                        className="w-10 h-10"
                        style={{ color: stat.color }}
                    />
                </motion.div>

                {/* Value */}
                <div
                    className="relative text-5xl font-bold mb-3"
                    style={{ color: stat.color, fontFamily: 'var(--font-display)' }}
                >
                    <AnimatedCounter
                        end={stat.value}
                        suffix={stat.suffix}
                        isDecimal={stat.isDecimal}
                    />
                </div>

                {/* Label */}
                <p className="relative text-[#94A3B8] text-sm font-medium">
                    {stat.label}
                </p>

                {/* Decorative corner */}
                <div
                    className="absolute top-0 right-0 w-24 h-24 opacity-10"
                    style={{
                        background: `radial-gradient(circle at top right, ${stat.color}, transparent 70%)`
                    }}
                />
            </div>
        </motion.div>
    )
}

export default function StatsDashboard() {
    return (
        <section className="py-32 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 grid-bg opacity-20" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[500px] bg-[#0EA5E9] opacity-5 blur-[200px] rounded-full" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <span className="inline-block px-4 py-1.5 rounded-full bg-[#0EA5E9]/10 text-[#0EA5E9] text-sm font-medium mb-4">
                        Live Metrics
                    </span>
                    <h2 className="section-title mb-4">Platform Statistics</h2>
                    <p className="text-[#94A3B8] text-lg max-w-xl mx-auto">
                        Real-time performance data from our verification engine
                    </p>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                    {stats.map((stat, index) => (
                        <StatCard key={stat.label} stat={stat} index={index} />
                    ))}
                </div>

                {/* Bottom Accent */}
                <motion.div
                    initial={{ opacity: 0, scaleX: 0 }}
                    whileInView={{ opacity: 1, scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="mt-16 h-px bg-gradient-to-r from-transparent via-[#0EA5E9]/50 to-transparent"
                />
            </div>
        </section>
    )
}
