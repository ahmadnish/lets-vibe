import {
  interpretProject,
  generateTasksAndMilestones,
  assignTasksAndTimeline,
  generateArtifacts,
} from "@/app/api/utils/llm";
import { createNotionPage } from "@/app/api/utils/notion";
import { createGitHubRepo } from "@/app/api/utils/github";

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

    console.log("Starting project generation...");
    console.log("Project idea:", project_idea);
    console.log("Contributors:", contributors);

    // Step 1: Interpret the project
    console.log("Step 1: Interpreting project...");
    const interpretation = await interpretProject(project_idea, special_instructions);
    console.log("Interpretation complete:", interpretation.title);

    // Step 2: Generate tasks and milestones
    console.log("Step 2: Generating tasks and milestones...");
    const milestones = await generateTasksAndMilestones(interpretation);
    console.log("Generated", milestones.milestones.length, "milestones");

    // Step 3: Assign tasks and create timeline
    console.log("Step 3: Assigning tasks and creating timeline...");
    const assignments = await assignTasksAndTimeline(milestones, contributors, special_instructions);
    console.log("Assigned", assignments.assignments.length, "tasks");

    // Step 4: Generate artifacts
    console.log("Step 4: Generating artifacts...");
    const artifacts = await generateArtifacts(
      interpretation,
      milestones,
      assignments,
      project_idea,
    );
    console.log("Artifacts generated");
    console.log("README length:", artifacts.readme?.length || 0);
    console.log("README preview:", artifacts.readme?.substring(0, 200) || "No README content");

    // Step 5: Create Notion page
    let notionUrl = null;
    try {
      console.log("Step 5: Creating Notion page...");
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
      console.log("Step 6: Creating GitHub repository...");
      githubUrl = await createGitHubRepo(interpretation, artifacts, milestones);
      console.log("GitHub repo created:", githubUrl);
    } catch (error) {
      console.error("GitHub integration failed:", error.message);
      // Continue even if GitHub fails
    }

    console.log("Project generation complete!");

    // Return results
    return Response.json({
      title: interpretation.title,
      objectives: interpretation.objectives,
      scope_assumptions: interpretation.scope_assumptions,
      milestones: milestones.milestones,
      assignments: assignments.assignments,
      notion_url: notionUrl,
      github_url: githubUrl,
      paper_content: artifacts.paper_draft,
      readme_content: artifacts.readme,
    });
  } catch (error) {
    console.error("Error generating project:", error);
    return Response.json(
      { error: error.message || "Failed to generate project" },
      { status: 500 },
    );
  }
}
