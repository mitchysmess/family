export type TaskStatus = "open" | "done";
export type TaskPriority = "normal" | "high";
export type TaskFilter = "alle" | "open" | "done";

export type Task = {
  id: string;
  title: string;
  description?: string;
  taskDate: string;
  assignedTo: string;
  createdBy: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: string;
  updatedAt: string;
};

export type NewTaskForm = {
  title: string;
  description: string;
  taskDate: string;
  assignedTo: string;
  repeat: RepeatOption;
  repeatUntil: string;
};

export type RepeatOption = "none" | "daily" | "weekdays" | "weekly";

export type TaskFormErrors = {
  title?: string;
  taskDate?: string;
  assignedTo?: string;
  repeatUntil?: string;
};

export type Profile = {
  id: string;
  fullName: string;
  email: string;
  role: "admin" | "member";
  avatarUrl?: string;
  profileColor: string;
};

export type NewProfileForm = {
  fullName: string;
  avatarUrl: string;
  profileColor: string;
};

export type ProfileFormErrors = {
  fullName?: string;
  avatarUrl?: string;
};
