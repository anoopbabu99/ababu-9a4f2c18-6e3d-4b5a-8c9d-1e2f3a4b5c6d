import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { Task } from './task.entity';
import { AuditLog } from './audit-log.entity'; // <--- 1. IMPORT THIS
import { Organization } from '../organizations/entities/organization.entity';

@Module({
  imports: [
    // 2. REGISTER IT HERE:
    TypeOrmModule.forFeature([Task, AuditLog, Organization]) 
  ],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}