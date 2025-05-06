import { Command } from "@cliffy/command";
import { dirname, join, relative } from "jsr:@std/path@1";
import { ensureDir } from "jsr:@std/fs@1/ensure-dir";

function toClassName(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9]/g, "")
    .replace(/^(\w)/, (_, c) => c.toUpperCase());
}

function toSceneKey(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9]/g, "")
    .replace(/^(\w)/, (_, c) => c.toLowerCase());
}

async function createSceneFile(name: string, output: string): Promise<string> {
  const templatePath = "src/templates/src/scenes/scene.ts.template";
  const content = await Deno.readTextFile(templatePath);
  const className = toClassName(name);
  const sceneKey = toSceneKey(name);
  const replaced = content
    .replace(/{{SCENE_CLASS_NAME}}/g, className)
    .replace(/{{SCENE_KEY}}/g, sceneKey);

  await ensureDir(output);
  const filePath = join(output, `${name}.scene.ts`);
  await Deno.writeTextFile(filePath, replaced);
  return className;
}

async function updateGameConfig(className: string, output: string) {
  let mainPath: string | null = null;
  let current = output;

  while (current !== "." && current !== "/" && !current.endsWith("src")) {
    current = join(current, "..");
  }

  if (current.endsWith("src")) {
    for await (const entry of Deno.readDir(current)) {
      if (entry.isFile && entry.name === "main.ts") {
        mainPath = join(current, entry.name);
        break;
      }
    }
  }

  if (!mainPath) return;

  try {
    const lines = await Deno.readTextFile(mainPath).then((text) =>
      text.split("\n")
    );
    const sceneInsertLine = className + ",";

    // Create import command
    const importPath =
      "./" +
      relative(dirname(mainPath), join(output, `${className}.scene`)).replace(
        /\\/g,
        "/"
      );
    const importLine = `import { ${className} } from "${importPath}";`;

    if (!lines.some((line) => line.includes(importLine))) {
      lines.unshift(importLine);
    }

    const sceneIndex = lines.findIndex((line) =>
      line.trim().match(/^scene\s*:\s*\[/)
    );

    if (sceneIndex !== -1) {
      if (lines[sceneIndex].includes("]")) {
        const line = lines[sceneIndex];
        const openIndex = line.indexOf("[");
        const closeIndex = line.indexOf("]");
        if (openIndex !== -1 && closeIndex !== -1 && closeIndex > openIndex) {
          const inner = line.slice(openIndex + 1, closeIndex).trim();
          const items = inner ? inner.split(",").map((s) => s.trim()) : [];
          if (!items.includes(className)) {
            items.push(className);
          }
          const rebuilt =
            line.slice(0, openIndex + 1) +
            items.join(", ") +
            line.slice(closeIndex);
          lines[sceneIndex] = rebuilt;
        }
      } else {
        let insertAt = sceneIndex + 1;
        while (insertAt < lines.length && !lines[insertAt].includes("]")) {
          insertAt++;
        }
        if (insertAt < lines.length && lines[insertAt].includes("]")) {
          const prev = lines[insertAt - 1];
          if (prev.trim().length > 0 && !prev.trim().endsWith(",")) {
            lines[insertAt - 1] = prev.replace(/\s*$/, ",");
          }
          lines.splice(insertAt, 0, "    " + sceneInsertLine);
        }
      }
    }

    await Deno.writeTextFile(mainPath, lines.join("\n"));
  } catch (_) {
    console.warn("⚠️  Could not update main.ts.");
  }
}

export const create = new Command()
  .name("create")
  .description("Create a new project component")
  .command("scene <name:string>")
  .option("-o, --output <path:string>", "Target directory", { default: "src" })
  .action(async ({ output }, name: string) => {
    const className = await createSceneFile(name, output);
    await updateGameConfig(className, output);
    console.log(
      `✅ Scene '${name}' created in '${output}' and main.ts (if found) has been updated.`
    );
  });
