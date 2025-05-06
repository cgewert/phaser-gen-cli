export async function loadProjectConfig(
  path: string
): Promise<Record<string, string>> {
  const content = await Deno.readTextFile(path);
  const json = JSON.parse(content);
  const placeholders: Record<string, string> = {};

  for (const [key, value] of Object.entries(json)) {
    if (typeof value === "string") {
      placeholders[key] = value;
    }
  }

  return placeholders;
}
