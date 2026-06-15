import { RedisService } from '../redis/redis.service';
import { Task } from '../tasks/task.entity';
import { Repository } from 'typeorm';

export type TaskRepositoryMock = jest.Mocked<
  Pick<Repository<Task>, 'create' | 'save' | 'find' | 'findOne' | 'remove'>
>;

export type RedisServiceMock = jest.Mocked<
  Pick<RedisService, 'get' | 'set' | 'del'>
>;

export const createTaskRepositoryMock = (): TaskRepositoryMock => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  remove: jest.fn(),
});

export const createRedisServiceMock = (): RedisServiceMock => ({
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
});
