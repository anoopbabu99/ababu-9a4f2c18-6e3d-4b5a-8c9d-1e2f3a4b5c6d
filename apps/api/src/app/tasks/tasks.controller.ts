import { Controller, Post, Get, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { AuthGuard } from '@nestjs/passport';
import { TaskStatus } from './task.entity';

@Controller('tasks')
@UseGuards(AuthGuard('jwt'))
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  // 1. CREATE
  @Post()
  create(@Body() createTaskDto: CreateTaskDto, @Request() req) {
    return this.tasksService.createTask(createTaskDto, req.user);
  }

  // 2. VIEW TASKS
  @Get()
  findAll(@Request() req) {
    return this.tasksService.getTasks(req.user);
  }

  // 3. AUDIT LOGS (CRITICAL: Must be ABOVE ':id' routes)
  @Get('audit-log')
  getAuditLogs(@Request() req) {
    return this.tasksService.getAuditLogs(req.user);
  }

  // 4. UPDATE TASK (Upgraded to PUT to match requirements)
  // Allows updating Title, Description, OR Status
  @Put(':id') 
  update(
    @Param('id') id: string, 
    @Body() updateDto: { title?: string; description?: string; status?: TaskStatus }, 
    @Request() req
  ) {
    return this.tasksService.updateTask(id, updateDto, req.user);
  }

  // 5. DELETE TASK
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.tasksService.deleteTask(id, req.user);
  }
}