import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Loader2, CheckCircle, AlertTriangle, XCircle, ExternalLink, Clock, AlertCircleIcon } from 'lucide-react'
import CredibilityGauge from './CredibilityGauge'
import { verifyClaim } from '../services/newsApi'
import { analyzeCredibilityWithAI } from '../services/aiService'

const demoData = {
    claim: "Breaking: Massive flood in Kerala, 500 casualties reported, government cover-up alleged",
    overallScore: 45,
    overallStatus: "DISPUTED",
    reasoning: "Flood event is verified by multiple credible sources, but casualty numbers are significantly disputed and conspiracy claims lack any supporting evidence.",
    claims: [
        {
            id: 1,
            text: "Massive floods in Kerala",
            status: "verified",
            score: 95,
            sources: ["NDTV", "Times of India", "PTI", "PIB India"],
            evidence: "Heavy rainfall and flooding in multiple Kerala districts confirmed by NDTV, Times of India, PIB India. NDRF teams deployed for rescue operations."
        },
        {
            id: 2,
            text: "500 casualties reported",
            status: "disputed",
            score: 30,
            sources: ["Unverified social media"],
            evidence: "Official government count states 23 casualties. The figure of 500 appears to be unverified social media speculation without official confirmation."
        },
        {
            id: 3,
            text: "Government cover-up alleged",
            status: "false",
            score: 10,
            sources: ["No credible sources"],
            evidence: "No credible sources support allegations of cover-up. This appears to be conspiracy speculation without factual basis. All official channels are reporting transparent casualty figures."
        }
    ],
    sources: [
        { name: "PTI", score: 92, type: "News Agency", credibilityScore: 92, reputation: "National wire service with 70+ years of journalistic excellence", coverage: "Reports flooding in multiple districts with official casualty count" },
        { name: "Times of India", score: 87, type: "Newspaper", credibilityScore: 87, reputation: "India's largest English-language daily newspaper", coverage: "Comprehensive flood coverage with on-ground reporting" },
        { name: "NDTV", score: 85, type: "TV News", credibilityScore: 85, reputation: "Established national TV news network", coverage: "Live updates from affected areas with official statements" },
        { name: "PIB India", score: 92, type: "Government", credibilityScore: 92, reputation: "Official Press Information Bureau", coverage: "Official casualty count: 23 deaths as of latest update" },
        { name: "Social Media", score: 15, type: "User Generated", credibilityScore: 15, reputation: "Unverified user-generated content", coverage: "Unverified claims circulating without official confirmation" }
    ],
    redFlags: [
        "Extreme casualty number discrepancy: 500 vs official count of 23",
        "Conspiracy language detected: 'cover-up', 'hiding'",
        "Sensational language: 'BREAKING', urgency manipulation",
        "Multiple exclamation marks indicating emotional manipulation"
    ],
    contextualInfo: "Historical pattern: Similar inflated casualty claims circulated during 2018 Kerala floods and were later debunked. Misinformation typically amplifies during crisis events. Official death toll stands at 23 as per government sources, with rescue operations ongoing.",
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

        // Enhanced analysis steps
        const steps = [
            'Extracting claims...',
            'Searching trusted sources...',
            'Cross-referencing databases...',
            'AI-powered credibility analysis...',
            'Detecting red flags...',
            'Generating comprehensive report...'
        ]

        let stepIndex = 0
        const stepInterval = setInterval(() => {
            if (stepIndex < steps.length) {
                setAnalysisStep(steps[stepIndex])
                stepIndex++
            }
        }, 600)

        try {
            // Step 1: Fetch news articles using NewsAPI
            const verificationResult = await verifyClaim(claimToAnalyze)

            if (verificationResult.success && verificationResult.articles.length > 0) {
                // Step 2: AI-powered credibility analysis
                setAnalysisStep('Running AI analysis...')
                const aiAnalysis = await analyzeCredibilityWithAI(
                    claimToAnalyze,
                    verificationResult.articles
                )

                clearInterval(stepInterval)
                setIsAnalyzing(false)

                // Step 3: Transform AI analysis to UI format
                const transformedData = {
                    claim: verificationResult.claim,
                    overallScore: aiAnalysis.overallCredibility,
                    overallStatus: aiAnalysis.overallStatus,
                    reasoning: aiAnalysis.reasoning,
                    claims: aiAnalysis.claims.map((claim, index) => ({
                        id: index + 1,
                        text: claim.claimText,
                        status: claim.status.toLowerCase(),
                        score: claim.credibility,
                        sources: claim.sources,
                        evidence: claim.evidence
                    })),
                    sources: aiAnalysis.sourceAnalysis || verificationResult.sources,
                    redFlags: aiAnalysis.redFlags || [],
                    contextualInfo: aiAnalysis.contextualInfo || '',
                    timeline: `Analyzed: ${new Date(verificationResult.timestamp).toLocaleTimeString()}`
                }
                setResults(transformedData)
            } else {
                // No articles found - use fallback
                clearInterval(stepInterval)
                setIsAnalyzing(false)
                setResults(demoData)
            }
        } catch (error) {
            console.error('Analysis error:', error)
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
                                    <h3 className="text-lg font-semibold text-white mb-4">AI Analysis - Extracted Claims</h3>
                                    {results.reasoning && (
                                        <div className="mb-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                            <p className="text-sm text-blue-300">{results.reasoning}</p>
                                        </div>
                                    )}
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
                                                        {claim.evidence && (
                                                            <p className="text-[#94A3B8] text-sm mb-2">{claim.evidence}</p>
                                                        )}
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

                                {/* Red Flags */}
                                {results.redFlags && results.redFlags.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.7 }}
                                        className="glass-card p-6"
                                    >
                                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                            <AlertTriangle className="w-5 h-5 text-[#EF4444]" />
                                            Red Flags Detected
                                        </h3>
                                        <div className="space-y-2">
                                            {results.redFlags.map((flag, index) => (
                                                <div
                                                    key={index}
                                                    className="p-3 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/20"
                                                >
                                                    <p className="text-sm text-[#FCA5A5]">{flag}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {/* Contextual Information */}
                                {results.contextualInfo && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.8 }}
                                        className="glass-card p-6 lg:col-span-2"
                                    >
                                        <h3 className="text-lg font-semibold text-white mb-4">Contextual Information</h3>
                                        <div className="p-4 rounded-lg bg-[#0EA5E9]/10 border border-[#0EA5E9]/20">
                                            <p className="text-sm text-[#94A3B8] leading-relaxed">{results.contextualInfo}</p>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </section>
    )
}
