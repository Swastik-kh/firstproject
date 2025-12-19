
import React, { useState, useEffect } from 'react';
import { LoginForm } from './components/LoginForm';
import { Dashboard } from './components/Dashboard';
import { APP_NAME, ORG_NAME } from './constants';
import { Landmark, ShieldCheck } from 'lucide-react';
import { User, OrganizationSettings, MagFormEntry, RabiesPatient, PurchaseOrderEntry, IssueReportEntry, FirmEntry, QuotationEntry, InventoryItem, Store, StockEntryRequest, DakhilaPratibedanEntry, ReturnEntry, MarmatEntry, DhuliyaunaEntry, LogBookEntry } from './types';
import { db } from './firebase';
import { ref, onValue, set, remove, update, get } from "firebase/database";

const INITIAL_SETTINGS: OrganizationSettings = {
    orgNameNepali: 'Smart Inventory System',
    orgNameEnglish: 'Smart Inventory System',
    subTitleNepali: 'जिन्सी व्यवस्थापन प्रणाली',
    address: 'City, Nepal',
    phone: '01-XXXXXXX',
    email: 'info@smartinventory.com',
    website: 'www.smartinventory.com',
    panNo: 'XXXXXXXXX',
    defaultVatRate: '13',
    activeFiscalYear: '2081/082',
    enableEnglishDate: 'no',
    logoUrl: ''
};

// superadmin user credentials set to admin / admin
const DEFAULT_ADMIN: User = {
    id: 'superadmin',
    username: 'admin',
    password: 'admin',
    role: 'SUPER_ADMIN',
    organizationName: 'Smart Inventory HQ',
    fullName: 'Administrator',
    designation: 'System Manager',
    phoneNumber: '98XXXXXXXX',
    allowedMenus: ['dashboard', 'inventory', 'settings']
};

const App: React.FC = () => {
  const [users, setUsers] = useState<User[]>([DEFAULT_ADMIN]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentFiscalYear, setCurrentFiscalYear] = useState<string>('2081/082');
  const [generalSettings, setGeneralSettings] = useState<OrganizationSettings>(INITIAL_SETTINGS);
  const [isDbConnected, setIsDbConnected] = useState(false);
  
  // Data States
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [magForms, setMagForms] = useState<MagFormEntry[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrderEntry[]>([]);
  const [issueReports, setIssueReports] = useState<IssueReportEntry[]>([]);
  const [stockEntryRequests, setStockEntryRequests] = useState<StockEntryRequest[]>([]);
  const [dakhilaReports, setDakhilaReports] = useState<DakhilaPratibedanEntry[]>([]);
  const [returnEntries, setReturnEntries] = useState<ReturnEntry[]>([]);
  const [firms, setFirms] = useState<FirmEntry[]>([]);
  const [quotations, setQuotations] = useState<QuotationEntry[]>([]);
  const [rabiesPatients, setRabiesPatients] = useState<RabiesPatient[]>([]);
  const [marmatEntries, setMarmatEntries] = useState<MarmatEntry[]>([]);
  const [dhuliyaunaEntries, setDhuliyaunaEntries] = useState<DhuliyaunaEntry[]>([]);
  const [logBookEntries, setLogBookEntries] = useState<LogBookEntry[]>([]);

  useEffect(() => {
    const connectedRef = ref(db, ".info/connected");
    onValue(connectedRef, (snap) => setIsDbConnected(snap.val() === true));

    // Ensure Default Admin exists in Database automatically
    const adminRef = ref(db, 'users/superadmin');
    get(adminRef).then((snapshot) => {
        if (!snapshot.exists()) {
            set(adminRef, DEFAULT_ADMIN);
        }
    });

    const usersRef = ref(db, 'users');
    onValue(usersRef, (snap) => {
        const data = snap.val();
        const userList = data ? Object.keys(data).map(key => ({ ...data[key], id: key })) : [];
        if (userList.length === 0) {
            setUsers([DEFAULT_ADMIN]);
        } else {
            setUsers(userList);
        }
    });

    const settingsRef = ref(db, 'settings');
    onValue(settingsRef, (snap) => {
        if (snap.val()) setGeneralSettings(snap.val());
    });

    const setupListener = (path: string, setter: Function) => {
        onValue(ref(db, path), (snap) => {
            const data = snap.val();
            setter(data ? Object.keys(data).map(key => ({ ...data[key], id: key })) : []);
        });
    };

    setupListener('inventory', setInventoryItems);
    setupListener('stores', setStores);
    setupListener('magForms', setMagForms);
    setupListener('purchaseOrders', setPurchaseOrders);
    setupListener('issueReports', setIssueReports);
    setupListener('stockRequests', setStockEntryRequests);
    setupListener('dakhilaReports', setDakhilaReports);
    setupListener('returnEntries', setReturnEntries);
    setupListener('firms', setFirms);
    setupListener('quotations', setQuotations);
    setupListener('rabiesPatients', setRabiesPatients);
    setupListener('marmatEntries', setMarmatEntries);
    setupListener('disposalEntries', setDhuliyaunaEntries);
    setupListener('logBook', setLogBookEntries);
  }, []);

  const handleLoginSuccess = (user: User, fiscalYear: string) => {
    setCurrentUser(user);
    setCurrentFiscalYear(fiscalYear);
  };

  return (
    <>
      {currentUser ? (
        <Dashboard 
          onLogout={() => setCurrentUser(null)} 
          currentUser={currentUser}
          currentFiscalYear={currentFiscalYear} 
          users={users}
          onAddUser={(u) => set(ref(db, `users/${u.id}`), u)}
          onUpdateUser={(u) => set(ref(db, `users/${u.id}`), u)}
          onDeleteUser={(id) => remove(ref(db, `users/${id}`))}
          onChangePassword={(id, pass) => update(ref(db, `users/${id}`), { password: pass })}
          generalSettings={generalSettings}
          onUpdateGeneralSettings={(s) => set(ref(db, 'settings'), s)}
          magForms={magForms}
          onSaveMagForm={(f) => set(ref(db, `magForms/${f.id}`), f)}
          purchaseOrders={purchaseOrders}
          onUpdatePurchaseOrder={(o) => set(ref(db, `purchaseOrders/${o.id}`), o)}
          issueReports={issueReports}
          onUpdateIssueReport={(r) => set(ref(db, `issueReports/${r.id}`), r)}
          rabiesPatients={rabiesPatients}
          onAddRabiesPatient={(p) => set(ref(db, `rabiesPatients/${p.id}`), p)}
          onUpdateRabiesPatient={(p) => set(ref(db, `rabiesPatients/${p.id}`), p)}
          onDeleteRabiesPatient={(id) => {
            const patientRef = ref(db, `rabiesPatients/${id}`);
            remove(patientRef).catch(err => console.error("Error deleting patient:", err));
          }}
          firms={firms}
          onAddFirm={(f) => set(ref(db, `firms/${f.id}`), f)}
          quotations={quotations}
          onAddQuotation={(q) => set(ref(db, `quotations/${q.id}`), q)}
          inventoryItems={inventoryItems}
          onAddInventoryItem={(i) => set(ref(db, `inventory/${i.id}`), i)}
          onUpdateInventoryItem={(i) => set(ref(db, `inventory/${i.id}`), i)}
          stockEntryRequests={stockEntryRequests}
          onRequestStockEntry={(r) => set(ref(db, `stockRequests/${r.id}`), r)}
          onApproveStockEntry={(id, app) => update(ref(db, `stockRequests/${id}`), { status: 'Approved', approvedBy: app })}
          onRejectStockEntry={(id, res, app) => update(ref(db, `stockRequests/${id}`), { status: 'Rejected', rejectionReason: res, approvedBy: app })}
          stores={stores}
          onAddStore={(s) => set(ref(db, `stores/${s.id}`), s)}
          onUpdateStore={(s) => set(ref(db, `stores/${s.id}`), s)}
          onDeleteStore={(id) => remove(ref(db, `stores/${id}`))}
          dakhilaReports={dakhilaReports}
          onSaveDakhilaReport={(r) => set(ref(db, `dakhilaReports/${r.id}`), r)}
          returnEntries={returnEntries}
          onSaveReturnEntry={(e) => set(ref(db, `returnEntries/${e.id}`), e)}
          marmatEntries={marmatEntries}
          onSaveMarmatEntry={(e) => set(ref(db, `marmatEntries/${e.id}`), e)}
          dhuliyaunaEntries={dhuliyaunaEntries}
          onSaveDhuliyaunaEntry={(e) => set(ref(db, `disposalEntries/${e.id}`), e)}
          logBookEntries={logBookEntries}
          onSaveLogBookEntry={(e) => set(ref(db, `logBook/${e.id}`), e)}
          onClearData={(p) => remove(ref(db, p))}
        />
      ) : (
        <div className="min-h-screen w-full bg-[#f8fafc] flex items-center justify-center p-6 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px]">
          <div className="w-full max-w-[440px] animate-in fade-in zoom-in-95 duration-500">
            <div className="bg-white rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.08)] overflow-hidden border border-slate-100">
              <div className="bg-primary-600 p-12 text-center text-white relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <path d="M0 100 C 20 0 50 0 100 100 Z" fill="currentColor"></path>
                    </svg>
                </div>
                <div className="relative z-10">
                    <div className="bg-white/20 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 backdrop-blur-md shadow-inner border border-white/30">
                        <Landmark className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-extrabold font-nepali tracking-tight mb-2">{APP_NAME}</h1>
                    <p className="text-primary-100 font-semibold tracking-wide uppercase text-xs">जिन्सी व्यवस्थापन पोर्टल</p>
                </div>
              </div>
              <div className="p-10">
                <LoginForm 
                    users={users} 
                    onLoginSuccess={handleLoginSuccess} 
                    initialFiscalYear={generalSettings.activeFiscalYear} 
                />
              </div>
              <div className="bg-slate-50 p-5 text-center border-t border-slate-100 flex items-center justify-center gap-3">
                 <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow-sm border border-slate-200">
                    <span className={`w-2 h-2 rounded-full ${isDbConnected ? 'bg-green-50 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-50 animate-pulse'}`}></span>
                    <span className="text-[11px] text-slate-600 font-bold uppercase tracking-wider">{isDbConnected ? 'System Online' : 'System Offline'}</span>
                 </div>
                 <div className="flex items-center gap-1.5 text-slate-400">
                    <ShieldCheck size={14} />
                    <span className="text-[11px] font-medium">Secure Access</span>
                 </div>
              </div>
            </div>
            <p className="text-center mt-8 text-slate-400 text-xs font-medium uppercase tracking-widest">
                &copy; {new Date().getFullYear()} Smart Inventory Solutions
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default App;
