import {
  assertEquals,
  assertRejects,
} from "https://deno.land/std@0.224.0/assert/mod.ts";
import { loadProjectConfig } from "../src/utils/config_parser.ts";

Deno.test("lädt nur string-Werte aus JSON", async () => {
  const tempDir = await Deno.makeTempDir();
  const path = `${tempDir}/temp_test_config.json`;

  const data = {
    title: "My Game",
    version: "1.0.0",
    debug: true,
    count: 5,
  };
  await Deno.writeTextFile(path, JSON.stringify(data));

  const result = await loadProjectConfig(path);
  assertEquals(result, {
    title: "My Game",
    version: "1.0.0",
  });

  await Deno.remove(path, { recursive: true });
});

Deno.test("leere Datei gibt leeres Objekt zurück", async () => {
  const tempDir = await Deno.makeTempDir();
  const path = `${tempDir}/empty.json`;
  await Deno.writeTextFile(path, "{}");

  const result = await loadProjectConfig(path);
  assertEquals(result, {});

  await Deno.remove(path, { recursive: true });
});

Deno.test("wirft Fehler bei ungültiger JSON", async () => {
  const tempDir = await Deno.makeTempDir();
  const path = `${tempDir}/invalid.json`;
  await Deno.writeTextFile(path, "{ not json");

  await assertRejects(() => loadProjectConfig(path));

  await Deno.remove(path, { recursive: true });
});

Deno.test("wirft Fehler bei nicht existierender Datei", async () => {
  await assertRejects(() => loadProjectConfig("nicht_vorhanden.json"));
});
