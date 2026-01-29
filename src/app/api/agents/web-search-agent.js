/**
 * Web Search Agent - Performs autonomous web research
 * Uses multiple search APIs and intelligently processes results
 */

import { callLLM } from '../utils/llm.js';

export class WebSearchAgent {
  constructor() {
    this.searchProviders = ['serper', 'bing', 'duckduckgo'];
    this.cache = new Map();
  }

  async search(query, options = {}) {
    const cacheKey = `${query}-${JSON.stringify(options)}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    console.log(`🔍 Web Search: "${query}"`);
    
    try {
      // Primary search using Serper API (Google Search)
      const searchResults = await this.searchWithSerper(query, options);
      
      // Process and analyze results with LLM
      const analyzedResults = await this.analyzeSearchResults(query, searchResults);
      
      this.cache.set(cacheKey, analyzedResults);
      return analyzedResults;
      
    } catch (error) {
      console.error(`Search failed for "${query}":`, error);
      return { query, results: [], analysis: null, error: error.message };
    }
  }

  async searchWithSerper(query, options = {}) {
    const apiKey = process.env.SERPER_API_KEY;
    if (!apiKey) {
      console.warn('⚠️ SERPER_API_KEY not configured - web search disabled');
      return {
        organic: [],
        searchInformation: {
          totalResults: 0,
          formattedTotalResults: "0 results (API key not configured)"
        }
      };
    }

    const searchParams = {
      q: query,
      num: options.numResults || 10,
      hl: options.language || 'en',
      gl: options.country || 'us'
    };

    const response = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(searchParams)
    });

    if (!response.ok) {
      throw new Error(`Serper API error: ${response.status}`);
    }

    return await response.json();
  }

  async analyzeSearchResults(query, searchResults) {
    if (!searchResults.organic || searchResults.organic.length === 0) {
      return { 
        query, 
        results: [], 
        analysis: {
          key_insights: ["Web search unavailable - API key not configured"],
          trends: ["Unable to analyze current trends without web access"],
          recommendations: ["Configure SERPER_API_KEY for enhanced research capabilities"],
          technical_details: ["Web search functionality disabled"],
          market_data: ["Market analysis unavailable without web search"],
          competitors: ["Competitor analysis unavailable without web search"],
          technologies: ["Technology research limited without web access"],
          summary: "Web search functionality is disabled. Configure SERPER_API_KEY to enable real-time research capabilities."
        }
      };
    }

    // Extract key information from search results
    const relevantResults = searchResults.organic.slice(0, 5).map(result => ({
      title: result.title,
      snippet: result.snippet,
      url: result.link,
      date: result.date
    }));

    // Use LLM to analyze and synthesize findings
    const analysis = await callLLM(
      `You are a research analyst. Analyze these search results and extract key insights, trends, and actionable information.
      
      Respond with JSON:
      {
        "key_insights": ["array of key insights"],
        "trends": ["array of identified trends"],
        "recommendations": ["array of actionable recommendations"],
        "technical_details": ["array of technical information found"],
        "market_data": ["array of market-related information"],
        "competitors": ["array of competitors or similar solutions"],
        "technologies": ["array of relevant technologies mentioned"],
        "summary": "concise summary of findings"
      }`,
      `Search Query: "${query}"
      
      Search Results:
      ${JSON.stringify(relevantResults, null, 2)}
      
      Analyze these results and provide comprehensive insights.`
    );

    return {
      query,
      results: relevantResults,
      analysis,
      timestamp: new Date().toISOString()
    };
  }

  async searchMultipleQueries(queries) {
    console.log(`🔍 Performing batch search for ${queries.length} queries`);
    
    const results = await Promise.all(
      queries.map(query => this.search(query))
    );

    // Synthesize findings across all searches
    const synthesis = await this.synthesizeMultipleSearches(queries, results);
    
    return {
      individualResults: results,
      synthesis
    };
  }

  async synthesizeMultipleSearches(queries, results) {
    return await callLLM(
      `You are a research synthesizer. Analyze multiple search results and create a comprehensive synthesis of findings.
      
      Respond with JSON:
      {
        "overall_insights": ["array of insights across all searches"],
        "common_themes": ["array of themes that appeared across searches"],
        "contradictions": ["array of contradictory information found"],
        "confidence_level": "high|medium|low",
        "research_gaps": ["array of areas needing more research"],
        "actionable_conclusions": ["array of actionable conclusions"]
      }`,
      `Search Queries: ${JSON.stringify(queries)}
      
      Search Results:
      ${JSON.stringify(results, null, 2)}
      
      Synthesize these findings into comprehensive insights.`
    );
  }

  // Specialized search methods
  async searchTechnologies(projectType) {
    const queries = [
      `best ${projectType} technology stack 2024`,
      `${projectType} development frameworks comparison`,
      `${projectType} architecture patterns best practices`,
      `${projectType} scalability performance benchmarks`
    ];
    
    return await this.searchMultipleQueries(queries);
  }

  async searchCompetitors(projectIdea) {
    const queries = [
      `${projectIdea} competitors market analysis`,
      `similar products to ${projectIdea}`,
      `${projectIdea} market size trends`,
      `${projectIdea} business model analysis`
    ];
    
    return await this.searchMultipleQueries(queries);
  }

  async searchBestPractices(domain) {
    const queries = [
      `${domain} best practices 2024`,
      `${domain} common mistakes to avoid`,
      `${domain} success stories case studies`,
      `${domain} implementation guidelines`
    ];
    
    return await this.searchMultipleQueries(queries);
  }

  clearCache() {
    this.cache.clear();
  }
}