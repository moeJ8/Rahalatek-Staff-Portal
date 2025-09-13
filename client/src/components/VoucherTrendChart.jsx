import React, { useRef } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export default function VoucherTrendChart({ monthlyTrends, isDarkMode }) {
    const chartRef = useRef();

    // Process data for chart
    const labels = monthlyTrends?.map(data => data.month) || [];
    const voucherData = monthlyTrends?.map(data => data.vouchers || 0) || [];

    // Define colors based on theme (same as Financial Overview)
    const chartColors = {
        light: {
            line: '#3b82f6', // Blue
            fill: 'rgba(59, 130, 246, 0.1)',
            grid: '#e5e7eb',
            text: '#374151'
        },
        dark: {
            line: '#14b8a6', // Teal
            fill: 'rgba(20, 184, 166, 0.1)',
            grid: '#374151',
            text: '#9ca3af'
        }
    };

    const colors = isDarkMode ? chartColors.dark : chartColors.light;

    const data = {
        labels,
        datasets: [
            {
                label: 'Vouchers Created',
                data: voucherData,
                borderColor: colors.line,
                backgroundColor: colors.fill,
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: colors.line,
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8,
                pointHoverBackgroundColor: colors.line,
                pointHoverBorderColor: '#ffffff',
                pointHoverBorderWidth: 3,
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                titleColor: isDarkMode ? '#f9fafb' : '#111827',
                bodyColor: isDarkMode ? '#d1d5db' : '#374151',
                borderColor: isDarkMode ? '#374151' : '#e5e7eb',
                borderWidth: 1,
                padding: 12,
                cornerRadius: 8,
                displayColors: false,
                callbacks: {
                    title: function(context) {
                        return context[0].label + ' ' + new Date().getFullYear();
                    },
                    label: function(context) {
                        const value = context.parsed.y;
                        return `${value} voucher${value !== 1 ? 's' : ''} created`;
                    }
                }
            }
        },
        scales: {
            x: {
                grid: {
                    color: colors.grid,
                    borderColor: colors.grid,
                },
                ticks: {
                    color: colors.text,
                    font: {
                        size: 11,
                        weight: '500'
                    }
                }
            },
            y: {
                beginAtZero: true,
                grid: {
                    color: colors.grid,
                    borderColor: colors.grid,
                },
                ticks: {
                    color: colors.text,
                    font: {
                        size: 11,
                        weight: '500'
                    },
                    callback: function(value) {
                        return Math.round(value);
                    }
                }
            }
        },
        elements: {
            point: {
                hoverBorderWidth: 3
            }
        }
    };

    return (
        <div className="w-full h-full">
            <Line 
                ref={chartRef}
                data={data} 
                options={options}
            />
        </div>
    );
}
