import { Task } from "./task.type";

export interface DataStore {
  tasks: Task[];
  nextId: number;
}
