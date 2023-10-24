const { Client } = require('@notionhq/client');
const fs = require('fs');
const path = require('path');

const page_id = 'e8ff4f278a5040d6b7b188ab36773668'; // Page ID
const database_id = 'fc70cf18bfa94a969a42b4b06e777ead';
const secret = 'secret_3WkfUjYJoXy5dYjb9Xfj0o8poF46cLkvykYCUXw5r96';

const notion = new Client({ auth: secret });

const fetchData = async () => {
  const items = [];
  const database = await notion.databases.query({ database_id: database_id });

  for (techRadarElement of database.results) {
    const isLeft = techRadarElement.properties.Name.title.length === 0;
    const isRight =
      techRadarElement.properties.type.select === null ||
      techRadarElement.properties.type.select.length === 0;

    if (isLeft || isRight) continue;

    const name = techRadarElement.properties.Name.title.at(0).text.content;
    const link = techRadarElement.properties.Name.title.at(0).text.link;
    const stage = techRadarElement.properties.Stage.status.name.toLowerCase();
    const quadrant = techRadarElement.properties.type.select.name;

    const revision = { name, ring: stage, title: name, quadrant };
    items.push(revision);
  }
  return items;
};

const generateMarkdownFiles = async (items, outputDirectory) => {
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
    const filename = `${item.name}.md`;

    // Create the full path to the output file
    const outputPath = path.join(outputDirectory, filename);

    // Write the Markdown content to the file
    fs.writeFileSync(outputPath, markdownContent);

    console.log(`Saved ${filename} to ${outputPath}`);
  }

  console.log('Markdown files saved successfully.');
};

(async () => {
  const items = await fetchData();
  await generateMarkdownFiles(items, 'radar');
})();
