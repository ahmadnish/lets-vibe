# 🚀 Agentic Setup Guide

## Quick Start (Basic Mode)

Your agentic system will work without web search, but with limited research capabilities.

1. **Required Environment Variables**
   ```bash
   # Copy the example file
   cp env.example .env
   
   # Edit .env and add your OpenAI key
   OPENAI_API_KEY=your_openai_api_key_here
   ```

2. **Start the Application**
   ```bash
   npm run dev
   ```

## Full Agentic Mode (Recommended)

For the complete agentic experience with real-time web research:

### 1. Get Serper API Key (Free)

1. Visit [serper.dev](https://serper.dev)
2. Sign up with Google/GitHub (takes 30 seconds)
3. Get 100 free searches per month
4. Copy your API key

### 2. Configure Environment

Add to your `.env` file:
```bash
# Core AI (Required)
OPENAI_API_KEY=your_openai_api_key_here

# Web Search (Recommended for full agentic capabilities)
SERPER_API_KEY=your_serper_api_key_here

# Optional Integrations
GITHUB_TOKEN=your_github_token_here
NOTION_API_KEY=your_notion_api_key_here
```

### 3. Restart Application

```bash
npm run dev
```

## 🤖 What You Get

### Basic Mode (OpenAI only)
- ✅ AI project generation
- ✅ Task assignment and planning
- ✅ Code scaffolding
- ✅ Documentation generation
- ❌ Real-time web research
- ❌ Market analysis
- ❌ Competitor research
- ❌ Technology trend analysis

### Full Agentic Mode (OpenAI + Serper)
- ✅ Everything in Basic Mode
- ✅ **Real-time web research**
- ✅ **Market analysis and trends**
- ✅ **Competitor intelligence**
- ✅ **Technology research**
- ✅ **Regulatory compliance research**
- ✅ **Best practices discovery**
- ✅ **Case studies and examples**
- ✅ **Higher confidence scores**

## 🔍 How to Tell Which Mode You're In

Look for these indicators in the UI:

**Basic Mode:**
- Confidence scores: 60-80%
- Research indicators: ❌ No web search performed
- Logs: "⚠️ Web search requested but SERPER_API_KEY not configured"

**Full Agentic Mode:**
- Confidence scores: 80-95%
- Research indicators: ✅ Web search, market analysis, technical research
- Logs: "🌐 Performing X web searches", "🔬 Research Agent: Investigating Y topics"

## 💡 Pro Tips

1. **Start with Basic Mode** to test the system
2. **Upgrade to Full Mode** for production use
3. **Monitor your Serper usage** at [serper.dev/dashboard](https://serper.dev/dashboard)
4. **100 searches/month** is usually enough for 10-20 comprehensive projects

## 🆘 Troubleshooting

**"SERPER_API_KEY not configured" errors:**
- This is normal in Basic Mode
- The system will continue working with reduced capabilities
- Add the API key to enable full research features

**"Search failed" messages:**
- Check your Serper API key is correct
- Verify you haven't exceeded your monthly limit
- The system will gracefully fallback to basic mode

## 🎯 Next Steps

Once you have the full agentic system running:
1. Try generating a complex project
2. Watch the real-time research in the console logs
3. Compare the confidence scores and research depth
4. Explore the enhanced artifacts and documentation

The agentic system becomes significantly more powerful with web search enabled! 🚀