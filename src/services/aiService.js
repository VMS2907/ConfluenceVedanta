// AI Service using OpenRouter GPT-4o-mini
// Complete credibility analysis and chatbot implementation

const OPENROUTER_API_KEY = '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'
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1'
const MODEL = 'openai/gpt-4o-mini'

// Rate limiter to prevent API abuse
const rateLimiter = {
    requests: [],
    maxRequests: 100, // per hour

    canMakeRequest() {
        const now = Date.now()
        const oneHourAgo = now - (60 * 60 * 1000)

        // Remove old requests
        this.requests = this.requests.filter(time => time > oneHourAgo)

        if (this.requests.length >= this.maxRequests) {
            return false
        }

        this.requests.push(now)
        return true
    }
}

/**
 * AI-POWERED CREDIBILITY ANALYSIS
 * Analyzes a claim against news articles using GPT-4o-mini
 */
export async function analyzeCredibilityWithAI(userClaim, newsArticles) {
    console.log('🤖 Starting AI analysis...')

    // Check rate limit
    if (!rateLimiter.canMakeRequest()) {
        console.warn('⚠️ Rate limit exceeded, using fallback')
        return getFallbackData(userClaim)
    }

    const systemPrompt = `You are an expert fact-checking AI and investigative journalism assistant. Your role is to analyze news claims with journalistic rigor and provide credibility assessments.

CREDIBILITY SCORING METHODOLOGY:
- Source Reputation (35%): Rate based on outlet's historical accuracy and editorial standards
- Cross-Source Consensus (30%): Multiple independent sources confirm the same facts
- Temporal Verification (15%): Distinguish breaking news from recycled old content
- Language Analysis (10%): Detect sensationalism, urgency manipulation, emotional triggers
- Evidence Quality (10%): Concrete facts with attribution vs speculation

SOURCE CREDIBILITY BASELINES:
- Wire Services (PTI, Reuters, ANI): 90-93
- Established National Media (NDTV, The Hindu, BBC): 85-90
- Major Newspapers (Times of India, Indian Express): 80-87
- Regional Media: 70-80
- Unverified Social Media: 20-40

RED FLAGS TO DETECT:
- Sensational language: "BREAKING", "URGENT", "SHOCKING", multiple exclamation marks
- Emotional manipulation: "Share immediately", "They don't want you to know"
- Unverified numbers: Casualty figures without official source attribution
- Conspiracy indicators: "cover-up", "hiding truth", "mainstream media won't report"
- Temporal manipulation: Old content presented as breaking news

CLAIM STATUS DEFINITIONS:
- VERIFIED (75-100): Multiple credible sources confirm with concrete evidence
- DISPUTED (40-74): Conflicting information or partial verification
- UNVERIFIED (0-39): No credible evidence found or contradicted by reliable sources

You must respond ONLY with valid JSON, no markdown formatting, no explanations outside the JSON structure.`

    const userMessage = `Analyze this claim and the sources found.

CLAIM TO VERIFY:
"${userClaim}"

SOURCES FOUND (${newsArticles.length} articles):
${newsArticles.slice(0, 10).map((article, i) => `
Source ${i + 1}:
- Outlet: ${article.source?.name || 'Unknown'}
- Title: ${article.title || 'No title'}
- Published: ${article.publishedAt || 'Unknown date'}
- Description: ${article.description || 'N/A'}
`).join('\n')}

REQUIRED ANALYSIS:

1. Extract ALL specific factual claims from the original statement
2. For EACH claim individually:
   - Determine verification status (VERIFIED/DISPUTED/UNVERIFIED)
   - Calculate credibility score 0-100
   - Document supporting/contradicting evidence
   - List which sources confirm or dispute it

3. Calculate OVERALL credibility score (0-100) using the methodology weights
4. Identify specific RED FLAGS present in the claim or sources
5. Provide contextual information (historical patterns, similar past events)

RESPOND IN THIS EXACT JSON FORMAT:
{
  "overallCredibility": 67,
  "overallStatus": "DISPUTED",
  "reasoning": "Concise 1-2 sentence explanation of overall assessment",
  "claims": [
    {
      "claimText": "Exact claim extracted from original statement",
      "status": "VERIFIED" or "DISPUTED" or "UNVERIFIED",
      "credibility": 85,
      "evidence": "Detailed explanation of what sources say with specifics",
      "sources": ["Source Name 1", "Source Name 2"]
    }
  ],
  "sourceAnalysis": [
    {
      "name": "NDTV",
      "credibilityScore": 85,
      "reputation": "Brief description of source's standing",
      "coverage": "What this specific source reported about the claim"
    }
  ],
  "redFlags": [
    "Specific red flag identified with explanation"
  ],
  "contextualInfo": "Historical context, similar past events, or patterns detected"
}

Be precise, evidence-based, and objective. Prioritize factual accuracy over speed.`

    try {
        const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'HTTP-Referer': window.location.origin,
                'X-Title': 'VEDANTA News Verifier'
            },
            body: JSON.stringify({
                model: MODEL,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userMessage }
                ],
                temperature: 0.3,
                max_tokens: 3000,
                response_format: { type: "json_object" }
            })
        })

        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`)
        }

        const data = await response.json()
        const aiResponse = data.choices[0].message.content

        console.log('✅ AI Analysis received')

        // Parse JSON response
        const analysis = JSON.parse(aiResponse)

        // Validate response structure
        if (!analysis.overallCredibility || !analysis.claims) {
            console.warn('⚠️ Invalid AI response, using fallback')
            return generateFallbackAnalysis(userClaim, newsArticles)
        }

        return analysis

    } catch (error) {
        console.error('❌ AI Analysis failed:', error.message)
        return generateFallbackAnalysis(userClaim, newsArticles)
    }
}

/**
 * REPORTER AI CHATBOT ASSISTANT
 * Intelligent chat interface for news queries
 */
export async function askReporterAI(userQuestion, context = {}) {
    console.log('💬 Reporter AI processing question...')

    // Check rate limit
    if (!rateLimiter.canMakeRequest()) {
        return {
            answer: "I'm currently at my rate limit. Please try again in a few minutes, or use the suggested questions below.",
            keySources: [],
            verificationStatus: "UNAVAILABLE",
            suggestedQuestions: [
                "What makes a source credible?",
                "How is the credibility score calculated?"
            ],
            urgencyLevel: "ROUTINE"
        }
    }

    const systemPrompt = `You are "Reporter AI" - an expert investigative journalism assistant specializing in crisis reporting and real-time fact verification.

YOUR CAPABILITIES:
- Provide accurate, verified information from credible sources
- Structure responses clearly with bullet points and sections
- Flag unverified information explicitly with appropriate caveats
- Suggest investigative next steps and follow-up questions
- Maintain journalistic objectivity and precision

RESPONSE STYLE:
- Concise but comprehensive (2-4 paragraphs maximum)
- Use bullet points for clarity when listing multiple items
- Bold key findings or important facts
- Always cite sources when making factual claims
- Distinguish between verified facts and developing information

VERIFICATION STANDARDS:
- Single source = "reported by [source]" (developing)
- Multiple sources = "confirmed by [source 1], [source 2]" (verified)
- Official sources = "according to official statement from [authority]" (authoritative)
- No sources = "unverified claim" or "no credible evidence found"

You must respond in valid JSON format with structured fields.`

    const userMessage = context.currentClaim
        ? `USER QUESTION: "${userQuestion}"

CURRENT INVESTIGATION CONTEXT:
- Claim being verified: "${context.currentClaim}"
- Sources analyzed: ${context.sources?.length || 0}
- Overall credibility: ${context.analysis?.overallCredibility || 'Unknown'}/100
- Status: ${context.analysis?.overallStatus || 'Unknown'}

Provide a helpful, journalistically rigorous response that assists the user in understanding this claim better.`
        : `USER QUESTION: "${userQuestion}"

Provide a helpful response as an investigative journalism assistant.`

    try {
        const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'HTTP-Referer': window.location.origin,
                'X-Title': 'VEDANTA Reporter AI'
            },
            body: JSON.stringify({
                model: MODEL,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userMessage }
                ],
                temperature: 0.4,
                max_tokens: 1500,
                response_format: { type: "json_object" }
            })
        })

        if (!response.ok) {
            throw new Error(`OpenRouter API error: ${response.status}`)
        }

        const data = await response.json()
        const aiResponse = JSON.parse(data.choices[0].message.content)

        console.log('✅ Reporter AI response received')

        return {
            answer: aiResponse.answer || aiResponse.response || "I'm analyzing the available information...",
            keySources: aiResponse.keySources || aiResponse.sources || [],
            verificationStatus: aiResponse.verificationStatus || aiResponse.status || "PARTIAL",
            suggestedQuestions: aiResponse.suggestedQuestions || aiResponse.suggestions || [
                "What are the most credible sources on this?",
                "Are there any contradictions in the reporting?"
            ],
            urgencyLevel: aiResponse.urgencyLevel || "ROUTINE"
        }

    } catch (error) {
        console.error('❌ Reporter AI chat failed:', error.message)

        return {
            answer: "I'm currently experiencing technical difficulties. However, based on the information available, I recommend cross-referencing multiple credible sources and looking for official statements from relevant authorities.",
            keySources: [],
            verificationStatus: "UNAVAILABLE",
            suggestedQuestions: [
                "What are the official sources saying?",
                "How many independent outlets have reported this?"
            ],
            urgencyLevel: "ROUTINE"
        }
    }
}

/**
 * FALLBACK ANALYSIS GENERATOR
 * Used when AI is unavailable
 */
function generateFallbackAnalysis(claim, articles) {
    console.log('📋 Generating fallback analysis...')

    const topSources = articles.slice(0, 5)
    const redFlags = detectBasicRedFlags(claim)

    return {
        overallCredibility: calculateBasicCredibility(articles, redFlags),
        overallStatus: determineStatus(calculateBasicCredibility(articles, redFlags)),
        reasoning: "Analysis based on available sources. " + (topSources.length > 0
            ? `Found ${topSources.length} sources covering this claim.`
            : "Limited source coverage found."),
        claims: [{
            claimText: extractMainClaim(claim),
            status: determineStatus(calculateBasicCredibility(articles, redFlags)),
            credibility: calculateBasicCredibility(articles, redFlags),
            evidence: topSources.length > 0
                ? `Covered by ${topSources.map(a => a.source.name).join(', ')}`
                : "Limited coverage in major news sources",
            sources: topSources.map(a => a.source.name)
        }],
        sourceAnalysis: topSources.map(article => ({
            name: article.source.name,
            credibilityScore: getBaseCredibility(article.source.name),
            reputation: getSourceReputation(article.source.name),
            coverage: article.title
        })),
        redFlags: redFlags,
        contextualInfo: "Analysis performed with available information. For complete verification, consult multiple independent sources."
    }
}

// Helper functions
function extractMainClaim(text) {
    const sentences = text.split(/[.!?]+/)
    return sentences[0].trim()
}

function detectBasicRedFlags(text) {
    const flags = []
    const lowerText = text.toLowerCase()

    if (/breaking|urgent|shocking/i.test(text)) {
        flags.push("Sensational language detected: 'BREAKING', 'URGENT', or 'SHOCKING'")
    }
    if (/!!!|share immediately|must see/i.test(text)) {
        flags.push("Urgency manipulation detected")
    }
    if (/cover-up|hiding|they don't want/i.test(lowerText)) {
        flags.push("Conspiracy-style language detected")
    }
    if ((text.match(/!/g) || []).length >= 3) {
        flags.push("Multiple exclamation marks (emotional manipulation indicator)")
    }

    return flags
}

function calculateBasicCredibility(articles, redFlags) {
    if (articles.length === 0) return 25

    let score = 40
    score += Math.min(articles.length * 5, 30)
    score -= redFlags.length * 10

    return Math.min(Math.max(score, 15), 85)
}

function determineStatus(score) {
    if (score >= 70) return "VERIFIED"
    if (score >= 40) return "DISPUTED"
    return "UNVERIFIED"
}

function getBaseCredibility(sourceName) {
    const credibilityScores = {
        'PTI': 92, 'Reuters': 93, 'ANI': 88, 'Associated Press': 91,
        'NDTV': 85, 'The Hindu': 88, 'Times of India': 80,
        'Indian Express': 87, 'Hindustan Times': 82,
        'BBC': 90, 'CNN': 82, 'Al Jazeera': 78,
        'The Guardian': 86, 'PIB India': 92
    }
    return credibilityScores[sourceName] || 60
}

function getSourceReputation(sourceName) {
    const reputations = {
        'PTI': 'National wire service with 70+ years of journalistic excellence',
        'Reuters': 'Global wire service, gold standard for accuracy',
        'NDTV': 'Established national TV news network',
        'The Hindu': 'India\'s newspaper of record',
        'BBC': 'British public broadcaster with global reputation'
    }
    return reputations[sourceName] || 'News outlet'
}

/**
 * COMPREHENSIVE DEMO DATA
 * For offline demonstrations
 */
function getFallbackData(claim) {
    const claimLower = claim.toLowerCase()

    // Check comprehensive demo data
    if (claimLower.includes('kerala') && claimLower.includes('flood')) {
        return {
            overallCredibility: 67,
            overallStatus: 'DISPUTED',
            reasoning: 'Flood event is verified by multiple credible sources, but casualty numbers are significantly disputed and conspiracy claims lack any supporting evidence.',
            claims: [
                {
                    claimText: 'Massive floods in Kerala',
                    status: 'VERIFIED',
                    credibility: 95,
                    evidence: 'Heavy rainfall and flooding in multiple Kerala districts confirmed by NDTV, Times of India, PIB India. NDRF teams deployed.',
                    sources: ['NDTV', 'Times of India', 'PIB India', 'Reuters']
                },
                {
                    claimText: '500 casualties reported',
                    status: 'DISPUTED',
                    credibility: 30,
                    evidence: 'Official government count states 23 casualties. The figure of 500 appears to be unverified social media speculation.',
                    sources: ['Unverified social media']
                },
                {
                    claimText: 'Government cover-up alleged',
                    status: 'UNVERIFIED',
                    credibility: 10,
                    evidence: 'No credible sources support allegations of cover-up. This appears to be conspiracy speculation without factual basis.',
                    sources: []
                }
            ],
            sourceAnalysis: [
                {
                    name: 'NDTV',
                    credibilityScore: 85,
                    reputation: 'Established national TV news network with 30+ years history',
                    coverage: 'Reports flooding in multiple districts with 23 confirmed casualties'
                },
                {
                    name: 'PIB India',
                    credibilityScore: 92,
                    reputation: 'Official Press Information Bureau - Government press agency',
                    coverage: 'Official casualty count: 23 deaths as of latest update'
                }
            ],
            redFlags: [
                'Extreme casualty number discrepancy: 500 vs official count of 23',
                'Conspiracy language detected: "hiding", "cover-up"',
                'Urgency manipulation: Multiple exclamation marks'
            ],
            contextualInfo: 'Historical pattern: Similar inflated claims circulated during 2018 Kerala floods and were debunked. Misinformation amplifies during crises.'
        }
    }

    // Generic fallback
    return generateFallbackAnalysis(claim, [])
}
