// LLM utility for OpenAI-compatible API calls

async function callLLM(systemPrompt, userPrompt, jsonMode = true) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY not configured");
  }

  const response = await fetch("https://eu.api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: jsonMode ? { type: "json_object" } : undefined,
      temperature: 0.8,
      max_tokens: 4000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;

  return jsonMode ? JSON.parse(content) : content;
}

// Step 1: Project Interpretation
export async function interpretProject(projectIdea, specialInstructions = "") {
  const systemPrompt = `You are a senior project architect and technical lead with expertise in software engineering, research, and product development. 

Your task is to analyze the project idea and create a comprehensive, detailed project interpretation that will serve as the foundation for a professional implementation.

You must respond with valid JSON only, following this exact schema:
{
  "title": "string - professional, descriptive project title",
  "description": "string - comprehensive 2-3 paragraph project description",
  "objectives": ["array of 5-8 detailed, measurable objectives"],
  "scope_assumptions": ["array of 4-6 detailed scope assumptions and constraints"],
  "technical_requirements": ["array of 6-10 specific technical requirements"],
  "success_criteria": ["array of 4-6 measurable success criteria"],
  "estimated_duration": "string - realistic project duration (e.g., '6 months', '1 year')",
  "complexity_level": "string - 'Low', 'Medium', 'High', or 'Very High'",
  "primary_technologies": ["array of main technologies/frameworks to be used"],
  "target_audience": "string - who will use this project",
  "business_value": "string - clear statement of business/research value"
}`;

  const specialInstructionsText = specialInstructions ? `\n\nSpecial Instructions: ${specialInstructions}` : "";

  const userPrompt = `Project idea: ${projectIdea}${specialInstructionsText}

Provide a thorough, professional analysis of this project. Consider:

1. **Title**: Create a professional, descriptive title that clearly communicates the project's purpose
2. **Description**: Write a comprehensive description explaining what the project does, why it's valuable, and how it works
3. **Objectives**: Define 5-8 specific, measurable objectives that clearly outline what the project will achieve
4. **Scope & Assumptions**: Identify key assumptions about resources, timeline, technology constraints, and project boundaries
5. **Technical Requirements**: List specific technical requirements including performance, scalability, security, and integration needs
6. **Success Criteria**: Define measurable criteria that will determine project success
7. **Duration**: Estimate realistic project duration based on complexity and scope
8. **Complexity**: Assess overall project complexity considering technical challenges, team coordination, and implementation requirements
9. **Technologies**: Identify primary technologies, frameworks, and tools that should be used
10. **Target Audience**: Clearly define who will use or benefit from this project
11. **Business Value**: Articulate the clear business, research, or societal value this project will deliver

Be thorough, professional, and realistic in your analysis. This will be used to guide the entire project implementation.

Return only valid JSON.`;

  return await callLLM(systemPrompt, userPrompt, true);
}

// Step 2: Task & Milestone Generation
export async function generateTasksAndMilestones(interpretation) {
  const systemPrompt = `You are a senior project manager and technical architect with extensive experience in software development, research projects, and team coordination.

Create a comprehensive project breakdown that enables parallel work, optimal resource utilization, and fastest possible delivery while maintaining quality.

You must respond with valid JSON only, following this exact schema:
{
  "project_phases": "string - brief description of the overall project approach",
  "milestones": [
    {
      "name": "string - descriptive milestone name",
      "description": "string - detailed description of what this milestone achieves",
      "duration_weeks": "number - estimated duration in weeks",
      "dependencies": ["array of milestone names this depends on, or empty array"],
      "deliverables": ["array of specific deliverables for this milestone"],
      "tasks": [
        {
          "id": "string - unique task ID like T001",
          "title": "string - concise task title",
          "description": "string - detailed task description with acceptance criteria",
          "required_expertise": ["array of required expertise areas"],
          "estimated_hours": "number - estimated hours to complete",
          "priority": "string - 'Critical', 'High', 'Medium', or 'Low'",
          "can_parallel": "boolean - true if this task can be done in parallel with others",
          "dependencies": ["array of task IDs this depends on, or empty array"]
        }
      ]
    }
  ]
}`;

  const userPrompt = `Project: ${interpretation.title}

Project Description: ${interpretation.description}

Objectives:
${interpretation.objectives.map((o, i) => `${i + 1}. ${o}`).join("\n")}

Technical Requirements:
${interpretation.technical_requirements.map((r, i) => `${i + 1}. ${r}`).join("\n")}

Estimated Duration: ${interpretation.estimated_duration}
Complexity Level: ${interpretation.complexity_level}
Primary Technologies: ${interpretation.primary_technologies.join(", ")}

Create a comprehensive project breakdown that:

1. **Optimizes for Speed**: Structure milestones and tasks to enable maximum parallelization and fastest delivery
2. **Enables Collaboration**: Design tasks so multiple team members can work simultaneously without blocking each other
3. **Follows Best Practices**: Include proper planning, development, testing, documentation, and deployment phases
4. **Is Realistic**: Provide accurate time estimates and identify true dependencies
5. **Covers Everything**: Include all aspects from initial setup to final deployment and documentation

Generate 4-7 major milestones that logically progress from project initiation to completion. Each milestone should have 3-8 tasks.

For each task, consider:
- Can it be done in parallel with other tasks?
- What are the real dependencies (not just logical sequence)?
- What expertise is truly required?
- How long will it realistically take?
- What are the specific acceptance criteria?

Use specific expertise areas from the available team members, and also include: Architecture, Backend Development, Frontend Development, DevOps, Database Design, API Development, Testing, Documentation, Research, Data Science, Machine Learning, UI/UX Design, Mobile Development, Security, Performance Optimization, Integration, Deployment.

Return only valid JSON.`;

  return await callLLM(systemPrompt, userPrompt, true);
}

// Step 3: Assignment & Timeline
export async function assignTasksAndTimeline(milestones, contributors, specialInstructions = "") {
  const systemPrompt = `You are a senior resource allocation expert and project scheduler with expertise in optimizing team productivity and project delivery speed.

Your goal is to create an optimal task assignment and timeline that maximizes parallel work, leverages each team member's strengths, and delivers the project as quickly as possible while maintaining quality.

You must respond with valid JSON only, following this exact schema:
{
  "timeline_strategy": "string - brief description of the overall timeline approach",
  "total_estimated_weeks": "number - total project duration in weeks",
  "assignments": [
    {
      "task_id": "string - task ID",
      "assigned_to": "string - contributor name",
      "start_week": "number - week when task should start (1-based)",
      "end_week": "number - week when task should complete (1-based)",
      "assignment_rationale": "string - why this person was chosen for this task",
      "collaboration_notes": "string - any notes about working with others on this task"
    }
  ],
  "weekly_schedule": [
    {
      "week": "number - week number",
      "active_tasks": [
        {
          "task_id": "string - task ID",
          "assigned_to": "string - contributor name",
          "status": "string - 'starting', 'continuing', or 'completing'"
        }
      ],
      "milestone_completions": ["array of milestone names completing this week"]
    }
  ],
  "workload_distribution": [
    {
      "contributor": "string - contributor name",
      "total_hours": "number - total estimated hours across all tasks",
      "peak_week_hours": "number - highest weekly hour commitment",
      "utilization_notes": "string - notes about this person's workload and capacity"
    }
  ]
}`;

  const contributorList = contributors
    .map((c) => `${c.name}: ${c.expertise.join(", ")}`)
    .join("\n");

  const milestoneList = milestones.milestones
    .map((m, i) => `
Milestone ${i + 1}: ${m.name}
Description: ${m.description}
Duration: ${m.duration_weeks} weeks
Dependencies: ${m.dependencies.length > 0 ? m.dependencies.join(", ") : "None"}
Tasks:
${m.tasks.map(t => `  - ${t.id}: ${t.title} (${t.estimated_hours}h, ${t.priority} priority, Expertise: ${t.required_expertise.join(", ")}, Parallel: ${t.can_parallel})`).join("\n")}`)
    .join("\n");

  const specialInstructionsText = specialInstructions ? `\n\nSpecial Instructions: ${specialInstructions}` : "";

  const userPrompt = `Team Members:
${contributorList}

Project Breakdown:
${milestoneList}${specialInstructionsText}

Create an optimal assignment and timeline strategy that:

1. **Maximizes Parallel Work**: Assign tasks that can run in parallel to different team members
2. **Leverages Expertise**: Match tasks to team members based on their specific skills and experience
3. **Balances Workload**: Ensure no team member is overloaded while others are underutilized
4. **Respects Dependencies**: Honor task and milestone dependencies while minimizing waiting time
5. **Optimizes for Speed**: Structure the timeline to complete the project as quickly as possible
6. **Enables Collaboration**: Consider tasks that benefit from collaboration between team members
7. **Follows Special Instructions**: Incorporate any specific assignment preferences or constraints

For each assignment, consider:
- Does this person have the right expertise?
- Can they work on this in parallel with their other tasks?
- Are there dependencies that affect the start date?
- Would collaboration with another team member be beneficial?
- Is the workload balanced across the timeline?

Create a realistic weekly schedule that shows what everyone is working on each week, when milestones complete, and how the work flows from start to finish.

Assume team members can work 30-40 hours per week on this project, and consider that some tasks may benefit from pair programming or collaboration.

Return only valid JSON.`;

  return await callLLM(systemPrompt, userPrompt, true);
}

// Step 4: Artifact Generation
export async function generateArtifacts(
  interpretation,
  milestones,
  assignments,
  projectIdea,
) {
  const systemPrompt = `You are a senior technical writer, software architect, and academic researcher with expertise in creating professional documentation, scientific papers, and production-ready code structures.

Create comprehensive, professional artifacts that could be used immediately in a real project or research setting.

You must respond with valid JSON only, following this exact schema:
{
  "readme": "string - complete, professional README.md content with proper markdown formatting",
  "paper_draft": "string - complete, publication-ready academic paper in markdown format",
  "code_structure": "string - detailed code architecture and implementation guide",
  "api_documentation": "string - comprehensive API documentation if applicable",
  "deployment_guide": "string - step-by-step deployment and setup instructions",
  "testing_strategy": "string - comprehensive testing approach and test cases"
}`;

  const userPrompt = `Project: ${interpretation.title}

Project Description: ${interpretation.description}

Objectives:
${interpretation.objectives.map((o, i) => `${i + 1}. ${o}`).join("\n")}

Technical Requirements:
${interpretation.technical_requirements.map((r, i) => `${i + 1}. ${r}`).join("\n")}

Success Criteria:
${interpretation.success_criteria.map((c, i) => `${i + 1}. ${c}`).join("\n")}

Primary Technologies: ${interpretation.primary_technologies.join(", ")}
Target Audience: ${interpretation.target_audience}
Business Value: ${interpretation.business_value}

Original Project Idea: ${projectIdea}

Generate comprehensive, professional artifacts:

## 1. README.md
Create a complete, professional README that includes:
- Compelling project description with badges and visuals
- Clear installation and setup instructions
- Usage examples and API documentation
- Architecture overview with diagrams (in markdown)
- Contributing guidelines
- License and acknowledgments
- Troubleshooting section
- Performance benchmarks (if applicable)
- Roadmap and future features

## 2. Academic Paper
Write a publication-ready scientific paper (6-8 pages) with:
- **Abstract**: Comprehensive summary of the work, methodology, and contributions
- **Introduction**: Problem statement, motivation, and related work
- **Methodology**: Detailed approach, algorithms, and design decisions
- **Architecture**: System design and implementation details
- **Experimental Setup**: How the system will be evaluated
- **Expected Results**: Anticipated outcomes and performance metrics
- **Discussion**: Implications, limitations, and future work
- **Conclusion**: Summary of contributions and impact
- **References**: Relevant citations (use placeholder format)
- Proper academic formatting with sections, subsections, and figures

## 3. Code Structure & Architecture
Provide a detailed implementation guide including:
- Overall system architecture
- Directory structure and file organization
- Core modules and their responsibilities
- Data models and database schema
- API endpoints and interfaces
- Key algorithms and data structures
- Integration points and dependencies
- Configuration and environment setup
- Error handling and logging strategy

## 4. API Documentation
If the project includes APIs, provide:
- Complete endpoint documentation
- Request/response schemas
- Authentication and authorization
- Rate limiting and usage guidelines
- SDK examples in multiple languages
- Error codes and troubleshooting

## 5. Deployment Guide
Create step-by-step deployment instructions:
- Environment requirements and dependencies
- Configuration management
- Database setup and migrations
- CI/CD pipeline configuration
- Production deployment checklist
- Monitoring and logging setup
- Backup and disaster recovery
- Scaling considerations

## 6. Testing Strategy
Develop a comprehensive testing approach:
- Unit testing framework and examples
- Integration testing scenarios
- End-to-end testing workflows
- Performance testing benchmarks
- Security testing considerations
- Test data management
- Automated testing pipeline
- Quality assurance checklist

Make everything production-ready, well-documented, and immediately usable. Use proper markdown formatting, include code examples, and ensure professional quality throughout.

Return only valid JSON.`;

  return await callLLM(systemPrompt, userPrompt, true);
}

export { callLLM };
