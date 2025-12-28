import { useState } from 'react'
import { Menu, X, Shield } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ThemeToggle from './ThemeToggle'

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    const navItems = [
        { name: 'Home', href: '#hero' },
        { name: 'How It Works', href: '#how-it-works' },
        { name: 'About', href: '#features' },
        { name: 'API', href: '#cta' },
    ]

    return (
        <header className="fixed top-0 left-0 right-0 z-50 glass-card-static border-t-0 border-l-0 border-r-0 rounded-none">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <a href="#" className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0EA5E9] to-[#0284C7] flex items-center justify-center">
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
                            VEDANTA
                        </span>
                    </a>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-8">
                        {navItems.map((item) => (
                            <a
                                key={item.name}
                                href={item.href}
                                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-200 font-medium"
                            >
                                {item.name}
                            </a>
                        ))}
                        <ThemeToggle />
                        <button className="bg-gradient-to-r from-[#0EA5E9] to-[#0284C7] text-white px-5 py-2 rounded-lg font-semibold hover:shadow-lg hover:shadow-[#0EA5E9]/30 transition-all duration-300">
                            Get Started
                        </button>
                    </nav>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center gap-4">
                        <ThemeToggle />
                        <button
                            className="text-[var(--text-primary)]"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
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
                        className="md:hidden glass-card-static border-t border-[rgba(148,163,184,0.2)]"
                    >
                        <nav className="px-4 py-4 space-y-3">
                            {navItems.map((item) => (
                                <a
                                    key={item.name}
                                    href={item.href}
                                    className="block text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-200 font-medium py-2"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {item.name}
                                </a>
                            ))}
                            <button className="w-full bg-gradient-to-r from-[#0EA5E9] to-[#0284C7] text-white px-5 py-3 rounded-lg font-semibold mt-2">
                                Get Started
                            </button>
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    )
}
