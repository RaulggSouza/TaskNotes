import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CreateTaskDto } from './dto/create-task.dto'
import { UpdateTaskDto } from './dto/update-task.dto'
import { Task } from './task.entity'
import { RedisService } from './redis/redis.service'

@Injectable()
export class TasksService {
  private readonly tasksCacheKey = 'tasks:all'

  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    private readonly redisService: RedisService
  ) {}

  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    const task = this.taskRepository.create(createTaskDto)

    const savedTask = await this.taskRepository.save(task)

    await this.clearTasksCache()

    return savedTask
  }

  async findAll(): Promise<Task[]> {
    const cachedTasks = await this.redisService.get(this.tasksCacheKey)

    if (cachedTasks) {
      return JSON.parse(cachedTasks)
    }

    const tasks = await this.taskRepository.find({
      order: {
        id: 'ASC'
      }
    })

    await this.redisService.set(this.tasksCacheKey, JSON.stringify(tasks), 60)

    return tasks
  }

  async findOne(id: number): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: {
        id
      }
    })

    if (!task) {
      throw new NotFoundException(`Task with id ${id} not found`)
    }

    return task
  }

  async update(id: number, updateTaskDto: UpdateTaskDto): Promise<Task> {
    const task = await this.findOne(id)

    Object.assign(task, updateTaskDto)

    const updatedTask = await this.taskRepository.save(task)

    await this.clearTasksCache()

    return updatedTask
  }

  async remove(id: number): Promise<void> {
    const task = await this.findOne(id)

    await this.taskRepository.remove(task)

    await this.clearTasksCache()
  }

  private async clearTasksCache(): Promise<void> {
    await this.redisService.del(this.tasksCacheKey)
  }
}