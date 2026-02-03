"use client";
import { TrendingUp, TrendingDown } from 'lucide-react';

type Variant = 'success' | 'warning' | 'info';

type Props = {
    title: string;
    value: string;
    subtitle: string;
    trend?: {
        direction: 'up' | 'down';
        percentage: string;
    };
    variant: Variant;
};

const variantClasses: Record<Variant, string> = {
    success: 'kpi-success',
    warning: 'kpi-warning',
    info: 'kpi-info',
};

export function KPICard({ title, value, subtitle, trend, variant }: Props) {
    return (
        <div className={`kpi-card ${variantClasses[variant]}`}>
            <div className="kpi-header">
                <span className="kpi-title">{title}</span>
                {trend && (
                    <span className={`kpi-trend ${trend.direction}`}>
                        {trend.direction === 'up' ? (
                            <TrendingUp size={14} />
                        ) : (
                            <TrendingDown size={14} />
                        )}
                        {trend.percentage}
                    </span>
                )}
            </div>
            <div className="kpi-value">{value}</div>
            <div className="kpi-subtitle">{subtitle}</div>
        </div>
    );
}
