import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config'; // <--- Import these
import { User } from './users/user.entity';
import { Task } from './tasks/task.entity';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TasksModule } from './tasks/tasks.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { Organization } from './organizations/entities/organization.entity';

@Module({
  imports: [
    // 1. Load the Config Module globally so .env works everywhere
    ConfigModule.forRoot({
      isGlobal: true, 
    }),

    // 2. Use forRootAsync to read from .env
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'sqlite',
        // Read from .env, fallback to 'database.sqlite' if missing
        database: configService.get<string>('DATABASE_NAME', 'database.sqlite'),
        entities: [User, Task, Organization],
        autoLoadEntities: true,
        synchronize: true,
      }),
      inject: [ConfigService],
    }),

    AuthModule,
    TasksModule,
    OrganizationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}