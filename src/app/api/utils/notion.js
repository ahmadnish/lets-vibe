// Notion API integration

export async function createNotionPage(
  interpretation,
  milestones,
  assignments,
) {
  const apiKey = process.env.NOTION_API_KEY;
  const parentPageId = process.env.NOTION_PARENT_PAGE_ID;

  if (!apiKey || !parentPageId) {
    throw new Error("NOTION_API_KEY or NOTION_PARENT_PAGE_ID not configured");
  }

  // Create the page
  const pageResponse = await fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Notion-Version": "2022-06-28",
    },
    body: JSON.stringify({
      parent: { page_id: parentPageId },
      properties: {
        title: {
          title: [
            {
              text: {
                content: interpretation.title,
              },
            },
          ],
        },
      },
    }),
  });

  if (!pageResponse.ok) {
    const error = await pageResponse.text();
    throw new Error(`Notion API error creating page: ${error}`);
  }

  const page = await pageResponse.json();
  const pageId = page.id;

  // Build content blocks
  const blocks = [];

  // Add objectives section
  blocks.push({
    object: "block",
    type: "heading_2",
    heading_2: {
      rich_text: [{ text: { content: "Objectives" } }],
    },
  });

  interpretation.objectives.forEach((objective) => {
    blocks.push({
      object: "block",
      type: "bulleted_list_item",
      bulleted_list_item: {
        rich_text: [{ text: { content: objective } }],
      },
    });
  });

  // Add scope assumptions
  blocks.push({
    object: "block",
    type: "heading_2",
    heading_2: {
      rich_text: [{ text: { content: "Scope Assumptions" } }],
    },
  });

  interpretation.scope_assumptions.forEach((assumption) => {
    blocks.push({
      object: "block",
      type: "bulleted_list_item",
      bulleted_list_item: {
        rich_text: [{ text: { content: assumption } }],
      },
    });
  });

  // Add milestones and tasks
  blocks.push({
    object: "block",
    type: "heading_2",
    heading_2: {
      rich_text: [{ text: { content: "Milestones & Tasks" } }],
    },
  });

  milestones.milestones.forEach((milestone) => {
    blocks.push({
      object: "block",
      type: "heading_3",
      heading_3: {
        rich_text: [{ text: { content: milestone.name } }],
      },
    });

    milestone.tasks.forEach((task) => {
      const assignment = assignments.assignments.find(
        (a) => a.task_id === task.id,
      );
      const assignedTo = assignment ? assignment.assigned_to : "Unassigned";
      const timeframe = assignment ? assignment.timeframe : "TBD";

      blocks.push({
        object: "block",
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: [
            {
              text: {
                content: `${task.description} | Assigned: ${assignedTo} | ${timeframe}`,
              },
            },
          ],
        },
      });
    });
  });

  // Append blocks to page (Notion has a limit of 100 blocks per request)
  const chunkSize = 100;
  for (let i = 0; i < blocks.length; i += chunkSize) {
    const chunk = blocks.slice(i, i + chunkSize);

    const appendResponse = await fetch(
      `https://api.notion.com/v1/blocks/${pageId}/children`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "Notion-Version": "2022-06-28",
        },
        body: JSON.stringify({
          children: chunk,
        }),
      },
    );

    if (!appendResponse.ok) {
      const error = await appendResponse.text();
      console.error(`Notion API error appending blocks: ${error}`);
    }
  }

  return page.url;
}
