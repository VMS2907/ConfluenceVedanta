# 📡 NewsAPI Integration - VEDANTA

## Overview
VEDANTA now uses **real live news data** from NewsAPI for India to provide actual news verification and AI-powered search capabilities.

---

## 🔑 API Configuration

**API Provider:** NewsAPI.org
**API Key:** `3320de2055b34ba89eee36c61ffdccdf`
**Coverage:** India-focused news from multiple sources

### Endpoints Used:
1. **Top Headlines** - `/v2/top-headlines?country=in`
2. **Everything Search** - `/v2/everything?q={query}`

---

## 📁 Files Created/Modified

### New Files:
1. **`src/services/newsApi.js`** - Complete NewsAPI service layer

### Modified Files:
1. **`src/components/VerificationDemo.jsx`** - Real claim verification
2. **`src/components/ReportersNotebook.jsx`** - Real news search

---

## 🚀 Features Implemented

### 1. Live Verification Demo

**What it does:**
- Takes any claim/query from user
- Searches NewsAPI for related articles
- Analyzes source credibility
- Calculates overall credibility score
- Returns verification results with sources

**How it works:**
```javascript
import { verifyClaim } from '../services/newsApi'

const result = await verifyClaim("Your claim here")
// Returns: credibilityScore, sources, articles, timestamp
```

**Example Flow:**
1. User inputs: "Flood in Kerala"
2. System searches NewsAPI for "flood kerala"
3. Finds articles from PTI, Times of India, NDTV, etc.
4. Analyzes source credibility (PTI = high, random blogs = low)
5. Calculates overall score based on:
   - Number of sources
   - Source reputation
   - Article recency
6. Displays results with credibility gauge

---

### 2. AI Assistant (Reporter's Notebook)

**What it does:**
- Accepts any news query
- Searches real-time news articles
- Formats results with sources, timestamps
- Shows article descriptions and links

**How it works:**
```javascript
import { searchNews } from '../services/newsApi'

const result = await searchNews("query", { pageSize: 5 })
// Returns: articles array with title, source, description, publishedAt
```

**Example Queries:**
- "What happened in Kerala today?"
- "Latest India news"
- "Modi speech"
- "Cricket updates"
- Any news topic!

---

## 🔧 NewsAPI Service Functions

### Core Functions

#### 1. `fetchIndiaHeadlines(category, pageSize)`
```javascript
// Fetch top headlines from India
const result = await fetchIndiaHeadlines('business', 10)
```

**Parameters:**
- `category` (optional): business, entertainment, general, health, science, sports, technology
- `pageSize`: Number of articles (1-100)

**Returns:**
```javascript
{
  success: true,
  articles: [...],
  totalResults: 47
}
```

---

#### 2. `searchNews(query, options)`
```javascript
// Search for specific news
const result = await searchNews("kerala floods", {
  language: 'en',
  sortBy: 'publishedAt',
  pageSize: 20
})
```

**Parameters:**
- `query`: Search keywords
- `options`:
  - `language`: 'en', 'hi', etc.
  - `sortBy`: 'relevancy', 'popularity', 'publishedAt'
  - `pageSize`: Number of results
  - `from`: Start date (YYYY-MM-DD)
  - `to`: End date (YYYY-MM-DD)

**Returns:**
```javascript
{
  success: true,
  articles: [...],
  totalResults: 150
}
```

---

#### 3. `verifyClaim(claimText)`
```javascript
// Verify any claim
const result = await verifyClaim("Breaking: 500 casualties in floods")
```

**Process:**
1. Extracts keywords from claim
2. Searches NewsAPI
3. Analyzes articles and sources
4. Calculates credibility score
5. Returns comprehensive verification

**Returns:**
```javascript
{
  success: true,
  claim: "Original claim text",
  credibilityScore: 75,
  sources: [
    { name: "PTI", score: 92, type: "News Agency", articleCount: 3 },
    { name: "NDTV", score: 85, type: "TV News", articleCount: 2 }
  ],
  articles: [...top 5 most relevant],
  timestamp: "2025-12-28T18:00:00.000Z"
}
```

---

#### 4. `getTrendingTopics()`
```javascript
// Get trending news topics
const result = await getTrendingTopics()
```

**Returns:**
```javascript
{
  success: true,
  topics: [
    { title: "...", source: "...", url: "...", publishedAt: "..." }
  ]
}
```

---

## 📊 Credibility Scoring Algorithm

### How Credibility is Calculated:

**Base Score:** 30 points

**Factors:**
1. **Source Count** (+8 points per unique source)
   - More sources = higher credibility

2. **Article Count** (+5 points per article)
   - More coverage = higher credibility

3. **Source Reputation** (+25 points for trusted sources)
   - Trusted sources: PTI, The Hindu, Times of India, NDTV, Indian Express, Hindustan Times

4. **Recency** (implicit)
   - Sorted by publishedAt

**Formula:**
```javascript
score = 30 + (uniqueSources × 8) + (totalArticles × 5)
if (trustedSource) score += 25
score = Math.min(score, 100) // Cap at 100
```

**Score Interpretation:**
- 70-100: **Verified** ✓ (Green badge)
- 40-69: **Disputed** ⚠ (Orange badge)
- 0-39: **False** ✗ (Red badge)

---

## 🎯 Article Object Structure

Each article from NewsAPI contains:

```javascript
{
  source: {
    id: "the-times-of-india",
    name: "The Times of India"
  },
  author: "Author Name",
  title: "Article Headline",
  description: "Brief description of the article...",
  url: "https://...",
  urlToImage: "https://...",
  publishedAt: "2025-12-28T12:00:00Z",
  content: "Full article content..."
}
```

---

## 🔐 Error Handling

All functions include comprehensive error handling:

```javascript
try {
  const result = await searchNews(query)
  if (result.success) {
    // Use result.articles
  } else {
    // Show error: result.error
  }
} catch (error) {
  // Network or unexpected error
}
```

**Fallback Strategy:**
- If API fails → Show demo data
- If no results → Inform user, suggest alternatives
- If network error → Graceful error message

---

## 📈 Performance Considerations

### Rate Limits:
- **Free Tier:** 100 requests/day
- **Developer Tier:** 500 requests/day

### Optimization:
1. **Keyword Extraction:** Only send 3-4 key words instead of full claim
2. **Result Limiting:** Default to 5-10 articles max
3. **Caching:** Consider implementing cache for repeated queries
4. **Debouncing:** Add debounce to search input (future)

---

## 🧪 Testing the Integration

### Test Verification Demo:

1. **Navigate to:** http://localhost:5176/
2. **Scroll to:** "Live Verification Demo"
3. **Try these claims:**
   - "India cricket team" → Should find recent cricket news
   - "Modi speech" → Should find government news
   - "Bollywood" → Should find entertainment news
   - "Tech startup" → Should find technology news

### Test AI Assistant:

1. **Scroll to:** "Reporter's Notebook"
2. **Try these queries:**
   - "latest india news" → Top headlines
   - "bangalore weather" → Weather-related articles
   - "stock market" → Business news
   - "ipl cricket" → Sports news

---

## 🎨 UI Integration

### Verification Demo Results:

**Displays:**
- ✅ Overall Credibility Score (0-100) with gauge
- ✅ Extracted Claims with verification status
- ✅ Source Analysis with credibility bars
- ✅ Evidence cards showing what sources say

### AI Assistant Results:

**Displays:**
- 📰 Article titles
- 🏢 Source names
- 🕒 Publication timestamps
- 📄 Article descriptions
- 📊 Coverage analysis (# of sources, recency)

---

## 🚨 Important Notes

### API Key Security:
⚠️ **WARNING:** The API key is currently in client-side code. For production:
- Move to environment variables (`.env`)
- Use backend proxy to hide the key
- Implement rate limiting

### CORS:
- NewsAPI supports CORS for development
- For production, consider backend proxy

### Data Freshness:
- Articles are real-time from NewsAPI
- Coverage depends on source availability
- India-focused sources prioritized

---

## 🎯 Demo Script for Hackathon

### Verification Demo:
1. **Input:** "India budget 2025"
2. **Show:** Loading animation
3. **Result:** Real articles from economic sources
4. **Highlight:** Multiple sources, credibility scores

### AI Assistant:
1. **Input:** "What's happening in India today?"
2. **Show:** Typing indicator
3. **Result:** Top 5 headlines with sources
4. **Highlight:** Real-time data, multiple perspectives

---

## 📚 API Documentation

**Official Docs:** https://newsapi.org/docs

**Endpoints Used:**
- `GET /v2/top-headlines`
- `GET /v2/everything`

**Parameters Reference:**
- `country`: in (India)
- `language`: en (English)
- `apiKey`: Your API key
- `q`: Query string
- `pageSize`: Results per page
- `sortBy`: relevancy | popularity | publishedAt

---

## 🔄 Future Enhancements

Potential improvements:
1. **Caching:** Cache recent queries for 5-10 minutes
2. **Advanced NLP:** Better keyword extraction
3. **Sentiment Analysis:** Analyze article sentiment
4. **Trend Detection:** Identify trending topics
5. **Multi-language:** Support Hindi and regional languages
6. **Source Filtering:** Allow users to select preferred sources
7. **Alert System:** Set up monitoring for specific topics
8. **Export:** Download verification reports as PDF

---

## ✅ Integration Checklist

- ✅ NewsAPI service created
- ✅ VerificationDemo connected to real API
- ✅ ReportersNotebook connected to real API
- ✅ Error handling implemented
- ✅ Fallback to demo data on failures
- ✅ Loading states with animations
- ✅ Credibility scoring algorithm
- ✅ Source analysis and ranking
- ✅ UI displays real news data
- ✅ Responsive to user queries

---

**Status:** ✅ **FULLY FUNCTIONAL**

All components are now using live news data from NewsAPI. The verification and AI assistant features work with real Indian news sources!

---

**Integration completed:** 2025-12-28
**API Provider:** NewsAPI.org
**Coverage:** India + Global news
**Status:** Production-ready for hackathon demo
