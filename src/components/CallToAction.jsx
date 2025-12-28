import { motion } from 'framer-motion'
import { ArrowRight, BookOpen, Shield, Sparkles, CheckCircle } from 'lucide-react'

const features = [
    'Unlimited claim verification',
    'Real-time crisis monitoring',
    'API access included',
    'Priority support'
]

export default function CallToAction() {
    return (
        <section id="cta" className="py-32 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 grid-bg opacity-10" />

            {/* Animated gradient orbs */}
            <motion.div
                className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#0EA5E9] rounded-full opacity-10 blur-[150px]"
                animate={{
                    x: [0, 50, 0],
                    y: [0, 30, 0]
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
                className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[#8B5CF6] rounded-full opacity-10 blur-[150px]"
                animate={{
                    x: [0, -30, 0],
                    y: [0, -50, 0]
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            />

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="relative"
                >
                    {/* Main Card */}
                    <div className="relative rounded-3xl overflow-hidden">
                        {/* Gradient Border */}
                        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-[#0EA5E9] via-[#8B5CF6] to-[#0EA5E9] p-[1px]">
                            <div className="w-full h-full rounded-3xl bg-[#0A1628]" />
                        </div>

                        {/* Content */}
                        <div className="relative p-10 md:p-16">
                            {/* Top Badge */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 }}
                                className="flex justify-center mb-8"
                            >
                                <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#10B981]/20 to-[#10B981]/10 border border-[#10B981]/30">
                                    <Sparkles className="w-4 h-4 text-[#10B981]" />
                                    <span className="text-[#10B981] font-semibold text-sm">Free Access Available</span>
                                </div>
                            </motion.div>

                            {/* Headline */}
                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.3 }}
                                className="text-4xl sm:text-5xl lg:text-6xl font-bold text-center mb-6"
                                style={{ fontFamily: 'var(--font-display)' }}
                            >
                                <span className="text-white">Start Verifying </span>
                                <span className="bg-gradient-to-r from-[#0EA5E9] via-[#38BDF8] to-[#8B5CF6] bg-clip-text text-transparent">
                                    Today
                                </span>
                            </motion.h2>

                            {/* Description */}
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.4 }}
                                className="text-[#94A3B8] text-lg md:text-xl text-center mb-10 max-w-2xl mx-auto leading-relaxed"
                            >
                                Join thousands of journalists, researchers, and fact-checkers who trust VEDANTA
                                for accurate, real-time verification of news and claims.
                            </motion.p>

                            {/* Feature Pills */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.5 }}
                                className="flex flex-wrap justify-center gap-3 mb-10"
                            >
                                {features.map((feature, i) => (
                                    <div
                                        key={feature}
                                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#1A365D]/50 border border-[rgba(148,163,184,0.1)]"
                                    >
                                        <CheckCircle className="w-4 h-4 text-[#10B981]" />
                                        <span className="text-[#94A3B8] text-sm">{feature}</span>
                                    </div>
                                ))}
                            </motion.div>

                            {/* CTA Buttons */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.6 }}
                                className="flex flex-col sm:flex-row items-center justify-center gap-4"
                            >
                                <motion.button
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full sm:w-auto relative group"
                                >
                                    {/* Button glow */}
                                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#0EA5E9] to-[#8B5CF6] blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />

                                    <div className="relative flex items-center justify-center gap-3 px-10 py-4 rounded-xl bg-gradient-to-r from-[#0EA5E9] to-[#0284C7] text-white font-semibold text-lg">
                                        Start Verifying Now
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl border-2 border-[rgba(148,163,184,0.2)] text-[#94A3B8] hover:text-white hover:border-[#0EA5E9]/50 hover:bg-[#0EA5E9]/5 transition-all font-medium"
                                >
                                    <BookOpen className="w-5 h-5" />
                                    Learn More About Our Mission
                                </motion.button>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
