import { motion } from 'framer-motion'
import {
    Layers,
    FileCheck,
    Archive,
    Image,
    Radio,
    RefreshCw
} from 'lucide-react'

const features = [
    {
        icon: Layers,
        name: 'Multi-Source Verification',
        description: 'Cross-reference 10+ trusted sources instantly for comprehensive fact-checking',
        color: '#0EA5E9'
    },
    {
        icon: FileCheck,
        name: 'Claim-Level Analysis',
        description: 'Every fact verified individually, not just overall content assessment',
        color: '#10B981'
    },
    {
        icon: Archive,
        name: 'Evidence Archive',
        description: 'Timestamped source preservation for complete audit trails and legal compliance',
        color: '#F59E0B'
    },
    {
        icon: Image,
        name: 'Visual Verification',
        description: 'Reverse image search & metadata extraction for photos and videos',
        color: '#8B5CF6'
    },
    {
        icon: Radio,
        name: 'Crisis Intelligence',
        description: 'Real-time monitoring of breaking events with instant alerts',
        color: '#EF4444'
    },
    {
        icon: RefreshCw,
        name: 'Pattern Detection',
        description: 'Identify recycled misinformation from past events and viral patterns',
        color: '#EC4899'
    }
]

function FeatureCard({ feature, index }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="feature-card glass-card p-6 group cursor-default"
        >
            <div
                className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                style={{ backgroundColor: `${feature.color}20` }}
            >
                <feature.icon
                    className="w-7 h-7 transition-all duration-300"
                    style={{ color: feature.color }}
                />
            </div>

            <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-[#0EA5E9] transition-colors">
                {feature.name}
            </h3>

            <p className="text-[#94A3B8] text-sm leading-relaxed">
                {feature.description}
            </p>
        </motion.div>
    )
}

export default function FeaturesShowcase() {
    return (
        <section id="features" className="py-24 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="section-title mb-4">Powerful Features</h2>
                    <p className="text-[#94A3B8] text-lg max-w-2xl mx-auto">
                        Built for journalists, researchers, and anyone who needs to verify information quickly and accurately
                    </p>
                </motion.div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, index) => (
                        <FeatureCard
                            key={feature.name}
                            feature={feature}
                            index={index}
                        />
                    ))}
                </div>
            </div>
        </section>
    )
}
