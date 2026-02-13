// libs/data/src/lib/data.ts

// 1. SHARED ENUMS (Single Source of Truth)
export enum UserRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  VIEWER = 'VIEWER',
}

export enum TaskStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

export enum TaskCategory {
  WORK = 'Work',
  PERSONAL = 'Personal',
  GENERAL = 'General'
}

// 2. SHARED INTERFACES (Frontend uses this, Backend implements this)
export interface IOrganization {
  id: string;
  name: string;
}

export interface IUser {
  id: string;
  username: string;
  role: UserRole;
  organization?: IOrganization;
}

export interface ITask {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  category: string; // or TaskCategory
  order: number;
  user?: IUser;
  createdAt: Date;
}

// --- 3. AUTH CONTRACTS ---
export interface IAuthResponse {
  access_token: string;
  user: IUser; // Reuse the IUser interface you already made!
}

export interface ILoginPayload {
  username: string;
  password?: string; // Optional because simpler apps might just ask for username
}

export interface IRegisterPayload {
  username: string;
  password?: string;
  organizationName?: string; // Optional for existing orgs
}

// --- 4. TASK INPUT CONTRACTS ---
// This ensures Frontend sends exactly what Backend expects
export interface ICreateTaskPayload {
  title: string;
  description: string;
  category?: string; // "Work" | "Personal"
}

export interface IUpdateTaskPayload {
  title?: string;
  description?: string;
  status?: TaskStatus;
  category?: string;
}