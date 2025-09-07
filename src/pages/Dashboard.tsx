import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatsCard } from '@/components/ui/stats-card';
import { useLanguage } from '@/contexts/LanguageContext';
import { employeeApi, recordsApi, calculateEmployeeSummary } from '@/services/api';
import { Employee, EmployeeSummary } from '@/types';
import { Users, TrendingUp, TrendingDown, DollarSign, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Dashboard() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeSummaries, setEmployeeSummaries] = useState<EmployeeSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Quick add form state
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [macharlu, setMacharlu] = useState('');
  const [karchulu, setKarchulu] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const employeesData = await employeeApi.getAll();
      setEmployees(employeesData);

      // Calculate summaries for each employee
      const summaries: EmployeeSummary[] = [];
      for (const employee of employeesData) {
        const summary = await calculateEmployeeSummary(employee.id);
        summaries.push({
          employee,
          ...summary,
        });
      }
      setEmployeeSummaries(summaries);
    } catch (error) {
      toast({
        title: t('common.error'),
        description: 'Failed to load dashboard data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployeeId || !macharlu || !karchulu) return;

    try {
      setIsSubmitting(true);
      await recordsApi.create({
        employeeId: selectedEmployeeId,
        date,
        macharlu: parseFloat(macharlu),
        karchulu: parseFloat(karchulu),
        notes,
      });

      toast({
        title: t('common.success'),
        description: 'Record added successfully',
      });

      // Reset form
      setSelectedEmployeeId('');
      setMacharlu('');
      setKarchulu('');
      setNotes('');
      
      // Reload data
      loadDashboardData();
    } catch (error) {
      toast({
        title: t('common.error'),
        description: 'Failed to add record',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalStats = employeeSummaries.reduce(
    (acc, summary) => ({
      totalEmployees: acc.totalEmployees + 1,
      activeEmployees: acc.activeEmployees + (summary.employee.isActive ? 1 : 0),
      totalMacharlu: acc.totalMacharlu + summary.totalMacharlu,
      totalKarchulu: acc.totalKarchulu + summary.totalKarchulu,
    }),
    { totalEmployees: 0, activeEmployees: 0, totalMacharlu: 0, totalKarchulu: 0 }
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight telugu-text">
          {t('dashboard.title')}
        </h1>
        <p className="text-muted-foreground">
          Overview of your wage management system
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title={t('dashboard.totalEmployees')}
          value={totalStats.totalEmployees}
          icon={Users}
          variant="default"
        />
        <StatsCard
          title={t('dashboard.activeEmployees')}
          value={totalStats.activeEmployees}
          icon={Users}
          variant="success"
        />
        <StatsCard
          title={t('dashboard.totalEarnings')}
          value={`₹${totalStats.totalMacharlu.toLocaleString()}`}
          icon={TrendingUp}
          variant="success"
        />
        <StatsCard
          title={t('dashboard.totalExpenses')}
          value={`₹${totalStats.totalKarchulu.toLocaleString()}`}
          icon={TrendingDown}
          variant="warning"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick Add Form */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 telugu-text">
              <Plus className="h-5 w-5" />
              {t('dashboard.quickAdd')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleQuickAdd} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="employee" className="telugu-text">
                  {t('employees.name')}
                </Label>
                <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
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
                  {t('records.date')}
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="macharlu" className="telugu-text">
                    {t('records.macharlu')} (₹)
                  </Label>
                  <Input
                    id="macharlu"
                    type="number"
                    value={macharlu}
                    onChange={(e) => setMacharlu(e.target.value)}
                    placeholder="800"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="karchulu" className="telugu-text">
                    {t('records.karchulu')} (₹)
                  </Label>
                  <Input
                    id="karchulu"
                    type="number"
                    value={karchulu}
                    onChange={(e) => setKarchulu(e.target.value)}
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
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="ఓవర్ టైం పని"
                />
              </div>

              <Button
                type="submit"
                className="w-full btn-gradient"
                disabled={isSubmitting || !selectedEmployeeId}
              >
                {isSubmitting ? 'Adding...' : t('records.save')}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Employee Summary */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="telugu-text">Recent Employee Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {employeeSummaries
                .filter(summary => summary.employee.isActive)
                .slice(0, 5)
                .map((summary) => (
                  <div
                    key={summary.employee.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div>
                      <p className="font-medium telugu-text">{summary.employee.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {summary.employee.employeeId}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-success">
                        ₹{summary.netBalance.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Net Balance
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}