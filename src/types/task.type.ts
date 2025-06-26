export interface Task {
  id: number;
  title: string;
  completed: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTaskRequest {
  title: string;
  completed: boolean;
}

export interface UpdateTaskRequest {
  title?: string;
  completed?: boolean;
}
