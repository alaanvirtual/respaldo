// tests/unit/storage_and_transactions.test.ts - Pruebas de Motores de Almacenamiento y Transacciones (Capítulos 14 y 15)
import { expect } from 'chai';
import * as path from 'path';
import * as fs from 'fs';

// Cap 14
import { SimpleLogEngine } from '../../src/storage/simple_log_engine';
import { ColumnarAnalyticsService } from '../../src/storage/columnar_analytics';
import { ActivityLoggerService } from '../../src/storage/activity_logger_service';

// Cap 15
import { executeSerializableTransaction } from '../../src/transactions/serializable_retry';
import { TaskTransactionService } from '../../src/transactions/task_transaction_service';
import { AppDataSource } from '../../src/utils/db';

describe('Capítulo 14: Motores de Almacenamiento e Índices Internos', () => {
  const testDbFile = path.join(__dirname, '../../data/test_log_engine.db');

  after(() => {
    if (fs.existsSync(testDbFile)) {
      try {
        fs.unlinkSync(testDbFile);
      } catch {
        // Ignorar en Windows si aún tiene descriptor abierto
      }
    }
  });

  it('SimpleLogEngine (Bitcask pattern): debe escribir append-only y recuperar con offset en memoria', async () => {
    const engine = new SimpleLogEngine(testDbFile);

    await engine.set('user:1', 'Alice');
    await engine.set('user:2', 'Bob');

    const user1 = await engine.get('user:1');
    const user2 = await engine.get('user:2');
    const nonExistent = await engine.get('user:999');

    expect(user1).to.equal('Alice');
    expect(user2).to.equal('Bob');
    expect(nonExistent).to.be.null;

    // Sobreescritura en append-only
    await engine.set('user:1', 'Alicia Actualizada');
    const user1Updated = await engine.get('user:1');
    expect(user1Updated).to.equal('Alicia Actualizada');

    engine.close();
  });

  it('Almacenamiento Columnar (OLAP): debe computar agregaciones idénticas a filas optimizando I/O', () => {
    const rowSum = ColumnarAnalyticsService.computeRowSum();
    const colSum = ColumnarAnalyticsService.computeColumnarSum();

    expect(rowSum).to.be.closeTo(435.70, 0.01);
    expect(colSum).to.be.closeTo(435.70, 0.01);
    expect(rowSum).to.equal(colSum);
  });

  it('ActivityLoggerService (LSM-Tree pattern): debe indexar eventos ordenados y realizar escaneo por rango', async () => {
    const logger = new ActivityLoggerService();

    await logger.logEvent('task-100', 'usr-1', 'CREATED');
    await logger.logEvent('task-100', 'usr-2', 'ASSIGNED');
    await logger.logEvent('task-100', 'usr-2', 'STATUS_IN_PROGRESS');
    await logger.logEvent('task-200', 'usr-3', 'CREATED'); // Otra tarea

    const historyTask100 = await logger.getTaskHistory('task-100');
    expect(historyTask100).to.have.lengthOf(3);
    expect(historyTask100[0].action).to.equal('CREATED');
    expect(historyTask100[1].action).to.equal('ASSIGNED');
    expect(historyTask100[2].action).to.equal('STATUS_IN_PROGRESS');

    const historyTask200 = await logger.getTaskHistory('task-200');
    expect(historyTask200).to.have.lengthOf(1);
    expect(historyTask200[0].action).to.equal('CREATED');
  });
});

describe('Capítulo 15: Transacciones Avanzadas y Niveles de Aislamiento', () => {
  it('executeSerializableTransaction: debe confirmar exitosamente una operación sin fallos', async () => {
    let executed = false;
    const result = await executeSerializableTransaction(async () => {
      executed = true;
      return 'SUCCESS_TX';
    });

    expect(executed).to.be.true;
    expect(result).to.equal('SUCCESS_TX');
  });

  it('executeSerializableTransaction: debe reintentar automáticamente ante error 40001 (serialization failure)', async () => {
    let attempts = 0;

    const result = await executeSerializableTransaction(
      async () => {
        attempts++;
        if (attempts < 2) {
          const err: any = new Error('could not serialize access due to read/write dependencies among transactions');
          err.code = '40001';
          throw err;
        }
        return 'RETRY_SUCCESS';
      },
      { maxRetries: 3, initialDelayMs: 10 }
    );

    expect(attempts).to.equal(2);
    expect(result).to.equal('RETRY_SUCCESS');
  });

  it('executeSerializableTransaction: debe lanzar error si supera maxRetries', async () => {
    let attempts = 0;

    try {
      await executeSerializableTransaction(
        async () => {
          attempts++;
          const err: any = new Error('serialization failure');
          err.code = '40001';
          throw err;
        },
        { maxRetries: 2, initialDelayMs: 5 }
      );
      expect.fail('Debería haber lanzado excepción');
    } catch (error: any) {
      expect(attempts).to.equal(3); // intento 1 + 2 reintentos
      expect(error.code).to.equal('40001');
    }
  });

  it('TaskTransactionService: debe instanciarse e iniciar flujo con protección de límite', async () => {
    const service = new TaskTransactionService(AppDataSource);
    const assigned = await service.assignTaskWithLimit('proj-uuid-1', 'Tarea SERIALIZABLE', 'user-uuid-1');
    expect(assigned).to.have.property('name', 'Tarea SERIALIZABLE');
    expect(assigned).to.have.property('status', 'In-Progress');
  });
});
