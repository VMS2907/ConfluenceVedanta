// Real-time Crisis Intelligence Feed Manager
// Multi-source news aggregation with live updates

const NEWSDATA_API_KEY = 'pub_1d320bcec5714feca699555638b7ed6b'
const NEWS_API_KEY = '3320de2055b34ba89eee36c61ffdccdf'

class CrisisFeedManager {
    constructor() {
        this.activeCrises = []
        this.updateInterval = 30000 // Update every 30 seconds
        this.updateTimer = null
        this.lastUpdateTime = null

        this.crisisKeywords = [
            'flood', 'earthquake', 'cyclone', 'disaster', 'emergency',
            'breaking', 'alert', 'warning', 'crisis', 'accident',
            'fire', 'explosion', 'terror', 'storm', 'landslide'
        ]

        this.listeners = []
    }

    // Subscribe to feed updates
    subscribe(callback) {
        this.listeners.push(callback)
        return () => {
            this.listeners = this.listeners.filter(cb => cb !== callback)
        }
    }

    // Notify all subscribers
    notify(crises) {
        this.listeners.forEach(callback => callback(crises))
    }

    /**
     * MULTI-SOURCE NEWS FETCHING
     * Priority: NewsData.io > NewsAPI > Google News RSS
     */
    async fetchLiveCrisisNews() {
        const crisisNews = []

        console.log('🔄 Fetching crisis news from multiple sources...')

        // Source 1: NewsData.io (PRIMARY - Most reliable for India)
        try {
            const newsDataArticles = await this.fetchFromNewsDataIO()
            if (newsDataArticles && newsDataArticles.length > 0) {
                console.log(`✅ NewsData.io: ${newsDataArticles.length} articles`)
                crisisNews.push(...newsDataArticles)
            }
        } catch (error) {
            console.error('NewsData.io error:', error.message)
        }

        // Source 2: NewsAPI (SECONDARY - Your existing integration)
        try {
            const newsApiArticles = await this.fetchFromNewsAPI()
            if (newsApiArticles && newsApiArticles.length > 0) {
                console.log(`✅ NewsAPI: ${newsApiArticles.length} articles`)
                crisisNews.push(...newsApiArticles)
            }
        } catch (error) {
            console.error('NewsAPI error:', error.message)
        }

        // Source 3: Google News RSS (FALLBACK - Always works, no API key)
        if (crisisNews.length < 10) {
            try {
                const rssArticles = await this.fetchFromGoogleNewsRSS()
                if (rssArticles && rssArticles.length > 0) {
                    console.log(`✅ Google News RSS: ${rssArticles.length} articles`)
                    crisisNews.push(...rssArticles)
                }
            } catch (error) {
                console.error('RSS error:', error.message)
            }
        }

        // If all sources fail, use fallback data
        if (crisisNews.length === 0) {
            console.warn('⚠️ All sources failed, using fallback data')
            return this.getFallbackCrisisData()
        }

        // Process and return top crises
        return this.processCrisisData(crisisNews)
    }

    /**
     * NewsData.io Integration - Best for India news
     */
    async fetchFromNewsDataIO() {
        const queries = [
            'disaster india crisis',
            'flood cyclone earthquake india',
            'emergency alert breaking india'
        ]

        const articles = []

        for (const query of queries) {
            try {
                const url = `https://newsdata.io/api/1/news?apikey=${NEWSDATA_API_KEY}&q=${encodeURIComponent(query)}&country=in&language=en&prioritydomain=top`

                const response = await fetch(url)
                const data = await response.json()

                if (data.status === 'success' && data.results) {
                    data.results.forEach(article => {
                        articles.push({
                            title: article.title,
                            url: article.link,
                            publishedAt: article.pubDate,
                            source: { name: article.source_id || 'Unknown' },
                            description: article.description || article.title,
                            imageUrl: article.image_url,
                            category: this.categorizeCrisis(article.title + ' ' + (article.description || '')),
                            keywords: article.keywords || []
                        })
                    })
                }

                // Respect rate limits
                await this.delay(500)
            } catch (error) {
                console.error('NewsData.io query error:', error)
            }
        }

        return articles
    }

    /**
     * NewsAPI Integration (existing)
     */
    async fetchFromNewsAPI() {
        const queries = [
            'disaster OR flood OR earthquake OR cyclone AND india',
            'breaking AND (crisis OR emergency) AND india',
            'alert OR warning AND india'
        ]

        const articles = []

        for (const query of queries) {
            try {
                const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&pageSize=10&language=en&apiKey=${NEWS_API_KEY}`

                const response = await fetch(url)
                const data = await response.json()

                if (data.status === 'ok' && data.articles) {
                    data.articles.forEach(article => {
                        articles.push({
                            title: article.title,
                            url: article.url,
                            publishedAt: article.publishedAt,
                            source: article.source,
                            description: article.description,
                            imageUrl: article.urlToImage,
                            category: this.categorizeCrisis(article.title + ' ' + (article.description || ''))
                        })
                    })
                }

                await this.delay(500)
            } catch (error) {
                console.error('NewsAPI query error:', error)
            }
        }

        return articles
    }

    /**
     * Google News RSS - Free, no API key needed
     */
    async fetchFromGoogleNewsRSS() {
        const queries = [
            'disaster india',
            'breaking news india crisis',
            'flood cyclone earthquake india',
            'emergency alert india'
        ]

        const articles = []

        for (const query of queries) {
            try {
                const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-IN&gl=IN&ceid=IN:en`

                const response = await fetch(rssUrl)
                const rssText = await response.text()

                // Parse RSS XML
                const parser = new DOMParser()
                const xmlDoc = parser.parseFromString(rssText, 'text/xml')
                const items = xmlDoc.querySelectorAll('item')

                items.forEach((item, index) => {
                    if (index < 5) { // Limit per feed
                        const title = item.querySelector('title')?.textContent || ''
                        const link = item.querySelector('link')?.textContent || ''
                        const pubDate = item.querySelector('pubDate')?.textContent || ''
                        const source = item.querySelector('source')?.textContent || 'Google News'

                        articles.push({
                            title,
                            url: link,
                            publishedAt: pubDate,
                            source: { name: source },
                            description: title,
                            category: this.categorizeCrisis(title)
                        })
                    }
                })

                await this.delay(300)
            } catch (error) {
                console.error('RSS query error:', error)
            }
        }

        return articles
    }

    /**
     * Categorize news into crisis types
     */
    categorizeCrisis(text) {
        const lower = text.toLowerCase()

        if (/flood|deluge|inundation|waterlogging/.test(lower)) return 'FLOOD'
        if (/cyclone|hurricane|storm|typhoon/.test(lower)) return 'CYCLONE'
        if (/earthquake|tremor|seismic|quake/.test(lower)) return 'EARTHQUAKE'
        if (/fire|blaze|inferno/.test(lower)) return 'FIRE'
        if (/landslide|mudslide/.test(lower)) return 'LANDSLIDE'
        if (/election|vote|poll/.test(lower)) return 'ELECTION'
        if (/stock|market|trading|sensex/.test(lower)) return 'MARKET'
        if (/accident|crash|collision/.test(lower)) return 'ACCIDENT'
        if (/terror|attack|shooting|blast/.test(lower)) return 'SECURITY'
        if (/covid|pandemic|epidemic|health/.test(lower)) return 'HEALTH'

        return 'GENERAL'
    }

    /**
     * Process and rank crisis news
     */
    processCrisisData(articles) {
        // Remove duplicates
        const unique = this.deduplicateArticles(articles)

        // Score by urgency
        const scored = unique.map(article => ({
            ...article,
            urgencyScore: this.calculateUrgency(article),
            verificationStatus: this.getVerificationStatus(article)
        }))

        // Sort by urgency (highest first)
        scored.sort((a, b) => b.urgencyScore - a.urgencyScore)

        // Take top 6 for display
        return scored.slice(0, 6)
    }

    /**
     * Remove duplicate articles
     */
    deduplicateArticles(articles) {
        const seen = new Set()
        return articles.filter(article => {
            const normalized = article.title.toLowerCase()
                .replace(/[^\w\s]/g, '')
                .slice(0, 50)

            if (seen.has(normalized)) return false
            seen.add(normalized)
            return true
        })
    }

    /**
     * Calculate urgency score (0-100)
     */
    calculateUrgency(article) {
        let score = 0
        const text = (article.title + ' ' + (article.description || '')).toLowerCase()

        // Recency boost
        const ageMinutes = (Date.now() - new Date(article.publishedAt)) / (1000 * 60)
        if (ageMinutes < 30) score += 50
        else if (ageMinutes < 120) score += 30
        else if (ageMinutes < 360) score += 10

        // Keyword urgency
        if (/breaking|alert|urgent|emergency/.test(text)) score += 30
        if (/death|casualt|kill|injur/.test(text)) score += 25
        if (/disaster|catastrophe|crisis/.test(text)) score += 20
        if (/warning|danger|threat/.test(text)) score += 15

        // Category urgency
        const criticalCategories = ['EARTHQUAKE', 'CYCLONE', 'FLOOD', 'SECURITY', 'FIRE']
        if (criticalCategories.includes(article.category)) score += 20

        return Math.min(score, 100)
    }

    /**
     * Get verification status based on source
     */
    getVerificationStatus(article) {
        const source = (article.source?.name || '').toLowerCase()

        // High credibility sources
        const tier1 = ['pti', 'reuters', 'ani', 'bbc', 'pib', 'ndtv', 'thehindu']
        if (tier1.some(s => source.includes(s))) {
            return { status: 'VERIFIED', confidence: 'HIGH', color: '#10B981' }
        }

        // Medium credibility
        const tier2 = ['times', 'hindu', 'express', 'firstpost', 'hindustantimes']
        if (tier2.some(s => source.includes(s))) {
            return { status: 'MONITORING', confidence: 'MEDIUM', color: '#0EA5E9' }
        }

        return { status: 'DEVELOPING', confidence: 'LOW', color: '#F59E0B' }
    }

    /**
     * Extract location from article text
     */
    extractLocation(text) {
        const locations = [
            'Kerala', 'Mumbai', 'Delhi', 'Kolkata', 'Chennai',
            'Bangalore', 'Hyderabad', 'Pune', 'Gujarat', 'Tamil Nadu',
            'Karnataka', 'Maharashtra', 'West Bengal', 'Uttar Pradesh',
            'Assam', 'Odisha', 'Bihar', 'Rajasthan', 'Madhya Pradesh'
        ]

        for (const loc of locations) {
            if (text.includes(loc)) return loc
        }

        if (/bay of bengal/i.test(text)) return 'Eastern Coast'
        if (/arabian sea/i.test(text)) return 'Western Coast'

        return 'India'
    }

    /**
     * Get time ago string
     */
    getTimeAgo(timestamp) {
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
     * Start live monitoring
     */
    async startLiveMonitoring() {
        console.log('🔴 Starting Live Crisis Monitoring...')

        // Initial fetch
        await this.updateFeed()

        // Auto-update every 30 seconds
        this.updateTimer = setInterval(() => {
            this.updateFeed()
        }, this.updateInterval)

        console.log('✅ Live Crisis Monitoring Active')
    }

    /**
     * Stop monitoring
     */
    stopMonitoring() {
        if (this.updateTimer) {
            clearInterval(this.updateTimer)
            this.updateTimer = null
            console.log('⏸️ Crisis Monitoring Stopped')
        }
    }

    /**
     * Update feed
     */
    async updateFeed() {
        try {
            const crises = await this.fetchLiveCrisisNews()
            this.activeCrises = crises
            this.lastUpdateTime = new Date().toISOString()

            // Notify subscribers
            this.notify(crises)

            console.log(`✅ Feed updated: ${crises.length} crises`)

            // Check for breaking news
            const breaking = crises.filter(c => c.urgencyScore > 80)
            if (breaking.length > 0) {
                console.log('🚨 BREAKING NEWS DETECTED:', breaking[0].title)
            }

            return crises
        } catch (error) {
            console.error('❌ Feed update failed:', error)
            return this.activeCrises // Return cached data
        }
    }

    /**
     * Fallback crisis data for offline demo
     */
    getFallbackCrisisData() {
        const now = Date.now()
        return [
            {
                title: 'Kerala Floods 2024: Heavy Rainfall Triggers Landslides in Multiple Districts',
                url: '#',
                publishedAt: new Date(now - 5 * 60000).toISOString(),
                source: { name: 'NDTV' },
                description: 'NDRF teams deployed for rescue operations across affected areas',
                category: 'FLOOD',
                urgencyScore: 85,
                verificationStatus: { status: 'VERIFIED', confidence: 'HIGH', color: '#10B981' }
            },
            {
                title: 'Cyclone Alert Issued for Bay of Bengal - IMD Warns Coastal Regions',
                url: '#',
                publishedAt: new Date(now - 12 * 60000).toISOString(),
                source: { name: 'PTI' },
                description: 'Depression intensifying over Bay of Bengal, expected to cross coast by tomorrow',
                category: 'CYCLONE',
                urgencyScore: 75,
                verificationStatus: { status: 'VERIFIED', confidence: 'HIGH', color: '#10B981' }
            },
            {
                title: 'Election Commission Debunks Viral Misinformation About Voter Lists',
                url: '#',
                publishedAt: new Date(now - 45 * 60000).toISOString(),
                source: { name: 'PIB India' },
                description: 'Official clarification issued on social media claims',
                category: 'ELECTION',
                urgencyScore: 60,
                verificationStatus: { status: 'MONITORING', confidence: 'MEDIUM', color: '#0EA5E9' }
            },
            {
                title: 'Stock Market Volatility: Sensex Drops 500 Points Amid Global Uncertainty',
                url: '#',
                publishedAt: new Date(now - 90 * 60000).toISOString(),
                source: { name: 'Economic Times' },
                description: 'Market experts analyze the downturn and future outlook',
                category: 'MARKET',
                urgencyScore: 45,
                verificationStatus: { status: 'MONITORING', confidence: 'MEDIUM', color: '#0EA5E9' }
            },
            {
                title: 'Fire Breaks Out in Mumbai High-Rise, 20 Families Evacuated',
                url: '#',
                publishedAt: new Date(now - 120 * 60000).toISOString(),
                source: { name: 'Times of India' },
                description: 'Fire brigade teams battling blaze on 15th floor',
                category: 'FIRE',
                urgencyScore: 70,
                verificationStatus: { status: 'VERIFIED', confidence: 'HIGH', color: '#10B981' }
            },
            {
                title: 'Delhi Air Quality Reaches Hazardous Levels, Health Advisory Issued',
                url: '#',
                publishedAt: new Date(now - 180 * 60000).toISOString(),
                source: { name: 'NDTV' },
                description: 'AQI crosses 400 mark, schools advised to limit outdoor activities',
                category: 'HEALTH',
                urgencyScore: 55,
                verificationStatus: { status: 'MONITORING', confidence: 'MEDIUM', color: '#0EA5E9' }
            }
        ]
    }

    /**
     * Utility: Delay for rate limiting
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms))
    }
}

// Export singleton instance
export const crisisFeedManager = new CrisisFeedManager()

// Export class for testing
export default CrisisFeedManager
