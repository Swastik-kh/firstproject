import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, Printer, Save, Calendar, CheckCircle2, Send, Clock, FileText, Download, ShieldCheck, CheckCheck, Eye, Search, X, AlertCircle, Store as StoreIcon, Layers } from 'lucide-react';
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

export const MagFaram: React.FC<MagFaramProps> = ({ currentFiscalYear, currentUser, existingForms, onSave, inventoryItems, stores = [], generalSettings }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isViewOnly, setIsViewOnly] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [items, setItems] = useState<MagItem[]>([{ id: Date.now(), name: '', specification: '', unit: '', quantity: '', remarks: '' }]);
  const [formDetails, setFormDetails] = useState({
    fiscalYear: currentFiscalYear,
    formNo: 1,
    date: '',
    status: 'Pending' as any,
    demandBy: { name: currentUser.fullName, designation: currentUser.designation, date: '', purpose: '' },
    recommendedBy: { name: '', designation: '', date: '' },
    storeKeeper: { status: '', name: '', },
    receiver: { name: '', designation: '', date: '' },
    ledgerEntry: { name: '', date: '' },
    approvedBy: { name: '', designation: '', date: '' }
  });

  const itemOptions = useMemo(() => inventoryItems.map(item => ({
    id: item.id,
    value: item.itemName,
    label: `${item.itemName} (${item.unit}) - Qty: ${item.currentQuantity}`
  })), [inventoryItems]);

  const handleAddItem = () => setItems([...items, { id: Date.now(), name: '', specification: '', unit: '', quantity: '', remarks: '' }]);
  const handleRemoveItem = (id: number) => items.length > 1 && setItems(items.filter(i => i.id !== id));
  const updateItem = (id: number, field: keyof MagItem, value: string) => setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));

  const handleSave = () => {
    if (!formDetails.date) { alert("Please select date"); return; }
    const newForm: MagFormEntry = {
        id: editingId || Date.now().toString(),
        ...formDetails,
        items,
        status: editingId ? (currentUser.role === 'STOREKEEPER' ? 'Verified' : 'Approved') : 'Pending'
    };
    onSave(newForm);
    alert("Saved Successfully");
    handleReset();
  };

  const handleReset = () => {
    setEditingId(null);
    setIsViewOnly(false);
    setItems([{ id: Date.now(), name: '', specification: '', unit: '', quantity: '', remarks: '' }]);
    setFormDetails({
        fiscalYear: currentFiscalYear,
        formNo: 1,
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

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 no-print">
          <h2 className="font-bold text-slate-700 font-nepali">माग फारम (Mag Faram)</h2>
          <div className="flex gap-2">
            {!isViewOnly && <button onClick={handleAddItem} className="px-4 py-2 bg-slate-100 rounded-lg text-sm font-medium"><Plus size={18} /></button>}
            <button onClick={handleSave} className="px-6 py-2 bg-primary-600 text-white rounded-lg font-medium shadow-sm">Save</button>
            <button onClick={() => window.print()} className="px-4 py-2 bg-slate-800 text-white rounded-lg"><Printer size={18} /></button>
          </div>
       </div>

       <div id="mag-form-print" className="bg-white p-8 rounded-xl shadow-lg max-w-[210mm] mx-auto min-h-[297mm] font-nepali text-sm">
          <div className="text-right font-bold text-xs mb-4">म.ले.प.फारम नं: ४०१</div>
          <div className="text-center mb-8">
              <h1 className="text-xl font-bold text-red-600">{generalSettings.orgNameNepali}</h1>
              <h2 className="text-lg font-bold">माग फारम</h2>
          </div>

          <div className="flex justify-between mb-4">
              <div>आ.व.: {currentFiscalYear}</div>
              <div>मिति: {formDetails.date || '..../../..'}</div>
          </div>

          <table className="w-full border-collapse border border-slate-900">
              <thead>
                  <tr className="bg-slate-50">
                      <th className="border border-slate-900 p-2">क्र.सं.</th>
                      <th className="border border-slate-900 p-2">सामानको नाम</th>
                      <th className="border border-slate-900 p-2">एकाई</th>
                      <th className="border border-slate-900 p-2">परिमाण</th>
                      <th className="border border-slate-900 p-2">कैफियत</th>
                  </tr>
              </thead>
              <tbody>
                  {items.map((item, idx) => (
                      <tr key={item.id}>
                          <td className="border border-slate-900 p-2 text-center">{idx + 1}</td>
                          <td className="border border-slate-900 p-1">
                              <SearchableSelect options={itemOptions} value={item.name} onChange={val => updateItem(item.id, 'name', val)} onSelect={opt => updateItem(item.id, 'unit', opt.itemData.unit)} className="border-none" />
                          </td>
                          <td className="border border-slate-900 p-2 text-center">{item.unit}</td>
                          <td className="border border-slate-900 p-1"><input value={item.quantity} onChange={e => updateItem(item.id, 'quantity', e.target.value)} className="w-full text-center outline-none" /></td>
                          <td className="border border-slate-900 p-1"><input value={item.remarks} onChange={e => updateItem(item.id, 'remarks', e.target.value)} className="w-full outline-none" /></td>
                      </tr>
                  ))}
              </tbody>
          </table>

          <div className="grid grid-cols-3 gap-8 mt-12">
              <div>
                  <div className="font-bold mb-8">माग गर्ने:</div>
                  <div className="border-t border-slate-400 text-xs pt-1">{currentUser.fullName}</div>
              </div>
              <div>
                  <div className="font-bold mb-8">सिफारिस गर्ने:</div>
                  <div className="border-t border-slate-400 text-xs pt-1">....................</div>
              </div>
              <div>
                  <div className="font-bold mb-8">स्वीकृत गर्ने:</div>
                  <div className="border-t border-slate-400 text-xs pt-1">....................</div>
              </div>
          </div>
       </div>
    </div>
  );
};