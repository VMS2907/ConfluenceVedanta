import { motion } from 'framer-motion'

// Shimmer animation CSS
const shimmerStyle = {
    backgroundImage: 'linear-gradient(90deg, transparent, rgba(14, 165, 233, 0.1), transparent)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite'
}

export function SkeletonCard({ className = '' }) {
    return (
        <div className={`glass-card-static p-6 ${className}`}>
            <div className="animate-pulse space-y-4">
                <div className="h-4 bg-[var(--navy-light)] rounded w-1/3" style={shimmerStyle}></div>
                <div className="space-y-2">
                    <div className="h-3 bg-[var(--navy-light)] rounded" style={shimmerStyle}></div>
                    <div className="h-3 bg-[var(--navy-light)] rounded w-5/6" style={shimmerStyle}></div>
                </div>
            </div>
        </div>
    )
}

export function SkeletonText({ className = '', width = 'full' }) {
    const widthClasses = {
        full: 'w-full',
        '3/4': 'w-3/4',
        '2/3': 'w-2/3',
        '1/2': 'w-1/2',
        '1/3': 'w-1/3',
        '1/4': 'w-1/4'
    }

    return (
        <div
            className={`h-4 bg-[var(--navy-light)] rounded ${widthClasses[width]} ${className}`}
            style={shimmerStyle}
        ></div>
    )
}

export function SkeletonCircle({ size = 'md', className = '' }) {
    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-12 h-12',
        lg: 'w-16 h-16',
        xl: 'w-24 h-24'
    }

    return (
        <div
            className={`${sizeClasses[size]} bg-[var(--navy-light)] rounded-full ${className}`}
            style={shimmerStyle}
        ></div>
    )
}

export function SkeletonButton({ className = '' }) {
    return (
        <div
            className={`h-12 bg-[var(--navy-light)] rounded-lg w-32 ${className}`}
            style={shimmerStyle}
        ></div>
    )
}

export function VerificationResultsSkeleton() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-6xl mx-auto"
        >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Score Skeleton */}
                <div className="glass-card-static p-8 flex flex-col items-center justify-center">
                    <SkeletonText width="1/2" className="mb-4" />
                    <SkeletonCircle size="xl" className="mb-4" />
                    <SkeletonText width="3/4" />
                </div>

                {/* Claims Skeleton */}
                <div className="glass-card-static p-6 lg:col-span-2">
                    <SkeletonText width="1/3" className="mb-4" />
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="p-4 rounded-lg bg-[var(--navy-deep)]/60 border border-[var(--border-glass)]">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 space-y-2">
                                        <SkeletonText width="full" />
                                        <SkeletonText width="2/3" />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <div className="w-20 h-6 bg-[var(--navy-light)] rounded-full" style={shimmerStyle}></div>
                                        <SkeletonText width="1/4" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sources Skeleton */}
                <div className="glass-card-static p-6 lg:col-span-2">
                    <SkeletonText width="1/3" className="mb-4" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="py-3 space-y-2">
                                <div className="flex justify-between items-center">
                                    <SkeletonText width="1/3" />
                                    <SkeletonText width="1/4" />
                                </div>
                                <div className="h-1 bg-[var(--navy-deep)] rounded">
                                    <div className="h-full bg-[var(--navy-light)] rounded w-3/4" style={shimmerStyle}></div>
                                </div>
                                <SkeletonText width="1/4" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Evidence Skeleton */}
                <div className="glass-card-static p-6">
                    <SkeletonText width="1/2" className="mb-4" />
                    <div className="space-y-3">
                        {[1, 2].map((i) => (
                            <div key={i} className="p-3 rounded-lg bg-[var(--navy-deep)]/30 border border-[var(--border-glass)]">
                                <div className="flex items-center gap-2 mb-2">
                                    <SkeletonCircle size="sm" />
                                    <SkeletonText width="1/3" />
                                </div>
                                <SkeletonText width="full" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

export default {
    Card: SkeletonCard,
    Text: SkeletonText,
    Circle: SkeletonCircle,
    Button: SkeletonButton,
    VerificationResults: VerificationResultsSkeleton
}
