// NewsAPI Service for VEDANTA
const NEWS_API_KEY = '3320de2055b34ba89eee36c61ffdccdf'
const NEWS_API_BASE_URL = 'https://newsapi.org/v2'

/**
 * Fetch top headlines from India
 */
export async function fetchIndiaHeadlines(category = '', pageSize = 10) {
    try {
        const params = new URLSearchParams({
            country: 'in',
            apiKey: NEWS_API_KEY,
            pageSize: pageSize.toString()
        })

        if (category) {
            params.append('category', category)
        }

        const response = await fetch(`${NEWS_API_BASE_URL}/top-headlines?${params}`)
        const data = await response.json()

        if (data.status === 'ok') {
            return {
                success: true,
                articles: data.articles,
                totalResults: data.totalResults
            }
        } else {
            return {
                success: false,
                error: data.message || 'Failed to fetch news'
            }
        }
    } catch (error) {
        return {
            success: false,
            error: error.message
        }
    }
}

/**
 * Search news articles
 */
export async function searchNews(query, options = {}) {
    try {
        const params = new URLSearchParams({
            q: query,
            apiKey: NEWS_API_KEY,
            language: options.language || 'en',
            sortBy: options.sortBy || 'publishedAt',
            pageSize: (options.pageSize || 20).toString()
        })

        if (options.from) {
            params.append('from', options.from)
        }

        if (options.to) {
            params.append('to', options.to)
        }

        const response = await fetch(`${NEWS_API_BASE_URL}/everything?${params}`)
        const data = await response.json()

        if (data.status === 'ok') {
            return {
                success: true,
                articles: data.articles,
                totalResults: data.totalResults
            }
        } else {
            return {
                success: false,
                error: data.message || 'Failed to search news'
            }
        }
    } catch (error) {
        return {
            success: false,
            error: error.message
        }
    }
}

/**
 * Verify a claim by searching for related news
 */
export async function verifyClaim(claimText) {
    try {
        // Extract key terms from the claim
        const keywords = extractKeywords(claimText)

        // Search for articles related to the claim
        const searchResult = await searchNews(keywords, {
            pageSize: 10,
            sortBy: 'relevancy'
        })

        if (!searchResult.success) {
            return {
                success: false,
                error: searchResult.error
            }
        }

        // Analyze the articles
        const articles = searchResult.articles
        const sources = analyzeArticles(articles, claimText)
        const credibilityScore = calculateCredibility(articles, claimText)

        return {
            success: true,
            claim: claimText,
            credibilityScore,
            sources,
            articles: articles.slice(0, 5), // Top 5 most relevant
            timestamp: new Date().toISOString()
        }
    } catch (error) {
        return {
            success: false,
            error: error.message
        }
    }
}

/**
 * Extract keywords from claim text
 */
function extractKeywords(text) {
    // Remove common words and extract key terms
    const stopWords = ['the', 'a', 'an', 'is', 'are', 'was', 'were', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']
    const words = text.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 3 && !stopWords.includes(word))

    // Return top keywords (max 3-4 words for better search)
    return words.slice(0, 4).join(' ')
}

/**
 * Analyze articles for source credibility
 */
function analyzeArticles(articles, claimText) {
    const sourceMap = new Map()

    articles.forEach(article => {
        const sourceName = article.source.name
        if (!sourceMap.has(sourceName)) {
            sourceMap.set(sourceName, {
                name: sourceName,
                count: 0,
                articles: []
            })
        }
        const source = sourceMap.get(sourceName)
        source.count++
        source.articles.push(article)
    })

    // Convert to array and calculate scores
    const sources = Array.from(sourceMap.values()).map(source => {
        // Score based on:
        // 1. Number of articles (more = higher credibility)
        // 2. Source reputation (trusted Indian sources)
        // 3. Recency of articles
        const trustedSources = ['PTI', 'The Hindu', 'Times of India', 'NDTV', 'Indian Express', 'Hindustan Times']
        const isTrusted = trustedSources.some(trusted => source.name.includes(trusted))

        let score = 50 // Base score
        score += source.count * 10 // +10 for each article
        score += isTrusted ? 25 : 0 // +25 for trusted sources
        score = Math.min(score, 100) // Cap at 100

        return {
            name: source.name,
            score,
            type: getSourceType(source.name),
            articleCount: source.count
        }
    })

    return sources.sort((a, b) => b.score - a.score)
}

/**
 * Determine source type
 */
function getSourceType(sourceName) {
    if (sourceName.includes('PTI') || sourceName.includes('ANI')) {
        return 'News Agency'
    } else if (sourceName.includes('TV') || sourceName.includes('News')) {
        return 'TV News'
    } else if (sourceName.includes('Times') || sourceName.includes('Hindu') || sourceName.includes('Express')) {
        return 'Newspaper'
    } else {
        return 'Online Media'
    }
}

/**
 * Calculate overall credibility score
 */
function calculateCredibility(articles, claimText) {
    if (articles.length === 0) {
        return 15 // Low credibility if no articles found
    }

    // Extract claim keywords for analysis
    const claimKeywords = claimText.toLowerCase().split(/\s+/).filter(w => w.length > 3)

    // Analyze articles for verification vs debunking indicators
    let verificationScore = 0
    let debunkingScore = 0

    const debunkingKeywords = ['false', 'fake', 'hoax', 'debunk', 'myth', 'misleading', 'unverified', 'no evidence', 'not true', 'misinformation', 'fact check']
    const verificationKeywords = ['confirmed', 'verified', 'official', 'announced', 'statement', 'reports confirm']

    articles.forEach(article => {
        const content = (article.title + ' ' + (article.description || '')).toLowerCase()

        // Check for debunking indicators
        debunkingKeywords.forEach(keyword => {
            if (content.includes(keyword)) {
                debunkingScore += 15
            }
        })

        // Check for verification indicators
        verificationKeywords.forEach(keyword => {
            if (content.includes(keyword)) {
                verificationScore += 8
            }
        })
    })

    // If there are strong debunking signals, score should be low
    if (debunkingScore > verificationScore * 2) {
        return Math.min(25, 15 + verificationScore) // Cap at 25 if heavily debunked
    }

    // Conservative scoring
    const sourceCount = new Set(articles.map(a => a.source.name)).size
    const trustedSources = ['PTI', 'The Hindu', 'Times of India', 'NDTV', 'Indian Express', 'BBC', 'Reuters']
    const hasTrustedSource = articles.some(a => trustedSources.some(t => a.source.name.includes(t)))

    let score = 20 // Lower base score
    score += sourceCount * 5 // Reduced from 8
    score += Math.min(articles.length * 3, 20) // Cap article bonus at 20
    score += hasTrustedSource ? 15 : 0 // Bonus for trusted sources
    score += Math.min(verificationScore, 25) // Cap verification bonus
    score -= debunkingScore // Subtract debunking signals

    // Final score between 15-85 (avoiding extremes)
    return Math.min(Math.max(score, 15), 85)
}

/**
 * Get news by category for AI assistant
 */
export async function getNewsByCategory(category) {
    return await fetchIndiaHeadlines(category, 5)
}

/**
 * Get trending topics
 */
export async function getTrendingTopics() {
    const result = await fetchIndiaHeadlines('', 10)

    if (result.success) {
        // Extract topics from headlines
        const topics = result.articles.map(article => ({
            title: article.title,
            source: article.source.name,
            url: article.url,
            publishedAt: article.publishedAt
        }))

        return {
            success: true,
            topics
        }
    }

    return result
}
