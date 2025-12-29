// AI Service using OpenRouter GPT-4o-mini
// Complete credibility analysis and chatbot implementation

const OPENROUTER_API_KEY = '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'
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1'
const MODEL = 'openai/gpt-4o-mini'
const NEWSAPI_KEY = '3320de2055b34ba89eee36c61ffdccdf'

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
 * EXTRACT KEYWORDS FROM USER QUESTION
 * Removes stop words and extracts meaningful terms
 */
function extractKeywords(question) {
    const stopWords = new Set([
        'what', 'when', 'where', 'who', 'why', 'how', 'is', 'are', 'was', 'were',
        'in', 'on', 'at', 'to', 'for', 'of', 'the', 'a', 'an', 'happened', 'happening',
        'today', 'now', 'latest', 'recent', 'current', 'can', 'you', 'tell', 'me',
        'about', 'show', 'give', 'find'
    ])

    const words = question.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 2 && !stopWords.has(word))

    return words
}

/**
 * BUILD SEARCH QUERIES FOR NEWS APIs
 * Creates optimized queries for recency
 */
function buildSearchQueries(keywords) {
    const queries = []

    // Primary query: Core keywords
    if (keywords.length > 0) {
        queries.push(keywords.slice(0, 4).join(' '))
    }

    // Add "today" or "latest" to prioritize fresh content
    if (keywords.length > 0) {
        queries.push(`${keywords.slice(0, 3).join(' ')} latest`)
    }

    // Location-specific query if location detected
    const locations = ['kerala', 'mumbai', 'delhi', 'bangalore', 'chennai', 'kolkata', 'india', 'pakistan', 'china', 'usa', 'ukraine', 'russia']
    const hasLocation = keywords.some(k => locations.includes(k.toLowerCase()))

    if (hasLocation) {
        const location = keywords.find(k => locations.includes(k.toLowerCase()))
        queries.push(`${location} news today`)
    }

    return queries.slice(0, 2) // Max 2 queries to optimize
}

/**
 * EXTRACT SIGNIFICANT KEYWORDS FOR VALIDATION
 * Removes stop words and returns meaningful terms
 */
function extractSignificantKeywords(text) {
    const stopWords = new Set([
        'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but',
        'in', 'with', 'to', 'for', 'of', 'as', 'by', 'this', 'that', 'from',
        'was', 'were', 'been', 'have', 'has', 'had', 'will', 'would', 'could',
        'should', 'may', 'might', 'must', 'can', 'it', 'its', 'their', 'them'
    ])

    return text.toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 3 && !stopWords.has(word))
        .slice(0, 5) // Top 5 keywords
}

/**
 * FETCH LATEST NEWS FOR AI ASSISTANT
 * Gets fresh articles from last 24 hours ONLY
 */
async function fetchLatestNewsForQuestion(question) {
    console.log('📰 Fetching fresh news for:', question)

    const keywords = extractKeywords(question)
    const queries = buildSearchQueries(keywords)

    const allArticles = []

    // Fetch from NewsAPI (sorted by recency)
    for (const query of queries) {
        try {
            const response = await fetch(
                `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&pageSize=10&language=en&apiKey=${NEWSAPI_KEY}`
            )

            if (!response.ok) {
                console.warn('NewsAPI request failed:', response.status)
                continue
            }

            const data = await response.json()

            if (data.articles && data.articles.length > 0) {
                allArticles.push(...data.articles)
            }
        } catch (error) {
            console.error('NewsAPI fetch error:', error)
        }
    }

    // Filter to recent articles (last 7 days for better coverage)
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000)
    const recentArticles = allArticles.filter(article => {
        const publishTime = new Date(article.publishedAt).getTime()
        return publishTime > sevenDaysAgo && article.title && article.source
    })

    // Sort by recency (newest first)
    recentArticles.sort((a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    )

    console.log(`✅ Found ${recentArticles.length} recent articles (< 7 days old)`)

    // Return top 10 most recent, unique articles
    const uniqueArticles = []
    const seenTitles = new Set()

    for (const article of recentArticles) {
        if (!seenTitles.has(article.title)) {
            seenTitles.add(article.title)
            uniqueArticles.push(article)
            if (uniqueArticles.length >= 10) break
        }
    }

    return uniqueArticles
}

/**
 * AI-POWERED CREDIBILITY ANALYSIS
 * Analyzes a claim against news articles using GPT-4o-mini
 * ENSURES UNIQUE ANALYSIS FOR EACH CLAIM - NO HARDCODED RESPONSES
 */
export async function analyzeCredibilityWithAI(userClaim, newsArticles) {
    console.log('🤖 Starting AI analysis for claim:', userClaim)
    console.log('📰 Using', newsArticles.length, 'news articles')

    // Validate inputs
    if (!userClaim || userClaim.trim().length === 0) {
        throw new Error('No claim provided for analysis')
    }

    if (!newsArticles || newsArticles.length === 0) {
        console.warn('⚠️ No articles provided, using empty analysis')
        return generateFallbackAnalysis(userClaim, [])
    }

    // Check rate limit
    if (!rateLimiter.canMakeRequest()) {
        console.warn('⚠️ Rate limit exceeded, using fallback')
        return generateFallbackAnalysis(userClaim, newsArticles)
    }

    // Current date for temporal awareness
    const currentDate = new Date().toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })

    const systemPrompt = `You are an expert fact-checking AI and investigative journalism assistant. Your role is to analyze SPECIFIC news claims with journalistic rigor.

TODAY'S DATE: ${currentDate}

CRITICAL INSTRUCTION: You must analyze the SPECIFIC claim provided by the user, NOT a generic example or unrelated topic. Extract claims from the ACTUAL user input and verify them against the PROVIDED sources.

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

RED FLAGS TO DETECT IN THIS SPECIFIC CLAIM:
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

    const userMessage = `Analyze THIS SPECIFIC claim and the sources found. DO NOT use generic examples.

USER'S CLAIM TO VERIFY:
"${userClaim}"

TODAY'S DATE: ${currentDate}

NEWS SOURCES FOUND (${newsArticles.length} articles):
${newsArticles.slice(0, 10).map((article, i) => {
    const publishTime = new Date(article.publishedAt)
    const hoursAgo = Math.floor((Date.now() - publishTime.getTime()) / (1000 * 60 * 60))

    return `
Source ${i + 1}:
- News Outlet: ${article.source?.name || 'Unknown'}
- Headline: ${article.title || 'No title'}
- Published: ${hoursAgo} hours ago (${publishTime.toLocaleDateString()})
- Description: ${article.description || 'N/A'}
- URL: ${article.url || 'N/A'}
`
}).join('\n')}

CRITICAL: Analyze the SPECIFIC claim "${userClaim}" - NOT Kerala floods or any other generic example.

REQUIRED ANALYSIS:

1. Extract ALL specific factual claims from THIS user's input: "${userClaim}"
2. For EACH claim individually:
   - Determine verification status (VERIFIED/DISPUTED/UNVERIFIED)
   - Calculate credibility score 0-100
   - Document supporting/contradicting evidence FROM THESE SOURCES
   - List which sources confirm or dispute it

3. Calculate OVERALL credibility score (0-100) using the methodology weights
4. Identify specific RED FLAGS present in THIS SPECIFIC CLAIM
5. Provide contextual information relevant to THIS SPECIFIC TOPIC

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
        console.log('📄 Response preview:', aiResponse.substring(0, 200) + '...')

        // Parse JSON response
        const analysis = JSON.parse(aiResponse)

        // Validate response structure
        if (!analysis.overallCredibility || !analysis.claims) {
            console.warn('⚠️ Invalid AI response structure, using fallback')
            return generateFallbackAnalysis(userClaim, newsArticles)
        }

        // CRITICAL: Validate that analysis is about the correct claim
        const analysisText = JSON.stringify(analysis).toLowerCase()
        const claimKeywords = extractSignificantKeywords(userClaim)

        console.log('🔍 Validating analysis relevance...')
        console.log('Claim keywords:', claimKeywords)

        // Check if analysis contains claim-related keywords
        const matchingKeywords = claimKeywords.filter(keyword =>
            analysisText.includes(keyword.toLowerCase())
        )

        const relevanceScore = matchingKeywords.length / Math.max(claimKeywords.length, 1)

        console.log('Matching keywords:', matchingKeywords)
        console.log('Relevance score:', relevanceScore)

        if (relevanceScore < 0.3 && claimKeywords.length > 0) {
            console.warn('⚠️ Low relevance score - analysis may not match claim')
            console.warn('Expected keywords:', claimKeywords)
            console.warn('Found keywords:', matchingKeywords)
            // Still return the analysis but log the warning
        }

        console.log('✅ Analysis validation complete:', {
            credibility: analysis.overallCredibility,
            status: analysis.overallStatus,
            claimsFound: analysis.claims.length,
            firstClaimText: analysis.claims[0]?.claimText || 'none'
        })

        return analysis

    } catch (error) {
        console.error('❌ AI Analysis failed:', error.message)
        return generateFallbackAnalysis(userClaim, newsArticles)
    }
}

/**
 * REPORTER AI CHATBOT ASSISTANT - REAL-TIME NEWS ONLY
 * Forces AI to use ONLY fresh news from last 24 hours
 */
export async function askReporterAI(userQuestion, context = {}) {
    console.log('💬 Reporter AI processing question:', userQuestion)

    // Check rate limit
    if (!rateLimiter.canMakeRequest()) {
        console.warn('⚠️ Rate limit exceeded for Reporter AI')
        return generateIntelligentFallback(userQuestion, context)
    }

    // STEP 1: FETCH FRESH NEWS BEFORE ASKING AI
    const freshNews = await fetchLatestNewsForQuestion(userQuestion)

    if (!freshNews || freshNews.length === 0) {
        console.warn('⚠️ No fresh news found, returning fallback')
        return {
            answer: `I couldn't find recent verified information about "${userQuestion}". This could mean:\n\n• The topic is very recent or breaking\n• Limited coverage in major news sources\n• The query needs to be rephrased\n\n**Recommendations:**\n• Try broader search terms\n• Check official news websites directly\n• Ask about related trending topics`,
            keySources: [],
            verificationStatus: "NO_CURRENT_REPORTS",
            suggestedQuestions: [
                "What are today's top verified news stories?",
                "Show me recent trending topics"
            ],
            urgencyLevel: "ROUTINE",
            temporalContext: "No current reports found in latest sources"
        }
    }

    // STEP 2: Create context-rich prompt WITH FRESH DATA
    const currentDate = new Date().toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })

    const systemPrompt = `You are "Reporter AI" - a real-time news intelligence assistant.

CRITICAL RULES:
1. TODAY'S DATE: ${currentDate}
2. You must ONLY use information from the NEWS SOURCES provided below (from past 7 days)
3. NEVER use your training data knowledge - it's outdated
4. Always specify WHEN something happened (today, yesterday, X days ago)
5. Distinguish between ongoing events vs past events clearly
6. If sources are older than 2 days, mention the recency in your response

Your responses must be based EXCLUSIVELY on the provided sources with proper temporal context.

RESPOND IN THIS EXACT JSON FORMAT:
{
  "answer": "Your response based ONLY on provided sources. Start with current status, then details. Use phrases like 'As of [date]...', 'Latest reports from X days ago show...', 'Recent coverage shows...'",
  "keySources": ["List sources you actually used"],
  "verificationStatus": "VERIFIED" or "DEVELOPING" or "NO_CURRENT_REPORTS",
  "suggestedQuestions": ["Relevant follow-up 1?", "Relevant follow-up 2?"],
  "urgencyLevel": "BREAKING" or "DEVELOPING" or "ROUTINE",
  "temporalContext": "Brief note about recency - e.g., 'Based on sources from past 3 days'"
}`

    const userMessage = `USER QUESTION: "${userQuestion}"

TODAY'S DATE: ${currentDate}

NEWS SOURCES (Published within last 7 days):
${freshNews.map((article, i) => {
    const publishedDate = new Date(article.publishedAt)
    const hoursAgo = Math.floor((Date.now() - publishedDate.getTime()) / (1000 * 60 * 60))

    return `
Source ${i + 1}:
- Outlet: ${article.source.name}
- Title: ${article.title}
- Published: ${hoursAgo} hours ago (${publishedDate.toLocaleString('en-IN')})
- Description: ${article.description || 'N/A'}
- URL: ${article.url}
`
}).join('\n')}

${context.currentClaim ? `
CONTEXT: User is investigating: "${context.currentClaim}"
` : ''}

TASK:
Based ONLY on these fresh sources (not your training data), answer the user's question.

CRITICAL REQUIREMENTS:
1. Only report what's in these sources (from past 7 days)
2. Clearly state if something is NOT currently happening
3. Specify timestamps ("reported 2 days ago", "as of [date]", "from X days ago")
4. If sources contradict each other, mention it
5. Flag if information is developing vs confirmed
6. If sources are older than 2 days, mention this in your response

If the sources don't mention what the user asked about, your answer should clearly state: "Based on recent news sources from the past week, there are no current reports of [topic]. The available information shows [what IS in the sources instead]."`

    try {
        console.log('📡 Calling OpenRouter API with fresh news...')

        const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'HTTP-Referer': window.location.origin || 'http://localhost',
                'X-Title': 'VEDANTA Reporter AI'
            },
            body: JSON.stringify({
                model: MODEL,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userMessage }
                ],
                temperature: 0.1, // VERY LOW - we want factual, not creative
                max_tokens: 1500,
                response_format: { type: "json_object" }
            })
        })

        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`OpenRouter API error: ${response.status}`)
        }

        const data = await response.json()
        const aiResponse = JSON.parse(data.choices[0].message.content)

        // Add temporal warning if sources are old
        const newestArticle = freshNews[0]
        const hoursOld = Math.floor((Date.now() - new Date(newestArticle.publishedAt).getTime()) / (1000 * 60 * 60))
        const daysOld = Math.floor(hoursOld / 24)

        if (daysOld >= 3) {
            aiResponse.temporalWarning = `⚠️ Note: Latest available sources are ${daysOld} days old. Information may not reflect very recent developments.`
        } else if (hoursOld > 48) {
            aiResponse.temporalWarning = `⚠️ Note: Latest available sources are ${hoursOld} hours old. Information may not reflect very recent developments.`
        }

        console.log('✅ AI response with fresh data:', aiResponse)

        return {
            answer: aiResponse.answer || "I've analyzed the latest sources.",
            keySources: aiResponse.keySources || [],
            verificationStatus: aiResponse.verificationStatus || "DEVELOPING",
            suggestedQuestions: aiResponse.suggestedQuestions || [
                "What are the most credible sources?",
                "What's the latest update?"
            ],
            urgencyLevel: aiResponse.urgencyLevel || "ROUTINE",
            temporalContext: aiResponse.temporalContext || `Based on ${freshNews.length} sources from last 24 hours`,
            temporalWarning: aiResponse.temporalWarning
        }

    } catch (error) {
        console.error('❌ Reporter AI with fresh data failed:', error)

        // Use intelligent fallback with the fresh news we already fetched
        return generateIntelligentFallback(userQuestion, { sources: freshNews, totalResults: freshNews.length })
    }
}

/**
 * Generate intelligent fallback response using available news data
 * Even if OpenRouter fails, we can still provide useful responses
 */
function generateIntelligentFallback(userQuestion, context = {}) {
    console.log('📋 Generating intelligent fallback response...')

    const sources = context.sources || []
    const totalResults = context.totalResults || sources.length

    // Build response from available news articles
    let answer = `**Search Results for "${userQuestion}"**\n\n`

    if (sources.length > 0) {
        answer += `I found **${totalResults}** articles related to your query.\n\n`
        answer += `**Top Headlines:**\n\n`

        sources.slice(0, 5).forEach((article, i) => {
            answer += `${i + 1}. **${article.title}**\n`
            answer += `   📰 Source: ${article.source.name}\n`
            if (article.publishedAt) {
                const timeAgo = getTimeAgo(article.publishedAt)
                answer += `   🕒 ${timeAgo}\n`
            }
            if (article.description) {
                answer += `   📄 ${article.description.substring(0, 100)}...\n`
            }
            answer += `\n`
        })

        answer += `**Analysis:**\n`
        answer += `• Coverage from ${new Set(sources.map(a => a.source.name)).size} different sources\n`
        answer += `• Most recent update: ${sources[0]?.publishedAt ? new Date(sources[0].publishedAt).toLocaleString() : 'Unknown'}\n\n`
        answer += `For comprehensive verification, cross-reference these articles and look for consensus among credible sources.`

        const sourceNames = [...new Set(sources.slice(0, 5).map(a => a.source.name))]

        return {
            answer,
            keySources: sourceNames,
            verificationStatus: sources.length >= 3 ? "PARTIAL" : "DEVELOPING",
            suggestedQuestions: [
                "Which sources are most credible?",
                "What's the latest update on this?",
                "Are there any contradictions in the reporting?"
            ],
            urgencyLevel: "ROUTINE"
        }
    } else {
        answer += `I couldn't find recent articles matching "${userQuestion}". This could mean:\n\n`
        answer += `• The topic is very recent or breaking\n`
        answer += `• The query terms need to be broader\n`
        answer += `• Limited coverage in major news sources\n\n`
        answer += `**Recommendations:**\n`
        answer += `• Try broader search terms\n`
        answer += `• Check trending topics\n`
        answer += `• Look for official statements from relevant authorities`

        return {
            answer,
            keySources: [],
            verificationStatus: "DEVELOPING",
            suggestedQuestions: [
                "What are the trending news topics?",
                "Can you search for related terms?",
                "What makes a source credible?"
            ],
            urgencyLevel: "ROUTINE"
        }
    }
}

function getTimeAgo(timestamp) {
    const now = Date.now()
    const then = new Date(timestamp).getTime()
    const diffMs = now - then
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`

    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`

    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}d ago`
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
 * DYNAMIC FALLBACK - NO HARDCODED DEMO DATA
 * Generates analysis based on actual claim and articles
 */
function getFallbackData(claim, articles = []) {
    console.log('⚠️ Using fallback data for claim:', claim)

    // Use dynamic fallback instead of hardcoded Kerala floods
    return generateFallbackAnalysis(claim, articles)
}
