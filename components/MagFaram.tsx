import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, Printer, Save, Calendar, CheckCircle2, Send, Clock, FileText, Eye, Search, X, AlertCircle, ChevronRight, ArrowLeft, Check, Square } from 'lucide-react';
import { User, MagItem, MagFormEntry, InventoryItem, Option, Store, OrganizationSettings } from '../types';
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

export const MagFaram: React.FC<MagFaramProps> = ({ currentFiscalYear, currentUser, existingForms, onSave, inventoryItems, generalSettings }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isViewOnly, setIsViewOnly] = useState(false);
  
  const generateMagFormNo = (forms: MagFormEntry[], fy: string) => {
    const fyForms = forms.filter(f => f.fiscalYear === fy);
    if (fyForms.length === 0) return "001";
    
    const maxNo = fyForms.reduce((max, f) => {
        let val = 0;
        if (typeof f.formNo === 'string') {
            const parts = f.formNo.split('-');
            val = parseInt(parts[0]);
        } else {
            val = f.formNo;
        }
        return isNaN(val) ? max : Math.max(max, val);
    }, 0);
    
    return String(maxNo + 1).padStart(2, '0');
  };

  const todayBS = useMemo(() => {
    try {
      /* Changed format from YYYY.MM.DD to YYYY-MM-DD to match NepaliDatePicker's allowed types */
      return new NepaliDate().format('YYYY-MM-DD');
    } catch (e) {
      return '';
    }
  }, []);

  const [items, setItems] = useState<MagItem[]>([{ id: Date.now(), name: '', specification: '', unit: '', quantity: '', remarks: '' }]);
  
  const [formDetails, setFormDetails] = useState<MagFormEntry>({
    id: '',
    items: [],
    fiscalYear: currentFiscalYear,
    formNo: '',
    date: todayBS,
    status: 'Pending',
    demandBy: { name: currentUser.fullName, designation: currentUser.designation, date: todayBS, purpose: '' },
    recommendedBy: { name: '', designation: '', date: '' },
    storeKeeper: { status: 'stock', name: '' },
    receiver: { name: currentUser.fullName, designation: currentUser.designation, date: todayBS },
    ledgerEntry: { name: '', date: '' },
    approvedBy: { name: '', designation: '', date: todayBS }
  });

  useEffect(() => {
    if (!editingId && !formDetails.id) {
        setFormDetails(prev => ({
            ...prev,
            formNo: generateMagFormNo(existingForms, currentFiscalYear)
        }));
    }
  }, [editingId, existingForms, currentFiscalYear]);

  const isStoreKeeper = currentUser.role === 'STOREKEEPER' || currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN';
  const isAdminOrApproval = ['ADMIN', 'SUPER_ADMIN', 'APPROVAL'].includes(currentUser.role);

  const actionableForms = useMemo(() => {
      if (isStoreKeeper) return existingForms.filter(f => f.status === 'Pending').sort((a, b) => b.id.localeCompare(a.id));
      if (isAdminOrApproval) return existingForms.filter(f => f.status === 'Verified').sort((a, b) => b.id.localeCompare(a.id));
      return [];
  }, [existingForms, isStoreKeeper, isAdminOrApproval]);

  const historyForms = useMemo(() => {
      if (isAdminOrApproval || isStoreKeeper) {
          return existingForms.filter(f => f.status === 'Approved' || f.status === 'Rejected').sort((a, b) => b.id.localeCompare(a.id));
      }
      return existingForms.filter(f => f.demandBy?.name === currentUser.fullName).sort((a, b) => b.id.localeCompare(a.id));
  }, [existingForms, isAdminOrApproval, isStoreKeeper, currentUser.fullName]);

  const itemOptions = useMemo(() => inventoryItems.map(item => ({
    id: item.id,
    value: item.itemName,
    label: `${item.itemName} (${item.unit})`,
    itemData: item
  })), [inventoryItems]);

  const handleAddItem = () => setItems([...items, { id: Date.now(), name: '', specification: '', unit: '', quantity: '', remarks: '' }]);
  const handleRemoveItem = (id: number) => items.length > 1 && setItems(items.filter(i => i.id !== id));
  const updateItem = (id: number, field: keyof MagItem, value: string) => setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));

  const updateStoreKeeperStatus = (status: string) => {
      if (isViewOnly) return;
      setFormDetails(prev => ({
          ...prev,
          storeKeeper: { ...prev.storeKeeper, status, name: prev.storeKeeper?.name || '' }
      }));
  };

  const handleLoadForm = (form: MagFormEntry, viewOnly: boolean = false) => {
      setEditingId(form.id);
      setIsViewOnly(viewOnly);
      setItems(form.items);
      setFormDetails({ ...form });
  };

  const handleSave = () => {
    let nextStatus = formDetails.status || 'Pending';
    if (editingId && editingId !== 'new') {
        if (isStoreKeeper && formDetails.status === 'Pending') nextStatus = 'Verified';
        else if (isAdminOrApproval && formDetails.status === 'Verified') nextStatus = 'Approved';
    }

    const newForm: MagFormEntry = {
        ...formDetails,
        id: editingId === 'new' || !editingId ? Date.now().toString() : editingId,
        items,
        status: nextStatus
    };
    onSave(newForm);
    alert("माग फारम सुरक्षित भयो।");
    handleReset();
  };

  const handleReset = () => {
    setEditingId(null);
    setIsViewOnly(false);
    setItems([{ id: Date.now(), name: '', specification: '', unit: '', quantity: '', remarks: '' }]);
    setFormDetails({
        id: '', items: [], fiscalYear: currentFiscalYear, formNo: generateMagFormNo(existingForms, currentFiscalYear),
        date: todayBS, status: 'Pending',
        demandBy: { name: currentUser.fullName, designation: currentUser.designation, date: todayBS, purpose: '' },
        recommendedBy: { name: '', designation: '', date: '' },
        storeKeeper: { status: 'stock', name: '' },
        receiver: { name: currentUser.fullName, designation: currentUser.designation, date: todayBS },
        ledgerEntry: { name: '', date: '' },
        approvedBy: { name: '', designation: '', date: todayBS }
    });
  };

  if (!editingId) {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 font-nepali">माग फारम व्यवस्थापन (Mag Faram)</h2>
                    <p className="text-sm text-slate-500 font-nepali">म.ले.प. फारम नं ४०१ अनुसारको माग फारम</p>
                </div>
                <button onClick={() => setEditingId('new')} className="bg-primary-600 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 shadow-lg hover:bg-primary-700 transition-all font-bold font-nepali">
                    <Plus size={20} /> नयाँ माग फारम थप्नुहोस्
                </button>
            </div>

            {actionableForms.length > 0 && (
                <div className="bg-white rounded-xl border border-orange-200 shadow-sm overflow-hidden">
                    <div className="bg-orange-50 px-6 py-3 border-b border-orange-100 flex justify-between items-center text-orange-800">
                        <h3 className="font-bold font-nepali flex items-center gap-2"><Clock size={18} /> कारबाहीको लागि बाँकी</h3>
                        <span className="bg-orange-200 text-xs font-bold px-2 py-0.5 rounded-full">{actionableForms.length}</span>
                    </div>
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-600 font-medium">
                            <tr><th className="px-6 py-3">Form No</th><th className="px-6 py-3">Requested By</th><th className="px-6 py-3">Date</th><th className="px-6 py-3 text-right">Action</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {actionableForms.map(f => (
                                <tr key={f.id} className="hover:bg-slate-50"><td className="px-6 py-3 font-mono font-bold">#{f.formNo}</td><td className="px-6 py-3 font-medium">{f.demandBy?.name}</td><td className="px-6 py-3 font-nepali">{f.date}</td><td className="px-6 py-3 text-right"><button onClick={() => handleLoadForm(f)} className="text-primary-600 font-bold hover:underline bg-primary-50 px-3 py-1.5 rounded-lg">Verify/Approve</button></td></tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 text-slate-700 font-bold font-nepali flex items-center gap-2"><FileText size={18} /> इतिहास (History)</div>
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-medium">
                        <tr><th className="px-6 py-3">Form No</th><th className="px-6 py-3">Date</th><th className="px-6 py-3">Status</th><th className="px-6 py-3 text-right">Action</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {historyForms.map(f => (
                            <tr key={f.id} className="hover:bg-slate-50"><td className="px-6 py-3 font-mono font-bold">#{f.formNo}</td><td className="px-6 py-3 font-nepali">{f.date}</td><td className="px-6 py-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${f.status === 'Approved' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>{f.status}</span></td><td className="px-6 py-3 text-right"><button onClick={() => handleLoadForm(f, true)} className="text-slate-400 hover:text-primary-600 p-2"><Eye size={18} /></button></td></tr>
                        ))}
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
              <button onClick={handleReset} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"><ArrowLeft size={20} /></button>
              <h2 className="font-bold text-slate-700 font-nepali text-lg">माग फारम भर्नुहोस्</h2>
          </div>
          <div className="flex gap-2">
            {!isViewOnly && (
                <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium shadow-sm">
                    <Save size={18} /> {editingId && editingId !== 'new' ? 'प्रमाणित/स्वीकृत गर्नुहोस्' : 'सुरक्षित गर्नुहोस्'}
                </button>
            )}
            <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white hover:bg-slate-900 rounded-lg font-medium shadow-sm">
                <Printer size={18} /> प्रिन्ट गर्नुहोस्
            </button>
          </div>
       </div>

       <div id="mag-form-print" className="bg-white p-6 md:p-10 max-w-[210mm] mx-auto min-h-[297mm] font-nepali text-slate-900 print:p-0 print:shadow-none print:w-full border shadow-lg rounded-xl">
          <div className="text-right font-bold text-[10px] mb-2">म.ले.प.फारम नं: ४०१</div>
          
          <div className="mb-6">
              <div className="flex items-start justify-between">
                  <div className="w-20 pt-1">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Emblem_of_Nepal.svg/1200px-Emblem_of_Nepal.svg.png" alt="Nepal Emblem" className="h-20 w-20 object-contain" />
                  </div>
                  <div className="flex-1 text-center">
                      <h1 className="text-lg font-bold">चौदण्डीगढी नगरपालिका</h1>
                      <h2 className="text-base font-bold">नगरकार्यपालिकाको कार्यालय</h2>
                      <h3 className="text-sm font-bold">स्वास्थ्य शाखा</h3>
                      <h3 className="text-base font-bold">आधारभूत नगर अस्पताल बेल्टार</h3>
                  </div>
                  <div className="w-20"></div> 
              </div>
              <div className="text-center mt-6">
                  <h2 className="text-lg font-bold underline underline-offset-4">माग फारम</h2>
              </div>
          </div>

          <div className="flex justify-end text-sm mb-4">
              <div className="space-y-1 w-44">
                  <div className="flex justify-between items-center">
                      <span className="font-bold">आर्थिक वर्ष :</span>
                      <span className="font-bold border-b border-dotted border-slate-800 px-1">{currentFiscalYear}</span>
                  </div>
                  <div className="flex justify-between items-center">
                      <span className="font-bold">माग फारम नं :</span>
                      <span className="font-bold border-b border-dotted border-slate-800 px-1 text-red-600">{formDetails.formNo}</span>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                      <span className="font-bold">मिति :</span>
                      <div className="flex-1">
                        <NepaliDatePicker 
                            value={formDetails.date} 
                            onChange={val => setFormDetails({...formDetails, date: val})}
                            /* Changed format from YYYY.MM.DD to YYYY-MM-DD to fix type error */
                            format="YYYY-MM-DD"
                            label=""
                            hideIcon={true}
                            inputClassName="!border-none !bg-transparent !p-0 !text-right !font-bold !h-auto !shadow-none !ring-0 border-b border-dotted border-slate-800 rounded-none w-full"
                            disabled={isViewOnly}
                            popupAlign="right"
                        />
                      </div>
                  </div>
              </div>
          </div>

          <table className="w-full border-collapse border border-slate-800 text-center text-xs">
              <thead className="bg-slate-50 font-bold">
                  <tr>
                      <th className="border border-slate-800 p-2 w-10">क्र.सं.</th>
                      <th className="border border-slate-800 p-2">सामानको नाम</th>
                      <th className="border border-slate-800 p-2 w-32">स्पेसिफिकेशन</th>
                      <th className="border border-slate-800 p-1 w-32" colSpan={2}>माग गरिएको</th>
                      <th className="border border-slate-800 p-2 w-24">कैफियत</th>
                  </tr>
                  <tr>
                      <th className="border border-slate-800 p-1"></th>
                      <th className="border border-slate-800 p-1"></th>
                      <th className="border border-slate-800 p-1"></th>
                      <th className="border border-slate-800 p-1">एकाई</th>
                      <th className="border border-slate-800 p-1">परिमाण</th>
                      <th className="border border-slate-800 p-1"></th>
                  </tr>
                  <tr className="bg-slate-100 text-[10px]">
                      <th className="border border-slate-800 p-0.5">१</th>
                      <th className="border border-slate-800 p-0.5">२</th>
                      <th className="border border-slate-800 p-0.5">३</th>
                      <th className="border border-slate-800 p-0.5">४</th>
                      <th className="border border-slate-800 p-0.5">५</th>
                      <th className="border border-slate-800 p-0.5">६</th>
                  </tr>
              </thead>
              <tbody>
                  {items.map((item, idx) => (
                      <tr key={item.id} className="min-h-[30px]">
                          <td className="border border-slate-800 p-1">{idx + 1}</td>
                          <td className="border border-slate-800 p-0 text-left">
                              {!isViewOnly ? (
                                <SearchableSelect 
                                    options={itemOptions} value={item.name} 
                                    onChange={val => updateItem(item.id, 'name', val)} 
                                    onSelect={opt => updateItem(item.id, 'unit', opt.itemData.unit)} 
                                    className="!border-none !bg-transparent !p-1 !text-xs" placeholder="सामान छान्नुहोस्..."
                                />
                              ) : <span className="px-2">{item.name}</span>}
                          </td>
                          <td className="border border-slate-800 p-1">
                              <input disabled={isViewOnly} value={item.specification} onChange={e => updateItem(item.id, 'specification', e.target.value)} className="w-full text-left outline-none bg-transparent px-1" />
                          </td>
                          <td className="border border-slate-800 p-1">
                              <input disabled={isViewOnly} value={item.unit} onChange={e => updateItem(item.id, 'unit', e.target.value)} className="w-full text-center outline-none bg-transparent" />
                          </td>
                          <td className="border border-slate-800 p-1 font-bold">
                              <input disabled={isViewOnly} value={item.quantity} onChange={e => updateItem(item.id, 'quantity', e.target.value)} className="w-full text-center outline-none bg-transparent" />
                          </td>
                          <td className="border border-slate-800 p-1">
                              <input disabled={isViewOnly} value={item.remarks} onChange={e => updateItem(item.id, 'remarks', e.target.value)} className="w-full text-left outline-none bg-transparent px-1" />
                          </td>
                      </tr>
                  ))}
                  {[...Array(Math.max(0, 4 - items.length))].map((_, i) => (
                      <tr key={`empty-${i}`} className="h-8">
                          <td className="border border-slate-800"></td><td className="border border-slate-800"></td><td className="border border-slate-800"></td><td className="border border-slate-800"></td><td className="border border-slate-800"></td><td className="border border-slate-800"></td>
                      </tr>
                  ))}
              </tbody>
          </table>

          {!isViewOnly && (
            <button onClick={handleAddItem} className="mt-2 no-print flex items-center gap-1 text-[10px] font-bold text-primary-600 bg-primary-50 px-2 py-1 rounded border border-dashed border-primary-200">
                <Plus size={12} /> थप्नुहोस्
            </button>
          )}

          <div className="mt-8 text-[11px] grid grid-cols-12 gap-y-10">
              <div className="col-span-4 pr-4">
                  <div className="font-bold mb-4">माग गर्नेको:</div>
                  <div className="space-y-1">
                      <div className="flex gap-1"><span>नाम:</span><input value={formDetails.demandBy?.name} onChange={e => setFormDetails({...formDetails, demandBy: {...formDetails.demandBy!, name: e.target.value}})} className="border-b border-dotted border-slate-800 flex-1 outline-none bg-transparent" disabled={isViewOnly}/></div>
                      <div className="flex gap-1"><span>पद:</span><input value={formDetails.demandBy?.designation} onChange={e => setFormDetails({...formDetails, demandBy: {...formDetails.demandBy!, designation: e.target.value}})} className="border-b border-dotted border-slate-800 flex-1 outline-none bg-transparent" disabled={isViewOnly}/></div>
                      <div className="flex gap-1"><span>मिति:</span><input value={formDetails.demandBy?.date} onChange={e => setFormDetails({...formDetails, demandBy: {...formDetails.demandBy!, date: e.target.value}})} className="border-b border-dotted border-slate-800 flex-1 outline-none bg-transparent" disabled={isViewOnly}/></div>
                      <div className="flex gap-1"><span>प्रयोजन:</span><input value={formDetails.demandBy?.purpose} onChange={e => setFormDetails({...formDetails, demandBy: {...formDetails.demandBy!, purpose: e.target.value}})} className="border-b border-dotted border-slate-800 flex-1 outline-none bg-transparent" disabled={isViewOnly}/></div>
                  </div>
              </div>

              <div className="col-span-4 px-4">
                  <div className="font-bold mb-4">सिफारिस गर्ने:.......</div>
                  <div className="space-y-1">
                      <div className="flex gap-1"><span>नाम:</span><input value={formDetails.recommendedBy?.name} onChange={e => setFormDetails({...formDetails, recommendedBy: {...formDetails.recommendedBy!, name: e.target.value}})} className="border-b border-dotted border-slate-800 flex-1 outline-none bg-transparent" disabled={isViewOnly}/></div>
                      <div className="flex gap-1"><span>पद:</span><input value={formDetails.recommendedBy?.designation} onChange={e => setFormDetails({...formDetails, recommendedBy: {...formDetails.recommendedBy!, designation: e.target.value}})} className="border-b border-dotted border-slate-800 flex-1 outline-none bg-transparent" disabled={isViewOnly}/></div>
                      <div className="flex gap-1"><span>मिति:</span><input value={formDetails.recommendedBy?.date} onChange={e => setFormDetails({...formDetails, recommendedBy: {...formDetails.recommendedBy!, date: e.target.value}})} className="border-b border-dotted border-slate-800 flex-1 outline-none bg-transparent" disabled={isViewOnly}/></div>
                  </div>
              </div>

              <div className="col-span-4 pl-4">
                  <div className="font-bold mb-2">स्टोरकिपरले भर्ने:</div>
                  <div className="space-y-1 mb-4">
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => updateStoreKeeperStatus('market')} className="text-slate-800">{formDetails.storeKeeper?.status === 'market' ? <CheckCircle2 size={14}/> : <Square size={14}/>}</button>
                        <span>क) बजारबाट खरिद गर्नु पर्ने</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => updateStoreKeeperStatus('stock')} className="text-slate-800">{formDetails.storeKeeper?.status === 'stock' ? <CheckCircle2 size={14}/> : <Square size={14}/>}</button>
                        <span>ख) मौज्दातमा रहेको</span>
                      </div>
                  </div>
                  <div className="space-y-1">
                      <div className="mb-2">स्टोरकिपरको दस्तखत:.......</div>
                      <div className="flex gap-1"><span>नाम:</span><input value={formDetails.storeKeeper?.name} onChange={e => setFormDetails({...formDetails, storeKeeper: {...formDetails.storeKeeper!, name: e.target.value}})} className="border-b border-dotted border-slate-800 flex-1 outline-none bg-transparent" disabled={isViewOnly}/></div>
                  </div>
              </div>

              <div className="col-span-4 pr-4">
                  <div className="font-bold mb-4">मालसामान बुझिलिनेको:</div>
                  <div className="space-y-1">
                      <div className="flex gap-2"><span>नाम:</span><input value={formDetails.receiver?.name} onChange={e => setFormDetails({...formDetails, receiver: {...formDetails.receiver!, name: e.target.value}})} className="border-b border-dotted border-slate-800 flex-1 outline-none bg-transparent" disabled={isViewOnly}/></div>
                      <div className="flex gap-1"><span>पद:</span><input value={formDetails.receiver?.designation} onChange={e => setFormDetails({...formDetails, receiver: {...formDetails.receiver!, designation: e.target.value}})} className="border-b border-dotted border-slate-800 flex-1 outline-none bg-transparent" disabled={isViewOnly}/></div>
                      <div className="flex gap-1"><span>मिति:</span><input value={formDetails.receiver?.date} onChange={e => setFormDetails({...formDetails, receiver: {...formDetails.receiver!, date: e.target.value}})} className="border-b border-dotted border-slate-800 flex-1 outline-none bg-transparent" disabled={isViewOnly}/></div>
                  </div>
              </div>

              <div className="col-span-4 px-4">
                  <div className="font-bold mb-4">खर्च निकासा खातामा चढाउने:.......</div>
                  <div className="space-y-1">
                      <div className="flex gap-1"><span>नाम:</span><input value={formDetails.ledgerEntry?.name} onChange={e => setFormDetails({...formDetails, ledgerEntry: {...formDetails.ledgerEntry!, name: e.target.value}})} className="border-b border-dotted border-slate-800 flex-1 outline-none bg-transparent" disabled={isViewOnly}/></div>
                      <div className="flex gap-1"><span>पद:</span><input value={formDetails.ledgerEntry?.designation} onChange={e => setFormDetails({...formDetails, ledgerEntry: {...formDetails.ledgerEntry!, designation: e.target.value}})} className="border-b border-dotted border-slate-800 flex-1 outline-none bg-transparent" disabled={isViewOnly}/></div>
                      <div className="flex gap-1"><span>मिति:</span><input value={formDetails.ledgerEntry?.date} onChange={e => setFormDetails({...formDetails, ledgerEntry: {...formDetails.ledgerEntry!, date: e.target.value}})} className="border-b border-dotted border-slate-800 flex-1 outline-none bg-transparent" disabled={isViewOnly}/></div>
                  </div>
              </div>

              <div className="col-span-4 pl-4">
                  <div className="font-bold mb-4">स्वीकृत गर्ने:.......</div>
                  <div className="space-y-1">
                      <div className="flex gap-1"><span>नाम:</span><input value={formDetails.approvedBy?.name} onChange={e => setFormDetails({...formDetails, approvedBy: {...formDetails.approvedBy!, name: e.target.value}})} className="border-b border-dotted border-slate-800 flex-1 outline-none bg-transparent" disabled={!isAdminOrApproval || isViewOnly}/></div>
                      <div className="flex gap-1"><span>पद:</span><input value={formDetails.approvedBy?.designation} onChange={e => setFormDetails({...formDetails, approvedBy: {...formDetails.approvedBy!, designation: e.target.value}})} className="border-b border-dotted border-slate-800 flex-1 outline-none bg-transparent" disabled={!isAdminOrApproval || isViewOnly}/></div>
                      <div className="flex gap-1"><span>मिति:</span><input value={formDetails.approvedBy?.date} onChange={e => setFormDetails({...formDetails, approvedBy: {...formDetails.approvedBy!, date: e.target.value}})} className="border-b border-dotted border-slate-800 flex-1 outline-none bg-transparent" disabled={!isAdminOrApproval || isViewOnly}/></div>
                  </div>
              </div>
          </div>
       </div>
    </div>
  );
};