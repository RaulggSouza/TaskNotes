type NestAppMock = {
  useGlobalPipes: jest.Mock
  enableCors: jest.Mock
  listen: jest.Mock
}

const importMain = async (port?: string) => {
  jest.resetModules()

  const previousPort = process.env.PORT
  const app: NestAppMock = {
    useGlobalPipes: jest.fn(),
    enableCors: jest.fn(),
    listen: jest.fn().mockResolvedValue(undefined),
  }
  const create = jest.fn().mockResolvedValue(app)

  jest.doMock('@nestjs/core', () => ({
    NestFactory: {
      create,
    },
  }))

  if (port === undefined) {
    delete process.env.PORT
  } else {
    process.env.PORT = port
  }

  require('./main')
  await Promise.resolve()
  await Promise.resolve()

  if (previousPort === undefined) {
    delete process.env.PORT
  } else {
    process.env.PORT = previousPort
  }

  return { app, create }
}

describe('bootstrap', () => {
  it('uses port 3000 when PORT is not configured', async () => {
    const { app, create } = await importMain()

    expect(create).toHaveBeenCalledTimes(1)
    expect(app.listen).toHaveBeenCalledWith(3000)
  })

  it('uses the numeric PORT value when it is configured', async () => {
    const { app } = await importMain('4010')

    expect(app.listen).toHaveBeenCalledWith(4010)
  })

  it('registers the configured validation pipe before listening', async () => {
    const { app } = await importMain()
    const { ValidationPipe } = require('@nestjs/common')
    const pipe = app.useGlobalPipes.mock.calls[0][0]

    expect(pipe).toBeInstanceOf(ValidationPipe)
    expect(app.useGlobalPipes).toHaveBeenCalledTimes(1)
    expect(app.useGlobalPipes.mock.invocationCallOrder[0]).toBeLessThan(
      app.listen.mock.invocationCallOrder[0],
    )
  })

  it('enables cors before listening', async () => {
    const { app } = await importMain()

    expect(app.enableCors).toHaveBeenCalledTimes(1)
    expect(app.enableCors.mock.invocationCallOrder[0]).toBeLessThan(
      app.listen.mock.invocationCallOrder[0],
    )
  })
})
