import { ConfigService } from '@nestjs/config'
import Redis from 'ioredis'
import { RedisService } from './redis.service'

jest.mock('ioredis')

type RedisClientMock = {
  get: jest.Mock
  set: jest.Mock
  del: jest.Mock
  quit: jest.Mock
}

const RedisMock = Redis as unknown as jest.Mock

const createRedisClientMock = (): RedisClientMock => ({
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  quit: jest.fn(),
})

const createConfigService = () =>
  ({
    get: jest.fn((key: string) => {
      const values: Record<string, string> = {
        REDIS_HOST: 'localhost',
        REDIS_PORT: '6379',
      }

      return values[key]
    }),
  }) as unknown as ConfigService

describe('RedisService', () => {
  let client: RedisClientMock
  let service: RedisService

  beforeEach(() => {
    client = createRedisClientMock()
    RedisMock.mockClear()
    RedisMock.mockImplementation(() => client)
    service = new RedisService(createConfigService())
  })

  it('creates a Redis client with host and port from configuration', () => {
    expect(RedisMock).toHaveBeenCalledWith({ host: 'localhost', port: 6379 })
  })

  it('delegates get calls to the Redis client', async () => {
    client.get.mockResolvedValue('cached-value')

    await expect(service.get('tasks:all')).resolves.toBe('cached-value')
    expect(client.get).toHaveBeenCalledWith('tasks:all')
  })

  it('sets a key with expiration when seconds to expire is positive', async () => {
    client.set.mockResolvedValue('OK')

    await expect(service.set('tasks:all', '[]', 60)).resolves.toBeUndefined()
    expect(client.set).toHaveBeenCalledWith('tasks:all', '[]', 'EX', 60)
  })

  it('sets a key without expiration when seconds to expire is omitted', async () => {
    client.set.mockResolvedValue('OK')

    await expect(service.set('tasks:all', '[]')).resolves.toBeUndefined()
    expect(client.set).toHaveBeenCalledWith('tasks:all', '[]')
  })

  it('sets a key without expiration when seconds to expire is zero', async () => {
    client.set.mockResolvedValue('OK')

    await expect(service.set('tasks:all', '[]', 0)).resolves.toBeUndefined()
    expect(client.set).toHaveBeenCalledWith('tasks:all', '[]')
  })

  it('delegates del calls to the Redis client', async () => {
    client.del.mockResolvedValue(1)

    await expect(service.del('tasks:all')).resolves.toBeUndefined()
    expect(client.del).toHaveBeenCalledWith('tasks:all')
  })

  it('quits the Redis client when the module is destroyed', async () => {
    client.quit.mockResolvedValue('OK')

    await expect(service.onModuleDestroy()).resolves.toBeUndefined()
    expect(client.quit).toHaveBeenCalledWith()
  })
})
