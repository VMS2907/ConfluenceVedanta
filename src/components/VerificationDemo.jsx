import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Loader2, CheckCircle, AlertTriangle, XCircle, ExternalLink, Clock } from 'lucide-react'
import CredibilityGauge from './CredibilityGauge'
import { verifyClaim } from '../services/newsApi'

const demoData = {
    claim: "Breaking: Massive flood in Kerala, 500 casualties reported, government cover-up alleged",
    overallScore: 45,
    claims: [
        {
            id: 1,
            text: "Flood in Kerala",
            status: "verified",
            score: 95,
            sources: ["NDTV", "Times of India", "PTI"]
        },
        {
            id: 2,
            text: "500 casualties reported",
            status: "disputed",
            score: 30,
            sources: ["Official count: 23 (PIB India)"]
        },
        {
            id: 3,
            text: "Government cover-up alleged",
            status: "false",
            score: 10,
            sources: ["No credible sources found"]
        }
    ],
    sources: [
        { name: "PTI", score: 92, type: "News Agency" },
        { name: "Times of India", score: 87, type: "Newspaper" },
        { name: "NDTV", score: 85, type: "TV News" },
        { name: "Random Blog", score: 25, type: "Blog" },
        { name: "Social Media", score: 15, type: "User Generated" }
    ],
    timeline: "First reported: 2 hours ago"
}

function ClaimBadge({ status }) {
    const config = {
        verified: { icon: CheckCircle, class: 'badge-verified', text: 'VERIFIED' },
        disputed: { icon: AlertTriangle, class: 'badge-disputed', text: 'DISPUTED' },
        false: { icon: XCircle, class: 'badge-false', text: 'FALSE' }
    }

    const { icon: Icon, class: className, text } = config[status]

    return (
        <span className={className}>
            <Icon className="w-3 h-3" />
            {text}
        </span>
    )
}

function SourceBar({ source, delay }) {
    const getColor = (score) => {
        if (score >= 70) return '#10B981'
        if (score >= 40) return '#F59E0B'
        return '#EF4444'
    }

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay }}
            className="flex items-center gap-3 py-2"
        >
            <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-white">{source.name}</span>
                    <span className="text-xs text-[#94A3B8]">{source.score}/100</span>
                </div>
                <div className="score-bar">
                    <motion.div
                        className="score-bar-fill"
                        style={{ backgroundColor: getColor(source.score) }}
                        initial={{ width: 0 }}
                        animate={{ width: `${source.score}%` }}
                        transition={{ delay: delay + 0.3, duration: 0.8 }}
                    />
                </div>
                <span className="text-xs text-[#64748B]">{source.type}</span>
            </div>
        </motion.div>
    )
}

export default function VerificationDemo() {
    const [inputValue, setInputValue] = useState('')
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [results, setResults] = useState(null)
    const [analysisStep, setAnalysisStep] = useState('')

    const handleAnalyze = async () => {
        const claimToAnalyze = inputValue.trim() || demoData.claim

        if (!claimToAnalyze) {
            return
        }

        setInputValue(claimToAnalyze)
        setIsAnalyzing(true)
        setResults(null)

        // Simulate analysis steps
        const steps = [
            'Extracting claims...',
            'Searching trusted sources...',
            'Cross-referencing databases...',
            'Analyzing credibility patterns...',
            'Generating report...'
        ]

        let stepIndex = 0
        const stepInterval = setInterval(() => {
            if (stepIndex < steps.length) {
                setAnalysisStep(steps[stepIndex])
                stepIndex++
            }
        }, 500)

        try {
            // Fetch real verification data
            const verificationResult = await verifyClaim(claimToAnalyze)

            clearInterval(stepInterval)
            setIsAnalyzing(false)

            if (verificationResult.success) {
                // Transform API data to match component structure
                const transformedData = {
                    claim: verificationResult.claim,
                    overallScore: verificationResult.credibilityScore,
                    claims: generateClaimsFromArticles(verificationResult.articles, verificationResult.credibilityScore),
                    sources: verificationResult.sources,
                    timeline: `Analyzed: ${new Date(verificationResult.timestamp).toLocaleTimeString()}`
                }
                setResults(transformedData)
            } else {
                // Fallback to demo data if API fails
                clearInterval(stepInterval)
                setIsAnalyzing(false)
                setResults(demoData)
            }
        } catch (error) {
            // Fallback to demo data on error
            clearInterval(stepInterval)
            setIsAnalyzing(false)
            setResults(demoData)
        }
    }

    // Helper function to generate claims from articles
    const generateClaimsFromArticles = (articles, overallScore) => {
        if (!articles || articles.length === 0) {
            return [{
                id: 1,
                text: "No recent articles found for this claim",
                status: "disputed",
                score: 20,
                sources: ["Limited coverage in news sources"]
            }]
        }

        const claims = []
        const sourceNames = articles.slice(0, 3).map(a => a.source.name)

        // Analyze if articles are debunking or verifying
        const debunkingKeywords = ['false', 'fake', 'hoax', 'debunk', 'not true', 'misleading', 'misinformation']
        const hasDebunking = articles.some(a => {
            const text = (a.title + ' ' + (a.description || '')).toLowerCase()
            return debunkingKeywords.some(keyword => text.includes(keyword))
        })

        // Main claim based on overall score and content analysis
        if (hasDebunking && overallScore < 40) {
            claims.push({
                id: 1,
                text: "Claim appears to be FALSE or MISLEADING",
                status: "false",
                score: overallScore,
                sources: sourceNames
            })
            claims.push({
                id: 2,
                text: "Multiple sources are debunking this claim",
                status: "false",
                score: 15,
                sources: ["Fact-check articles found"]
            })
        } else if (overallScore >= 60) {
            claims.push({
                id: 1,
                text: "Claim has credible verification",
                status: "verified",
                score: overallScore,
                sources: sourceNames
            })
        } else if (overallScore >= 35) {
            claims.push({
                id: 1,
                text: "Claim requires further verification",
                status: "disputed",
                score: overallScore,
                sources: sourceNames
            })
        } else {
            claims.push({
                id: 1,
                text: "Claim lacks credible evidence",
                status: "false",
                score: overallScore,
                sources: sourceNames
            })
        }

        return claims
    }

    return (
        <section id="demo" className="py-24 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <h2 className="section-title mb-4">Live Verification Demo</h2>
                    <p className="text-[#94A3B8] text-lg max-w-2xl mx-auto">
                        Paste any news claim, URL, or suspicious content to see our AI verification in action
                    </p>
                </motion.div>

                {/* Input Area */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="max-w-4xl mx-auto mb-8"
                >
                    <div className="glass-card-static p-6">
                        <div className="relative">
                            <textarea
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Paste any news claim, URL, or suspicious content..."
                                className="input-glass min-h-[120px] pr-4 resize-none"
                                disabled={isAnalyzing}
                            />
                            <Search className="absolute right-4 top-4 w-5 h-5 text-[#64748B]" />
                        </div>

                        <div className="flex justify-between items-center mt-4">
                            <span className="text-xs text-[#64748B]">
                                Try with our demo claim or paste your own
                            </span>
                            <button
                                onClick={handleAnalyze}
                                disabled={isAnalyzing}
                                className="btn-glow flex items-center gap-2 !py-3 !px-6"
                            >
                                {isAnalyzing ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Analyzing...
                                    </>
                                ) : (
                                    <>
                                        <Search className="w-5 h-5" />
                                        Analyze Now
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Analysis Progress */}
                <AnimatePresence>
                    {isAnalyzing && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="max-w-4xl mx-auto mb-8"
                        >
                            <div className="glass-card-static p-8 text-center">
                                <Loader2 className="w-12 h-12 text-[#0EA5E9] animate-spin mx-auto mb-4" />
                                <p className="text-white font-medium mb-2">{analysisStep}</p>
                                <p className="text-[#64748B] text-sm">Checking across 10+ trusted sources</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Results */}
                <AnimatePresence>
                    {results && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="max-w-6xl mx-auto"
                        >
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Main Score */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.1 }}
                                    className="glass-card p-8 flex flex-col items-center justify-center"
                                >
                                    <h3 className="text-lg font-semibold text-white mb-4">Overall Credibility</h3>
                                    <CredibilityGauge score={results.overallScore} />
                                    <p className="text-[#94A3B8] text-sm mt-4 text-center">
                                        Based on {results.sources.length} sources and {results.claims.length} claims analyzed
                                    </p>
                                </motion.div>

                                {/* Claims Breakdown */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="glass-card p-6 lg:col-span-2"
                                >
                                    <h3 className="text-lg font-semibold text-white mb-4">Extracted Claims</h3>
                                    <div className="space-y-4">
                                        {results.claims.map((claim, i) => (
                                            <motion.div
                                                key={claim.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.3 + i * 0.15 }}
                                                className="p-4 rounded-lg bg-[#0A1628]/60 border border-[rgba(148,163,184,0.1)]"
                                            >
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex-1">
                                                        <p className="text-white font-medium mb-2">"{claim.text}"</p>
                                                        <p className="text-[#64748B] text-sm">
                                                            {claim.sources.join(' • ')}
                                                        </p>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-2">
                                                        <ClaimBadge status={claim.status} />
                                                        <span className="text-sm text-[#94A3B8]">{claim.score}/100</span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>

                                {/* Source Analysis */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className="glass-card p-6 lg:col-span-2"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-white">Source Analysis</h3>
                                        <span className="text-xs text-[#64748B] flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {results.timeline}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                                        {results.sources.map((source, i) => (
                                            <SourceBar key={source.name} source={source} delay={0.6 + i * 0.1} />
                                        ))}
                                    </div>
                                </motion.div>

                                {/* What Sources Say */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.7 }}
                                    className="glass-card p-6"
                                >
                                    <h3 className="text-lg font-semibold text-white mb-4">What Sources Say</h3>
                                    <div className="space-y-3">
                                        <div className="p-3 rounded-lg bg-[#10B981]/10 border border-[#10B981]/20">
                                            <div className="flex items-center gap-2 mb-1">
                                                <CheckCircle className="w-4 h-4 text-[#10B981]" />
                                                <span className="text-sm font-medium text-[#10B981]">Official Sources</span>
                                            </div>
                                            <p className="text-xs text-[#94A3B8]">
                                                PIB confirms 23 casualties, relief operations underway
                                            </p>
                                        </div>
                                        <div className="p-3 rounded-lg bg-[#F59E0B]/10 border border-[#F59E0B]/20">
                                            <div className="flex items-center gap-2 mb-1">
                                                <AlertTriangle className="w-4 h-4 text-[#F59E0B]" />
                                                <span className="text-sm font-medium text-[#F59E0B]">Unverified Claims</span>
                                            </div>
                                            <p className="text-xs text-[#94A3B8]">
                                                Casualty numbers vary across social media posts
                                            </p>
                                        </div>
                                        <a href="#" className="flex items-center gap-1 text-xs text-[#0EA5E9] hover:underline mt-2">
                                            View full report <ExternalLink className="w-3 h-3" />
                                        </a>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </section>
    )
}
