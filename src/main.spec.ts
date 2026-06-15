import { ValidationPipe } from '@nestjs/common';

type NestAppMock = {
  useGlobalPipes: jest.Mock;
  enableCors: jest.Mock;
  listen: jest.Mock;
};

const createMock = jest.fn();
const setupOpenApiDocumentationMock = jest.fn();

jest.mock('@nestjs/core', () => ({
  NestFactory: {
    create: createMock,
  },
}));

jest.mock('./openapi', () => ({
  setupOpenApiDocumentation: setupOpenApiDocumentationMock,
}));

describe('bootstrap', () => {
  let previousPort: string | undefined;
  let app: NestAppMock;

  beforeEach(() => {
    jest.clearAllMocks();

    previousPort = process.env.PORT;

    app = {
      useGlobalPipes: jest.fn(),
      enableCors: jest.fn(),
      listen: jest.fn().mockResolvedValue(undefined),
    };

    createMock.mockResolvedValue(app);
  });

  afterEach(() => {
    if (previousPort === undefined) {
      delete process.env.PORT;
    } else {
      process.env.PORT = previousPort;
    }
  });

  async function importBootstrapAndRun(port?: string) {
    if (port === undefined) {
      delete process.env.PORT;
    } else {
      process.env.PORT = port;
    }

    const { bootstrap } = require('./bootstrap');

    await bootstrap();

    return {
      app,
      create: createMock,
      setupOpenApiDocumentation: setupOpenApiDocumentationMock,
    };
  }

  it('uses port 3000 when PORT is not configured', async () => {
    const { app, create } = await importBootstrapAndRun();

    expect(create).toHaveBeenCalledTimes(1);
    expect(app.listen).toHaveBeenCalledWith(3000);
  });

  it('uses the numeric PORT value when it is configured', async () => {
    const { app } = await importBootstrapAndRun('4010');

    expect(app.listen).toHaveBeenCalledWith(4010);
  });

  it('registers the configured validation pipe before listening', async () => {
    const { app } = await importBootstrapAndRun();
    const pipe = app.useGlobalPipes.mock.calls[0][0];

    expect(pipe).toBeInstanceOf(ValidationPipe);
    expect(app.useGlobalPipes).toHaveBeenCalledTimes(1);
    expect(app.useGlobalPipes.mock.invocationCallOrder[0]).toBeLessThan(
      app.listen.mock.invocationCallOrder[0],
    );
  });

  it('enables cors before listening', async () => {
    const { app } = await importBootstrapAndRun();

    expect(app.enableCors).toHaveBeenCalledTimes(1);
    expect(app.enableCors.mock.invocationCallOrder[0]).toBeLessThan(
      app.listen.mock.invocationCallOrder[0],
    );
  });

  it('sets up OpenAPI documentation after cors and before listening', async () => {
    const { app, setupOpenApiDocumentation } = await importBootstrapAndRun();

    expect(setupOpenApiDocumentation).toHaveBeenCalledWith(app);
    expect(app.enableCors.mock.invocationCallOrder[0]).toBeLessThan(
      setupOpenApiDocumentation.mock.invocationCallOrder[0],
    );
    expect(setupOpenApiDocumentation.mock.invocationCallOrder[0]).toBeLessThan(
      app.listen.mock.invocationCallOrder[0],
    );
  });
});
