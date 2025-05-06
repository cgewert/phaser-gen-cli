export async function isCommandAvailable(command: string): Promise<boolean> {
  try {
    const check = new Deno.Command(command, {
      args: ["--version"],
      stdout: "null",
      stderr: "null",
    });
    const { success } = await check.output();
    return success;
  } catch {
    return false;
  }
}
