export type Priority = 'low' | 'medium' | 'high';

export type TaskStatus = 'pending' | 'completed';

export type Task = {
  id: number;
  user_id: number;
  category_id: number | null;
  parent_task_id: number | null;
  title: string;
  description: string | null;
  priority: Priority;
  due_date: string | null;
  completed_at: string | null;
  order_position: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  category?: Category | null;
  parent_task?: Task | null;
};

export type Category = {
  id: number;
  user_id: number;
  name: string;
  color: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type TasksFilters = {
  search?: string;
  category_id?: number[];
  priority?: Priority[];
  completed?: boolean | null;
  page?: number;
  per_page?: number;
};

export type TasksResponse = {
  data: Task[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};