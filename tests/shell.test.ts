import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { isCommandAvailable } from "../src/utils/shell.ts";

Deno.test("liefert true für vorhandenes Kommando", async () => {
  const result = await isCommandAvailable("deno");
  assertEquals(result, true);
});

Deno.test("liefert false für nicht vorhandenes Kommando", async () => {
  const result = await isCommandAvailable("xyzxyz-unknown-command-1234567890");
  assertEquals(result, false);
});
