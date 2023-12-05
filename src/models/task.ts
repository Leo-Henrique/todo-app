import { Table } from ".";

export interface Task extends Table {
  title: string;
  description: string;
  completed_at: Date | null;
}
