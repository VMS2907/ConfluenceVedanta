import { useState, useEffect } from 'react'
import { motion, useScroll, useSpring } from 'framer-motion'
import { ArrowUp } from 'lucide-react'

export default function ScrollProgress() {
    const [showScrollTop, setShowScrollTop] = useState(false)
    const { scrollYProgress } = useScroll()
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    })

    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 500)
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        })
    }

    return (
        <>
            {/* Scroll Progress Bar */}
            <motion.div
                className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0EA5E9] via-[#38BDF8] to-[#0EA5E9] origin-left z-50"
                style={{ scaleX }}
            />

            {/* Scroll to Top Button */}
            <motion.button
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                    opacity: showScrollTop ? 1 : 0,
                    scale: showScrollTop ? 1 : 0
                }}
                transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 25
                }}
                onClick={scrollToTop}
                className="fixed bottom-24 right-6 w-12 h-12 rounded-full bg-gradient-to-br from-[#0EA5E9] to-[#0284C7] text-white shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center z-40 group"
                style={{
                    boxShadow: '0 4px 20px rgba(14, 165, 233, 0.4)'
                }}
                aria-label="Scroll to top"
            >
                <ArrowUp className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
            </motion.button>
        </>
    )
}
