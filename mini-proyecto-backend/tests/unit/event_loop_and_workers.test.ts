import { expect } from 'chai';
import path from 'node:path';
import { EventLoopMonitor } from '../../src/perf/event_loop_monitor';
import { runEventLoopSequenceDemo } from '../../src/perf/event_loop_demo';
import { executeHeavyCalculationInFork } from '../../src/services/heavy_calc_process';
import { executeSharedMemoryDemo } from '../../src/workers/shared_memory_demo';
import { WorkerPool } from '../../src/utils/worker_pool';
import { AnalyticsController } from '../../src/controllers/analytics_controller';

describe('Capítulo 18: Optimización del Event Loop y Cómputo Paralelo', function () {
  this.timeout(15000); // Dar suficiente tiempo para workers e IPC

  after(async () => {
    await AnalyticsController.closePool();
  });

  it('EventLoopMonitor: debe medir utilización del Event Loop (ELU) con node:perf_hooks', () => {
    const monitor = new EventLoopMonitor();
    const elu = monitor.measure();

    expect(elu).to.have.property('utilization');
    expect(elu).to.have.property('activeMs');
    expect(elu).to.have.property('idleMs');
    expect(elu).to.have.property('utilizationPercent');
    expect(elu.utilization).to.be.a('number');
  });

  it('EventLoopDemo: debe demostrar el orden estricto de microtareas antes de macrotareas', async () => {
    const log = await runEventLoopSequenceDemo();

    expect(log).to.include('1. Inicio síncrono');
    expect(log).to.include('6. Fin síncrono');
    expect(log).to.include('2. Microtarea prioritaria: process.nextTick');
    expect(log).to.include('3. Microtarea: Promise.then');

    const nextTickIndex = log.indexOf('2. Microtarea prioritaria: process.nextTick');
    const promiseIndex = log.indexOf('3. Microtarea: Promise.then');
    const syncEndIndex = log.indexOf('6. Fin síncrono');

    // Síncrono termina antes de que se ejecuten las microtareas
    expect(syncEndIndex).to.be.lessThan(nextTickIndex);
    // process.nextTick tiene prioridad absoluta sobre Promise.then
    expect(nextTickIndex).to.be.lessThan(promiseIndex);
  });

  it('child_process.fork: debe ejecutar cómputo CPU-bound en proceso hijo y retornar por IPC', async () => {
    const resultado = await executeHeavyCalculationInFork(1000);
    expect(resultado).to.be.a('number');
    expect(resultado).to.be.greaterThan(0);
  });

  it('SharedArrayBuffer y Atomics: debe sincronizar memoria compartida de forma atómica e hilo-segura', async () => {
    const finalValue = await executeSharedMemoryDemo(100, 50);
    expect(finalValue).to.equal(150);
  });

  it('WorkerPool: debe reutilizar hilos de worker y balancear tareas concurrentes', async () => {
    const workerPath = path.join(__dirname, '../../src/workers/analytics_worker.ts');
    const pool = new WorkerPool(workerPath, 2);

    const task1 = pool.runTask({ projectId: 'prj-alpha', sampleSize: 2000 });
    const task2 = pool.runTask({ projectId: 'prj-beta', sampleSize: 3000 });

    const [res1, res2] = await Promise.all([task1, task2]);

    expect(res1.projectId).to.equal('prj-alpha');
    expect(res1.calculatedMean).to.be.a('number');
    expect(res2.projectId).to.equal('prj-beta');
    expect(res2.calculatedVariance).to.be.a('number');

    await pool.destroy();
  });

  it('AnalyticsController: debe responder HTTP 200 con analíticas calculadas por el pool', async () => {
    const req: any = {
      params: { projectId: 'prj-mock-123' },
      query: { sampleSize: '1000' }
    };

    let responseStatus = 0;
    let responseBody: any = null;

    const res: any = {
      status: (code: number) => {
        responseStatus = code;
        return res;
      },
      json: (data: any) => {
        responseBody = data;
        return res;
      }
    };

    await AnalyticsController.getProjectMetricsHandler(req, res);

    expect(responseStatus).to.equal(200);
    expect(responseBody.success).to.be.true;
    expect(responseBody.data.projectId).to.equal('prj-mock-123');
    expect(responseBody.data.sampleSize).to.equal(1000);
  });
});
