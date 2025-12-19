
import React, { useState, useMemo } from 'react';
import { Archive, Plus, Trash2, Printer, Save, CheckCircle2, ArrowLeft, Eye, X, Clock, FileText, ClipboardCheck, AlertCircle, ShieldCheck, Send, Layers, ShieldCheck as ShieldIcon, Warehouse } from 'lucide-react';
import { DakhilaPratibedanEntry, DakhilaItem, User, StockEntryRequest, OrganizationSettings, Store, InventoryItem } from '../types';

interface DakhilaPratibedanProps {
    dakhilaReports: DakhilaPratibedanEntry[];
    onSaveDakhilaReport: (report: DakhilaPratibedanEntry) => void;
    currentFiscalYear: string;
    currentUser: User;
    stockEntryRequests: StockEntryRequest[];
    onApproveStockEntry: (requestId: string, approverName: string) => void;
    onRejectStockEntry: (requestId: string, reason: string, approverName: string) => void;
    generalSettings: OrganizationSettings;
    stores?: Store[];
}

export const DakhilaPratibedan: React.FC<DakhilaPratibedanProps> = ({ 
    dakhilaReports, 
    onSaveDakhilaReport, 
    currentFiscalYear, 
    currentUser, 
    stockEntryRequests,
    onApproveStockEntry,
    onRejectStockEntry,
    generalSettings,
    stores = []
}) => {
    const [selectedReport, setSelectedReport] = useState<DakhilaPratibedanEntry | null>(null);
    const [selectedRequest, setSelectedRequest] = useState<StockEntryRequest | null>(null);
    const [activeTab, setActiveTab] = useState<'Requests' | 'History'>('Requests');
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');

    const isAdmin = ['ADMIN', 'SUPER_ADMIN', 'APPROVAL'].includes(currentUser.role);

    // Filter ONLY Pending requests for the current fiscal year
    const pendingRequests = useMemo(() => 
        stockEntryRequests.filter(req => req.fiscalYear === currentFiscalYear && req.status === 'Pending')
            .sort((a, b) => b.id.localeCompare(a.id)),
    [stockEntryRequests, currentFiscalYear]);

    // Unified History: Formal Dakhila Reports (including bulk ones auto-archived in App.tsx)
    const filteredReports = useMemo(() => 
        dakhilaReports.filter(r => r.fiscalYear === currentFiscalYear)
            .sort((a, b) => b.dakhilaNo.localeCompare(a.dakhilaNo)),
    [dakhilaReports, currentFiscalYear]);

    const handleLoadReport = (report: DakhilaPratibedanEntry) => {
        setSelectedReport(report);
        setSelectedRequest(null);
    };

    const handleLoadRequest = (request: StockEntryRequest) => {
        setSelectedRequest(request);
        setSelectedReport(null);
    };

    const handleApprove = () => {
        if (!selectedRequest) return;
        if (window.confirm('के तपाइँ निश्चित हुनुहुन्छ कि तपाइँ यो दाखिला अनुरोध स्वीकृत गर्न चाहनुहुन्छ? (Are you sure you want to approve this dakhila request?)')) {
            onApproveStockEntry(selectedRequest.id, currentUser.fullName);
            setSelectedRequest(null);
            alert("अनुरोध स्वीकृत भयो र मौज्दात अपडेट गरियो। यो अब इतिहासमा सुरक्षित भएको छ। (Request approved and inventory updated. It is now saved in History.)");
        }
    };

    const handleRejectSubmit = () => {
        if (!selectedRequest || !rejectionReason.trim()) return;
        onRejectStockEntry(selectedRequest.id, rejectionReason, currentUser.fullName);
        setShowRejectModal(false);
        setSelectedRequest(null);
        alert("अनुरोध अस्वीकृत गरियो। (Request rejected.)");
    };

    const getStoreName = (id: string) => stores.find(s => s.id === id)?.name || 'Unknown Store';

    // List View
    if (!selectedReport && !selectedRequest) {
        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm no-print">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                            <Archive size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800 font-nepali">दाखिला प्रतिवेदन (Entry Report)</h2>
                            <p className="text-sm text-slate-500">स्टक प्रविष्टि अनुरोध र स्वीकृत प्रतिवेदनहरू</p>
                        </div>
                    </div>

                    <div className="flex bg-slate-100 p-1 rounded-lg">
                        <button 
                            onClick={() => setActiveTab('Requests')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'Requests' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <ClipboardCheck size={16} />
                            आएका अनुरोधहरू {pendingRequests.length > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{pendingRequests.length}</span>}
                        </button>
                        <button 
                            onClick={() => setActiveTab('History')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'History' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <FileText size={16} />
                            दाखिला इतिहास (History)
                        </button>
                    </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    {activeTab === 'Requests' ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-slate-600 font-medium">
                                    <tr>
                                        <th className="px-6 py-4">दाखिला मिति (Date)</th>
                                        <th className="px-6 py-4">दाखिला नं (Dakhila No)</th>
                                        <th className="px-6 py-4">स्टोर (Store)</th>
                                        <th className="px-6 py-4">स्रोत (Source)</th>
                                        <th className="px-6 py-4">निवेदक (Requester)</th>
                                        <th className="px-6 py-4 text-right">कार्य (Action)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {pendingRequests.length === 0 ? (
                                        <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic font-nepali">हाल कुनै नयाँ अनुरोध आएको छैन</td></tr>
                                    ) : (
                                        pendingRequests.map(req => (
                                            <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-4 font-nepali">{req.requestDateBs}</td>
                                                <td className="px-6 py-4 font-mono font-bold text-indigo-600">{req.items[0]?.dakhilaNo || '-'}</td>
                                                <td className="px-6 py-4 font-medium flex items-center gap-2">
                                                    <Warehouse size={14} className="text-slate-400" />
                                                    {getStoreName(req.storeId)}
                                                </td>
                                                <td className="px-6 py-4">{req.receiptSource}</td>
                                                <td className="px-6 py-4">
                                                    <div className="text-slate-700">{req.requesterName}</div>
                                                    <div className="text-[10px] text-slate-400 uppercase font-bold">{req.requesterDesignation}</div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button 
                                                        onClick={() => handleLoadRequest(req)}
                                                        className="bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-all border border-indigo-100"
                                                    >
                                                        <Eye size={14} /> विवरण हेर्नुहोस्
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                             <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-slate-600 font-medium">
                                    <tr>
                                        <th className="px-6 py-4">दाखिला मिति</th>
                                        <th className="px-6 py-4">दाखिला नं</th>
                                        <th className="px-6 py-4">प्रकार</th>
                                        <th className="px-6 py-4">तयार गर्ने</th>
                                        <th className="px-6 py-4">स्वीकृत गर्ने</th>
                                        <th className="px-6 py-4 text-right">कार्य</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredReports.length === 0 ? (
                                        <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">No historical reports found.</td></tr>
                                    ) : (
                                        filteredReports.map(r => (
                                            <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-4 font-nepali">{r.date}</td>
                                                <td className="px-6 py-4 font-mono font-bold text-green-600">{r.dakhilaNo}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded-full border border-slate-200 font-bold uppercase`}>
                                                        {r.orderNo === 'BULK-ENTRY' ? 'Bulk' : 'Manual'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-slate-500 text-xs">{r.preparedBy?.name}</td>
                                                <td className="px-6 py-4 text-slate-700 font-medium">{r.approvedBy?.name}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <button onClick={() => handleLoadReport(r)} className="text-slate-400 hover:text-indigo-600 p-2"><Eye size={18}/></button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Detail View
    const renderDetailView = (data: any, isRequest: boolean) => {
        const dakhilaNo = isRequest ? (data.items[0]?.dakhilaNo || 'N/A') : data.dakhilaNo;
        const date = isRequest ? data.requestDateBs : data.date;
        const items = data.items || [];
        const isApproved = data.status === 'Approved' || data.status === 'Final' || data.status === 'Issued';
        const isPending = data.status === 'Pending';
        const storeName = isRequest ? getStoreName(data.storeId) : '-';

        // Determine Item Type for Category Label
        let categoryLabel = '';
        let categoryColorClass = '';
        let CategoryIcon = Layers;

        if (items.length > 0) {
            // For requests, itemType is string 'Expendable', for dakhilaReports we infer from source logic or metadata if present
            const type = isRequest ? items[0].itemType : (items[0].source?.toLowerCase().includes('expendable') ? 'Expendable' : 'Non-Expendable');
            
            if (type === 'Expendable') {
                categoryLabel = 'खर्च भएर जाने जिन्सी सामान (Expendable Goods)';
                categoryColorClass = 'text-orange-600 bg-orange-50 border-orange-100';
                CategoryIcon = Layers;
            } else {
                categoryLabel = 'खर्च भएर नजाने जिन्सी सामान (Non-Expendable Goods)';
                categoryColorClass = 'text-blue-600 bg-blue-50 border-blue-100';
                CategoryIcon = ShieldIcon;
            }
        }

        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm no-print">
                    <div className="flex items-center gap-4">
                        <button onClick={() => { setSelectedRequest(null); setSelectedReport(null); }} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h2 className="font-bold text-slate-700 font-nepali text-lg">दाखिला प्रतिवेदन विवरण (Dakhila Details)</h2>
                            <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${isApproved ? 'bg-green-50 text-green-700 border-green-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>
                                    {data.status}
                                </span>
                                {isRequest && <span className="text-[10px] font-bold text-slate-500">SOURCE: PENDING BULK ENTRY</span>}
                                {!isRequest && <span className="text-[10px] font-bold text-slate-500">SOURCE: OFFICIAL HISTORY</span>}
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                         {isAdmin && isPending && isRequest && (
                             <>
                                <button onClick={() => setShowRejectModal(true)} className="flex items-center gap-2 px-6 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg font-medium transition-colors">
                                    <X size={18} /> अस्वीकृत (Reject)
                                </button>
                                <button onClick={handleApprove} className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg font-medium shadow-sm transition-all active:scale-95">
                                    <ShieldCheck size={18} /> स्वीकृत गर्नुहोस् (Approve)
                                </button>
                             </>
                         )}
                         <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white hover:bg-slate-900 rounded-lg font-medium shadow-sm transition-colors">
                            <Printer size={18} /> प्रिन्ट (Print)
                        </button>
                    </div>
                </div>

                {/* FORM 403 PRINT LAYOUT */}
                <div id="dakhila-print-container" className="bg-white p-8 md:p-12 rounded-xl shadow-lg max-w-[210mm] mx-auto min-h-[297mm] text-slate-900 font-nepali text-sm print:shadow-none print:p-0 print:max-w-none">
                    <div className="text-right font-bold text-[10px] mb-4">म.ले.प.फारम नं: ४०३</div>

                    <div className="mb-8">
                        <div className="flex items-start justify-between">
                            <div className="w-24 pt-2">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Emblem_of_Nepal.svg/1200px-Emblem_of_Nepal.svg.png" alt="Emblem" className="h-24 w-24 object-contain"/>
                            </div>
                            <div className="flex-1 text-center space-y-1">
                                <h1 className="text-xl font-bold text-red-600">{generalSettings.orgNameNepali}</h1>
                                {generalSettings.subTitleNepali && <h2 className="text-lg font-bold">{generalSettings.subTitleNepali}</h2>}
                                {generalSettings.subTitleNepali2 && <h3 className="text-base font-bold">{generalSettings.subTitleNepali2}</h3>}
                                {generalSettings.subTitleNepali3 && <h3 className="text-lg font-bold">{generalSettings.subTitleNepali3}</h3>}
                                <div className="text-xs mt-2 space-x-3 font-medium text-slate-600">
                                    {generalSettings.address && <span>{generalSettings.address}</span>}
                                    {generalSettings.phone && <span>| फोन: {generalSettings.phone}</span>}
                                </div>
                            </div>
                            <div className="w-24"></div> 
                        </div>
                        <div className="text-center pt-6 pb-2">
                            <h2 className="text-xl font-bold underline underline-offset-4 uppercase tracking-wider">दाखिला प्रतिवेदन फाराम</h2>
                        </div>
                    </div>

                    <div className="flex justify-between items-end mb-4 text-sm font-medium">
                        <div className="space-y-1">
                            <div>आर्थिक वर्ष: <span className="font-bold border-b border-dotted border-slate-800 px-2">{data.fiscalYear}</span></div>
                            <div>स्टोर/गोदाम: <span className="font-bold border-b border-dotted border-slate-800 px-2">{storeName}</span></div>
                            {(isRequest || data.orderNo === 'BULK-ENTRY') && <div>प्राप्तिको स्रोत: <span className="font-bold border-b border-dotted border-slate-800 px-2">{data.receiptSource || 'Bulk Inventory'}</span></div>}
                        </div>
                        <div className="space-y-1 text-right">
                            <div>दाखिला नं.: <span className="font-bold text-red-600 border-b border-dotted border-slate-800 px-2">{dakhilaNo}</span></div>
                            <div>मिति: <span className="font-bold border-b border-dotted border-slate-800 px-2">{date}</span></div>
                        </div>
                    </div>

                    {categoryLabel && (
                        <div className={`mb-3 py-2 px-4 rounded-lg border flex items-center gap-3 font-bold text-sm ${categoryColorClass}`}>
                            <CategoryIcon size={18} />
                            <span>प्रकार: {categoryLabel}</span>
                        </div>
                    )}

                    <table className="w-full border-collapse border border-slate-900 text-center align-middle text-[11px]">
                        <thead>
                            <tr className="bg-slate-50">
                                <th className="border border-slate-900 p-2 w-10">क्र.सं.</th>
                                <th className="border border-slate-900 p-2">विवरण (सामानको नाम)</th>
                                <th className="border border-slate-900 p-2 w-20">सङ्केत नं.</th>
                                <th className="border border-slate-900 p-2 w-24">स्पेसिफिकेसन</th>
                                <th className="border border-slate-900 p-2 w-16">एकाई</th>
                                <th className="border border-slate-900 p-2 w-16">परिमाण</th>
                                <th className="border border-slate-900 p-2 w-20">दर</th>
                                <th className="border border-slate-900 p-2 w-24">जम्मा मूल्य</th>
                                <th className="border border-slate-900 p-2 w-24">कैफियत</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item: any, idx: number) => {
                                const itemName = isRequest ? item.itemName : item.name;
                                const codeNo = isRequest ? (item.sanketNo || item.uniqueCode) : item.codeNo;
                                const rate = isRequest ? item.rate : item.rate;
                                const qty = isRequest ? item.currentQuantity : item.quantity;
                                const total = isRequest ? item.totalAmount : item.totalAmount;
                                
                                return (
                                    <tr key={idx}>
                                        <td className="border border-slate-900 p-2">{idx + 1}</td>
                                        <td className="border border-slate-900 p-1 text-left px-2 font-medium">{itemName}</td>
                                        <td className="border border-slate-900 p-1 font-mono">{codeNo || '-'}</td>
                                        <td className="border border-slate-900 p-1 text-left px-2">{item.specification || '-'}</td>
                                        <td className="border border-slate-900 p-1">{item.unit}</td>
                                        <td className="border border-slate-900 p-1 font-bold">{qty}</td>
                                        <td className="border border-slate-900 p-1 text-right px-2">{rate?.toFixed(2)}</td>
                                        <td className="border border-slate-900 p-1 text-right px-2 font-bold">{total?.toFixed(2)}</td>
                                        <td className="border border-slate-900 p-1 text-[10px] text-left px-1 italic">{item.remarks || '-'}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                        <tfoot>
                            <tr className="bg-slate-50 font-bold">
                                <td colSpan={7} className="border border-slate-900 p-2 text-right px-4 uppercase tracking-tighter">कुल जम्मा (Total Amount)</td>
                                <td className="border border-slate-900 p-2 text-right px-2">
                                    {items.reduce((sum: number, i: any) => sum + (isRequest ? i.totalAmount : i.totalAmount), 0).toFixed(2)}
                                </td>
                                <td className="border border-slate-900 p-2"></td>
                            </tr>
                        </tfoot>
                    </table>

                    <div className="mt-8 text-xs italic text-slate-500">
                        उपरोक्त सामानहरू बिल विजक अनुसार दाखिला गरियो। (Items recorded as per invoice.)
                    </div>

                    <div className="grid grid-cols-3 gap-8 mt-16 text-sm">
                        <div className="flex flex-col">
                            <div className="font-bold mb-10">तयार गर्ने (Prepared By):</div>
                            <div className="border-t border-slate-400 pt-1">
                                {isRequest ? (
                                    <>
                                        <div className="font-bold">{data.requesterName}</div>
                                        <div className="text-[10px] uppercase">{data.requesterDesignation}</div>
                                    </>
                                ) : (
                                    <>
                                        <div className="font-bold">{data.preparedBy?.name || '....................'}</div>
                                        <div className="text-[10px]">{data.preparedBy?.designation}</div>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <div className="font-bold mb-10">प्रमाणित गर्ने (Verified By):</div>
                            <div className="border-t border-slate-400 pt-1 text-slate-300">....................</div>
                        </div>
                        <div className="flex flex-col">
                            <div className="font-bold mb-10">स्वीकृत गर्ने (Approved By):</div>
                            <div className="border-t border-slate-400 pt-1">
                                {isApproved ? (
                                    <div className="font-bold">
                                        {isRequest ? data.approvedBy : (data.approvedBy?.name || '....................')}
                                    </div>
                                ) : (
                                    <div className="text-slate-300 italic">....................</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reject Modal */}
                {showRejectModal && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setShowRejectModal(false)}></div>
                        <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
                            <div className="px-6 py-4 border-b bg-red-50 text-red-800 flex justify-between items-center">
                                <h3 className="font-bold">अस्वीकृत गर्नुहोस् (Reject Request)</h3>
                                <button onClick={() => setShowRejectModal(false)}><X size={20}/></button>
                            </div>
                            <div className="p-6 space-y-4">
                                <label className="block text-sm font-medium text-slate-700">अस्वीकृतिको कारण (Reason for Rejection)</label>
                                <textarea 
                                    className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-red-500 outline-none"
                                    rows={4}
                                    placeholder="कारण लेख्नुहोस्..."
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                />
                                <div className="flex justify-end gap-3 pt-2">
                                    <button onClick={() => setShowRejectModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm">Cancel</button>
                                    <button onClick={handleRejectSubmit} className="px-6 py-2 bg-red-600 text-white rounded-lg text-sm font-bold shadow-sm">Confirm Reject</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    if (selectedRequest) return renderDetailView(selectedRequest, true);
    if (selectedReport) return renderDetailView(selectedReport, false);

    return null;
};
