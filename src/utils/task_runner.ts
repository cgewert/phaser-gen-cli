export class TaskRunner {
  private tasks: { name: string; action: () => Promise<unknown> }[] = [];

  public add<T>(name: string, action: () => Promise<T>): this {
    this.tasks.push({ name, action });
    return this;
  }

  async runAll(): Promise<void> {
    for (const task of this.tasks) {
      const start = Date.now();
      console.log(`🔧 Starte Task: ${task.name}`);
      try {
        await task.action();
        const duration = Date.now() - start;
        console.log(`✅ Task abgeschlossen: ${task.name} (${duration}ms)`);
      } catch (error) {
        console.error(`❌ Fehler in Task '${task.name}':`, error);
      }
    }
  }
}
