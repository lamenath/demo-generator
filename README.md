```markdown
# Demo Generator Tool

This tool helps you create a mocked visual demo of the Prismic Page Builder using screenshots of slices from a site design. It enables you to visually demonstrate the Page Builder experience to customers or prospects, showcasing slice selection in the modal popup and slice previews in the builder.

---

## Features
- Generate mock slices from screenshots of site sections or Figma designs.
- Simulate Prismic Page Builder slice selection and preview.
- Quickly prepare a demo environment to impress clients.

---

## Prerequisites
- [Node.js](https://nodejs.org/) installed on your system.
- A Prismic repository with the **Next.js starter**.

---

## Installation
1. Clone or download this repository.
2. Open a terminal, navigate to the project directory, and run:
   ```bash
   npm install
   ```

---

## How to Use

### 1. Prepare Your Screenshots
- Take screenshots of the sections you want to demo (e.g., "Hero.png", "Slide.png").
- Use meaningful names for clarity (e.g., `Hero.png`, `EditorialSection.png`).

### 2. Set Up Your Prismic Environment
1. Create a new Prismic repository and select the **Next.js starter**.
2. Launch the starter locally using:
   ```bash
   npx create-next-app my-project
   ```
3. Navigate to the project directory and open it in your code editor.

### 3. Place Screenshots in the Public Directory
1. Create a `public` directory in your project.
2. Place your screenshots in this folder.

### 4. Run the Script
1. Open a terminal in the script's directory and run:
   ```bash
   node script.mjs
   ```
2. Follow the prompts to:
   - Enter the path to your project's `public` folder.
   - Enter the path to your project's `slices` folder.

### 5. Preview the Demo
1. Run your project locally with:
   ```bash
   npm run dev
   ```
2. Open `http://localhost:3000` in your browser to see the generated slices.

### 6. Additional Setup for Previews
1. **Slice Simulator:**
   - In the Prismic Page Builder, go to the settings (3-dot menu) and select "Live preview settings."
   - Enter:
     ```
     http://localhost:3000/slice-simulator
     ```

2. **Page Preview:**
   - Navigate to `/settings/previews/` in your Prismic repository.
   - Create a new preview with:
     - **Domain of your application:** `http://localhost:3000`
     - **Preview route:** `/api/preview`.

---

Your Prismic Page Builder demo is now ready to showcase! Build, customize, and impress your audience.
```
