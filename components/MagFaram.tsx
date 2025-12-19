
import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, Printer, Save, Calendar, CheckCircle2, Send, Clock, FileText, Download, ShieldCheck, CheckCheck, Eye, Search, X, AlertCircle, Store as StoreIcon, Layers, ChevronRight, ArrowLeft } from 'lucide-react';
// Import Signature and StoreKeeperSignature to satisfy explicit state typing
import { User, MagItem, MagFormEntry, InventoryItem, Option, Store, OrganizationSettings, Signature, StoreKeeperSignature } from '../types';
import { SearchableSelect } from './SearchableSelect';
import { NepaliDatePicker } from './NepaliDatePicker';
// @ts-ignore
import NepaliDate from 'nepali-date-converter';

interface MagFaramProps {
  currentFiscalYear: string;
  currentUser: User;
  existingForms: MagFormEntry[];
  onSave: (form: MagFormEntry) => void;
  inventoryItems: InventoryItem[];
  stores?: Store[];
  generalSettings: OrganizationSettings;
}

export const MagFaram: React.FC<MagFaramProps> = ({ currentFiscalYear, currentUser, existingForms, onSave, inventoryItems, stores = [], generalSettings }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isViewOnly, setIsViewOnly] = useState(false);
  const [items, setItems] = useState<MagItem[]>([{ id: Date.now(), name: '', specification: '', unit: '', quantity: '', remarks: '' }]);
  
  // Explicitly type formDetails state as MagFormEntry to handle Signature optionality correctly
  const [formDetails, setFormDetails] = useState<MagFormEntry>({
    id: '',
    items: [],
    fiscalYear: currentFiscalYear,
    formNo: 1,
    date: '',
    status: 'Pending',
    demandBy: { name: currentUser.fullName, designation: currentUser.designation, date: '', purpose: '' },
    recommendedBy: { name: '', designation: '', date: '' },
    storeKeeper: { status: '', name: '', },
    receiver: { name: '', designation: '', date: '' },
    ledgerEntry: { name: '', date: '' },
    approvedBy: { name: '', designation: '', date: '' }
  });

  const isStoreKeeper = currentUser.role === 'STOREKEEPER';
  const isAdminOrApproval = ['ADMIN', 'SUPER_ADMIN', 'APPROVAL'].includes(currentUser.role);
  const isRegularUser = currentUser.role === 'STAFF';

  // Filter Actionable Forms for Storekeeper and Admin
  const actionableForms = useMemo(() => {
      if (isStoreKeeper) {
          return existingForms.filter(f => f.status === 'Pending').sort((a, b) => b.formNo - a.formNo);
      }
      if (isAdminOrApproval) {
          return existingForms.filter(f => f.status === 'Verified').sort((a, b) => b.formNo - a.formNo);
      }
      return [];
  }, [existingForms, isStoreKeeper, isAdminOrApproval]);

  // History for Regular Users and General
  const historyForms = useMemo(() => {
      if (isRegularUser) {
          return existingForms.filter(f => f.demandBy?.name === currentUser.fullName).sort((a, b) => b.formNo - a.formNo);
      }
      return existingForms.filter(f => f.status === 'Approved' || f.status === 'Rejected').sort((a, b) => b.formNo - a.formNo);
  }, [existingForms, isRegularUser, currentUser.fullName]);

  const itemOptions = useMemo(() => inventoryItems.map(item => ({
    id: item.id,
    value: item.itemName,
    label: `${item.itemName} (${item.unit}) - Qty: ${item.currentQuantity}`,
    itemData: item
  })), [inventoryItems]);

  const handleAddItem = () => setItems([...items, { id: Date.now(), name: '', specification: '', unit: '', quantity: '', remarks: '' }]);
  const handleRemoveItem = (id: number) => items.length > 1 && setItems(items.filter(i => i.id !== id));
  const updateItem = (id: number, field: keyof MagItem, value: string) => setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));

  const handleLoadForm = (form: MagFormEntry, viewOnly: boolean = false) => {
      setEditingId(form.id);
      setIsViewOnly(viewOnly);
      setItems(form.items);
      // Correctly merge form object into typed state
      setFormDetails({
          ...form,
          // Auto-fill role based details if acting
          storeKeeper: isStoreKeeper && form.status === 'Pending' ? { status: 'stock', name: currentUser.fullName } : form.storeKeeper || { status: '', name: '' },
          approvedBy: isAdminOrApproval && form.status === 'Verified' ? { name: currentUser.fullName, designation: currentUser.designation, date: '' } : form.approvedBy || { name: '', designation: '', date: '' }
      });
  };

  const handleSave = () => {
    if (!formDetails.date) { alert("कृपया मिति छान्नुहोस् (Please select date)"); return; }
    
    let nextStatus = formDetails.status || 'Pending';
    let successMsg = "माग फारम सुरक्षित भयो (Saved Successfully)";

    if (editingId) {
        if (isStoreKeeper && formDetails.status === 'Pending') {
            nextStatus = 'Verified';
            successMsg = "फारम प्रमाणित गरी स्वीकृतिको लागि पठाइयो (Verified and forwarded for approval)";
        } else if (isAdminOrApproval && formDetails.status === 'Verified') {
            nextStatus = 'Approved';
            successMsg = "माग फारम स्वीकृत गरियो (Mag Faram Approved)";
        }
    }

    const newForm: MagFormEntry = {
        ...formDetails,
        id: editingId || Date.now().toString(),
        items,
        status: nextStatus
    };
    onSave(newForm);
    alert(successMsg);
    handleReset();
  };

  const handleReset = () => {
    setEditingId(null);
    setIsViewOnly(false);
    setItems([{ id: Date.now(), name: '', specification: '', unit: '', quantity: '', remarks: '' }]);
    setFormDetails({
        id: '',
        items: [],
        fiscalYear: currentFiscalYear,
        formNo: existingForms.length + 1,
        date: '',
        status: 'Pending',
        demandBy: { name: currentUser.fullName, designation: currentUser.designation, date: '', purpose: '' },
        recommendedBy: { name: '', designation: '', date: '' },
        storeKeeper: { status: '', name: '' },
        receiver: { name: '', designation: '', date: '' },
        ledgerEntry: { name: '', date: '' },
        approvedBy: { name: '', designation: '', date: '' }
    });
  };

  if (!editingId && (isStoreKeeper || isAdminOrApproval || historyForms.length > 0)) {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 font-nepali">माग फारम व्यवस्थापन (Mag Faram Management)</h2>
                    <p className="text-sm text-slate-500">अनुरोधहरू प्रमाणिकरण र स्वीकृत गर्नुहोस्</p>
                </div>
                {isRegularUser && (
                    <button onClick={() => setEditingId('new')} className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm hover:bg-primary-700">
                        <Plus size={18} /> नयाँ माग फारम
                    </button>
                )}
            </div>

            {/* ACTIONABLE LIST FOR STOREKEEPER / ADMIN */}
            {(isStoreKeeper || isAdminOrApproval) && actionableForms.length > 0 && (
                <div className="bg-white rounded-xl border border-orange-200 shadow-sm overflow-hidden">
                    <div className="bg-orange-50 px-6 py-3 border-b border-orange-100 flex justify-between items-center text-orange-800">
                        <h3 className="font-bold font-nepali flex items-center gap-2">
                            <Clock size={18} /> {isStoreKeeper ? 'प्रमाणिकरणको लागि बाँकी' : 'स्वीकृतिको लागि बाँकी'}
                        </h3>
                        <span className="bg-orange-200 text-xs font-bold px-2 py-0.5 rounded-full">{actionableForms.length} Requests</span>
                    </div>
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-600 font-medium">
                            <tr>
                                <th className="px-6 py-3">Form No</th>
                                <th className="px-6 py-3">Requested By</th>
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3">Items</th>
                                <th className="px-6 py-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {actionableForms.map(f => (
                                <tr key={f.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-3 font-mono font-bold text-orange-600">#{f.formNo}</td>
                                    <td className="px-6 py-3 font-medium">{f.demandBy?.name}</td>
                                    <td className="px-6 py-3 font-nepali">{f.date}</td>
                                    <td className="px-6 py-3 text-slate-500">{f.items.length} items</td>
                                    <td className="px-6 py-3 text-right">
                                        <button onClick={() => handleLoadForm(f)} className="text-primary-600 font-bold hover:underline flex items-center gap-1 ml-auto">
                                            {isStoreKeeper ? 'Verify' : 'Approve'} <ChevronRight size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* HISTORY LIST */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 text-slate-700 font-bold font-nepali flex items-center gap-2">
                    <FileText size={18} /> फारम इतिहास (History)
                </div>
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-medium">
                        <tr>
                            <th className="px-6 py-3">Form No</th>
                            <th className="px-6 py-3">Date</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {historyForms.length === 0 ? (
                            <tr><td colSpan={4} className="p-8 text-center text-slate-400 italic">No history found</td></tr>
                        ) : (
                            historyForms.map(f => (
                                <tr key={f.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-3 font-mono">#{f.formNo}</td>
                                    <td className="px-6 py-3 font-nepali">{f.date}</td>
                                    <td className="px-6 py-3">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                                            f.status === 'Approved' ? 'bg-green-50 text-green-700 border-green-200' :
                                            f.status === 'Pending' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                            'bg-blue-50 text-blue-700 border-blue-200'
                                        }`}>
                                            {f.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3 text-right">
                                        <button onClick={() => handleLoadForm(f, true)} className="text-slate-400 hover:text-primary-600">
                                            <Eye size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
  }

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm no-print">
          <div className="flex items-center gap-3">
              <button onClick={handleReset} className="p-2 hover:bg-slate-100 rounded-full text-slate-500"><ArrowLeft size={20} /></button>
              <h2 className="font-bold text-slate-700 font-nepali text-lg">माग फारम (Mag Faram)</h2>
          </div>
          <div className="flex gap-2">
            {!isViewOnly && (
                <button onClick={handleAddItem} className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium transition-colors">
                    <Plus size={18} /> थप्नुहोस्
                </button>
            )}
            {!isViewOnly && (
                <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium shadow-sm transition-colors">
                    <Save size={18} /> {editingId && editingId !== 'new' ? (isStoreKeeper ? 'प्रमाणित गर्नुहोस्' : 'स्वीकृत गर्नुहोस्') : 'सुरक्षित गर्नुहोस्'}
                </button>
            )}
            <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg transition-colors">
                <Printer size={18} /> प्रिन्ट
            </button>
          </div>
       </div>

       <div id="mag-form-print" className="bg-white p-8 md:p-12 rounded-xl shadow-lg max-w-[210mm] mx-auto min-h-[297mm] font-nepali text-sm print:shadow-none print:p-0">
          <div className="text-right font-bold text-xs mb-4">म.ले.प.फारम नं: ४०१</div>
          
          <div className="text-center mb-8 space-y-1">
              <h1 className="text-xl font-bold text-red-600">{generalSettings.orgNameNepali}</h1>
              {generalSettings.subTitleNepali && <h2 className="text-lg font-bold">{generalSettings.subTitleNepali}</h2>}
              {generalSettings.subTitleNepali2 && <h3 className="text-base font-bold">{generalSettings.subTitleNepali2}</h3>}
              {generalSettings.subTitleNepali3 && <h3 className="text-lg font-bold">{generalSettings.subTitleNepali3}</h3>}
              <h2 className="text-lg font-bold underline underline-offset-4 pt-2">माग फारम</h2>
          </div>

          <div className="flex justify-between items-end mb-6">
              <div className="font-bold">आर्थिक वर्ष: <span className="border-b border-dotted border-slate-800 px-2">{currentFiscalYear}</span></div>
              <div className="flex items-center gap-2">
                  <span className="font-bold">मिति:</span>
                  <NepaliDatePicker
                    value={formDetails.date}
                    onChange={(val) => setFormDetails({ ...formDetails, date: val })}
                    format="YYYY/MM/DD"
                    label=""
                    hideIcon={true}
                    inputClassName="border-b border-dotted border-slate-800 w-32 text-center outline-none bg-transparent font-bold placeholder:text-slate-400 placeholder:font-normal rounded-none px-0 py-0 h-auto focus:ring-0 focus:border-slate-800"
                    wrapperClassName="w-32"
                    disabled={isViewOnly || (editingId && editingId !== 'new' && !isRegularUser)}
                  />
              </div>
          </div>

          <table className="w-full border-collapse border border-slate-900 text-center">
              <thead>
                  <tr className="bg-slate-50">
                      <th className="border border-slate-900 p-2 w-12">क्र.सं.</th>
                      <th className="border border-slate-900 p-2">सामानको नाम</th>
                      <th className="border border-slate-900 p-2 w-20">एकाई</th>
                      <th className="border border-slate-900 p-2 w-24">परिमाण</th>
                      <th className="border border-slate-900 p-2">कैफियत</th>
                  </tr>
              </thead>
              <tbody>
                  {items.map((item, idx) => (
                      <tr key={item.id}>
                          <td className="border border-slate-900 p-2">{idx + 1}</td>
                          <td className="border border-slate-900 p-0 text-left">
                              {!isViewOnly && (!editingId || editingId === 'new') ? (
                                <SearchableSelect 
                                    options={itemOptions} 
                                    value={item.name} 
                                    onChange={val => updateItem(item.id, 'name', val)} 
                                    onSelect={opt => updateItem(item.id, 'unit', opt.itemData.unit)} 
                                    className="!border-none !bg-transparent !p-1"
                                    placeholder="सामान खोज्नुहोस्..."
                                />
                              ) : (
                                <span className="px-2">{item.name}</span>
                              )}
                          </td>
                          <td className="border border-slate-900 p-1">
                              <input disabled={isViewOnly || (editingId && editingId !== 'new')} value={item.unit} onChange={e => updateItem(item.id, 'unit', e.target.value)} className="w-full text-center bg-transparent outline-none" />
                          </td>
                          <td className="border border-slate-900 p-1">
                              <input disabled={isViewOnly || (editingId && editingId !== 'new')} value={item.quantity} onChange={e => updateItem(item.id, 'quantity', e.target.value)} className="w-full text-center font-bold bg-transparent outline-none" placeholder="०" />
                          </td>
                          <td className="border border-slate-900 p-1">
                              <input disabled={isViewOnly || (editingId && editingId !== 'new')} value={item.remarks} onChange={e => updateItem(item.id, 'remarks', e.target.value)} className="w-full text-left px-1 bg-transparent outline-none" />
                          </td>
                      </tr>
                  ))}
              </tbody>
          </table>

          <div className="grid grid-cols-3 gap-8 mt-12 text-sm">
              <div>
                  <div className="font-bold mb-8">माग गर्नेको दस्तखत:</div>
                  <div className="border-t border-slate-400 pt-1">
                    <div>नाम: {formDetails.demandBy?.name}</div>
                    <div>पद: {formDetails.demandBy?.designation}</div>
                  </div>
              </div>
              <div>
                  <div className="font-bold mb-8">सिफारिस गर्ने/प्रमाणित:</div>
                  <div className="border-t border-slate-400 pt-1">
                    {formDetails.status === 'Verified' || formDetails.status === 'Approved' ? (
                        <div>
                            <div>नाम: {formDetails.storeKeeper?.name}</div>
                            <div className="text-xs italic text-slate-500">(स्टोरकिपर)</div>
                        </div>
                    ) : '....................'}
                  </div>
              </div>
              <div>
                  <div className="font-bold mb-8">स्वीकृत गर्नेको दस्तखत:</div>
                  <div className="border-t border-slate-400 pt-1">
                    {formDetails.status === 'Approved' ? (
                        <div>
                            <div>नाम: {formDetails.approvedBy?.name}</div>
                            <div>पद: {formDetails.approvedBy?.designation}</div>
                        </div>
                    ) : '....................'}
                  </div>
              </div>
          </div>
       </div>
    </div>
  );
};
