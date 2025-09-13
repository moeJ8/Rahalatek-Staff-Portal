import React, { useEffect, useRef } from 'react';
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

export default function ProfitChart({ monthlyProfitData, isDarkMode, selectedCurrency = 'USD' }) {
    const chartRef = useRef();

    // Check if mobile screen (needs to be declared first)
    const isMobile = window.innerWidth < 640;
    
    // Process data for chart based on selected currency
    const originalLabels = monthlyProfitData?.map(data => data.month) || [];
    const labels = isMobile 
        ? originalLabels.map(month => month.substring(0, 3))
        : originalLabels;
    const profitData = monthlyProfitData?.map(data => {
        const currencyData = data.currencies?.[selectedCurrency];
        return currencyData ? currencyData.profit : 0;
    }) || [];

    // Get currency symbol
    const getCurrencySymbol = (currency) => {
        const symbols = { USD: '$', EUR: '€', TRY: '₺', GBP: '£' };
        return symbols[currency] || currency + ' ';
    };
    
    // Define colors based on theme
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

    const chartData = {
        labels,
        datasets: [
            {
                label: 'Monthly Profit',
                data: profitData,
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
        layout: {
            padding: {
                top: isMobile ? 10 : 20,
                bottom: isMobile ? 10 : 20,
                left: isMobile ? 10 : 20,
                right: isMobile ? 10 : 20
            }
        },
        interaction: {
            intersect: false,
            mode: 'index'
        },
        plugins: {
            legend: {
                display: false // Hide legend as we have a custom title
            },
            tooltip: {
                backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                titleColor: isDarkMode ? '#f1f5f9' : '#1f2937',
                bodyColor: isDarkMode ? '#cbd5e1' : '#6b7280',
                borderColor: isDarkMode ? '#475569' : '#e5e7eb',
                borderWidth: 1,
                cornerRadius: 8,
                padding: isMobile ? 8 : 12,
                displayColors: false,
                titleFont: {
                    size: isMobile ? 12 : 14
                },
                bodyFont: {
                    size: isMobile ? 11 : 12
                },
                callbacks: {
                    title: function(context) {
                        const dataIndex = context[0].dataIndex;
                        const monthData = monthlyProfitData[dataIndex];
                        return `${monthData.month} ${monthData.year} (${selectedCurrency})`;
                    },
                    label: function(context) {
                        const value = context.parsed.y;
                        const dataIndex = context.dataIndex;
                        const monthData = monthlyProfitData[dataIndex];
                        const currencyData = monthData.currencies?.[selectedCurrency];
                        const symbol = getCurrencySymbol(selectedCurrency);
                        
                        if (!currencyData) {
                            return [`Profit: ${symbol}0`, 'No data for this month'];
                        }
                        
                        return [
                            `Profit: ${symbol}${value.toLocaleString()}`,
                            `Revenue: ${symbol}${currencyData.clientRevenue.toLocaleString()}`,
                            `Costs: ${symbol}${currencyData.supplierCosts.toLocaleString()}`,
                            `Margin: ${currencyData.profitMargin.toFixed(1)}%`,
                            `Vouchers: ${currencyData.voucherCount}`
                        ];
                    }
                }
            }
        },
        scales: {
            x: {
                grid: {
                    color: colors.grid,
                    drawBorder: false
                },
                ticks: {
                    color: colors.text,
                    font: {
                        size: isMobile ? 10 : 12,
                        weight: '500'
                    },
                    maxRotation: 0,
                    minRotation: 0,
                    maxTicksLimit: isMobile ? 4 : 12
                }
            },
            y: {
                grid: {
                    color: colors.grid,
                    drawBorder: false
                },
                ticks: {
                    color: colors.text,
                    font: {
                        size: isMobile ? 10 : 12
                    },
                    maxTicksLimit: isMobile ? 5 : 8,
                    callback: function(value) {
                        if (isMobile && value >= 1000) {
                            // Format large numbers for mobile (e.g., $25K instead of $25,000)
                            if (value >= 1000000) {
                                return getCurrencySymbol(selectedCurrency) + (value / 1000000).toFixed(1) + 'M';
                            } else {
                                return getCurrencySymbol(selectedCurrency) + (value / 1000).toFixed(0) + 'K';
                            }
                        }
                        return getCurrencySymbol(selectedCurrency) + value.toLocaleString();
                    }
                },
                beginAtZero: true
            }
        },
        elements: {
            point: {
                radius: isMobile ? 4 : 6,
                hoverRadius: isMobile ? 6 : 8,
                borderWidth: isMobile ? 2 : 3,
                hoverBorderWidth: isMobile ? 3 : 4
            },
            line: {
                borderWidth: isMobile ? 2 : 3,
                tension: 0.4
            }
        },
        animation: {
            duration: 1000,
            easing: 'easeInOutCubic'
        }
    };

    // Update chart colors when theme changes
    useEffect(() => {
        if (chartRef.current) {
            const chart = chartRef.current;
            const newColors = isDarkMode ? chartColors.dark : chartColors.light;
            
            // Update dataset colors
            chart.data.datasets[0].borderColor = newColors.line;
            chart.data.datasets[0].backgroundColor = newColors.fill;
            chart.data.datasets[0].pointBackgroundColor = newColors.line;
            chart.data.datasets[0].pointHoverBackgroundColor = newColors.line;
            
            // Update scale colors
            chart.options.scales.x.grid.color = newColors.grid;
            chart.options.scales.x.ticks.color = newColors.text;
            chart.options.scales.y.grid.color = newColors.grid;
            chart.options.scales.y.ticks.color = newColors.text;
            
            chart.update('none');
        }
    }, [isDarkMode]);

    return (
        <div className="h-full w-full relative">
            <Line 
                ref={chartRef}
                data={chartData} 
                options={options}
            />
        </div>
    );
}
