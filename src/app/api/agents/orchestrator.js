/**
 * Agent Orchestrator - The central brain that coordinates all agents
 * Makes autonomous decisions about what research, validation, and enhancement to perform
 */

import { WebSearchAgent } from './web-search-agent.js';
import { ResearchAgent } from './research-agent.js';
import { ValidationAgent } from './validation-agent.js';
import { EnhancementAgent } from './enhancement-agent.js';
import { KnowledgeBase } from './knowledge-base.js';
import { callLLM } from '../utils/llm.js';

export class AgentOrchestrator {
  constructor() {
    this.webSearchAgent = new WebSearchAgent();
    this.researchAgent = new ResearchAgent();
    this.validationAgent = new ValidationAgent();
    this.enhancementAgent = new EnhancementAgent();
    this.knowledgeBase = new KnowledgeBase();
    this.executionLog = [];
  }

  async orchestrateProjectGeneration(projectIdea, contributors, specialInstructions) {
    this.log("🧠 Agent Orchestrator starting autonomous project generation");
    
    // Phase 1: Autonomous Analysis & Planning
    const analysisResults = await this.autonomousAnalysis(projectIdea, specialInstructions);
    
    // Phase 2: Dynamic Research & Validation
    const researchResults = await this.autonomousResearch(analysisResults);
    
    // Phase 3: Enhanced Project Generation
    const enhancedProject = await this.enhancedGeneration(
      projectIdea, 
      contributors, 
      specialInstructions, 
      analysisResults, 
      researchResults
    );
    
    // Phase 4: Continuous Validation & Improvement
    const finalProject = await this.continuousImprovement(enhancedProject);
    
    return {
      ...finalProject,
      agentInsights: {
        analysisResults,
        researchResults,
        executionLog: this.executionLog,
        confidenceScore: this.calculateConfidenceScore(),
        recommendations: await this.generateRecommendations(finalProject)
      }
    };
  }

  async autonomousAnalysis(projectIdea, specialInstructions) {
    this.log("🔍 Starting autonomous project analysis");
    
    // Agent decides what aspects need deeper analysis
    const analysisDecision = await callLLM(
      `You are an autonomous project analysis agent. Analyze the project idea and determine what additional research, validation, and enhancement is needed.
      
      Respond with JSON:
      {
        "complexity_assessment": "low|medium|high|very_high",
        "research_needed": ["array of research topics"],
        "validation_checks": ["array of validation requirements"],
        "enhancement_opportunities": ["array of enhancement suggestions"],
        "web_search_queries": ["array of search queries to perform"],
        "additional_llm_calls": ["array of specialized LLM tasks needed"],
        "risk_factors": ["array of potential risks"],
        "success_factors": ["array of critical success factors"]
      }`,
      `Project Idea: ${projectIdea}
      Special Instructions: ${specialInstructions || 'None'}
      
      Autonomously determine what research, validation, and enhancement this project needs.`
    );

    this.log(`📊 Analysis complete: ${analysisDecision.complexity_assessment} complexity`);
    return analysisDecision;
  }

  async autonomousResearch(analysisResults) {
    this.log("🔬 Starting autonomous research phase");
    const researchResults = {};

    // Web Search Research
    if (analysisResults.web_search_queries?.length > 0) {
      const hasApiKey = process.env.SERPER_API_KEY;
      if (hasApiKey) {
        this.log(`🌐 Performing ${analysisResults.web_search_queries.length} web searches`);
      } else {
        this.log(`⚠️ Web search requested but SERPER_API_KEY not configured - using fallback research`);
      }
      
      researchResults.webSearchResults = await Promise.all(
        analysisResults.web_search_queries.map(query => 
          this.webSearchAgent.search(query)
        )
      );
    }

    // Technical Research
    if (analysisResults.research_needed?.length > 0) {
      this.log(`📚 Conducting technical research on ${analysisResults.research_needed.length} topics`);
      researchResults.technicalResearch = await this.researchAgent.conductResearch(
        analysisResults.research_needed
      );
    }

    // Market & Competitive Analysis
    researchResults.marketAnalysis = await this.researchAgent.analyzeMarket(
      analysisResults.research_needed
    );

    // Technology Stack Research
    researchResults.technologyResearch = await this.researchAgent.researchTechnologies(
      analysisResults.research_needed
    );

    this.log("✅ Research phase complete");
    return researchResults;
  }

  async enhancedGeneration(projectIdea, contributors, specialInstructions, analysisResults, researchResults) {
    this.log("🚀 Starting enhanced project generation with agent insights");

    // Create enhanced context for LLM
    const enhancedContext = {
      originalIdea: projectIdea,
      contributors,
      specialInstructions,
      agentAnalysis: analysisResults,
      researchFindings: researchResults,
      marketInsights: researchResults.marketAnalysis,
      technicalRecommendations: researchResults.technologyResearch
    };

    // Generate project with enhanced context
    const enhancedProject = await callLLM(
      `You are an expert project architect with access to comprehensive research and market analysis.
      Use the provided research findings and agent analysis to create a superior project plan.
      
      Respond with JSON following the standard project schema but enhanced with research insights.`,
      `Enhanced Project Generation Context:
      ${JSON.stringify(enhancedContext, null, 2)}
      
      Create a comprehensive project plan that incorporates all research findings and agent recommendations.`
    );

    return enhancedProject;
  }

  async continuousImprovement(project) {
    this.log("🔄 Starting continuous improvement validation");

    // Validate project feasibility
    const validationResults = await this.validationAgent.validateProject(project);
    
    // Enhance based on validation
    if (validationResults.improvementNeeded) {
      this.log("🔧 Applying autonomous improvements");
      const improvedProject = await this.enhancementAgent.enhanceProject(
        project, 
        validationResults.suggestions
      );
      return improvedProject;
    }

    return project;
  }

  calculateConfidenceScore() {
    // Calculate confidence based on research depth, validation results, etc.
    const factors = {
      researchDepth: this.executionLog.filter(log => log.includes('research')).length,
      validationChecks: this.executionLog.filter(log => log.includes('validation')).length,
      enhancementSteps: this.executionLog.filter(log => log.includes('enhancement')).length
    };

    const score = Math.min(100, (factors.researchDepth * 20 + factors.validationChecks * 25 + factors.enhancementSteps * 15));
    return score;
  }

  async generateRecommendations(project) {
    return await callLLM(
      `Generate strategic recommendations for this project based on the comprehensive analysis performed.`,
      `Project: ${JSON.stringify(project, null, 2)}
      
      Provide actionable recommendations for success.`
    );
  }

  log(message) {
    const timestamp = new Date().toISOString();
    this.executionLog.push(`[${timestamp}] ${message}`);
    console.log(`🤖 ${message}`);
  }
}