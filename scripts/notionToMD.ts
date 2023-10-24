import { Client } from '@notionhq/client';
import * as fs from 'fs';
import * as path from 'path';

const page_id: string = 'e8ff4f278a5040d6b7b188ab36773668'; // Page ID
const database_id: string = 'fc70cf18bfa94a969a42b4b06e777ead';
const secret: string = 'secret_3WkfUjYJoXy5dYjb9Xfj0o8poF46cLkvykYCUXw5r96';

const notion = new Client({ auth: secret });

interface TechRadarElement {
  properties: {
    Name: {
      title: Array<{
        text: {
          content: string;
          link?: string;
        };
      }>;
    };
    type: {
      select: {
        name: string;
      };
    };
    Stage: {
      status: {
        name: string;
      };
    };
  };
}

const fetchData = async (): Promise<Array<any>> => {
  const items: Array<any> = [];
  const database: any = await notion.databases.query({ database_id: database_id });

  for (const techRadarElement of database.results as TechRadarElement[]) {
    const isLeft: boolean = techRadarElement.properties.Name.title.length === 0;
    const isRight: boolean =
      techRadarElement.properties.type.select === null;

    if (isLeft || isRight) continue;

    const name: string = techRadarElement.properties.Name.title[0].text.content;
    const link: string | undefined = techRadarElement.properties.Name.title[0].text.link;
    const stage: string = techRadarElement.properties.Stage.status.name.toLowerCase();
    const quadrant: string = techRadarElement.properties.type.select.name;
    const styledQuadrant : string = quadrant.replace(/ /g, '-');

    const revision: any = { name, ring: stage, title: name, quadrant: styledQuadrant };
    items.push(revision);
  }
  return items;
};

const generateMarkdownFiles = async (items: any[], outputDirectory: string): Promise<void> => {
  if (!fs.existsSync(outputDirectory)) {
    fs.mkdirSync(outputDirectory);
  }

  for (const item of items) {
    const markdownContent = `---
title: "${item.title}"
ring: "${item.ring}"
quadrant: "${item.quadrant}"
${item.info ? `info: "${item.info}"` : ""}
featured: ${item.featured !== undefined ? item.featured : true}
---

Text goes here. You can use **markdown** here.`;


    // Define the filename (you can use a unique identifier if needed)
    const filename: string = `${item.name}.md`;

    // Create the full path to the output file
    const outputPath: string = path.join(outputDirectory, filename);

    // Write the Markdown content to the file
    fs.writeFileSync(outputPath, markdownContent);

    console.log(`Saved ${filename} to ${outputPath}`);
  }

  console.log('Markdown files saved successfully.');
};

export const notionData = async () => {
  const items: any[] = await fetchData();
  await generateMarkdownFiles(items, 'radar');
};

