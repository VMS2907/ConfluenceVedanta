import { motion } from 'framer-motion'
import { Upload, Brain, Search, BarChart3, ArrowRight } from 'lucide-react'

const steps = [
    {
        icon: Upload,
        title: 'Input Content',
        description: 'Paste any claim, URL, or upload media for verification',
        color: '#0EA5E9'
    },
    {
        icon: Brain,
        title: 'AI Analysis',
        description: 'Our AI extracts and processes individual claims',
        color: '#8B5CF6'
    },
    {
        icon: Search,
        title: 'Source Cross-Check',
        description: 'Cross-reference with 10+ trusted news sources',
        color: '#F59E0B'
    },
    {
        icon: BarChart3,
        title: 'Credibility Report',
        description: 'Get detailed verification results with evidence',
        color: '#10B981'
    }
]

export default function HowItWorks() {
    return (
        <section id="how-it-works" className="py-32 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 grid-bg opacity-20" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#0EA5E9] opacity-5 blur-[150px] rounded-full" />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-20"
                >
                    <span className="inline-block px-4 py-1.5 rounded-full bg-[#0EA5E9]/10 text-[#0EA5E9] text-sm font-medium mb-4">
                        Simple Process
                    </span>
                    <h2 className="section-title mb-4">How It Works</h2>
                    <p className="text-[#94A3B8] text-lg max-w-xl mx-auto">
                        Verify any piece of content in four simple steps
                    </p>
                </motion.div>

                {/* Timeline - Vertical on mobile, Horizontal on desktop */}
                <div className="relative">
                    {/* Desktop Layout */}
                    <div className="hidden lg:block">
                        {/* Connection Line */}
                        <div className="absolute top-[60px] left-[10%] right-[10%] h-1 bg-gradient-to-r from-[#0EA5E9]/20 via-[#8B5CF6]/20 to-[#10B981]/20 rounded-full" />
                        <motion.div
                            className="absolute top-[60px] left-[10%] h-1 bg-gradient-to-r from-[#0EA5E9] via-[#8B5CF6] to-[#10B981] rounded-full"
                            initial={{ width: 0 }}
                            whileInView={{ width: '80%' }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.5, delay: 0.5 }}
                        />

                        <div className="grid grid-cols-4 gap-6">
                            {steps.map((step, index) => (
                                <motion.div
                                    key={step.title}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.2 }}
                                    className="relative text-center"
                                >
                                    {/* Icon Circle */}
                                    <div className="relative inline-block mb-6">
                                        <motion.div
                                            whileHover={{ scale: 1.1 }}
                                            className="w-[120px] h-[120px] rounded-3xl mx-auto flex items-center justify-center relative z-10"
                                            style={{
                                                background: `linear-gradient(135deg, ${step.color}15 0%, ${step.color}05 100%)`,
                                                border: `2px solid ${step.color}30`
                                            }}
                                        >
                                            <step.icon
                                                className="w-12 h-12"
                                                style={{ color: step.color }}
                                            />
                                        </motion.div>

                                        {/* Step Badge */}
                                        <div
                                            className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold z-20"
                                            style={{
                                                backgroundColor: step.color,
                                                color: 'white',
                                                boxShadow: `0 4px 15px ${step.color}50`
                                            }}
                                        >
                                            Step {index + 1}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <h3 className="text-xl font-semibold text-white mb-3">
                                        {step.title}
                                    </h3>
                                    <p className="text-[#94A3B8] text-sm leading-relaxed px-2">
                                        {step.description}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Mobile Layout - Vertical */}
                    <div className="lg:hidden space-y-8">
                        {steps.map((step, index) => (
                            <motion.div
                                key={step.title}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="flex gap-6 items-start"
                            >
                                {/* Left - Icon & Line */}
                                <div className="flex flex-col items-center">
                                    <div
                                        className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
                                        style={{
                                            background: `linear-gradient(135deg, ${step.color}20 0%, ${step.color}05 100%)`,
                                            border: `2px solid ${step.color}40`
                                        }}
                                    >
                                        <step.icon
                                            className="w-8 h-8"
                                            style={{ color: step.color }}
                                        />
                                    </div>
                                    {index < steps.length - 1 && (
                                        <div className="w-0.5 h-16 bg-gradient-to-b from-[#0EA5E9]/50 to-transparent mt-2" />
                                    )}
                                </div>

                                {/* Right - Content */}
                                <div className="flex-1 pt-2">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span
                                            className="px-2 py-0.5 rounded text-xs font-bold"
                                            style={{ backgroundColor: `${step.color}20`, color: step.color }}
                                        >
                                            Step {index + 1}
                                        </span>
                                        <h3 className="text-lg font-semibold text-white">
                                            {step.title}
                                        </h3>
                                    </div>
                                    <p className="text-[#94A3B8] text-sm">
                                        {step.description}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
