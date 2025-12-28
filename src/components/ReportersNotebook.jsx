import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Bot, User, Sparkles } from 'lucide-react'
import { searchNews, fetchIndiaHeadlines, getTrendingTopics } from '../services/newsApi'
import { askReporterAI } from '../services/aiService'

const samplePrompts = [
    "What happened in Kerala today?",
    "Latest verified updates on floods",
    "Check recent earthquake claims",
    "Trending misinformation topics"
]

const initialMessages = [
    {
        id: 1,
        type: 'ai',
        content: `Welcome to Reporter's Notebook! I'm your AI research assistant. I can help you:

• **Verify claims** - Check any news story or viral content
• **Get briefings** - Summarized updates from verified sources
• **Track events** - Monitor developing stories in real-time
• **Find sources** - Locate credible information on any topic

What would you like to investigate today?`,
        timestamp: '2 mins ago'
    }
]

const sampleResponses = {
    "What happened in Kerala today?": {
        content: `**Kerala Situation Update** (Last verified: 5 mins ago)

📍 **Current Status**: Heavy rainfall continues across 7 districts

**Verified Facts:**
• IMD has issued red alert for Wayanad, Idukki, and Kozhikode
• 23 casualties confirmed by State Disaster Management Authority
• Over 10,000 people evacuated to 156 relief camps

**Sources:** PTI (92%), Kerala SDMA (Official), IMD (Official)

⚠️ **Misinformation Alert:** Claims of "500 casualties" circulating on WhatsApp are **unverified** and contradict official counts.

Would you like me to set up monitoring alerts for this event?`,
        timestamp: 'Just now'
    },
    "Latest verified updates on floods": {
        content: `**Flood Monitoring Report** (Real-time)

🌊 **Active Flood Situations:**

1. **Kerala** - Severe | 7 districts affected
   - Water level: Rising in Periyar, Chalakudy rivers
   - Status: Red alert active

2. **Assam** - Moderate | 3 districts affected
   - Brahmaputra above danger mark at Guwahati
   - Status: Orange alert

**Verification Stats Today:**
• 47 flood-related claims analyzed
• 12 marked as misinformation
• 35 verified as accurate

📊 Primary sources: IMD, CWC, State Disaster Management`,
        timestamp: 'Just now'
    }
}

function TypingIndicator() {
    return (
        <div className="flex items-center gap-2 p-4">
            <Bot className="w-5 h-5 text-[#0EA5E9]" />
            <div className="flex gap-1">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
            </div>
        </div>
    )
}

function MessageBubble({ message }) {
    const isAI = message.type === 'ai'

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${isAI ? '' : 'flex-row-reverse'}`}
        >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isAI ? 'bg-gradient-to-br from-[#0EA5E9] to-[#0284C7]' : 'bg-[#1A365D]'
                }`}>
                {isAI ? <Bot className="w-4 h-4 text-white" /> : <User className="w-4 h-4 text-[#94A3B8]" />}
            </div>

            <div className={`max-w-[85%] ${isAI ? '' : 'text-right'}`}>
                <div className={`p-4 rounded-2xl ${isAI
                        ? 'bg-[#0F2847] rounded-tl-none'
                        : 'bg-gradient-to-br from-[#0EA5E9] to-[#0284C7] rounded-tr-none'
                    }`}>
                    <p className="text-sm text-white whitespace-pre-line leading-relaxed"
                        dangerouslySetInnerHTML={{
                            __html: message.content
                                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                .replace(/\n/g, '<br />')
                        }}
                    />
                </div>
                <span className="text-xs text-[#64748B] mt-1 block">
                    {message.timestamp}
                </span>
            </div>
        </motion.div>
    )
}

export default function ReportersNotebook() {
    const [messages, setMessages] = useState(initialMessages)
    const [inputValue, setInputValue] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const messagesEndRef = useRef(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleSend = async (text = inputValue) => {
        if (!text.trim()) return

        const userMessage = {
            id: Date.now(),
            type: 'user',
            content: text,
            timestamp: 'Just now'
        }

        setMessages(prev => [...prev, userMessage])
        setInputValue('')
        setIsTyping(true)

        try {
            // Check for predefined sample responses first
            if (sampleResponses[text]) {
                setTimeout(() => {
                    setMessages(prev => [...prev, {
                        id: Date.now(),
                        type: 'ai',
                        ...sampleResponses[text]
                    }])
                    setIsTyping(false)
                }, 1500)
                return
            }

            // Step 1: Fetch news articles for context
            const newsResult = await searchNews(text, { pageSize: 10 })

            // Step 2: Use AI to generate intelligent response
            const aiResponse = await askReporterAI(text, {
                sources: newsResult.success ? newsResult.articles : [],
                totalResults: newsResult.totalResults || 0
            })

            let responseContent = ''

            // Format AI response with sources and suggestions
            responseContent = aiResponse.answer + '\n\n'

            // Add key sources if available
            if (aiResponse.keySources && aiResponse.keySources.length > 0) {
                responseContent += '**Key Sources:**\n'
                aiResponse.keySources.forEach(source => {
                    responseContent += `• ${source}\n`
                })
                responseContent += '\n'
            }

            // Add verification status
            if (aiResponse.verificationStatus && aiResponse.verificationStatus !== 'UNAVAILABLE') {
                const statusEmoji = {
                    'VERIFIED': '✅',
                    'PARTIAL': '⚠️',
                    'UNVERIFIED': '❌',
                    'ROUTINE': 'ℹ️'
                }
                responseContent += `**Verification Status:** ${statusEmoji[aiResponse.verificationStatus] || 'ℹ️'} ${aiResponse.verificationStatus}\n\n`
            }

            // Add urgency level indicator
            if (aiResponse.urgencyLevel && aiResponse.urgencyLevel !== 'ROUTINE') {
                responseContent += `**🚨 Urgency Level:** ${aiResponse.urgencyLevel}\n\n`
            }

            // Add suggested follow-up questions
            if (aiResponse.suggestedQuestions && aiResponse.suggestedQuestions.length > 0) {
                responseContent += '**Suggested Follow-ups:**\n'
                aiResponse.suggestedQuestions.forEach((q, i) => {
                    responseContent += `${i + 1}. ${q}\n`
                })
            }

            setTimeout(() => {
                setMessages(prev => [...prev, {
                    id: Date.now(),
                    type: 'ai',
                    content: responseContent,
                    timestamp: 'Just now'
                }])
                setIsTyping(false)
            }, 800)

        } catch (error) {
            console.error('Chat error:', error)
            setTimeout(() => {
                setMessages(prev => [...prev, {
                    id: Date.now(),
                    type: 'ai',
                    content: `I encountered an error while processing your question: "${text}"\n\nPlease try again or rephrase your query. I'm here to help with news verification and research!`,
                    timestamp: 'Just now'
                }])
                setIsTyping(false)
            }, 800)
        }
    }

    const handlePromptClick = (prompt) => {
        handleSend(prompt)
    }

    return (
        <section className="py-24 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    {/* Info Section */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0EA5E9] to-[#0284C7] flex items-center justify-center">
                                <Sparkles className="w-6 h-6 text-white" />
                            </div>
                            <h2 className="section-title">Reporter's Notebook</h2>
                        </div>

                        <p className="text-[#94A3B8] text-lg mb-6">
                            Your AI research assistant for investigative journalism. Get instant briefings,
                            verify claims, and track developing stories with verified sources.
                        </p>

                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-[#10B981]/20 flex items-center justify-center flex-shrink-0">
                                    <span className="text-[#10B981] font-bold">1</span>
                                </div>
                                <div>
                                    <h4 className="text-white font-medium">Ask anything</h4>
                                    <p className="text-[#64748B] text-sm">Query news events, claims, or topics</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-[#0EA5E9]/20 flex items-center justify-center flex-shrink-0">
                                    <span className="text-[#0EA5E9] font-bold">2</span>
                                </div>
                                <div>
                                    <h4 className="text-white font-medium">Get verified intel</h4>
                                    <p className="text-[#64748B] text-sm">AI cross-references trusted sources</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-[#F59E0B]/20 flex items-center justify-center flex-shrink-0">
                                    <span className="text-[#F59E0B] font-bold">3</span>
                                </div>
                                <div>
                                    <h4 className="text-white font-medium">Track & monitor</h4>
                                    <p className="text-[#64748B] text-sm">Set alerts for developing stories</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Chat Interface */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="glass-card-static overflow-hidden"
                    >
                        {/* Chat Header */}
                        <div className="px-6 py-4 border-b border-[rgba(148,163,184,0.2)] flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-[#10B981] animate-pulse" />
                            <span className="text-white font-medium">AI Assistant Online</span>
                        </div>

                        {/* Messages */}
                        <div className="h-[400px] overflow-y-auto p-4 space-y-4">
                            {messages.map((message) => (
                                <MessageBubble key={message.id} message={message} />
                            ))}

                            <AnimatePresence>
                                {isTyping && <TypingIndicator />}
                            </AnimatePresence>

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Prompt Chips */}
                        <div className="px-4 py-2 border-t border-[rgba(148,163,184,0.1)] flex gap-2 overflow-x-auto">
                            {samplePrompts.map((prompt) => (
                                <button
                                    key={prompt}
                                    onClick={() => handlePromptClick(prompt)}
                                    className="flex-shrink-0 px-3 py-1.5 rounded-full bg-[#1A365D] text-xs text-[#94A3B8] hover:bg-[#0EA5E9]/20 hover:text-[#0EA5E9] transition-colors"
                                >
                                    {prompt}
                                </button>
                            ))}
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t border-[rgba(148,163,184,0.2)]">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Ask about any news event..."
                                    className="input-glass flex-1 !py-3"
                                />
                                <button
                                    onClick={() => handleSend()}
                                    className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0EA5E9] to-[#0284C7] flex items-center justify-center hover:shadow-lg hover:shadow-[#0EA5E9]/30 transition-all"
                                >
                                    <Send className="w-5 h-5 text-white" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
