export interface Employee {
  id: string;
  name: string;
  email: string;
  position: string;
  department: Department;
  projects: Project[];
}

export interface Department {
  id: string;
  name: string;
  manager: {
    id: string;
    name: string;
    contact: {
      email: string;
      phone: string;
    };
  };
}

export interface Project {
  projectId: string;
  projectName: string;
  startDate: string;
  tasks: Task[];
}

export interface Task {
  taskId: string;
  title: string;
  status: string;
  details: {
    hoursSpent: number;
    technologiesUsed: string[];
    completionDate: string;
  };
}

export type TimeoutType = ReturnType<typeof setTimeout>;