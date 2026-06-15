import { Task } from "../tasks/task.entity";

export const makeTask = (overrides: Partial<Task> = {}): Task => ({
  id: 1,
  title: 'Write tests',
  description: 'Cover the implemented task API',
  done: false,
  createdAt: new Date('2026-06-15T12:00:00.000Z'),
  updatedAt: new Date('2026-06-15T12:00:00.000Z'),
  ...overrides,
});
