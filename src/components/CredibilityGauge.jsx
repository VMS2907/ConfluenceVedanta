import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { motion } from 'framer-motion'

export default function CredibilityGauge({ score, size = 180, animated = true }) {
    const getColor = (score) => {
        if (score >= 70) return '#10B981' // Green
        if (score >= 40) return '#F59E0B' // Warning
        return '#EF4444' // Red
    }

    const getLabel = (score) => {
        if (score >= 70) return 'VERIFIED'
        if (score >= 40) return 'DISPUTED'
        return 'FALSE'
    }

    const color = getColor(score)
    const data = [
        { value: score },
        { value: 100 - score }
    ]

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={size * 0.35}
                        outerRadius={size * 0.45}
                        startAngle={90}
                        endAngle={-270}
                        paddingAngle={0}
                        dataKey="value"
                        animationDuration={animated ? 1500 : 0}
                        animationBegin={animated ? 300 : 0}
                    >
                        <Cell fill={color} />
                        <Cell fill="rgba(148, 163, 184, 0.2)" />
                    </Pie>
                </PieChart>
            </ResponsiveContainer>

            {/* Center Content */}
            <motion.div
                className="absolute inset-0 flex flex-col items-center justify-center"
                initial={animated ? { opacity: 0, scale: 0.5 } : {}}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.3 }}
            >
                <span
                    className="text-4xl font-bold"
                    style={{ color, fontFamily: 'var(--font-display)' }}
                >
                    {score}
                </span>
                <span className="text-xs text-[#94A3B8] mt-1">out of 100</span>
                <span
                    className="text-xs font-semibold mt-2 px-3 py-1 rounded-full"
                    style={{
                        backgroundColor: `${color}20`,
                        color
                    }}
                >
                    {getLabel(score)}
                </span>
            </motion.div>
        </div>
    )
}
