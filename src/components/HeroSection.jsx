import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Zap, Clock, Target } from 'lucide-react'

const tickerHeadlines = [
    "✓ Kerala flood reports verified across 12 sources",
    "⚠ Viral video debunked using metadata analysis",
    "✓ Election data cross-referenced with EC database",
    "✓ Cyclone path prediction confirmed by IMD",
    "⚠ Manipulated image detected via reverse search",
    "✓ Government statement verified against PIB archives",
    "✓ Breaking: Stock market claim verified in 2.1s",
    "⚠ Social media rumor flagged for misinformation",
]

function AnimatedCounter({ end, duration = 2000, suffix = '' }) {
    const [count, setCount] = useState(0)
    const countRef = useRef(null)
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true)
                }
            },
            { threshold: 0.5 }
        )

        if (countRef.current) {
            observer.observe(countRef.current)
        }

        return () => observer.disconnect()
    }, [])

    useEffect(() => {
        if (!isVisible) return

        let startTime = null
        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp
            const progress = Math.min((timestamp - startTime) / duration, 1)
            setCount(Math.floor(progress * end))
            if (progress < 1) {
                requestAnimationFrame(animate)
            }
        }
        requestAnimationFrame(animate)
    }, [isVisible, end, duration])

    return (
        <span ref={countRef} className="tabular-nums">
            {count.toLocaleString()}{suffix}
        </span>
    )
}

export default function HeroSection() {
    return (
        <section id="hero" className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
            {/* Grid Background */}
            <div className="absolute inset-0 grid-bg opacity-50" />

            {/* Gradient Orbs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#0EA5E9] rounded-full opacity-10 blur-[120px]" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#0284C7] rounded-full opacity-10 blur-[120px]" />

            {/* News Ticker Background */}
            <div className="absolute top-24 left-0 right-0 overflow-hidden opacity-20">
                <div className="news-ticker flex whitespace-nowrap">
                    {[...tickerHeadlines, ...tickerHeadlines].map((headline, i) => (
                        <span key={i} className="mx-8 text-sm text-[#94A3B8]">
                            {headline}
                        </span>
                    ))}
                </div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card-static border-[#0EA5E9]/30 mb-8"
                >
                    <Zap className="w-4 h-4 text-[#0EA5E9]" />
                    <span className="text-sm text-[#94A3B8]">AI-Powered Fact Verification</span>
                </motion.div>

                {/* Main Headline */}
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6"
                    style={{ fontFamily: 'var(--font-display)' }}
                >
                    <span className="text-white">Truth at </span>
                    <span className="gradient-text text-reveal">
                        Crisis Speed
                    </span>
                </motion.h1>

                {/* Subheading */}
                <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-xl sm:text-2xl text-[#94A3B8] mb-10 max-w-3xl mx-auto"
                >
                    AI-Powered Investigative Journalism for Everyone
                </motion.p>

                {/* CTA Button */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                >
                    <a
                        href="#demo"
                        className="btn-glow pulse-glow glow-border inline-flex items-center gap-3 text-lg"
                    >
                        Verify Content Now
                        <ArrowRight className="w-5 h-5" />
                    </a>
                    <a
                        href="#how-it-works"
                        className="glass-card px-6 py-4 rounded-lg inline-flex items-center gap-2 text-white hover:scale-105 transition-transform"
                    >
                        <Clock className="w-5 h-5 text-[#0EA5E9]" />
                        <span>2.8s Average Response</span>
                    </a>
                </motion.div>
            </div>

            {/* Scroll Indicator */}
            <motion.div
                className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
            >
                <div className="w-6 h-10 rounded-full border-2 border-[#94A3B8]/50 flex justify-center pt-2">
                    <div className="w-1.5 h-3 bg-[#0EA5E9] rounded-full" />
                </div>
            </motion.div>
        </section>
    )
}
