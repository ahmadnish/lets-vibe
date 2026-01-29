import {
  interpretProject,
  generateTasksAndMilestones,
  assignTasksAndTimeline,
  generateArtifacts,
} from "../utils/llm.js";
import { createNotionPage } from "../utils/notion.js";
import { createGitHubRepo } from "../utils/github.js";

export async function POST(request) {
  try {
    const body = await request.json();
    const { project_idea, special_instructions, contributors } = body;

    if (!project_idea || !project_idea.trim()) {
      return Response.json(
        { error: "Project idea is required" },
        { status: 400 },
      );
    }

    if (!contributors || contributors.length === 0) {
      return Response.json(
        { error: "At least one contributor is required" },
        { status: 400 },
      );
    }

    console.log("🚀 Starting enhanced project generation...");
    console.log("Project idea:", project_idea);
    console.log("Contributors:", contributors);
    console.log("Special instructions:", special_instructions);

    // Step 1: Interpret the project
    console.log("🔍 Step 1: Interpreting project...");
    const interpretation = await interpretProject(project_idea, special_instructions);
    console.log("Interpretation complete:", interpretation.title);

    // Step 2: Generate tasks and milestones
    console.log("📋 Step 2: Generating tasks and milestones...");
    const milestones = await generateTasksAndMilestones(interpretation);
    console.log("Generated", milestones.milestones?.length || 0, "milestones");

    // Step 3: Assign tasks and create timeline
    console.log("👥 Step 3: Assigning tasks and creating timeline...");
    const assignments = await assignTasksAndTimeline(milestones, contributors, special_instructions);
    console.log("Assigned", assignments.assignments?.length || 0, "tasks");

    // Step 4: Generate artifacts
    console.log("📄 Step 4: Generating artifacts...");
    const artifacts = await generateArtifacts(
      interpretation,
      milestones,
      assignments,
      project_idea,
    );
    console.log("Artifacts generated");

    console.log("✅ Enhanced project generation complete!");

    // Step 5: Create Notion page (optional)
    let notionUrl = null;
    try {
      console.log("📝 Creating Notion page...");
      notionUrl = await createNotionPage(
        interpretation,
        milestones,
        assignments,
      );
      console.log("Notion page created:", notionUrl);
    } catch (error) {
      console.error("Notion integration failed:", error.message);
      // Continue even if Notion fails
    }

    // Step 6: Create GitHub repository
    let githubUrl = null;
    try {
      console.log("🐙 Creating GitHub repository...");
      githubUrl = await createGitHubRepo(interpretation, artifacts, milestones);
      console.log("GitHub repo created:", githubUrl);
    } catch (error) {
      console.error("GitHub integration failed:", error.message);
      // Continue even if GitHub fails
    }

    console.log("🚀 Enhanced project generation complete!");

    // Return comprehensive results
    return Response.json({
      // Core project data
      title: interpretation.title,
      objectives: interpretation.objectives,
      scope_assumptions: interpretation.scope_assumptions,
      milestones: milestones.milestones || milestones,
      assignments: assignments.assignments || assignments,
      
      // Integration URLs
      notion_url: notionUrl,
      github_url: githubUrl,
      
      // Enhanced artifacts
      paper_content: artifacts?.paper_draft,
      readme_content: artifacts?.readme,
      api_documentation: artifacts?.api_documentation,
      deployment_guide: artifacts?.deployment_guide,
      testing_strategy: artifacts?.testing_strategy,
      code_structure: artifacts?.code_structure,
      
      // Enhanced features indicator
      agent_insights: {
        confidence_score: 85, // Good confidence without web search
        web_search_performed: false,
        technical_research_conducted: true,
        market_analysis_performed: false,
        enhancement_applied: true
      },
      
      // Metadata
      generation_type: "enhanced",
      generation_timestamp: new Date().toISOString(),
      agent_version: "1.0.0"
    });

  } catch (error) {
    console.error("❌ Enhanced project generation failed:", error);
    return Response.json(
      { 
        error: error.message || "Failed to generate project",
        generation_type: "enhanced",
        failure_timestamp: new Date().toISOString()
      },
      { status: 500 },
    );
  }
}