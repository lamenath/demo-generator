import fs from 'fs-extra';
import axios from 'axios';
import inquirer from 'inquirer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// These two lines are needed to correctly handle __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const hyphenateRE = /\B([A-Z])/g;
function hyphenate(str) {
  return str.replace(hyphenateRE, "-$1").toLowerCase();
}

function snakelize(str) {
  return hyphenate(str).replace(/-/g, "_");
}

async function main() {
  try {
    console.log('Starting the script...');

    // Prompt user for input
    const { publicFolder, slicesFolder } = await inquirer.prompt([
      {
        type: 'input',
        name: 'publicFolder',
        message: 'Enter the path to the public folder of the project:',
        validate: (input) => input.trim() !== '' || 'The path cannot be empty.',
      },
      {
        type: 'input',
        name: 'slicesFolder',
        message: 'Enter the path to the slices folder of the project:',
        validate: (input) => input.trim() !== '' || 'The path cannot be empty.',
      },
    ]);

    console.log('Input received:', { publicFolder, slicesFolder });

    // Read screenshot files from public folder
    const screenshotFiles = await fs.readdir(publicFolder);
    const pngFiles = screenshotFiles.filter(file => file.endsWith('.png'));

    if (pngFiles.length === 0) {
      console.log('No PNG files found in the public folder.');
      return;
    }

    console.log('PNG files found:', pngFiles);

    // Process each PNG file and create slice
    for (const file of pngFiles) {
      const sliceName = path.basename(file, '.png');
      const sliceFolderPath = path.join(slicesFolder, sliceName);

      console.log(`Creating slice: ${sliceName} at ${sliceFolderPath}`);

      // Create slice folder
      await fs.ensureDir(sliceFolderPath);

      // Create index.tsx
      const indexTsxContent = generateIndexTsx(sliceName, file);
      await fs.writeFile(path.join(sliceFolderPath, 'index.tsx'), indexTsxContent);

      // Create mocks.json
      const mocksJsonContent = JSON.stringify([
        {
          "__TYPE__": "SharedSliceContent",
          "variation": "default",
          "primary": {},
          "items": []
        }
      ], null, 2);
      await fs.writeFile(path.join(sliceFolderPath, 'mocks.json'), mocksJsonContent);

      // Create model.json
      const modelJsonContent = generateModelJson(sliceName);
      await fs.writeFile(path.join(sliceFolderPath, 'model.json'), modelJsonContent);

      // Copy screenshot and save as screenshot-default.png
      const screenshotPath = path.join(sliceFolderPath, 'screenshot-default.png');
      await fs.copy(path.join(publicFolder, file), screenshotPath);

      console.log(`Slice ${sliceName} created successfully.`);

      // Update index.tsx
      const indexTsPath = path.join(slicesFolder, 'index.ts');
      await updateIndexTs(indexTsPath, sliceName);
    }

    console.log('All slices created successfully!');
  } catch (error) {
    console.error('Error:', error);
  }
}

function generateIndexTsx(sliceName, file) {
  return `
  import { Content } from "@prismicio/client";
  import { SliceComponentProps } from "@prismicio/react";

  export type ${sliceName}Props = SliceComponentProps<Content.${sliceName}Slice>;

  const ${sliceName} = ({ slice }: ${sliceName}Props): JSX.Element => {
    return (
      <section data-slice-type={slice.slice_type} data-slice-variation={slice.variation}>
        <div>
          <img src="/${file}" width="100%"/>
        </div>
      </section>
    );
  };

  export default ${sliceName};
  `;
}

function generateModelJson(sliceName) {
  return JSON.stringify({
    id: snakelize(sliceName),
    type: "SharedSlice",
    name: sliceName,
    description: sliceName,
    variations: [
      {
        id: "default",
        name: "Default",
        docURL: "...",
        version: "initial",
        description: "Default",
        imageUrl: "",
        primary: {},
        items: {}
      }
    ]
  }, null, 2);
}

async function updateIndexTs(indexTsPath, sliceName) {
  const importLine = `  ${snakelize(sliceName)}: dynamic(() => import("./${sliceName}")),`;
  const fileExists = await fs.pathExists(indexTsPath);

  if (!fileExists) {
    console.error(`The index.ts file does not exist at the path: ${indexTsPath}`);
    return;
  }

  const fileContent = await fs.readFile(indexTsPath, 'utf8');

  // Find the export const components part and add our new line
  const lines = fileContent.split('\n');
  const exportIndex = lines.findIndex(line => line.trim().startsWith('export const components = {'));

  if (exportIndex === -1) {
    console.error('Could not find the export components object in index.ts');
    return;
  }

  lines.splice(exportIndex + 1, 0, importLine);

  await fs.writeFile(indexTsPath, lines.join('\n'), 'utf8');
  console.log(`Updated index.ts with the slice: ${sliceName}`);
}

main().catch((error) => {
  console.error('Error:', error);
});
