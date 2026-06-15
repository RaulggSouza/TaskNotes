import { NotFoundException } from '@nestjs/common';
import {
  createRedisServiceMock,
  createTaskRepositoryMock,
} from '../test-utils/mocks';
import { makeTask } from '../test-utils/task.factory';
import { TasksService } from './tasks.service';

describe('TasksService', () => {
  const cacheKey = 'tasks:all';
  let repository: ReturnType<typeof createTaskRepositoryMock>;
  let redis: ReturnType<typeof createRedisServiceMock>;
  let service: TasksService;

  beforeEach(() => {
    repository = createTaskRepositoryMock();
    redis = createRedisServiceMock();
    service = new TasksService(repository as never, redis as never);
  });

  describe('create', () => {
    it('saves a task with the minimum valid title, clears the task cache, and returns the saved task', async () => {
      const createTaskDto = { title: 'A' };
      const createdTask = makeTask({ id: 0, title: createTaskDto.title });
      const savedTask = makeTask({ title: createTaskDto.title });

      repository.create.mockReturnValue(createdTask);
      repository.save.mockResolvedValue(savedTask);
      redis.del.mockResolvedValue(undefined);

      await expect(service.create(createTaskDto)).resolves.toBe(savedTask);
      expect(repository.create).toHaveBeenCalledWith(createTaskDto);
      expect(repository.save).toHaveBeenCalledWith(createdTask);
      expect(redis.del).toHaveBeenCalledWith(cacheKey);
    });

    it('preserves the optional description while saving a new task', async () => {
      const createTaskDto = {
        title: 'Document API',
        description: 'Add endpoint notes',
      };
      const createdTask = makeTask(createTaskDto);
      const savedTask = makeTask({ id: 2, ...createTaskDto });

      repository.create.mockReturnValue(createdTask);
      repository.save.mockResolvedValue(savedTask);
      redis.del.mockResolvedValue(undefined);

      await expect(service.create(createTaskDto)).resolves.toEqual(savedTask);
      expect(repository.create).toHaveBeenCalledWith(createTaskDto);
      expect(repository.save).toHaveBeenCalledWith(createdTask);
      expect(redis.del).toHaveBeenCalledWith(cacheKey);
    });
  });

  describe('findAll', () => {
    it('returns parsed tasks from cache without querying the repository', async () => {
      const tasks = [makeTask(), makeTask({ id: 2, title: 'Review tests' })];
      const cachedTasks = JSON.parse(JSON.stringify(tasks));

      redis.get.mockResolvedValue(JSON.stringify(tasks));

      await expect(service.findAll()).resolves.toEqual(cachedTasks);
      expect(redis.get).toHaveBeenCalledWith(cacheKey);
      expect(repository.find).not.toHaveBeenCalled();
      expect(redis.set).not.toHaveBeenCalled();
    });

    it('loads ordered tasks from the repository and caches them for sixty seconds when cache is absent', async () => {
      const tasks = [makeTask(), makeTask({ id: 2, title: 'Review tests' })];

      redis.get.mockResolvedValue(null);
      repository.find.mockResolvedValue(tasks);
      redis.set.mockResolvedValue(undefined);

      await expect(service.findAll()).resolves.toBe(tasks);
      expect(repository.find).toHaveBeenCalledWith({ order: { id: 'ASC' } });
      expect(redis.set).toHaveBeenCalledWith(
        cacheKey,
        JSON.stringify(tasks),
        60,
      );
    });

    it('treats an empty cached string as a cache miss', async () => {
      const tasks = [makeTask()];

      redis.get.mockResolvedValue('');
      repository.find.mockResolvedValue(tasks);
      redis.set.mockResolvedValue(undefined);

      await expect(service.findAll()).resolves.toBe(tasks);
      expect(repository.find).toHaveBeenCalledWith({ order: { id: 'ASC' } });
      expect(redis.set).toHaveBeenCalledWith(
        cacheKey,
        JSON.stringify(tasks),
        60,
      );
    });

    it('caches and returns an empty repository result', async () => {
      redis.get.mockResolvedValue(null);
      repository.find.mockResolvedValue([]);
      redis.set.mockResolvedValue(undefined);

      await expect(service.findAll()).resolves.toEqual([]);
      expect(redis.set).toHaveBeenCalledWith(cacheKey, '[]', 60);
    });
  });

  describe('findOne', () => {
    it('returns the task found for the requested id', async () => {
      const task = makeTask({ id: 7 });

      repository.findOne.mockResolvedValue(task);

      await expect(service.findOne(7)).resolves.toBe(task);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 7 } });
    });

    it('throws a not found exception containing the requested id when no task exists', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne(99)).rejects.toThrow(
        new NotFoundException('Task with id 99 not found'),
      );
    });
  });

  describe('update', () => {
    it('updates title, description, and done for an existing task, saves it, clears cache, and returns it', async () => {
      const task = makeTask({ id: 5, done: false });
      const updateTaskDto = {
        title: 'Updated title',
        description: 'Updated description',
        done: true,
      };

      repository.findOne.mockResolvedValue(task);
      repository.save.mockImplementation(async (value) => value);
      redis.del.mockResolvedValue(undefined);

      await expect(service.update(5, updateTaskDto)).resolves.toMatchObject(
        updateTaskDto,
      );
      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining(updateTaskDto),
      );
      expect(redis.del).toHaveBeenCalledWith(cacheKey);
    });

    it('preserves a false done value when updating an existing task', async () => {
      const task = makeTask({ id: 6, done: true });
      const updateTaskDto = { done: false };

      repository.findOne.mockResolvedValue(task);
      repository.save.mockImplementation(async (value) => value);
      redis.del.mockResolvedValue(undefined);

      await expect(service.update(6, updateTaskDto)).resolves.toMatchObject({
        id: 6,
        done: false,
      });
      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({ done: false }),
      );
    });

    it('saves the found task without overwriting fields when the update payload is empty', async () => {
      const task = makeTask({ id: 8, title: 'Keep me', done: false });

      repository.findOne.mockResolvedValue(task);
      repository.save.mockImplementation(async (value) => value);
      redis.del.mockResolvedValue(undefined);

      await expect(service.update(8, {})).resolves.toEqual(task);
      expect(repository.save).toHaveBeenCalledWith(task);
      expect(redis.del).toHaveBeenCalledWith(cacheKey);
    });

    it('propagates not found without saving or clearing cache when the task does not exist', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.update(9, { title: 'Missing' })).rejects.toThrow(
        NotFoundException,
      );
      expect(repository.save).not.toHaveBeenCalled();
      expect(redis.del).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('removes an existing task and clears the task cache', async () => {
      const task = makeTask({ id: 10 });

      repository.findOne.mockResolvedValue(task);
      repository.remove.mockResolvedValue(task);
      redis.del.mockResolvedValue(undefined);

      await expect(service.remove(10)).resolves.toBeUndefined();
      expect(repository.remove).toHaveBeenCalledWith(task);
      expect(redis.del).toHaveBeenCalledWith(cacheKey);
    });

    it('propagates not found without removing or clearing cache when the task does not exist', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.remove(11)).rejects.toThrow(NotFoundException);
      expect(repository.remove).not.toHaveBeenCalled();
      expect(redis.del).not.toHaveBeenCalled();
    });
  });
});
