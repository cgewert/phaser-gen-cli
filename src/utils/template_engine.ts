import { ensureDir } from "jsr:@std/fs@1";
import { basename, dirname, join, relative } from "jsr:@std/path@1";
import { walk } from "jsr:@std/fs@1/walk";

export class TemplateEngine {
  constructor(private replacements: Record<string, string>) {}

  async process(templatePath: string, outputPath: string): Promise<void> {
    const template = await Deno.readTextFile(templatePath);
    const content = this.replacePlaceholders(template);
    await ensureDir(dirname(outputPath));
    await Deno.writeTextFile(outputPath, content);
  }

  async processAll(templateRoot: string, outputRoot: string): Promise<void> {
    for await (const entry of walk(templateRoot, {
      exts: [".template"],
      includeFiles: true,
    })) {
      const relativeTemplatePath = relative(templateRoot, entry.path);
      const templateDir = dirname(relativeTemplatePath);
      const outputFilename = basename(entry.path, ".template");
      const outputPath = join(outputRoot, templateDir, outputFilename);

      await this.process(entry.path, outputPath);
    }
  }

  private replacePlaceholders(template: string): string {
    let result = template;
    for (const [key, value] of Object.entries(this.replacements)) {
      result = result.replaceAll(`{{${key}}}`, value);
    }
    return result;
  }
}
