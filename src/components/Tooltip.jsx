import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * Tooltip component with accessibility support
 * @param {Object} props
 * @param {React.ReactNode} props.children - Element that triggers the tooltip
 * @param {string} props.content - Tooltip content
 * @param {'top'|'bottom'|'left'|'right'} props.position - Tooltip position
 * @param {number} props.delay - Delay before showing tooltip (ms)
 */
export default function Tooltip({
    children,
    content,
    position = 'top',
    delay = 300,
    className = ''
}) {
    const [isVisible, setIsVisible] = useState(false)
    const [timeoutId, setTimeoutId] = useState(null)

    const showTooltip = () => {
        const id = setTimeout(() => {
            setIsVisible(true)
        }, delay)
        setTimeoutId(id)
    }

    const hideTooltip = () => {
        if (timeoutId) {
            clearTimeout(timeoutId)
        }
        setIsVisible(false)
    }

    const positions = {
        top: {
            tooltip: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
            arrow: 'top-full left-1/2 -translate-x-1/2 border-t-[var(--bg-glass)] border-l-transparent border-r-transparent border-b-transparent'
        },
        bottom: {
            tooltip: 'top-full left-1/2 -translate-x-1/2 mt-2',
            arrow: 'bottom-full left-1/2 -translate-x-1/2 border-b-[var(--bg-glass)] border-l-transparent border-r-transparent border-t-transparent'
        },
        left: {
            tooltip: 'right-full top-1/2 -translate-y-1/2 mr-2',
            arrow: 'left-full top-1/2 -translate-y-1/2 border-l-[var(--bg-glass)] border-t-transparent border-b-transparent border-r-transparent'
        },
        right: {
            tooltip: 'left-full top-1/2 -translate-y-1/2 ml-2',
            arrow: 'right-full top-1/2 -translate-y-1/2 border-r-[var(--bg-glass)] border-t-transparent border-b-transparent border-l-transparent'
        }
    }

    const animations = {
        top: { initial: { opacity: 0, y: 5 }, animate: { opacity: 1, y: 0 } },
        bottom: { initial: { opacity: 0, y: -5 }, animate: { opacity: 1, y: 0 } },
        left: { initial: { opacity: 0, x: 5 }, animate: { opacity: 1, x: 0 } },
        right: { initial: { opacity: 0, x: -5 }, animate: { opacity: 1, x: 0 } }
    }

    return (
        <div
            className={`relative inline-block ${className}`}
            onMouseEnter={showTooltip}
            onMouseLeave={hideTooltip}
            onFocus={showTooltip}
            onBlur={hideTooltip}
        >
            {children}

            <AnimatePresence>
                {isVisible && content && (
                    <motion.div
                        initial={animations[position].initial}
                        animate={animations[position].animate}
                        exit={animations[position].initial}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className={`absolute ${positions[position].tooltip} z-50 pointer-events-none`}
                        role="tooltip"
                        aria-hidden={!isVisible}
                    >
                        <div
                            className="px-3 py-2 text-sm text-white rounded-lg shadow-xl whitespace-nowrap"
                            style={{
                                background: 'var(--bg-glass)',
                                backdropFilter: 'blur(20px)',
                                border: '1px solid var(--border-glass)',
                                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
                            }}
                        >
                            {content}
                        </div>
                        {/* Arrow */}
                        <div
                            className={`absolute ${positions[position].arrow} w-0 h-0`}
                            style={{
                                borderWidth: '6px',
                                filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))'
                            }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

/**
 * Simple Badge component for status indicators
 */
export function Badge({ children, variant = 'primary', className = '' }) {
    const variants = {
        primary: 'bg-gradient-to-r from-[#0EA5E9] to-[#0284C7] text-white',
        success: 'bg-gradient-to-r from-[#10B981] to-[#059669] text-white',
        warning: 'bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white',
        danger: 'bg-gradient-to-r from-[#EF4444] to-[#DC2626] text-white',
        neutral: 'bg-[var(--navy-light)] text-[var(--text-secondary)]'
    }

    return (
        <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${variants[variant]} ${className}`}
        >
            {children}
        </span>
    )
}
