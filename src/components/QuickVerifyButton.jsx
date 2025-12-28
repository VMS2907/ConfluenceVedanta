import { motion } from 'framer-motion'
import { Search } from 'lucide-react'

export default function QuickVerifyButton() {
    const handleClick = () => {
        const demoSection = document.getElementById('demo')
        if (demoSection) {
            demoSection.scrollIntoView({ behavior: 'smooth' })
        }
    }

    return (
        <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleClick}
            className="floating-btn"
            aria-label="Quick Verify"
        >
            <Search className="w-6 h-6" />
        </motion.button>
    )
}
