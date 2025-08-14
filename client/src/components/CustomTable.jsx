import React from 'react';
import { Table } from 'flowbite-react';

const CustomTable = ({ 
    headers = [], 
    data = [], 
    renderRow, 
    striped = true,
    className = "",
    emptyMessage = "No data available",
    emptyIcon: EmptyIcon = null
}) => {
    const customTheme = {
        root: {
            base: "w-full text-left text-sm text-gray-500 dark:text-gray-400",
            shadow: "absolute bg-white dark:bg-slate-900 w-full h-full top-0 left-0 rounded-lg drop-shadow-md -z-10",
            wrapper: "relative"
        },
        body: {
            base: "group/tbody",
            cell: {
                base: "px-6 py-4 group-first/tbody:group-first/tr:first:rounded-tl-lg group-first/tbody:group-first/tr:last:rounded-tr-lg group-last/tbody:group-last/tr:first:rounded-bl-lg group-last/tbody:group-last/tr:last:rounded-br-lg"
            }
        },
        head: {
            base: "group/thead",
            cell: {
                base: "bg-gray-50 dark:bg-slate-900 border-b dark:border-slate-700 px-6 py-3 group-first/thead:first:rounded-tl-lg group-first/thead:last:rounded-tr-lg text-xs font-medium uppercase tracking-wider text-left text-gray-500 dark:text-gray-400"
            }
        },
        row: {
            base: "group/tr",
            hovered: "hover:bg-gray-50 dark:hover:bg-slate-700",
            striped: "odd:bg-white even:bg-gray-50 odd:dark:bg-slate-800 even:dark:bg-slate-900"
        }
    };

    return (
        <>
            <style>{`
                .custom-table-scrollbar::-webkit-scrollbar {
                    width: 8px;
                    height: 8px;
                }
                
                /* Light mode scrollbar */
                .custom-table-scrollbar::-webkit-scrollbar-track {
                    background: #f1f5f9;
                }
                
                .custom-table-scrollbar::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 4px;
                }
                
                .custom-table-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }
                
                /* Dark mode scrollbar */
                .dark .custom-table-scrollbar::-webkit-scrollbar-track {
                    background: #1e293b;
                }
                
                .dark .custom-table-scrollbar::-webkit-scrollbar-thumb {
                    background: #475569;
                    border-radius: 4px;
                }
                
                .dark .custom-table-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #64748b;
                }
            `}</style>
            <div className={`overflow-auto custom-table-scrollbar ${className}`} style={{ maxHeight: '70vh' }}>
                <Table 
                    striped={striped}
                    theme={customTheme}
                >
                {headers.length > 0 && (
                    <Table.Head className="text-gray-900 dark:text-white bg-gray-50 dark:bg-slate-900 border-b dark:border-slate-700">
                        {headers.map((header, index) => (
                            <Table.HeadCell 
                                key={index} 
                                className={`text-sm font-semibold px-4 py-3 ${header.className || ''}`}
                            >
                                {header.label || header}
                            </Table.HeadCell>
                        ))}
                    </Table.Head>
                )}
                
                <Table.Body>
                    {data.length > 0 ? (
                        data.map((item, index) => (
                            <Table.Row 
                                key={item.id || item._id || index} 
                                className="group bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700"
                            >
                                {renderRow ? renderRow(item, index) : (
                                    <Table.Cell className="px-4 py-3">
                                        No render function provided
                                    </Table.Cell>
                                )}
                            </Table.Row>
                        ))
                    ) : (
                        <Table.Row>
                            <Table.Cell colSpan={headers.length || 1} className="text-center py-8 text-gray-500 dark:text-gray-400">
                                {EmptyIcon && (
                                    <EmptyIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                )}
                                <p className="text-lg font-medium">{emptyMessage}</p>
                            </Table.Cell>
                        </Table.Row>
                    )}
                </Table.Body>
            </Table>
            </div>
        </>
    );
};

export default CustomTable; 