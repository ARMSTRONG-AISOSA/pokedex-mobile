import { createLimiter } from '@/lib/limit';

describe('createLimiter', () => {
  it('runs tasks in order of arrival once a slot frees up', async () => {
    const limit = createLimiter(1);
    const order: number[] = [];
    const task = (n: number) => limit(async () => {
      order.push(n);
      await Promise.resolve();
    });
    await Promise.all([task(1), task(2), task(3)]);
    expect(order).toEqual([1, 2, 3]);
  });

  it('frees the slot when a task fails', async () => {
    const limit = createLimiter(1);
    await expect(limit(async () => { throw new Error('boom'); })).rejects.toThrow('boom');
    await expect(limit(async () => 'next')).resolves.toBe('next');
  });
});
