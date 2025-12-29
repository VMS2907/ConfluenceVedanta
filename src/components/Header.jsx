import { useState, useEffect } from 'react'
import { Menu, X, Zap, TrendingUp, Radio } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ThemeToggle from './ThemeToggle'

// Premium VEDANTA Logo Component
function VedantaLogo({ className = "w-10 h-10" }) {
    return (
        <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Outer hexagon shield */}
            <path
                d="M50 5 L85 25 L85 65 L50 85 L15 65 L15 25 Z"
                fill="url(#logo-gradient)"
                stroke="url(#logo-stroke)"
                strokeWidth="2"
            />

            {/* Verification checkmark */}
            <path
                d="M35 50 L45 60 L65 35"
                stroke="white"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
            />

            {/* Inner pulse circle */}
            <circle
                cx="50"
                cy="50"
                r="8"
                fill="white"
                opacity="0.3"
            >
                <animate attributeName="r" values="8;12;8" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.3;0.1;0.3" dur="2s" repeatCount="indefinite" />
            </circle>

            {/* Gradient definitions */}
            <defs>
                <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0EA5E9" />
                    <stop offset="50%" stopColor="#0284C7" />
                    <stop offset="100%" stopColor="#0369A1" />
                </linearGradient>
                <linearGradient id="logo-stroke" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#38BDF8" />
                    <stop offset="100%" stopColor="#0EA5E9" />
                </linearGradient>
            </defs>
        </svg>
    )
}

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const navItems = [
        { name: 'Features', href: '#features', icon: Zap },
        { name: 'Live Feed', href: '#demo', icon: Radio },
        { name: 'Analytics', href: '#how-it-works', icon: TrendingUp },
        { name: 'Contact', href: '#cta' },
    ]

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                scrolled
                    ? 'glass-card-static border-t-0 border-l-0 border-r-0 rounded-none shadow-2xl shadow-black/20'
                    : 'bg-transparent border-0'
            }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Premium Logo */}
                    <motion.a
                        href="#"
                        className="flex items-center gap-3 group"
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="relative">
                            <VedantaLogo className="w-12 h-12 drop-shadow-lg group-hover:drop-shadow-2xl transition-all duration-300" />

                            {/* Live indicator */}
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50" />
                        </div>

                        <div className="flex flex-col">
                            <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-[#0EA5E9] via-[#38BDF8] to-[#0EA5E9] bg-clip-text text-transparent bg-size-200 animate-gradient"
                                  style={{ fontFamily: 'var(--font-display)' }}>
                                VEDANTA
                            </span>
                            <span className="text-[10px] font-semibold text-[#64748B] tracking-widest uppercase -mt-1">
                                Intelligence Platform
                            </span>
                        </div>
                    </motion.a>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center gap-1">
                        {navItems.map((item, index) => (
                            <motion.a
                                key={item.name}
                                href={item.href}
                                className="relative px-4 py-2 text-sm font-medium text-[#94A3B8] hover:text-white transition-colors duration-200 group"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <div className="flex items-center gap-2">
                                    {item.icon && <item.icon className="w-4 h-4" />}
                                    {item.name}
                                </div>

                                {/* Hover underline effect */}
                                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#0EA5E9] to-[#38BDF8] group-hover:w-full transition-all duration-300" />
                            </motion.a>
                        ))}
                    </nav>

                    {/* CTA Section */}
                    <div className="hidden lg:flex items-center gap-4">
                        <ThemeToggle />

                        {/* Status Badge */}
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
                            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                            <span className="text-xs font-semibold text-green-400">LIVE</span>
                        </div>

                        {/* Primary CTA */}
                        <motion.button
                            className="relative px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#0EA5E9] to-[#0284C7] text-white font-bold text-sm overflow-hidden group shadow-lg shadow-[#0EA5E9]/30"
                            whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(14, 165, 233, 0.4)" }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <span className="relative z-10">Try Free Demo</span>

                            {/* Animated background */}
                            <div className="absolute inset-0 bg-gradient-to-r from-[#38BDF8] to-[#0EA5E9] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                            {/* Shine effect */}
                            <div className="absolute inset-0 translate-x-full group-hover:translate-x-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700" />
                        </motion.button>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="lg:hidden flex items-center gap-3">
                        <ThemeToggle />

                        <motion.button
                            className="relative w-10 h-10 rounded-lg bg-[#1E293B] flex items-center justify-center text-white"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            whileTap={{ scale: 0.95 }}
                        >
                            <AnimatePresence mode="wait">
                                {isMenuOpen ? (
                                    <motion.div
                                        key="close"
                                        initial={{ rotate: -90, opacity: 0 }}
                                        animate={{ rotate: 0, opacity: 1 }}
                                        exit={{ rotate: 90, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <X className="w-5 h-5" />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="menu"
                                        initial={{ rotate: 90, opacity: 0 }}
                                        animate={{ rotate: 0, opacity: 1 }}
                                        exit={{ rotate: -90, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <Menu className="w-5 h-5" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="lg:hidden glass-card-static border-t border-[rgba(148,163,184,0.2)] overflow-hidden"
                    >
                        <nav className="px-4 py-6 space-y-2">
                            {navItems.map((item, index) => (
                                <motion.a
                                    key={item.name}
                                    href={item.href}
                                    className="flex items-center gap-3 text-[#94A3B8] hover:text-white hover:bg-[#1E293B] transition-all duration-200 font-medium py-3 px-4 rounded-lg group"
                                    onClick={() => setIsMenuOpen(false)}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    {item.icon && <item.icon className="w-5 h-5 group-hover:text-[#0EA5E9] transition-colors" />}
                                    {item.name}
                                </motion.a>
                            ))}

                            {/* Mobile Status Badge */}
                            <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-green-500/10 border border-green-500/20 mt-4">
                                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                <span className="text-sm font-semibold text-green-400">System Online</span>
                            </div>

                            {/* Mobile CTA */}
                            <motion.button
                                className="w-full mt-4 px-6 py-4 rounded-xl bg-gradient-to-r from-[#0EA5E9] to-[#0284C7] text-white font-bold shadow-lg shadow-[#0EA5E9]/30"
                                whileTap={{ scale: 0.98 }}
                            >
                                Try Free Demo
                            </motion.button>
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    )
}
