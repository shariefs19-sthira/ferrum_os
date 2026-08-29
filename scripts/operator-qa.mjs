#!/usr/bin/env node

import fs from 'fs/promises';
import { chromium } from 'playwright';

const args = process.argv.slice(2);
const taskArgIndex = args.indexOf('--task');
const taskId = taskArgIndex !== -1 && args[taskArgIndex + 1] ? args[taskArgIndex + 1] : null;

if (!taskId) {
  console.error('Usage: node operator-qa.mjs --task <taskId>');
  process.exit(1);
}

async function parseWaveQueueForTask(filePath, targetTaskId) {
  const content = await fs.readFile(filePath, 'utf8');
  const lines = content.split('\n');

  let headerIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith('|') && lines[i].includes('Assigned To')) {
      headerIndex = i;
      break;
    }
  }

  if (headerIndex === -1) {
    throw new Error(`Could not find table header in ${filePath}`);
  }

  const headerLine = lines[headerIndex];
  const columns = headerLine.split('|').map(col => col.trim());

  const taskIdColIndex = columns.findIndex(col => col === 'Task ID');
  const domainColIndex = columns.findIndex(col => col === 'J/Domain'); // Assuming this holds scope info

  if (taskIdColIndex === -1 || domainColIndex === -1) {
    throw new Error('Could not find required columns in table header.');
  }

  for (let i = headerIndex + 2; i < lines.length; i++) { // +2 to skip header and separator
    const line = lines[i];
    if (line.trim().startsWith('|')) {
      const cells = line.split('|').map(cell => cell.trim());
      if (cells.length > Math.max(taskIdColIndex, domainColIndex)) {
        const taskIdInFile = cells[taskIdColIndex];
        const taskDescription = cells[domainColIndex];

        if (taskIdInFile === targetTaskId) {
          console.log(`Found task ${targetTaskId}: ${taskDescription}`);
          return { id: taskIdInFile, description: taskDescription };
        }
      }
    }
  }
  return null;
}

async function runQaTask(taskId) {
  console.log(`Starting QA run for task ${taskId}`);
  const browser = await chromium.launch({ headless: true }); // Use headless mode for CI
  const context = await browser.newContext();
  const page = await context.newPage();

  // Array of routes to visit
  const routes = ['/', '/structura', '/promarket', '/buildos', '/procurehub', '/investflow', '/communitybuild', '/landintel', '/boq-pro'];

  // Collect console errors and page errors
  const consoleErrors = [];
  const pageErrors = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  page.on('pageerror', error => {
    pageErrors.push(error.message);
  });

  const qaResults = [];

  // Create screenshot directory if it doesn't exist
  const screenshotDir = 'docs/shots/operator';
  await fs.mkdir(screenshotDir, { recursive: true });

  for (const route of routes) {
    const url = `http://localhost:3000${route}`;
    console.log(`Navigating to ${url}`);

    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 }); // Wait for network idle or 30 seconds

      // Take a screenshot
      const screenshotPath = `${screenshotDir}/${route.replace(/\//g, '_') || 'home'}.png`;
      await page.screenshot({ path: screenshotPath });
      console.log(`Screenshot saved to ${screenshotPath}`);

      // Get page title and status
      const title = await page.title();
      const status = 'SUCCESS'; // Assuming success if navigation didn't throw

      qaResults.push({
        route,
        url,
        status,
        title,
        consoleErrors: [...consoleErrors],
        pageErrors: [...pageErrors],
        screenshotPath
      });

      // Clear errors for next route
      consoleErrors.length = 0;
      pageErrors.length = 0;

    } catch (error) {
      console.error(`Error navigating to ${url}: ${error.message}`);
      qaResults.push({
        route,
        url,
        status: 'ERROR',
        title: 'N/A',
        consoleErrors: [],
        pageErrors: [error.message],
        screenshotPath: null
      });
    }
  }

  await browser.close();

  // Write the report to a JSON file
  const reportPath = `${screenshotDir}/${taskId}-report.json`;
  await fs.writeFile(reportPath, JSON.stringify(qaResults, null, 2));

  console.log(`QA report written to ${reportPath}`);
  return reportPath;
}

// Main execution
(async () => {
  try {
    if (!taskId) {
      console.error('Please provide a task ID using --task <taskId>');
      process.exit(1);
    }

    // Parse WAVE_QUEUE to get task details (optional, for logging)
    const taskDetails = await parseWaveQueueForTask('./docs/WAVE_QUEUE.md', taskId);
    if (taskDetails) {
      console.log(`Processing QA for task: ${taskDetails.id} - ${taskDetails.description}`);
    } else {
      console.log(`Task ${taskId} details not found in WAVE_QUEUE.md, proceeding anyway.`);
    }

    const reportPath = await runQaTask(taskId);
    console.log('QA run completed successfully.');
  } catch (error) {
    console.error('An error occurred during the QA run:', error);
    process.exit(1);
  }
})();