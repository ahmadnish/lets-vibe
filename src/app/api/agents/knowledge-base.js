/**
 * Knowledge Base - Persistent memory and learning system for agents
 * Stores insights, patterns, and learnings from previous projects
 */

import { callLLM } from '../utils/llm.js';

export class KnowledgeBase {
  constructor() {
    this.knowledge = {
      patterns: new Map(),
      insights: new Map(),
      bestPractices: new Map(),
      failures: new Map(),
      technologies: new Map(),
      markets: new Map()
    };
    this.learningEnabled = true;
  }

  async storeProjectLearnings(project, results, feedback = null) {
    if (!this.learningEnabled) return;

    console.log('🧠 Knowledge Base: Storing project learnings');
    
    // Extract patterns and insights
    const learnings = await this.extractLearnings(project, results, feedback);
    
    // Store in appropriate categories
    await this.categorizeAndStore(learnings);
    
    // Update knowledge patterns
    await this.updatePatterns(project, results);
    
    console.log('✅ Knowledge Base: Learnings stored successfully');
  }

  async extractLearnings(project, results, feedback) {
    return await callLLM(
      `You are a knowledge extraction expert. Extract key learnings from this project and its results.
      
      Respond with JSON:
      {
        "success_patterns": ["array of patterns that led to success"],
        "failure_patterns": ["array of patterns that led to issues"],
        "technical_insights": ["array of technical insights"],
        "market_insights": ["array of market insights"],
        "team_insights": ["array of team collaboration insights"],
        "process_insights": ["array of process improvement insights"],
        "technology_learnings": ["array of technology-specific learnings"],
        "best_practices": ["array of best practices discovered"],
        "anti_patterns": ["array of anti-patterns to avoid"],
        "key_success_factors": ["array of factors critical to success"],
        "improvement_opportunities": ["array of areas for future improvement"]
      }`,
      `Project:
      ${JSON.stringify(project, null, 2)}
      
      Results:
      ${JSON.stringify(results, null, 2)}
      
      Feedback:
      ${feedback ? JSON.stringify(feedback, null, 2) : 'No feedback provided'}
      
      Extract comprehensive learnings from this project experience.`
    );
  }

  async categorizeAndStore(learnings) {
    // Store success patterns
    for (const pattern of learnings.success_patterns || []) {
      this.storePattern('success', pattern);
    }

    // Store failure patterns
    for (const pattern of learnings.failure_patterns || []) {
      this.storePattern('failure', pattern);
    }

    // Store insights by category
    for (const insight of learnings.technical_insights || []) {
      this.storeInsight('technical', insight);
    }

    for (const insight of learnings.market_insights || []) {
      this.storeInsight('market', insight);
    }

    // Store best practices
    for (const practice of learnings.best_practices || []) {
      this.storeBestPractice(practice);
    }

    // Store technology learnings
    for (const learning of learnings.technology_learnings || []) {
      this.storeTechnologyLearning(learning);
    }
  }

  storePattern(type, pattern) {
    const key = this.generatePatternKey(pattern);
    const existing = this.knowledge.patterns.get(key) || { 
      pattern, 
      type, 
      occurrences: 0, 
      projects: [] 
    };
    
    existing.occurrences++;
    existing.lastSeen = new Date().toISOString();
    
    this.knowledge.patterns.set(key, existing);
  }

  storeInsight(category, insight) {
    const key = this.generateInsightKey(insight);
    const existing = this.knowledge.insights.get(key) || {
      insight,
      category,
      confidence: 1,
      sources: []
    };
    
    existing.confidence++;
    existing.lastUpdated = new Date().toISOString();
    
    this.knowledge.insights.set(key, existing);
  }

  storeBestPractice(practice) {
    const key = this.generateBestPracticeKey(practice);
    const existing = this.knowledge.bestPractices.get(key) || {
      practice,
      effectiveness: 1,
      contexts: []
    };
    
    existing.effectiveness++;
    existing.lastValidated = new Date().toISOString();
    
    this.knowledge.bestPractices.set(key, existing);
  }

  storeTechnologyLearning(learning) {
    const key = this.generateTechnologyKey(learning);
    const existing = this.knowledge.technologies.get(key) || {
      learning,
      reliability: 1,
      contexts: []
    };
    
    existing.reliability++;
    existing.lastUpdated = new Date().toISOString();
    
    this.knowledge.technologies.set(key, existing);
  }

  async getRelevantKnowledge(projectContext) {
    console.log('🔍 Knowledge Base: Retrieving relevant knowledge');
    
    const relevantKnowledge = {
      patterns: this.getRelevantPatterns(projectContext),
      insights: this.getRelevantInsights(projectContext),
      bestPractices: this.getRelevantBestPractices(projectContext),
      technologies: this.getRelevantTechnologies(projectContext)
    };

    // Synthesize knowledge for this context
    const synthesis = await this.synthesizeKnowledge(projectContext, relevantKnowledge);
    
    return {
      ...relevantKnowledge,
      synthesis
    };
  }

  getRelevantPatterns(context) {
    const patterns = Array.from(this.knowledge.patterns.values());
    return patterns
      .filter(pattern => this.isRelevantToContext(pattern, context))
      .sort((a, b) => b.occurrences - a.occurrences)
      .slice(0, 10);
  }

  getRelevantInsights(context) {
    const insights = Array.from(this.knowledge.insights.values());
    return insights
      .filter(insight => this.isRelevantToContext(insight, context))
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 10);
  }

  getRelevantBestPractices(context) {
    const practices = Array.from(this.knowledge.bestPractices.values());
    return practices
      .filter(practice => this.isRelevantToContext(practice, context))
      .sort((a, b) => b.effectiveness - a.effectiveness)
      .slice(0, 10);
  }

  getRelevantTechnologies(context) {
    const technologies = Array.from(this.knowledge.technologies.values());
    return technologies
      .filter(tech => this.isRelevantToContext(tech, context))
      .sort((a, b) => b.reliability - a.reliability)
      .slice(0, 10);
  }

  isRelevantToContext(item, context) {
    // Simple relevance check - in a real implementation, this would be more sophisticated
    const itemText = JSON.stringify(item).toLowerCase();
    const contextText = JSON.stringify(context).toLowerCase();
    
    // Check for keyword overlap
    const contextWords = contextText.split(/\s+/);
    const relevantWords = contextWords.filter(word => 
      word.length > 3 && itemText.includes(word)
    );
    
    return relevantWords.length > 0;
  }

  async synthesizeKnowledge(context, relevantKnowledge) {
    if (this.isEmpty(relevantKnowledge)) {
      return { message: 'No relevant knowledge found for this context' };
    }

    return await callLLM(
      `You are a knowledge synthesizer. Combine relevant knowledge into actionable insights for this project context.
      
      Respond with JSON:
      {
        "key_recommendations": ["array of key recommendations based on knowledge"],
        "success_predictors": ["array of factors that predict success"],
        "risk_indicators": ["array of risk indicators to watch"],
        "best_practices_to_apply": ["array of best practices most relevant to this context"],
        "technologies_to_consider": ["array of technology recommendations"],
        "patterns_to_leverage": ["array of success patterns to leverage"],
        "patterns_to_avoid": ["array of failure patterns to avoid"],
        "confidence_level": "high|medium|low",
        "knowledge_gaps": ["array of areas where more knowledge is needed"]
      }`,
      `Project Context:
      ${JSON.stringify(context, null, 2)}
      
      Relevant Knowledge:
      ${JSON.stringify(relevantKnowledge, null, 2)}
      
      Synthesize this knowledge into actionable insights for the current project.`
    );
  }

  async updatePatterns(project, results) {
    // Analyze project outcomes and update pattern recognition
    const patternAnalysis = await callLLM(
      `You are a pattern recognition expert. Analyze this project and its results to identify patterns.
      
      Respond with JSON:
      {
        "emerging_patterns": ["array of new patterns identified"],
        "confirmed_patterns": ["array of patterns confirmed by this project"],
        "contradicted_patterns": ["array of patterns contradicted by this project"],
        "pattern_strength_updates": [
          {
            "pattern": "pattern description",
            "strength_change": "increased|decreased|unchanged",
            "evidence": "evidence for the change"
          }
        ]
      }`,
      `Project:
      ${JSON.stringify(project, null, 2)}
      
      Results:
      ${JSON.stringify(results, null, 2)}
      
      Analyze patterns and their validation from this project.`
    );

    // Update pattern strengths based on analysis
    this.updatePatternStrengths(patternAnalysis);
  }

  updatePatternStrengths(analysis) {
    // Update pattern strengths based on new evidence
    for (const update of analysis.pattern_strength_updates || []) {
      const key = this.generatePatternKey(update.pattern);
      const existing = this.knowledge.patterns.get(key);
      
      if (existing) {
        if (update.strength_change === 'increased') {
          existing.confidence = (existing.confidence || 1) * 1.1;
        } else if (update.strength_change === 'decreased') {
          existing.confidence = (existing.confidence || 1) * 0.9;
        }
        
        existing.lastValidated = new Date().toISOString();
        existing.evidence = existing.evidence || [];
        existing.evidence.push(update.evidence);
      }
    }
  }

  generatePatternKey(pattern) {
    return `pattern_${this.hashString(JSON.stringify(pattern))}`;
  }

  generateInsightKey(insight) {
    return `insight_${this.hashString(JSON.stringify(insight))}`;
  }

  generateBestPracticeKey(practice) {
    return `practice_${this.hashString(JSON.stringify(practice))}`;
  }

  generateTechnologyKey(learning) {
    return `tech_${this.hashString(JSON.stringify(learning))}`;
  }

  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  isEmpty(obj) {
    return Object.values(obj).every(arr => Array.isArray(arr) && arr.length === 0);
  }

  exportKnowledge() {
    return {
      patterns: Array.from(this.knowledge.patterns.entries()),
      insights: Array.from(this.knowledge.insights.entries()),
      bestPractices: Array.from(this.knowledge.bestPractices.entries()),
      technologies: Array.from(this.knowledge.technologies.entries()),
      exportDate: new Date().toISOString()
    };
  }

  importKnowledge(knowledgeData) {
    if (knowledgeData.patterns) {
      this.knowledge.patterns = new Map(knowledgeData.patterns);
    }
    if (knowledgeData.insights) {
      this.knowledge.insights = new Map(knowledgeData.insights);
    }
    if (knowledgeData.bestPractices) {
      this.knowledge.bestPractices = new Map(knowledgeData.bestPractices);
    }
    if (knowledgeData.technologies) {
      this.knowledge.technologies = new Map(knowledgeData.technologies);
    }
  }

  clearKnowledge() {
    this.knowledge = {
      patterns: new Map(),
      insights: new Map(),
      bestPractices: new Map(),
      failures: new Map(),
      technologies: new Map(),
      markets: new Map()
    };
  }

  getKnowledgeStats() {
    return {
      patterns: this.knowledge.patterns.size,
      insights: this.knowledge.insights.size,
      bestPractices: this.knowledge.bestPractices.size,
      technologies: this.knowledge.technologies.size,
      totalKnowledgeItems: this.knowledge.patterns.size + 
                          this.knowledge.insights.size + 
                          this.knowledge.bestPractices.size + 
                          this.knowledge.technologies.size
    };
  }
}