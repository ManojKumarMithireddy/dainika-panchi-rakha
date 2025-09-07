import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { employeeApi, recordsApi } from '@/services/api';
import { Employee, DailyRecord } from '@/types';
import { Plus, Calendar, TrendingUp, TrendingDown, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function RecordsPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [records, setRecords] = useState<DailyRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<DailyRecord[]>([]);
  const [selectedEmployeeFilter, setSelectedEmployeeFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<DailyRecord | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    employeeId: '',
    date: new Date().toISOString().split('T')[0],
    macharlu: '',
    karchulu: '',
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [records, selectedEmployeeFilter, dateFilter]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [employeesData, recordsData] = await Promise.all([
        employeeApi.getAll(),
        recordsApi.getAll(),
      ]);
      setEmployees(employeesData);
      setRecords(recordsData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch (error) {
      toast({
        title: t('common.error'),
        description: 'Failed to load data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...records];

    if (selectedEmployeeFilter !== 'all') {
      filtered = filtered.filter(record => record.employeeId === selectedEmployeeFilter);
    }

    if (dateFilter) {
      filtered = filtered.filter(record => record.date === dateFilter);
    }

    setFilteredRecords(filtered);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const recordData = {
        employeeId: formData.employeeId,
        date: formData.date,
        macharlu: parseFloat(formData.macharlu),
        karchulu: parseFloat(formData.karchulu),
        notes: formData.notes,
      };

      if (editingRecord) {
        await recordsApi.update(editingRecord.id, recordData);
        toast({
          title: t('common.success'),
          description: 'Record updated successfully',
        });
      } else {
        await recordsApi.create(recordData);
        toast({
          title: t('common.success'),
          description: 'Record added successfully',
        });
      }

      setIsDialogOpen(false);
      setEditingRecord(null);
      resetForm();
      loadData();
    } catch (error) {
      toast({
        title: t('common.error'),
        description: 'Failed to save record',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (record: DailyRecord) => {
    setEditingRecord(record);
    setFormData({
      employeeId: record.employeeId,
      date: record.date,
      macharlu: record.macharlu.toString(),
      karchulu: record.karchulu.toString(),
      notes: record.notes || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (record: DailyRecord) => {
    if (!confirm('Are you sure you want to delete this record?')) return;

    try {
      await recordsApi.delete(record.id);
      toast({
        title: t('common.success'),
        description: 'Record deleted successfully',
      });
      loadData();
    } catch (error) {
      toast({
        title: t('common.error'),
        description: 'Failed to delete record',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      employeeId: '',
      date: new Date().toISOString().split('T')[0],
      macharlu: '',
      karchulu: '',
      notes: '',
    });
    setEditingRecord(null);
  };

  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? employee.name : 'Unknown';
  };

  const getEmployeeId = (employeeId: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? employee.employeeId : '';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight telugu-text">
            {t('records.title')}
          </h1>
          <p className="text-muted-foreground">
            Manage daily wage records for all employees
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="btn-gradient">
              <Plus className="h-4 w-4 mr-2" />
              {t('records.addEntry')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="telugu-text">
                {editingRecord ? 'Edit Record' : t('records.addEntry')}
              </DialogTitle>
              <DialogDescription>
                {editingRecord ? 'Update the daily wage record' : 'Add a new daily wage record'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="employee" className="telugu-text">
                  {t('employees.name')} *
                </Label>
                <Select value={formData.employeeId} onValueChange={(value) => setFormData({ ...formData, employeeId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees
                      .filter(emp => emp.isActive)
                      .map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.name} ({employee.employeeId})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date" className="telugu-text">
                  {t('records.date')} *
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="macharlu" className="telugu-text">
                    {t('records.macharlu')} (₹) *
                  </Label>
                  <Input
                    id="macharlu"
                    type="number"
                    value={formData.macharlu}
                    onChange={(e) => setFormData({ ...formData, macharlu: e.target.value })}
                    placeholder="800"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="karchulu" className="telugu-text">
                    {t('records.karchulu')} (₹) *
                  </Label>
                  <Input
                    id="karchulu"
                    type="number"
                    value={formData.karchulu}
                    onChange={(e) => setFormData({ ...formData, karchulu: e.target.value })}
                    placeholder="150"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="telugu-text">
                  {t('records.notes')}
                </Label>
                <Input
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="ఓవర్ టైం పని"
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="btn-gradient flex-1">
                  {editingRecord ? 'Update' : 'Add'} Record
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

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label className="telugu-text">Filter by Employee</Label>
              <Select value={selectedEmployeeFilter} onValueChange={setSelectedEmployeeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Employees</SelectItem>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name} ({employee.employeeId})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="telugu-text">Filter by Date</Label>
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedEmployeeFilter('all');
                  setDateFilter('');
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Records List */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="telugu-text">
            Daily Records ({filteredRecords.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredRecords.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No records found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRecords.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary to-primary-hover flex items-center justify-center text-primary-foreground">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold telugu-text">
                        {getEmployeeName(record.employeeId)}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {getEmployeeId(record.employeeId)} • {new Date(record.date).toLocaleDateString()}
                      </p>
                      {record.notes && (
                        <p className="text-sm text-muted-foreground mt-1 telugu-text">
                          {record.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right space-y-1">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-4 w-4 text-success" />
                        <span className="text-success font-medium">
                          ₹{record.macharlu.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <TrendingDown className="h-4 w-4 text-warning" />
                        <span className="text-warning font-medium">
                          ₹{record.karchulu.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-1">
                      <Badge variant={record.macharlu > record.karchulu ? 'default' : 'secondary'}>
                        Net: ₹{(record.macharlu - record.karchulu).toLocaleString()}
                      </Badge>
                    </div>
                    
                    <div className="flex space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(record)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(record)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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