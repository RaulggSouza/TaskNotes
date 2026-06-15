import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { TasksModule } from './tasks/tasks.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DATABASE_HOST') ?? 'localhost',
        port: Number(config.get<string>('DATABASE_PORT') ?? 5432),
        username: config.get<string>('DATABASE_USER') ?? 'admin',
        password: config.get<string>('DATABASE_PASSWORD') ?? 'admin',
        database: config.get<string>('DATABASE_NAME') ?? 'tasks_db',
        autoLoadEntities: true,
        synchronize: true,
        retryAttempts: 10,
        retryDelay: 3000,
      }),
    }),

    RedisModule,
    TasksModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
