import { Employee, DailyRecord } from '@/types';

// Mock data storage - replace with your MongoDB API calls
let mockEmployees: Employee[] = [
  {
    id: '1',
    name: 'రాజేష్ కుమార్',
    employeeId: 'EMP001',
    contact: '9876543210',
    isActive: true,
    createdAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    name: 'సీతా దేవి',
    employeeId: 'EMP002',
    contact: '9876543211',
    isActive: true,
    createdAt: new Date('2024-01-02'),
  },
];

let mockRecords: DailyRecord[] = [
  {
    id: '1',
    employeeId: '1',
    date: '2024-09-06',
    macharlu: 800,
    karchulu: 150,
    notes: 'రెగ్యులర్ పని',
    createdAt: new Date('2024-09-06'),
  },
  {
    id: '2',
    employeeId: '1',
    date: '2024-09-07',
    macharlu: 900,
    karchulu: 200,
    notes: 'ఓవర్ టైం',
    createdAt: new Date('2024-09-07'),
  },
  {
    id: '3',
    employeeId: '2',
    date: '2024-09-06',
    macharlu: 750,
    karchulu: 100,
    notes: 'రెగ్యులర్ పని',
    createdAt: new Date('2024-09-06'),
  },
];

// Employee API functions
export const employeeApi = {
  // Get all employees
  getAll: async (): Promise<Employee[]> => {
    // TODO: Replace with actual API call
    // const response = await fetch('/api/employees');
    // return response.json();
    
    const saved = localStorage.getItem('employees');
    if (saved) {
      mockEmployees = JSON.parse(saved);
    }
    return Promise.resolve(mockEmployees);
  },

  // Get employee by ID
  getById: async (id: string): Promise<Employee | null> => {
    const employees = await employeeApi.getAll();
    return employees.find(emp => emp.id === id) || null;
  },

  // Create new employee
  create: async (employeeData: Omit<Employee, 'id' | 'createdAt'>): Promise<Employee> => {
    // TODO: Replace with actual API call
    // const response = await fetch('/api/employees', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(employeeData)
    // });
    // return response.json();
    
    const newEmployee: Employee = {
      ...employeeData,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    
    mockEmployees.push(newEmployee);
    localStorage.setItem('employees', JSON.stringify(mockEmployees));
    return Promise.resolve(newEmployee);
  },

  // Update employee
  update: async (id: string, employeeData: Partial<Employee>): Promise<Employee> => {
    const employees = await employeeApi.getAll();
    const index = employees.findIndex(emp => emp.id === id);
    if (index === -1) throw new Error('Employee not found');
    
    mockEmployees[index] = { ...mockEmployees[index], ...employeeData };
    localStorage.setItem('employees', JSON.stringify(mockEmployees));
    return Promise.resolve(mockEmployees[index]);
  },

  // Deactivate employee
  deactivate: async (id: string): Promise<Employee> => {
    return employeeApi.update(id, { isActive: false });
  },

  // Activate employee
  activate: async (id: string): Promise<Employee> => {
    return employeeApi.update(id, { isActive: true });
  },
};

// Daily Records API functions
export const recordsApi = {
  // Get all records
  getAll: async (): Promise<DailyRecord[]> => {
    const saved = localStorage.getItem('records');
    if (saved) {
      mockRecords = JSON.parse(saved);
    }
    return Promise.resolve(mockRecords);
  },

  // Get records by employee ID
  getByEmployeeId: async (employeeId: string): Promise<DailyRecord[]> => {
    const records = await recordsApi.getAll();
    return records.filter(record => record.employeeId === employeeId);
  },

  // Get records by date range
  getByDateRange: async (startDate: string, endDate: string): Promise<DailyRecord[]> => {
    const records = await recordsApi.getAll();
    return records.filter(record => record.date >= startDate && record.date <= endDate);
  },

  // Create new record
  create: async (recordData: Omit<DailyRecord, 'id' | 'createdAt'>): Promise<DailyRecord> => {
    const newRecord: DailyRecord = {
      ...recordData,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    
    mockRecords.push(newRecord);
    localStorage.setItem('records', JSON.stringify(mockRecords));
    return Promise.resolve(newRecord);
  },

  // Update record
  update: async (id: string, recordData: Partial<DailyRecord>): Promise<DailyRecord> => {
    const records = await recordsApi.getAll();
    const index = records.findIndex(record => record.id === id);
    if (index === -1) throw new Error('Record not found');
    
    mockRecords[index] = { ...mockRecords[index], ...recordData };
    localStorage.setItem('records', JSON.stringify(mockRecords));
    return Promise.resolve(mockRecords[index]);
  },

  // Delete record
  delete: async (id: string): Promise<void> => {
    const records = await recordsApi.getAll();
    mockRecords = records.filter(record => record.id !== id);
    localStorage.setItem('records', JSON.stringify(mockRecords));
    return Promise.resolve();
  },
};

// Calculate employee summary
export const calculateEmployeeSummary = async (employeeId: string, startDate?: string, endDate?: string) => {
  let records = await recordsApi.getByEmployeeId(employeeId);
  
  if (startDate && endDate) {
    records = records.filter(record => record.date >= startDate && record.date <= endDate);
  }
  
  const totalMacharlu = records.reduce((sum, record) => sum + record.macharlu, 0);
  const totalKarchulu = records.reduce((sum, record) => sum + record.karchulu, 0);
  const netBalance = totalMacharlu - totalKarchulu;
  
  return {
    totalMacharlu,
    totalKarchulu,
    netBalance,
    recordsCount: records.length,
  };
};