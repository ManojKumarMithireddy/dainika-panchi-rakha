import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { employeeApi, recordsApi, calculateEmployeeSummary } from '@/services/api';
import { Employee } from '@/types';
import { Download, FileText, TrendingUp, TrendingDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';

export default function ReportsPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadEmployees();
    // Set default date range (last 30 days)
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    setEndDate(today.toISOString().split('T')[0]);
    setStartDate(thirtyDaysAgo.toISOString().split('T')[0]);
  }, []);

  const loadEmployees = async () => {
    try {
      const data = await employeeApi.getAll();
      setEmployees(data);
    } catch (error) {
      toast({
        title: t('common.error'),
        description: 'Failed to load employees',
        variant: 'destructive',
      });
    }
  };

  const generateReport = async () => {
    if (!startDate || !endDate) {
      toast({
        title: t('common.error'),
        description: 'Please select date range',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsGenerating(true);
      const records = await recordsApi.getByDateRange(startDate, endDate);
      
      let employeesToProcess = employees;
      if (selectedEmployee !== 'all') {
        employeesToProcess = employees.filter(emp => emp.id === selectedEmployee);
      }

      const reportSummaries = [];
      for (const employee of employeesToProcess) {
        const summary = await calculateEmployeeSummary(employee.id, startDate, endDate);
        const employeeRecords = records.filter(r => r.employeeId === employee.id);
        
        reportSummaries.push({
          employee,
          ...summary,
          records: employeeRecords,
        });
      }

      setReportData({
        summaries: reportSummaries,
        dateRange: { startDate, endDate },
        totalMacharlu: reportSummaries.reduce((sum, s) => sum + s.totalMacharlu, 0),
        totalKarchulu: reportSummaries.reduce((sum, s) => sum + s.totalKarchulu, 0),
      });

      toast({
        title: t('common.success'),
        description: 'Report generated successfully',
      });
    } catch (error) {
      toast({
        title: t('common.error'),
        description: 'Failed to generate report',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadPDF = () => {
    if (!reportData) return;

    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Wage Report', 20, 30);
    
    doc.setFontSize(12);
    doc.text(`Period: ${startDate} to ${endDate}`, 20, 45);
    
    let yPos = 60;
    reportData.summaries.forEach((summary: any) => {
      doc.text(`${summary.employee.name} (${summary.employee.employeeId})`, 20, yPos);
      doc.text(`Earnings: ₹${summary.totalMacharlu}`, 20, yPos + 10);
      doc.text(`Expenses: ₹${summary.totalKarchulu}`, 20, yPos + 20);
      doc.text(`Net: ₹${summary.netBalance}`, 20, yPos + 30);
      yPos += 50;
    });

    doc.save(`wage-report-${startDate}-to-${endDate}.pdf`);
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight telugu-text">
          {t('reports.title')}
        </h1>
        <p className="text-muted-foreground">
          Generate detailed wage reports for analysis
        </p>
      </div>

      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="telugu-text">{t('reports.generate')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label className="telugu-text">Employee</Label>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('reports.allEmployees')}</SelectItem>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name} ({employee.employeeId})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="telugu-text">{t('reports.fromDate')}</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label className="telugu-text">{t('reports.toDate')}</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
          
          <Button
            onClick={generateReport}
            disabled={isGenerating}
            className="btn-gradient"
          >
            <FileText className="h-4 w-4 mr-2" />
            {isGenerating ? 'Generating...' : t('reports.generate')}
          </Button>
        </CardContent>
      </Card>

      {reportData && (
        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="telugu-text">Report Results</CardTitle>
            <Button onClick={downloadPDF} className="btn-success">
              <Download className="h-4 w-4 mr-2" />
              {t('reports.download')} PDF
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3 mb-6">
              <div className="text-center p-4 bg-success-light rounded-lg">
                <TrendingUp className="h-8 w-8 text-success mx-auto mb-2" />
                <div className="text-2xl font-bold text-success">
                  ₹{reportData.totalMacharlu.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Total Earnings</div>
              </div>
              <div className="text-center p-4 bg-warning-light rounded-lg">
                <TrendingDown className="h-8 w-8 text-warning mx-auto mb-2" />
                <div className="text-2xl font-bold text-warning">
                  ₹{reportData.totalKarchulu.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Total Expenses</div>
              </div>
              <div className="text-center p-4 bg-primary/10 rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  ₹{(reportData.totalMacharlu - reportData.totalKarchulu).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Net Balance</div>
              </div>
            </div>

            <div className="space-y-4">
              {reportData.summaries.map((summary: any) => (
                <div key={summary.employee.id} className="border rounded-lg p-4">
                  <h3 className="font-semibold telugu-text mb-2">
                    {summary.employee.name} ({summary.employee.employeeId})
                  </h3>
                  <div className="grid gap-2 md:grid-cols-4 text-sm">
                    <div>Records: {summary.recordsCount}</div>
                    <div className="text-success">Earnings: ₹{summary.totalMacharlu.toLocaleString()}</div>
                    <div className="text-warning">Expenses: ₹{summary.totalKarchulu.toLocaleString()}</div>
                    <div className="font-semibold">Net: ₹{summary.netBalance.toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}