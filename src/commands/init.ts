import { dirname, join, relative, basename } from "jsr:@std/path@1";
import { TemplateEngine } from "../utils/template_engine.ts";
import { TaskRunner } from "../utils/task_runner.ts";
import { isCommandAvailable } from "../utils/shell.ts";
import { walk } from "jsr:@std/fs@1/walk";
import { loadProjectConfig } from "../utils/config_parser.ts";
import { Command } from "@cliffy/command";

export const PROJECT_CONFIG_FILE = "project.config.json";
export const DEFAULT_PROJECT_NAME = "new-phaser-project";
export const DEFAULT_REPLACEMENTS = {
  TITLE: DEFAULT_PROJECT_NAME,
  AUTHOR: "Author <author@example.com>",
  YEAR: new Date().getFullYear().toString(),
  WEBPACK_DEV_SERVER_PORT: "9000",
  PACKAGE_JSON_DESCRIPTION:
    "An application skeleton for 2D Game development with Phaser 3",
  SCENE_CLASS_NAME: "DefaultScene",
  SCENE_KEY: "defaultScene",
};

/**
 * Searches recursively for a 'project.config.json' in the target directory.
 */
export async function findProjectConfigFile(
  searchDir: string
): Promise<string | null> {
  try {
    for await (const entry of walk(searchDir, {
      includeDirs: false,
      exts: [".json"],
    })) {
      if (basename(entry.path) === PROJECT_CONFIG_FILE) {
        return entry.path;
      }
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.name !== "NotFound") {
        console.warn(
          "⚠️  Project directory does not yet exist and will be created."
        );
      }
    } else {
      console.warn("⚠️  Unexpected error:", err);
    }
  }

  return null;
}

/**
 * Executes the init project with priority logic:
 * 1. config param > 2. search in the project directory > 3. default values
 */
async function initProject(
  projectName: string,
  baseDir: string,
  configPath?: string
) {
  const projectPath = join(Deno.realPathSync(baseDir), projectName);
  const execDir = dirname(Deno.execPath());
  const templateDir = join(execDir, "src", "templates");

  console.log(`📁 Create Project: ${projectName}`);
  console.log(`📂 Destination path: ${projectPath}`);
  console.log(`📂 Template path: ${templateDir}`);

  let replacements: Record<string, string> = {};

  if (configPath) {
    // Prio 1: Transfer user-defined config
    replacements = await loadProjectConfig(configPath);
    console.log("📝 Config loaded from parameter:", configPath);
  } else {
    const found = await findProjectConfigFile(projectPath);
    if (found) {
      // Prio 2: Use automatically found config
      replacements = await loadProjectConfig(found);
      console.log("🔍 Config automatically found:", relative(baseDir, found));
    } else {
      // Prio 3: Use default values
      replacements = DEFAULT_REPLACEMENTS;
      console.log("📄 No config found – using default values.");
    }
  }

  // Create all files in the project directories
  const engine = new TemplateEngine(replacements);
  const runner = new TaskRunner();

  // Task 1: Generating templates
  runner.add("Generating project files", async () => {
    await engine.processAll(templateDir, projectPath);
  });

  // Task 2: Initializing NPM (if available)
  runner.add("Installing NPM", async () => {
    if (await isCommandAvailable("npm")) {
      console.log("📦 NPM recognized. Initializing...");
      const cmd = new Deno.Command("npm", {
        args: ["install"],
        cwd: projectPath,
        stdout: "inherit",
        stderr: "inherit",
      });
      await cmd.output();
    } else {
      console.warn("⚠️  NPM not found – step skipped.");
    }
  });

  // Task 3: Initializing Git (if available)
  runner.add("Initializing Git", async () => {
    if (await isCommandAvailable("git")) {
      console.log("🔧 Git recognized. Initializing...");
      const cmd = new Deno.Command("git", {
        args: ["init"],
        cwd: projectPath,
        stdout: "inherit",
        stderr: "inherit",
      });
      await cmd.output();
    } else {
      console.warn("⚠️  Git not found – step skipped.");
    }
  });

  // Execute tasks
  await runner.runAll();

  console.log(
    `✅ Project '${projectName}' successfully generated at: ${projectPath}`
  );
}

export const init = new Command()
  .name("init")
  .description("Creates a new phaser project")
  .option("-n, --name <name:string>", "Project name / Game name", {
    required: true,
  })
  .option("-o, --output <output:string>", "Target directory")
  .option("-c, --config <path:string>", "Path to a configuration file")

  .action(async (options) => {
    const { name, output, config } = options;
    const projectName = name ?? DEFAULT_PROJECT_NAME;
    const baseDir = output ?? ".";
    await initProject(projectName, baseDir, config);
  });
