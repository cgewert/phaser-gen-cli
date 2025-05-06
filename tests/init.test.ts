import { join } from "https://deno.land/std@0.224.0/path/join.ts";
import {
  findProjectConfigFile,
  PROJECT_CONFIG_FILE,
} from "../src/commands/init.ts";
import { assertEquals } from "https://deno.land/std@0.224.0/assert/assert_equals.ts";

Deno.test("findet vorhandene project.config.json", async () => {
  const dir = await Deno.makeTempDir();
  const configPath = join(dir, PROJECT_CONFIG_FILE);
  await Deno.writeTextFile(configPath, JSON.stringify({ TITLE: "Demo" }));

  const result = await findProjectConfigFile(dir);
  assertEquals(result, configPath);

  await Deno.remove(dir, { recursive: true });
});

Deno.test(
  "initProject gibt null zurück, wenn keine Konfig vorhanden ist",
  async () => {
    const dir = await Deno.makeTempDir();

    const result = await findProjectConfigFile(dir);
    assertEquals(result, null);

    await Deno.remove(dir, { recursive: true });
  }
);
