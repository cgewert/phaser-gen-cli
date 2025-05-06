import { Command } from "@cliffy/command";
import { init } from "./commands/init.ts";
import { create } from "./commands/create.ts";

await new Command()
  .name("phaser")
  .version("1.0.0")
  .description("CLI tool for generating phaser projects")
  .command("init", init)
  .command("create", create)
  .parse(Deno.args);
