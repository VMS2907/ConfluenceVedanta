import { useRef, useState } from 'react'
import { motion } from 'framer-motion'

/**
 * 3D Tilt Card Component - Adds perspective tilt effect on mouse move
 */
export default function TiltCard({ children, className = '', intensity = 15 }) {
    const cardRef = useRef(null)
    const [rotateX, setRotateX] = useState(0)
    const [rotateY, setRotateY] = useState(0)
    const [isHovering, setIsHovering] = useState(false)

    const handleMouseMove = (e) => {
        if (!cardRef.current) return

        const card = cardRef.current
        const rect = card.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2
        const mouseX = e.clientX - centerX
        const mouseY = e.clientY - centerY

        const rotateXValue = (mouseY / (rect.height / 2)) * intensity
        const rotateYValue = (mouseX / (rect.width / 2)) * -intensity

        setRotateX(-rotateXValue)
        setRotateY(rotateYValue)
    }

    const handleMouseEnter = () => {
        setIsHovering(true)
    }

    const handleMouseLeave = () => {
        setIsHovering(false)
        setRotateX(0)
        setRotateY(0)
    }

    return (
        <motion.div
            ref={cardRef}
            className={`relative ${className}`}
            style={{
                transformStyle: 'preserve-3d',
                perspective: '1000px',
            }}
            animate={{
                rotateX: rotateX,
                rotateY: rotateY,
                scale: isHovering ? 1.02 : 1,
            }}
            transition={{
                type: 'spring',
                stiffness: 300,
                damping: 20,
            }}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div
                style={{
                    transform: 'translateZ(20px)',
                    transformStyle: 'preserve-3d',
                }}
            >
                {children}
            </div>

            {/* Shine effect */}
            {isHovering && (
                <motion.div
                    className="absolute inset-0 rounded-2xl pointer-events-none"
                    style={{
                        background: `radial-gradient(circle at ${50 + rotateY}% ${50 + rotateX}%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)`,
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                />
            )}
        </motion.div>
    )
}
