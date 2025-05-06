import {
  assertEquals,
  assertStringIncludes,
} from "https://deno.land/std@0.224.0/assert/mod.ts";
import { TemplateEngine } from "../src/utils/template_engine.ts";
import { join } from "https://deno.land/std@0.224.0/path/mod.ts";

Deno.test("replacePlaceholders ersetzt Platzhalter korrekt", () => {
  const engine = new TemplateEngine({ TITLE: "Test Game", YEAR: "2025" });
  const result = engine["replacePlaceholders"](
    "Willkommen bei {{TITLE}} im Jahr {{YEAR}}."
  );
  assertEquals(result, "Willkommen bei Test Game im Jahr 2025.");
});

Deno.test("process erzeugt Datei mit ersetztem Inhalt", async () => {
  const tempDir = await Deno.makeTempDir();
  const engine = new TemplateEngine({ HELLO: "Hi" });
  const inputPath = join(tempDir, "test.template");
  const outputPath = join(tempDir, "test_output.txt");

  await Deno.writeTextFile(inputPath, "Sag {{HELLO}}!");
  await engine.process(inputPath, outputPath);

  const result = await Deno.readTextFile(outputPath);
  assertEquals(result, "Sag Hi!");

  await Deno.remove(inputPath);
  await Deno.remove(outputPath);
});

Deno.test("processAll verarbeitet mehrere Templates rekursiv", async () => {
  const root = await Deno.makeTempDir();
  try {
    const templateRoot = join(root, "templates");
    const outRoot = join(root, "output");

    await Deno.mkdir(templateRoot, { recursive: true });
    const subDir = join(templateRoot, "sub");
    await Deno.mkdir(subDir);

    const file1 = join(templateRoot, "a.template");
    const file2 = join(subDir, "b.template");

    await Deno.writeTextFile(file1, "Spiel: {{TITLE}}");
    await Deno.writeTextFile(file2, "Autor: {{AUTHOR}}");

    const engine = new TemplateEngine({
      TITLE: "Nova Quest",
      AUTHOR: "Admiral Foobar",
    });
    await engine.processAll(templateRoot, outRoot);

    const result1 = await Deno.readTextFile(join(outRoot, "a"));
    const result2 = await Deno.readTextFile(join(outRoot, "sub", "b"));

    assertStringIncludes(result1, "Nova Quest");
    assertStringIncludes(result2, "Admiral Foobar");
  } finally {
    await Deno.remove(root, { recursive: true });
  }
});
