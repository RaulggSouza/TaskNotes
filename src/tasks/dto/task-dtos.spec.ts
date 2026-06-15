import { BadRequestException } from '@nestjs/common';
import {
  bodyMetadata,
  createConfiguredValidationPipe,
  validateDto,
} from '../../test-utils/validation';
import { CreateTaskDto } from './create-task.dto';
import { UpdateTaskDto } from './update-task.dto';

const expectValid = async <T extends object>(
  dtoClass: new () => T,
  payload: Record<string, unknown>,
) => {
  await expect(validateDto(dtoClass, payload)).resolves.toHaveLength(0);
};

const expectInvalid = async <T extends object>(
  dtoClass: new () => T,
  payload: Record<string, unknown>,
) => {
  const errors = await validateDto(dtoClass, payload);

  expect(errors.length).toBeGreaterThan(0);
};

describe('CreateTaskDto', () => {
  it('accepts a title with one character', async () => {
    await expectValid(CreateTaskDto, { title: 'A' });
  });

  it('accepts a missing description', async () => {
    await expectValid(CreateTaskDto, { title: 'Write tests' });
  });

  it('accepts an empty string description', async () => {
    await expectValid(CreateTaskDto, { title: 'Write tests', description: '' });
  });

  it.each([
    ['missing title', {}],
    ['empty title', { title: '' }],
    ['numeric title', { title: 1 }],
    ['boolean title', { title: true }],
    ['array title', { title: ['Task'] }],
    ['object title', { title: { value: 'Task' } }],
    ['numeric description', { title: 'Write tests', description: 1 }],
    [
      'object description',
      { title: 'Write tests', description: { value: 'Details' } },
    ],
  ])('rejects %s', async (_, payload) => {
    await expectInvalid(CreateTaskDto, payload);
  });
});

describe('UpdateTaskDto', () => {
  it.each([
    ['empty payload', {}],
    ['title only', { title: 'Updated title' }],
    ['description only', { description: 'Updated description' }],
    ['done true only', { done: true }],
    ['done false only', { done: false }],
    ['null title', { title: null }],
    ['null description', { description: null }],
    ['null done', { done: null }],
  ])('accepts %s', async (_, payload) => {
    await expectValid(UpdateTaskDto, payload);
  });

  it.each([
    ['string done', { done: 'true' }],
    ['numeric done', { done: 1 }],
    ['object done', { done: { value: true } }],
  ])('rejects %s', async (_, payload) => {
    await expectInvalid(UpdateTaskDto, payload);
  });
});

describe('Configured ValidationPipe', () => {
  it('rejects a task creation payload with a non-whitelisted field', async () => {
    const pipe = createConfiguredValidationPipe();
    const payload = { title: 'Write tests', unexpected: 'field' };

    await expect(
      pipe.transform(payload, bodyMetadata(CreateTaskDto)),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('transforms a valid task creation payload into the expected dto instance', async () => {
    const pipe = createConfiguredValidationPipe();
    const payload = {
      title: 'Write tests',
      description: 'Keep behavior clear',
    };

    await expect(
      pipe.transform(payload, bodyMetadata(CreateTaskDto)),
    ).resolves.toEqual(expect.objectContaining(payload));
  });
});
