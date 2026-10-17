// src/utils/async-iterator.ts - Iteradores y Generadores Asíncronos (Capítulo 12)
export interface BatchResponse<T> {
  items: T[];
  nextPage: number | null;
}

export async function* fetchInBatches<T = any>(
  fetcher: (page: number) => Promise<BatchResponse<T>>
): AsyncGenerator<T[], void, unknown> {
  let page: number | null = 1;
  while (page !== null) {
    const response = await fetcher(page);
    yield response.items;
    page = response.nextPage;
  }
}

export async function processPagedTasks(): Promise<string[]> {
  const processed: string[] = [];
  const mockFetcher = async (p: number): Promise<BatchResponse<string>> => {
    if (p > 3) return { items: [], nextPage: null };
    return { items: [`Tarea-${p}-1`, `Tarea-${p}-2`], nextPage: p + 1 };
  };

  for await (const batch of fetchInBatches(mockFetcher)) {
    console.log(`[Batch] Procesados ${batch.length} elementos:`, batch);
    processed.push(...batch);
  }

  return processed;
}
