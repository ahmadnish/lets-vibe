/**
 * Research Agent - Conducts deep technical and domain research
 * Makes autonomous decisions about what research to perform
 */

import { callLLM } from '../utils/llm.js';
import { WebSearchAgent } from './web-search-agent.js';

export class ResearchAgent {
  constructor() {
    this.webSearchAgent = new WebSearchAgent();
    this.researchCache = new Map();
    this.knowledgeDomains = [
      'technology', 'market', 'competition', 'regulations', 
      'best_practices', 'architecture', 'security', 'scalability'
    ];
  }

  async conductResearch(researchTopics) {
    console.log(`🔬 Research Agent: Investigating ${researchTopics.length} topics`);
    
    const researchResults = {};
    
    for (const topic of researchTopics) {
      console.log(`📚 Researching: ${topic}`);
      researchResults[topic] = await this.researchTopic(topic);
    }

    // Synthesize all research findings
    const synthesis = await this.synthesizeResearch(researchResults);
    
    return {
      individualResearch: researchResults,
      synthesis,
      researchMetadata: {
        topicsInvestigated: researchTopics.length,
        timestamp: new Date().toISOString(),
        confidenceScore: this.calculateResearchConfidence(researchResults)
      }
    };
  }

  async researchTopic(topic) {
    // Determine research strategy for this topic
    const researchStrategy = await this.planResearchStrategy(topic);
    
    const results = {
      topic,
      strategy: researchStrategy,
      findings: {}
    };

    // Execute research based on strategy
    if (researchStrategy.webSearchNeeded) {
      results.findings.webResearch = await this.webSearchAgent.searchMultipleQueries(
        researchStrategy.searchQueries
      );
    }

    if (researchStrategy.technicalAnalysisNeeded) {
      results.findings.technicalAnalysis = await this.performTechnicalAnalysis(topic);
    }

    if (researchStrategy.marketAnalysisNeeded) {
      results.findings.marketAnalysis = await this.performMarketAnalysis(topic);
    }

    if (researchStrategy.riskAnalysisNeeded) {
      results.findings.riskAnalysis = await this.performRiskAnalysis(topic);
    }

    // Synthesize findings for this topic
    results.synthesis = await this.synthesizeTopicFindings(topic, results.findings);
    
    return results;
  }

  async planResearchStrategy(topic) {
    return await callLLM(
      `You are a research strategist. Plan the optimal research approach for this topic.
      
      Respond with JSON:
      {
        "webSearchNeeded": boolean,
        "searchQueries": ["array of specific search queries"],
        "technicalAnalysisNeeded": boolean,
        "marketAnalysisNeeded": boolean,
        "riskAnalysisNeeded": boolean,
        "specializedResearch": ["array of specialized research areas"],
        "expectedInsights": ["array of insights we expect to find"],
        "researchPriority": "high|medium|low"
      }`,
      `Research Topic: ${topic}
      
      Plan a comprehensive research strategy to gather the most valuable insights about this topic.`
    );
  }

  async performTechnicalAnalysis(topic) {
    return await callLLM(
      `You are a technical architect and engineer. Perform deep technical analysis on this topic.
      
      Respond with JSON:
      {
        "technical_feasibility": "high|medium|low",
        "implementation_complexity": "low|medium|high|very_high",
        "recommended_technologies": ["array of technology recommendations"],
        "architecture_patterns": ["array of suitable architecture patterns"],
        "performance_considerations": ["array of performance factors"],
        "scalability_factors": ["array of scalability considerations"],
        "security_implications": ["array of security considerations"],
        "maintenance_requirements": ["array of maintenance considerations"],
        "technical_risks": ["array of technical risks"],
        "development_timeline": "estimated development time"
      }`,
      `Technical Analysis Topic: ${topic}
      
      Provide comprehensive technical analysis covering all aspects of implementation.`
    );
  }

  async performMarketAnalysis(topic) {
    // First, search for market data
    const marketSearchResults = await this.webSearchAgent.searchMultipleQueries([
      `${topic} market size analysis 2024`,
      `${topic} industry trends growth`,
      `${topic} target audience demographics`,
      `${topic} pricing models revenue streams`
    ]);

    // Analyze market findings
    return await callLLM(
      `You are a market research analyst. Analyze the market landscape for this topic.
      
      Respond with JSON:
      {
        "market_size": "estimated market size and growth",
        "target_segments": ["array of target market segments"],
        "competition_level": "low|medium|high|very_high",
        "market_trends": ["array of relevant market trends"],
        "opportunities": ["array of market opportunities"],
        "threats": ["array of market threats"],
        "pricing_insights": ["array of pricing strategy insights"],
        "go_to_market_strategy": ["array of GTM recommendations"],
        "market_validation": "validation status and recommendations"
      }`,
      `Market Analysis Topic: ${topic}
      
      Market Research Data:
      ${JSON.stringify(marketSearchResults, null, 2)}
      
      Provide comprehensive market analysis.`
    );
  }

  async performRiskAnalysis(topic) {
    return await callLLM(
      `You are a risk management expert. Identify and analyze risks for this topic.
      
      Respond with JSON:
      {
        "technical_risks": [{"risk": "description", "probability": "high|medium|low", "impact": "high|medium|low", "mitigation": "mitigation strategy"}],
        "business_risks": [{"risk": "description", "probability": "high|medium|low", "impact": "high|medium|low", "mitigation": "mitigation strategy"}],
        "operational_risks": [{"risk": "description", "probability": "high|medium|low", "impact": "high|medium|low", "mitigation": "mitigation strategy"}],
        "regulatory_risks": [{"risk": "description", "probability": "high|medium|low", "impact": "high|medium|low", "mitigation": "mitigation strategy"}],
        "overall_risk_level": "low|medium|high|very_high",
        "critical_success_factors": ["array of factors critical for success"],
        "risk_mitigation_plan": ["array of overall mitigation strategies"]
      }`,
      `Risk Analysis Topic: ${topic}
      
      Identify and analyze all potential risks and provide mitigation strategies.`
    );
  }

  async synthesizeTopicFindings(topic, findings) {
    return await callLLM(
      `You are a research synthesizer. Combine all research findings into actionable insights.
      
      Respond with JSON:
      {
        "key_insights": ["array of most important insights"],
        "actionable_recommendations": ["array of specific recommendations"],
        "implementation_priorities": ["array of prioritized implementation steps"],
        "success_metrics": ["array of metrics to track success"],
        "next_steps": ["array of immediate next steps"],
        "confidence_level": "high|medium|low",
        "research_quality": "excellent|good|fair|poor"
      }`,
      `Research Topic: ${topic}
      
      Research Findings:
      ${JSON.stringify(findings, null, 2)}
      
      Synthesize all findings into actionable insights and recommendations.`
    );
  }

  async synthesizeResearch(researchResults) {
    return await callLLM(
      `You are a strategic research synthesizer. Combine all research across topics into a comprehensive strategic analysis.
      
      Respond with JSON:
      {
        "strategic_insights": ["array of high-level strategic insights"],
        "cross_topic_patterns": ["array of patterns identified across topics"],
        "synergies": ["array of synergies between different areas"],
        "conflicts": ["array of conflicting findings that need resolution"],
        "overall_feasibility": "high|medium|low",
        "strategic_recommendations": ["array of strategic recommendations"],
        "implementation_roadmap": ["array of phased implementation steps"],
        "success_probability": "percentage estimate of success probability"
      }`,
      `Comprehensive Research Results:
      ${JSON.stringify(researchResults, null, 2)}
      
      Provide strategic synthesis across all research topics.`
    );
  }

  calculateResearchConfidence(researchResults) {
    let totalScore = 0;
    let topicCount = 0;

    for (const [topic, results] of Object.entries(researchResults)) {
      topicCount++;
      let topicScore = 0;
      
      // Score based on research depth
      if (results.findings.webResearch) topicScore += 25;
      if (results.findings.technicalAnalysis) topicScore += 25;
      if (results.findings.marketAnalysis) topicScore += 25;
      if (results.findings.riskAnalysis) topicScore += 25;
      
      totalScore += topicScore;
    }

    return topicCount > 0 ? Math.round(totalScore / topicCount) : 0;
  }

  // Specialized research methods
  async analyzeMarket(topics) {
    const marketTopics = topics.filter(topic => 
      topic.toLowerCase().includes('market') || 
      topic.toLowerCase().includes('business') ||
      topic.toLowerCase().includes('competition')
    );

    if (marketTopics.length === 0) return null;

    return await this.conductResearch(marketTopics);
  }

  async researchTechnologies(topics) {
    const techTopics = topics.filter(topic =>
      topic.toLowerCase().includes('tech') ||
      topic.toLowerCase().includes('framework') ||
      topic.toLowerCase().includes('architecture')
    );

    if (techTopics.length === 0) return null;

    return await this.conductResearch(techTopics);
  }
}