// Test utility for OpenRouter API
// Run this from browser console: window.testOpenRouter()

const OPENROUTER_API_KEY = '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'
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1'
const MODEL = 'openai/gpt-4o-mini'

async function testOpenRouterAPI() {
    console.log('🧪 Testing OpenRouter API...')
    console.log('API Key:', OPENROUTER_API_KEY.substring(0, 20) + '...')
    console.log('Base URL:', OPENROUTER_BASE_URL)
    console.log('Model:', MODEL)

    try {
        const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'HTTP-Referer': window.location.origin,
                'X-Title': 'VEDANTA Test'
            },
            body: JSON.stringify({
                model: MODEL,
                messages: [
                    {
                        role: 'user',
                        content: 'Reply with exactly: "API is working correctly"'
                    }
                ],
                max_tokens: 20,
                temperature: 0
            })
        })

        console.log('Response status:', response.status)
        console.log('Response headers:', Object.fromEntries(response.headers.entries()))

        if (!response.ok) {
            const errorText = await response.text()
            console.error('❌ API Error Response:', errorText)

            // Try to parse as JSON
            try {
                const errorJson = JSON.parse(errorText)
                console.error('Error details:', errorJson)

                if (errorJson.error) {
                    return {
                        success: false,
                        error: errorJson.error.message || 'Unknown error',
                        fullError: errorJson
                    }
                }
            } catch (e) {
                return {
                    success: false,
                    error: `HTTP ${response.status}: ${errorText}`,
                    rawError: errorText
                }
            }
        }

        const data = await response.json()
        console.log('✅ Full API Response:', data)

        const aiMessage = data.choices?.[0]?.message?.content
        console.log('AI Response:', aiMessage)

        return {
            success: true,
            message: aiMessage,
            fullResponse: data,
            usage: data.usage
        }

    } catch (error) {
        console.error('❌ Network Error:', error)
        return {
            success: false,
            error: error.message,
            errorType: 'NetworkError'
        }
    }
}

// Test with JSON response format (what we use in production)
async function testOpenRouterJSON() {
    console.log('🧪 Testing OpenRouter with JSON response format...')

    try {
        const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'HTTP-Referer': window.location.origin,
                'X-Title': 'VEDANTA JSON Test'
            },
            body: JSON.stringify({
                model: MODEL,
                messages: [
                    {
                        role: 'system',
                        content: 'You are a helpful assistant. Always respond in valid JSON format.'
                    },
                    {
                        role: 'user',
                        content: 'Return this exact JSON: {"status": "working", "message": "API is functional"}'
                    }
                ],
                temperature: 0,
                max_tokens: 100,
                response_format: { type: "json_object" }
            })
        })

        if (!response.ok) {
            const errorText = await response.text()
            console.error('❌ JSON Test Failed:', errorText)
            return { success: false, error: errorText }
        }

        const data = await response.json()
        const aiResponse = data.choices[0].message.content
        console.log('✅ JSON Response:', aiResponse)

        const parsed = JSON.parse(aiResponse)
        console.log('✅ Parsed JSON:', parsed)

        return {
            success: true,
            response: parsed,
            fullResponse: data
        }

    } catch (error) {
        console.error('❌ JSON Test Error:', error)
        return { success: false, error: error.message }
    }
}

// Check API credits/limits
async function checkOpenRouterCredits() {
    console.log('💳 Checking OpenRouter credits...')

    try {
        // Note: OpenRouter doesn't have a dedicated credits endpoint
        // We'll check by making a minimal request
        const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'HTTP-Referer': window.location.origin,
                'X-Title': 'VEDANTA Credit Check'
            },
            body: JSON.stringify({
                model: MODEL,
                messages: [{ role: 'user', content: 'Hi' }],
                max_tokens: 1
            })
        })

        if (response.status === 401) {
            console.error('❌ Invalid API Key')
            return { valid: false, error: 'Invalid API key' }
        }

        if (response.status === 402) {
            console.error('❌ Insufficient Credits')
            return { valid: false, error: 'Insufficient credits' }
        }

        if (response.status === 429) {
            console.error('⚠️ Rate Limited')
            return { valid: true, rateLimited: true }
        }

        if (response.ok) {
            console.log('✅ API Key is valid and has credits')
            return { valid: true, hasCredits: true }
        }

        return { valid: false, status: response.status }

    } catch (error) {
        console.error('❌ Credit check failed:', error)
        return { valid: false, error: error.message }
    }
}

// Run all tests
async function runAllTests() {
    console.log('🚀 Running comprehensive OpenRouter API tests...\n')

    console.log('═══════════════════════════════════════')
    console.log('TEST 1: Basic API Connection')
    console.log('═══════════════════════════════════════')
    const basicTest = await testOpenRouterAPI()
    console.log('Result:', basicTest)

    console.log('\n═══════════════════════════════════════')
    console.log('TEST 2: JSON Response Format')
    console.log('═══════════════════════════════════════')
    const jsonTest = await testOpenRouterJSON()
    console.log('Result:', jsonTest)

    console.log('\n═══════════════════════════════════════')
    console.log('TEST 3: API Credits/Limits')
    console.log('═══════════════════════════════════════')
    const creditsTest = await checkOpenRouterCredits()
    console.log('Result:', creditsTest)

    console.log('\n═══════════════════════════════════════')
    console.log('SUMMARY')
    console.log('═══════════════════════════════════════')

    const allPassed = basicTest.success && jsonTest.success && creditsTest.valid

    if (allPassed) {
        console.log('✅ ALL TESTS PASSED')
        console.log('OpenRouter API is working correctly!')
    } else {
        console.log('❌ SOME TESTS FAILED')
        if (!basicTest.success) console.log('   - Basic API test failed')
        if (!jsonTest.success) console.log('   - JSON format test failed')
        if (!creditsTest.valid) console.log('   - Credits/limits check failed')
    }

    return {
        basicTest,
        jsonTest,
        creditsTest,
        allPassed
    }
}

// Export to window for browser console access
if (typeof window !== 'undefined') {
    window.testOpenRouter = testOpenRouterAPI
    window.testOpenRouterJSON = testOpenRouterJSON
    window.checkOpenRouterCredits = checkOpenRouterCredits
    window.runAllOpenRouterTests = runAllTests

    console.log('✅ OpenRouter test utilities loaded!')
    console.log('Run these commands in browser console:')
    console.log('  - window.testOpenRouter()')
    console.log('  - window.testOpenRouterJSON()')
    console.log('  - window.checkOpenRouterCredits()')
    console.log('  - window.runAllOpenRouterTests() // Run all tests')
}

export { testOpenRouterAPI, testOpenRouterJSON, checkOpenRouterCredits, runAllTests }
