import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { TaskRunner } from "../src/utils/task_runner.ts";

Deno.test("führt einen Task aus", async () => {
  let result = 0;
  const runner = new TaskRunner();
  runner.add("add one", async () => {
    result += 1;
  });

  await runner.runAll();
  assertEquals(result, 1);
});

Deno.test("führt mehrere Tasks in dedizierter Reihenfolge aus", async () => {
  const log: string[] = [];
  const runner = new TaskRunner();
  runner
    .add("eins", async () => log.push("1"))
    .add("zwei", async () => log.push("2"));

  await runner.runAll();
  assertEquals(log, ["1", "2"]);
});

Deno.test("fängt Fehler ab und fährt fort", async () => {
  const log: string[] = [];
  const runner = new TaskRunner();
  runner
    .add("gut", async () => log.push("ok"))
    .add("fail", async () => {
      throw new Error("Fehlschlag");
    })
    .add("weiter", async () => log.push("nach Fehler"));

  await runner.runAll();
  assertEquals(log, ["ok", "nach Fehler"]);
});

Deno.test("add() erlaubt chaining", () => {
  const runner = new TaskRunner();
  const returned = runner.add("noop", async () => {});
  assertEquals(returned, runner);
});
