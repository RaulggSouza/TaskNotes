import { NotFoundException } from '@nestjs/common';
import { makeTask } from '../test-utils/task.factory';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

type TasksServiceMock = jest.Mocked<
  Pick<TasksService, 'create' | 'findAll' | 'findOne' | 'update' | 'remove'>
>;

const createTasksServiceMock = (): TasksServiceMock => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

describe('TasksController', () => {
  let tasksService: TasksServiceMock;
  let controller: TasksController;

  beforeEach(() => {
    tasksService = createTasksServiceMock();
    controller = new TasksController(tasksService as never);
  });

  it('delegates task creation with the received payload', async () => {
    const createTaskDto = {
      title: 'New task',
      description: 'Controller unit test',
    };
    const task = makeTask(createTaskDto);

    tasksService.create.mockResolvedValue(task);

    await expect(controller.create(createTaskDto)).resolves.toBe(task);
    expect(tasksService.create).toHaveBeenCalledWith(createTaskDto);
  });

  it('delegates task listing without additional arguments', async () => {
    const tasks = [makeTask(), makeTask({ id: 2, title: 'Second task' })];

    tasksService.findAll.mockResolvedValue(tasks);

    await expect(controller.findAll()).resolves.toBe(tasks);
    expect(tasksService.findAll).toHaveBeenCalledWith();
  });

  it('delegates single task lookup with the parsed id', async () => {
    const task = makeTask({ id: 3 });

    tasksService.findOne.mockResolvedValue(task);

    await expect(controller.findOne(3)).resolves.toBe(task);
    expect(tasksService.findOne).toHaveBeenCalledWith(3);
  });

  it('delegates task updates with the parsed id and received payload', async () => {
    const updateTaskDto = { title: 'Updated task', done: true };
    const task = makeTask({ id: 4, ...updateTaskDto });

    tasksService.update.mockResolvedValue(task);

    await expect(controller.update(4, updateTaskDto)).resolves.toBe(task);
    expect(tasksService.update).toHaveBeenCalledWith(4, updateTaskDto);
  });

  it('delegates task removal with the parsed id', async () => {
    tasksService.remove.mockResolvedValue(undefined);

    await expect(controller.remove(5)).resolves.toBeUndefined();
    expect(tasksService.remove).toHaveBeenCalledWith(5);
  });

  it('propagates service errors while looking up a task', async () => {
    const error = new NotFoundException('Task with id 404 not found');

    tasksService.findOne.mockRejectedValue(error);

    await expect(controller.findOne(404)).rejects.toBe(error);
  });
});
