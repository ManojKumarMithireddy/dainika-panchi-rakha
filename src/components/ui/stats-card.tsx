import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  variant?: 'default' | 'success' | 'warning' | 'destructive';
  subtitle?: string;
}

export function StatsCard({ title, value, icon: Icon, variant = 'default', subtitle }: StatsCardProps) {
  const variantStyles = {
    default: 'bg-gradient-to-br from-white to-slate-50 border-border',
    success: 'bg-gradient-to-br from-success-light to-green-50 border-success/20',
    warning: 'bg-gradient-to-br from-warning-light to-orange-50 border-warning/20',
    destructive: 'bg-gradient-to-br from-red-50 to-red-100 border-red-200',
  };

  const iconStyles = {
    default: 'text-primary',
    success: 'text-success',
    warning: 'text-warning',
    destructive: 'text-destructive',
  };

  return (
    <Card className={`${variantStyles[variant]} shadow-card animate-fade-in`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground telugu-text">
          {title}
        </CardTitle>
        <Icon className={`h-4 w-4 ${iconStyles[variant]}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1 telugu-text">
            {subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  );
}