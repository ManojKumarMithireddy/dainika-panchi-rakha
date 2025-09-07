import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { employeeApi } from '@/services/api';
import { Employee } from '@/types';
import { Plus, Search, Edit, UserCheck, UserX } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function EmployeesPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    employeeId: '',
    contact: '',
  });

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    // Filter employees based on search term
    const filtered = employees.filter(
      (employee) =>
        employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (employee.contact && employee.contact.includes(searchTerm))
    );
    setFilteredEmployees(filtered);
  }, [employees, searchTerm]);

  const loadEmployees = async () => {
    try {
      setIsLoading(true);
      const data = await employeeApi.getAll();
      setEmployees(data);
    } catch (error) {
      toast({
        title: t('common.error'),
        description: 'Failed to load employees',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingEmployee) {
        await employeeApi.update(editingEmployee.id, formData);
        toast({
          title: t('common.success'),
          description: 'Employee updated successfully',
        });
      } else {
        await employeeApi.create({
          ...formData,
          isActive: true,
        });
        toast({
          title: t('common.success'),
          description: 'Employee added successfully',
        });
      }

      setIsDialogOpen(false);
      setEditingEmployee(null);
      setFormData({ name: '', employeeId: '', contact: '' });
      loadEmployees();
    } catch (error) {
      toast({
        title: t('common.error'),
        description: 'Failed to save employee',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      name: employee.name,
      employeeId: employee.employeeId,
      contact: employee.contact || '',
    });
    setIsDialogOpen(true);
  };

  const handleToggleStatus = async (employee: Employee) => {
    try {
      if (employee.isActive) {
        await employeeApi.deactivate(employee.id);
        toast({
          title: t('common.success'),
          description: 'Employee deactivated',
        });
      } else {
        await employeeApi.activate(employee.id);
        toast({
          title: t('common.success'),
          description: 'Employee activated',
        });
      }
      loadEmployees();
    } catch (error) {
      toast({
        title: t('common.error'),
        description: 'Failed to update employee status',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({ name: '', employeeId: '', contact: '' });
    setEditingEmployee(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading employees...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight telugu-text">
            {t('employees.title')}
          </h1>
          <p className="text-muted-foreground">
            Manage your employees and their details
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="btn-gradient">
              <Plus className="h-4 w-4 mr-2" />
              {t('employees.addNew')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="telugu-text">
                {editingEmployee ? t('employees.edit') : t('employees.addNew')}
              </DialogTitle>
              <DialogDescription>
                {editingEmployee ? 'Update employee information' : 'Add a new employee to the system'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="telugu-text">
                  {t('employees.name')} *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="రాజేష్ కుమార్"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="employeeId" className="telugu-text">
                  {t('employees.id')} *
                </Label>
                <Input
                  id="employeeId"
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  placeholder="EMP001"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact" className="telugu-text">
                  {t('employees.contact')}
                </Label>
                <Input
                  id="contact"
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  placeholder="9876543210"
                  type="tel"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="btn-gradient flex-1">
                  {editingEmployee ? 'Update' : 'Add'} Employee
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  {t('records.cancel')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('common.search') + ' employees...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Employees List */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="telugu-text">
            All Employees ({filteredEmployees.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredEmployees.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No employees found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEmployees.map((employee) => (
                <div
                  key={employee.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary to-primary-hover flex items-center justify-center text-primary-foreground font-semibold">
                      {employee.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold telugu-text">{employee.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {employee.employeeId}
                        {employee.contact && ` • ${employee.contact}`}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge variant={employee.isActive ? 'default' : 'secondary'}>
                      {employee.isActive ? t('employees.active') : t('employees.inactive')}
                    </Badge>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(employee)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant={employee.isActive ? 'destructive' : 'default'}
                      size="sm"
                      onClick={() => handleToggleStatus(employee)}
                    >
                      {employee.isActive ? (
                        <UserX className="h-4 w-4" />
                      ) : (
                        <UserCheck className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}