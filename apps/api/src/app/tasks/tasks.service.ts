import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm'; // <--- Import "In"
import { Task, TaskStatus } from './task.entity';
import { AuditLog } from './audit-log.entity'; // <--- Import
import { Organization } from '../organizations/entities/organization.entity'; // <--- Import
import { User, UserRole } from '../users/user.entity';
import { CreateTaskDto } from './dto/create-task.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>, // <--- Inject
    @InjectRepository(Organization)
    private orgRepository: Repository<Organization>, // <--- Inject
  ) {}

  // --- HELPER: SAVE LOG ---
  private async logAction(user: any, taskId: string, action: string, details: string) {
    const log = this.auditLogRepository.create({
      userId: user.username, 
      orgId: user.orgId,
      taskId,
      action,
      details,
    });
    return this.auditLogRepository.save(log);
  }

  // --- 1. CREATE TASK ---
  async createTask(createTaskDto: CreateTaskDto, user: any): Promise<Task> {
    if (!user.orgId) throw new ForbiddenException('User must belong to an Organization');

    const task = this.tasksRepository.create({
      title: createTaskDto.title,
      description: createTaskDto.description,
      status: TaskStatus.OPEN,
      user: { id: user.id } as User,
    });
    
    const savedTask = await this.tasksRepository.save(task);
    
    // RECORD LOG
    await this.logAction(user, savedTask.id, 'CREATE', `Created task: ${savedTask.title}`);
    
    return savedTask;
  }

  // --- 2. GET TASKS (Existing Logic) ---
  async getTasks(user: any): Promise<Task[]> {
    const { id, role, orgId } = user;

    if (role === UserRole.VIEWER) {
      return this.tasksRepository.find({
        where: { user: { id } }, 
        relations: ['user', 'user.organization'],
      });
    }

    if (role === UserRole.OWNER) {
      return this.tasksRepository.find({
        where: [
          { user: { organization: { id: orgId } } },
          { user: { organization: { parent: { id: orgId } } } }
        ],
        relations: ['user', 'user.organization'],
      });
    }

    return this.tasksRepository.find({
      where: { user: { organization: { id: orgId } } },
      relations: ['user', 'user.organization'],
    });
  }

  // --- 3. UPDATE TASK ---
  // Update the signature to accept an object
  async updateTask(id: string, updates: { title?: string; description?: string; status?: TaskStatus }, user: any): Promise<Task> {
    const task = await this.tasksRepository.findOne({ 
      where: { id }, 
      relations: ['user', 'user.organization'] 
    });

    if (!task) throw new NotFoundException('Task not found');

    // --- PERMISSION CHECK (Copy-Paste from before) ---
    let canEdit = false;
    if (task.user.id === user.id) canEdit = true; // Owner can always edit
    else if (user.role !== UserRole.VIEWER) {
      // Admin/Owner can edit if in their scope
      const taskOrgId = task.user.organization.id;
      const taskParentId = task.user.organization.parent?.id;
      if ((taskOrgId === user.orgId) || (taskParentId === user.orgId)) {
        canEdit = true;
      }
    }
    
    if (!canEdit) throw new ForbiddenException('Access Denied');
    // ------------------------------------------------

    // APPLY UPDATES
    if (updates.title) task.title = updates.title;
    if (updates.description) task.description = updates.description;
    if (updates.status) task.status = updates.status;

    const updated = await this.tasksRepository.save(task);

    // LOG IT (Be specific!)
    await this.logAction(user, task.id, 'UPDATE', `Updated task details: ${Object.keys(updates).join(', ')}`);
    
    return updated;
  }

  // --- 4. DELETE TASK ---
  async deleteTask(id: string, user: any): Promise<void> {
    const task = await this.tasksRepository.findOne({ 
      where: { id }, 
      relations: ['user', 'user.organization'] 
    });

    if (!task) throw new NotFoundException('Task not found');

    let canDelete = false;
    if (task.user.id === user.id) canDelete = true;
    else if (user.role !== UserRole.VIEWER) {
      const taskOrgId = task.user.organization.id;
      const taskParentId = task.user.organization.parent?.id;
      if ((taskOrgId === user.orgId) || (taskParentId === user.orgId)) {
        canDelete = true;
      }
    }

    if (!canDelete) throw new ForbiddenException('Access Denied');

    // LOG BEFORE DELETE
    await this.logAction(user, id, 'DELETE', `Deleted task: ${task.title}`);
    await this.tasksRepository.delete(id);
  }

  // --- 5. GET AUDIT LOGS (New Endpoint) ---
  async getAuditLogs(user: any): Promise<AuditLog[]> {
    const { role, orgId } = user;

    if (role === UserRole.VIEWER) {
      throw new ForbiddenException('Viewers cannot access audit logs');
    }

    // OWNER: See Root + Child Orgs
    if (role === UserRole.OWNER) {
      const myOrg = await this.orgRepository.findOne({
        where: { id: orgId },
        relations: ['children']
      });

      // Collect all IDs (Mine + My Children)
      const allowedOrgIds = [myOrg.id];
      if (myOrg.children) {
        allowedOrgIds.push(...myOrg.children.map(c => c.id));
      }

      return this.auditLogRepository.find({
        where: { orgId: In(allowedOrgIds) },
        order: { timestamp: 'DESC' }
      });
    }

    // ADMIN: See My Org Only
    return this.auditLogRepository.find({
      where: { orgId },
      order: { timestamp: 'DESC' },
    });
  }
}