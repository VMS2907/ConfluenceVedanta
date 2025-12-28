import { useState, useEffect } from 'react'
import { Sun, Moon } from 'lucide-react'
import { motion } from 'framer-motion'

export default function ThemeToggle() {
    const [theme, setTheme] = useState(() => {
        // Check localStorage first, then system preference, default to 'dark'
        const savedTheme = localStorage.getItem('vedanta-theme')
        if (savedTheme) return savedTheme

        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
            return 'light'
        }
        return 'dark'
    })

    useEffect(() => {
        // Apply theme to document
        document.documentElement.setAttribute('data-theme', theme)
        localStorage.setItem('vedanta-theme', theme)
    }, [theme])

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark')
    }

    return (
        <button
            onClick={toggleTheme}
            className="relative w-14 h-7 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-electric focus:ring-offset-2 focus:ring-offset-transparent"
            style={{
                background: theme === 'dark'
                    ? 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)'
                    : 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)',
                boxShadow: theme === 'dark'
                    ? '0 2px 8px rgba(14, 165, 233, 0.2), inset 0 1px 2px rgba(0, 0, 0, 0.3)'
                    : '0 2px 8px rgba(251, 191, 36, 0.3), inset 0 1px 2px rgba(0, 0, 0, 0.1)'
            }}
            aria-label="Toggle theme"
        >
            {/* Toggle Circle */}
            <motion.div
                className="absolute top-0.5 flex items-center justify-center w-6 h-6 rounded-full shadow-lg"
                style={{
                    background: theme === 'dark'
                        ? 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)'
                        : 'linear-gradient(135deg, #FFFFFF 0%, #F3F4F6 100%)',
                }}
                animate={{
                    x: theme === 'dark' ? 2 : 30
                }}
                transition={{
                    type: 'spring',
                    stiffness: 500,
                    damping: 30
                }}
            >
                {theme === 'dark' ? (
                    <Moon className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                ) : (
                    <Sun className="w-3.5 h-3.5 text-yellow-600" strokeWidth={2.5} />
                )}
            </motion.div>

            {/* Background Icons */}
            <div className="absolute inset-0 flex items-center justify-between px-1.5">
                <Sun
                    className="w-3 h-3 transition-opacity duration-300"
                    style={{
                        color: theme === 'light' ? '#B45309' : '#64748B',
                        opacity: theme === 'light' ? 0.4 : 0.6
                    }}
                />
                <Moon
                    className="w-3 h-3 transition-opacity duration-300"
                    style={{
                        color: theme === 'dark' ? '#38BDF8' : '#64748B',
                        opacity: theme === 'dark' ? 0.4 : 0.6
                    }}
                />
            </div>
        </button>
    )
}
