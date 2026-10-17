// src/reports/base-report.generator.ts - Patrón Template Method (Capítulo 12)
export abstract class BaseReportGenerator {
  public async generate(projectId: string): Promise<Buffer> {
    const rawData = await this.fetchData(projectId);
    const formatted = this.formatData(rawData);
    const resultBuffer = await this.exportFile(formatted);
    await this.auditLog(projectId);
    return resultBuffer;
  }

  protected abstract fetchData(projectId: string): Promise<any>;
  protected abstract formatData(data: any): any;
  protected abstract exportFile(formattedData: any): Promise<Buffer>;

  protected async auditLog(projectId: string): Promise<void> {
    console.log(`[Audit] Reporte compilado para proyecto ${projectId}`);
  }
}

export class CsvReportGenerator extends BaseReportGenerator {
  protected async fetchData(projectId: string): Promise<any> {
    return { projectId, title: 'Sistema PMS', tasksCount: 12 };
  }

  protected formatData(data: any): any {
    return `ID,Proyecto,Tareas\n${data.projectId},${data.title},${data.tasksCount}`;
  }

  protected async exportFile(formattedData: any): Promise<Buffer> {
    return Buffer.from(formattedData, 'utf-8');
  }
}
