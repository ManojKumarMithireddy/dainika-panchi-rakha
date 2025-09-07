export interface Employee {
  id: string;
  name: string;
  employeeId: string;
  contact?: string;
  isActive: boolean;
  createdAt: Date;
}

export interface DailyRecord {
  id: string;
  employeeId: string;
  date: string;
  macharlu: number; // మచ్చర్లు (earnings)
  karchulu: number; // కర్చులు (expenses)
  notes?: string;
  createdAt: Date;
}

export interface User {
  id: string;
  username: string;
  role: 'admin' | 'user';
}

export interface EmployeeSummary {
  employee: Employee;
  totalMacharlu: number;
  totalKarchulu: number;
  netBalance: number;
  lastEntry?: DailyRecord;
}

export interface DateRange {
  startDate: string;
  endDate: string;
}

export type Language = 'te' | 'en';