import React, { useState } from 'react';
import { Archive, Plus, Trash2, Printer, Save, CheckCircle2, ArrowLeft, Eye, X } from 'lucide-react';
import { DakhilaPratibedanEntry, DakhilaItem, User, StockEntryRequest, OrganizationSettings } from '../types';

// Added missing onRejectStockEntry property to fix type mismatch error in Dashboard.tsx
interface DakhilaPratibedanProps {
    dakhilaReports: DakhilaPratibedanEntry[];
    onSaveDakhilaReport: (report: DakhilaPratibedanEntry) => void;
    currentFiscalYear: string;
    currentUser: User;
    stockEntryRequests?: StockEntryRequest[];
    onApproveStockEntry?: (requestId: string, approverName: string) => void;
    onRejectStockEntry?: (requestId: string, reason: string, approverName: string) => void;
    generalSettings: OrganizationSettings;
}

export const DakhilaPratibedan: React.FC<DakhilaPratibedanProps> = ({ 
    dakhilaReports, onSaveDakhilaReport, currentFiscalYear, currentUser, generalSettings 
}) => {
    const [selectedReport, setSelectedReport] = useState<DakhilaPratibedanEntry | null>(null);
    const [items, setItems] = useState<DakhilaItem[]>([]);

    const handleLoadReport = (report: DakhilaPratibedanEntry) => {
        setSelectedReport(report);
        setItems(report.items || []);
    };

    return (
        <div className="space-y-6">
            {!selectedReport ? (
                <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
                    <div className="p-4 bg-slate-50 border-b font-bold font-nepali">दाखिला इतिहास (Entry History)</div>
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="p-3 border-b">दाखिला नं</th>
                                <th className="p-3 border-b">मिति</th>
                                <th className="p-3 border-b text-right">कार्य</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dakhilaReports.map(r => (
                                <tr key={r.id} className="hover:bg-slate-50">
                                    <td className="p-3 border-b font-mono">{r.dakhilaNo}</td>
                                    <td className="p-3 border-b">{r.date}</td>
                                    <td className="p-3 border-b text-right">
                                        <button onClick={() => handleLoadReport(r)} className="text-primary-600 font-bold hover:underline">View Report</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                    <div className="flex justify-between items-center bg-white p-4 rounded-xl border no-print">
                        <button onClick={() => setSelectedReport(null)} className="flex items-center gap-2 text-slate-600"><ArrowLeft size={20}/> List</button>
                        <button onClick={() => window.print()} className="px-4 py-2 bg-slate-800 text-white rounded-lg flex items-center gap-2"><Printer size={18}/> Print</button>
                    </div>

                    <div className="bg-white p-8 rounded-xl shadow-lg max-w-[210mm] mx-auto min-h-[297mm] font-nepali text-sm">
                        <div className="text-right font-bold text-xs mb-4">म.ले.प.फारम नं: ४०३</div>
                        <div className="text-center mb-8">
                            <h1 className="text-xl font-bold text-red-600">{generalSettings.orgNameNepali}</h1>
                            <h2 className="text-lg font-bold underline">दाखिला प्रतिवेदन फाराम</h2>
                        </div>
                        
                        <div className="flex justify-between mb-4">
                            <div>दाखिला नं: <span className="font-bold">{selectedReport.dakhilaNo}</span></div>
                            <div>मिति: {selectedReport.date}</div>
                        </div>

                        <table className="w-full border-collapse border border-slate-900 text-center">
                            <thead>
                                <tr className="bg-slate-50">
                                    <th className="border border-slate-900 p-1">क्र.सं.</th>
                                    <th className="border border-slate-900 p-1">सामानको नाम</th>
                                    <th className="border border-slate-900 p-1">एकाई</th>
                                    <th className="border border-slate-900 p-1">परिमाण</th>
                                    <th className="border border-slate-900 p-1">दर</th>
                                    <th className="border border-slate-900 p-1">जम्मा मूल्य</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item, idx) => (
                                    <tr key={idx}>
                                        <td className="border border-slate-900 p-1">{idx+1}</td>
                                        <td className="border border-slate-900 p-1 text-left px-2">{item.name}</td>
                                        <td className="border border-slate-900 p-1">{item.unit}</td>
                                        <td className="border border-slate-900 p-1 font-bold">{item.quantity}</td>
                                        <td className="border border-slate-900 p-1 text-right">{item.rate}</td>
                                        <td className="border border-slate-900 p-1 text-right">{item.totalAmount}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div className="grid grid-cols-2 gap-20 mt-20">
                            <div className="text-center">
                                <div className="border-t border-slate-800 pt-2 font-bold">फाँटवाला (Storekeeper)</div>
                            </div>
                            <div className="text-center">
                                <div className="border-t border-slate-800 pt-2 font-bold">कार्यालय प्रमुख (In-charge)</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};