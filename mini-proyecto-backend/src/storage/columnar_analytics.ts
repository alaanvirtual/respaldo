// src/storage/columnar_analytics.ts - Almacenamiento orientado a filas (OLTP) vs orientado a columnas (OLAP) (Capítulo 14)

export interface RowRecord {
  id: number;
  user: string;
  total: number;
  date: string;
}

export interface ColumnarTable {
  id: number[];
  user: string[];
  total: number[];
  date: string[];
}

export class ColumnarAnalyticsService {
  // Datos representativos orientados a filas (OLTP)
  public static rowOriented: RowRecord[] = [
    { id: 1, user: 'Alice', total: 150.00, date: '2026-10-01' },
    { id: 2, user: 'Bob', total: 200.50, date: '2026-10-02' },
    { id: 3, user: 'Carol', total: 85.20, date: '2026-10-02' }
  ];

  // Datos representativos orientados a columnas (OLAP / Columnar)
  public static columnOriented: ColumnarTable = {
    id: [1, 2, 3],
    user: ['Alice', 'Bob', 'Carol'],
    total: [150.00, 200.50, 85.20],
    date: ['2026-10-01', '2026-10-02', '2026-10-02']
  };

  /**
   * Cálculo analítico sobre almacenamiento columnar:
   * Solo lee y procesa el vector continuo 'total' sin cargar el resto de atributos
   */
  public static computeColumnarSum(columnarTable: ColumnarTable = ColumnarAnalyticsService.columnOriented): number {
    return columnarTable.total.reduce((acc, val) => acc + val, 0);
  }

  /**
   * Cálculo tradicional sobre almacenamiento orientado a filas:
   * Debe iterar sobre cada objeto completo para extraer la propiedad 'total'
   */
  public static computeRowSum(rowTable: RowRecord[] = ColumnarAnalyticsService.rowOriented): number {
    return rowTable.reduce((acc, row) => acc + row.total, 0);
  }
}
