/**
 * Validation Agent - Autonomous quality assurance and validation
 * Validates project feasibility, completeness, and quality
 */

import { callLLM } from '../utils/llm.js';
import { WebSearchAgent } from './web-search-agent.js';

export class ValidationAgent {
  constructor() {
    this.webSearchAgent = new WebSearchAgent();
    this.validationCriteria = [
      'technical_feasibility',
      'market_viability', 
      'resource_adequacy',
      'timeline_realism',
      'risk_assessment',
      'completeness_check',
      'quality_standards',
      'best_practices_compliance'
    ];
  }

  async validateProject(project) {
    console.log('🔍 Validation Agent: Starting comprehensive project validation');
    
    const validationResults = {
      timestamp: new Date().toISOString(),
      validationCriteria: this.validationCriteria,
      results: {},
      overallScore: 0,
      improvementNeeded: false,
      suggestions: []
    };

    // Run all validation checks
    for (const criterion of this.validationCriteria) {
      console.log(`✅ Validating: ${criterion}`);
      validationResults.results[criterion] = await this.validateCriterion(project, criterion);
    }

    // Calculate overall validation score
    validationResults.overallScore = this.calculateOverallScore(validationResults.results);
    
    // Determine if improvement is needed
    validationResults.improvementNeeded = validationResults.overallScore < 75;
    
    // Generate improvement suggestions
    if (validationResults.improvementNeeded) {
      validationResults.suggestions = await this.generateImprovementSuggestions(
        project, 
        validationResults.results
      );
    }

    // Generate validation report
    validationResults.report = await this.generateValidationReport(validationResults);
    
    return validationResults;
  }

  async validateCriterion(project, criterion) {
    const validationMethod = `validate${criterion.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join('')}`;

    if (typeof this[validationMethod] === 'function') {
      return await this[validationMethod](project);
    } else {
      return await this.genericValidation(project, criterion);
    }
  }

  async validateTechnicalFeasibility(project) {
    return await callLLM(
      `You are a senior technical architect. Validate the technical feasibility of this project.
      
      Respond with JSON:
      {
        "score": "number 0-100",
        "feasibility": "high|medium|low",
        "technical_challenges": ["array of technical challenges"],
        "technology_risks": ["array of technology-related risks"],
        "architecture_concerns": ["array of architecture concerns"],
        "scalability_assessment": "excellent|good|fair|poor",
        "performance_expectations": "realistic|optimistic|unrealistic",
        "implementation_complexity": "low|medium|high|very_high",
        "recommendations": ["array of technical recommendations"]
      }`,
      `Project for Technical Validation:
      ${JSON.stringify(project, null, 2)}
      
      Assess technical feasibility and provide detailed analysis.`
    );
  }

  async validateMarketViability(project) {
    // First, research current market conditions
    const marketResearch = await this.webSearchAgent.searchMultipleQueries([
      `${project.title} market demand 2024`,
      `${project.title} competition analysis`,
      `${project.title} target audience size`,
      `${project.title} monetization strategies`
    ]);

    return await callLLM(
      `You are a market research expert. Validate the market viability of this project.
      
      Respond with JSON:
      {
        "score": "number 0-100",
        "viability": "high|medium|low",
        "market_demand": "high|medium|low",
        "competition_level": "low|medium|high|very_high",
        "target_market_size": "large|medium|small|niche",
        "monetization_potential": "excellent|good|fair|poor",
        "market_timing": "excellent|good|fair|poor",
        "barriers_to_entry": ["array of market barriers"],
        "competitive_advantages": ["array of competitive advantages"],
        "recommendations": ["array of market recommendations"]
      }`,
      `Project for Market Validation:
      ${JSON.stringify(project, null, 2)}
      
      Market Research Data:
      ${JSON.stringify(marketResearch, null, 2)}
      
      Assess market viability and provide detailed analysis.`
    );
  }

  async validateResourceAdequacy(project) {
    return await callLLM(
      `You are a resource planning expert. Validate if the allocated resources are adequate for this project.
      
      Respond with JSON:
      {
        "score": "number 0-100",
        "adequacy": "adequate|insufficient|excessive",
        "team_size_assessment": "appropriate|understaffed|overstaffed",
        "skill_coverage": "complete|partial|inadequate",
        "missing_expertise": ["array of missing expertise areas"],
        "workload_distribution": "balanced|unbalanced",
        "resource_risks": ["array of resource-related risks"],
        "optimization_opportunities": ["array of resource optimization suggestions"],
        "recommendations": ["array of resource recommendations"]
      }`,
      `Project for Resource Validation:
      ${JSON.stringify(project, null, 2)}
      
      Assess resource adequacy and allocation efficiency.`
    );
  }

  async validateTimelineRealism(project) {
    return await callLLM(
      `You are a project management expert. Validate the realism of the project timeline.
      
      Respond with JSON:
      {
        "score": "number 0-100",
        "realism": "realistic|optimistic|unrealistic",
        "timeline_assessment": "well_planned|rushed|too_conservative",
        "critical_path_analysis": ["array of critical path concerns"],
        "dependency_risks": ["array of dependency-related risks"],
        "buffer_adequacy": "adequate|insufficient|excessive",
        "milestone_feasibility": ["array of milestone feasibility assessments"],
        "timeline_risks": ["array of timeline risks"],
        "recommendations": ["array of timeline recommendations"]
      }`,
      `Project for Timeline Validation:
      ${JSON.stringify(project, null, 2)}
      
      Assess timeline realism and identify potential scheduling issues.`
    );
  }

  async validateRiskAssessment(project) {
    return await callLLM(
      `You are a risk management expert. Validate the project's risk assessment and mitigation strategies.
      
      Respond with JSON:
      {
        "score": "number 0-100",
        "risk_coverage": "comprehensive|partial|inadequate",
        "unidentified_risks": ["array of risks not previously identified"],
        "mitigation_quality": "excellent|good|fair|poor",
        "contingency_planning": "adequate|inadequate",
        "risk_monitoring": ["array of risk monitoring recommendations"],
        "critical_risks": ["array of most critical risks"],
        "risk_tolerance": "appropriate|too_high|too_low",
        "recommendations": ["array of risk management recommendations"]
      }`,
      `Project for Risk Validation:
      ${JSON.stringify(project, null, 2)}
      
      Assess risk identification, analysis, and mitigation strategies.`
    );
  }

  async validateCompletenessCheck(project) {
    return await callLLM(
      `You are a project completeness auditor. Check if all necessary project components are included.
      
      Respond with JSON:
      {
        "score": "number 0-100",
        "completeness": "complete|mostly_complete|incomplete",
        "missing_components": ["array of missing project components"],
        "documentation_quality": "excellent|good|fair|poor",
        "specification_clarity": "clear|unclear|ambiguous",
        "deliverable_definition": "well_defined|partially_defined|poorly_defined",
        "acceptance_criteria": "clear|unclear|missing",
        "quality_standards": ["array of quality standard assessments"],
        "recommendations": ["array of completeness recommendations"]
      }`,
      `Project for Completeness Validation:
      ${JSON.stringify(project, null, 2)}
      
      Check project completeness and identify missing components.`
    );
  }

  async validateQualityStandards(project) {
    return await callLLM(
      `You are a quality assurance expert. Validate adherence to quality standards and best practices.
      
      Respond with JSON:
      {
        "score": "number 0-100",
        "quality_level": "excellent|good|fair|poor",
        "standards_compliance": ["array of standards compliance assessments"],
        "best_practices_adherence": "high|medium|low",
        "code_quality_expectations": "realistic|unrealistic",
        "testing_strategy": "comprehensive|adequate|inadequate",
        "documentation_standards": "excellent|good|fair|poor",
        "quality_gates": ["array of recommended quality gates"],
        "recommendations": ["array of quality improvement recommendations"]
      }`,
      `Project for Quality Standards Validation:
      ${JSON.stringify(project, null, 2)}
      
      Assess quality standards and best practices compliance.`
    );
  }

  async validateBestPracticesCompliance(project) {
    // Research current best practices
    const bestPracticesResearch = await this.webSearchAgent.searchBestPractices(
      project.title || 'software development'
    );

    return await callLLM(
      `You are a best practices expert. Validate compliance with industry best practices.
      
      Respond with JSON:
      {
        "score": "number 0-100",
        "compliance_level": "high|medium|low",
        "best_practices_followed": ["array of best practices being followed"],
        "best_practices_missing": ["array of missing best practices"],
        "industry_standards": ["array of relevant industry standards"],
        "methodology_alignment": "aligned|partially_aligned|misaligned",
        "process_maturity": "high|medium|low",
        "improvement_areas": ["array of areas for improvement"],
        "recommendations": ["array of best practices recommendations"]
      }`,
      `Project for Best Practices Validation:
      ${JSON.stringify(project, null, 2)}
      
      Best Practices Research:
      ${JSON.stringify(bestPracticesResearch, null, 2)}
      
      Assess compliance with industry best practices.`
    );
  }

  async genericValidation(project, criterion) {
    return await callLLM(
      `You are a project validation expert. Validate this project against the specified criterion.
      
      Respond with JSON:
      {
        "score": "number 0-100",
        "assessment": "excellent|good|fair|poor",
        "strengths": ["array of strengths in this area"],
        "weaknesses": ["array of weaknesses in this area"],
        "risks": ["array of risks related to this criterion"],
        "opportunities": ["array of opportunities for improvement"],
        "recommendations": ["array of specific recommendations"]
      }`,
      `Project for Validation:
      ${JSON.stringify(project, null, 2)}
      
      Validation Criterion: ${criterion}
      
      Provide detailed validation assessment for this criterion.`
    );
  }

  calculateOverallScore(validationResults) {
    const scores = Object.values(validationResults).map(result => result.score || 0);
    return scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  }

  async generateImprovementSuggestions(project, validationResults) {
    return await callLLM(
      `You are a project improvement consultant. Generate specific, actionable improvement suggestions.
      
      Respond with JSON array of improvement suggestions:
      [
        {
          "category": "category of improvement",
          "priority": "high|medium|low",
          "suggestion": "specific improvement suggestion",
          "rationale": "why this improvement is needed",
          "implementation": "how to implement this improvement",
          "impact": "expected impact of this improvement"
        }
      ]`,
      `Project:
      ${JSON.stringify(project, null, 2)}
      
      Validation Results:
      ${JSON.stringify(validationResults, null, 2)}
      
      Generate prioritized improvement suggestions based on validation findings.`
    );
  }

  async generateValidationReport(validationResults) {
    return await callLLM(
      `You are a project validation reporter. Generate a comprehensive validation report.
      
      Respond with JSON:
      {
        "executive_summary": "high-level summary of validation results",
        "overall_assessment": "overall project assessment",
        "key_strengths": ["array of key project strengths"],
        "critical_issues": ["array of critical issues to address"],
        "risk_level": "low|medium|high|very_high",
        "go_no_go_recommendation": "go|conditional_go|no_go",
        "next_steps": ["array of recommended next steps"],
        "validation_confidence": "high|medium|low"
      }`,
      `Validation Results:
      ${JSON.stringify(validationResults, null, 2)}
      
      Generate a comprehensive validation report with clear recommendations.`
    );
  }
}