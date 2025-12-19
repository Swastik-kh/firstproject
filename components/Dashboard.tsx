
import React, { useState, useMemo } from 'react';
import { 
  LogOut, Menu, Calendar, Stethoscope, Package, FileText, Settings, LayoutDashboard, 
  ChevronDown, ChevronRight, Syringe, Activity, 
  ClipboardList, FileSpreadsheet, FilePlus, ShoppingCart, FileOutput, 
  BookOpen, Book, Archive, RotateCcw, Wrench, Scroll, BarChart3,
  Sliders, Store, ShieldCheck, Users, Database, KeyRound, UserCog, Lock, Warehouse, ClipboardCheck, Bell, X, CheckCircle2, ArrowRightCircle, AlertTriangle, Pill, Scissors, Clock, Calculator, Trash2 
} from 'lucide-react';
import { APP_NAME, ORG_NAME, FISCAL_YEARS } from '../constants';
import { DashboardProps, PurchaseOrderEntry, InventoryItem } from '../types'; 
import { UserManagement } from './UserManagement';
import { ChangePassword } from './ChangePassword';
import { TBPatientRegistration } from './TBPatientRegistration';
import { RabiesRegistration } from './RabiesRegistration';
import { RabiesReport } from './RabiesReport';
import { MagFaram } from './MagFaram';
import { KharidAdesh } from './KharidAdesh';
import { NikashaPratibedan } from './NikashaPratibedan';
import { FirmListing } from './FirmListing'; 
import { Quotation } from './Quotation'; 
import { JinshiMaujdat } from './JinshiMaujdat'; 
import { StoreSetup } from './StoreSetup'; 
import { InventoryMonthlyReport } from './InventoryMonthlyReport'; 
import { StockEntryApproval } from './StockEntryApproval'; 
import { DakhilaPratibedan } from './DakhilaPratibedan'; 
import { SahayakJinshiKhata } from './SahayakJinshiKhata'; 
import { JinshiFirtaFaram } from './JinshiFirtaFaram'; 
import { MarmatAdesh } from './MarmatAdesh';
import { JinshiKhata } from './JinshiKhata'; 
import { DatabaseManagement } from './DatabaseManagement';
import { DhuliyaunaFaram } from './DhuliyaunaFaram';
import { LogBook } from './LogBook';
import { GeneralSetting } from './GeneralSetting';

export const Dashboard: React.FC<DashboardProps> = ({ 
  onLogout, 
  currentUser, 
  currentFiscalYear,
  users,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  onChangePassword,
  generalSettings,
  onUpdateGeneralSettings,
  magForms,
  onSaveMagForm,
  purchaseOrders,
  onUpdatePurchaseOrder,
  issueReports,
  onUpdateIssueReport, 
  rabiesPatients,
  onAddRabiesPatient,
  onUpdateRabiesPatient,
  firms,
  onAddFirm,
  quotations,
  onAddQuotation,
  inventoryItems,
  onAddInventoryItem,
  onUpdateInventoryItem,
  stockEntryRequests,
  onRequestStockEntry,
  onApproveStockEntry,
  onRejectStockEntry,
  stores,
  onAddStore,
  onUpdateStore,
  onDeleteStore,
  dakhilaReports,
  onSaveDakhilaReport,
  returnEntries,
  onSaveReturnEntry,
  marmatEntries,
  onSaveMarmatEntry,
  dhuliyaunaEntries,
  onSaveDhuliyaunaEntry,
  logBookEntries,
  onSaveLogBookEntry,
  onClearData
}) => {
  const fiscalYearLabel = FISCAL_YEARS.find(fy => fy.value === currentFiscalYear)?.label || currentFiscalYear;

  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const [expandedSubMenu, setExpandedSubMenu] = useState<string | null>(null);
  const [activeItem, setActiveItem] = useState<string>('dashboard');
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [pendingPoDakhila, setPendingPoDakhila] = useState<PurchaseOrderEntry | null>(null);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [lastSeenNotificationId, setLastSeenNotificationId] = useState<string | null>(null);
  const [expiryModalInfo, setExpiryModalInfo] = useState<{title: string, items: InventoryItem[]} | null>(null);

  const latestApprovedDakhila = useMemo(() => {
      const approved = stockEntryRequests.filter(req => req.status === 'Approved');
      if (approved.length > 0) {
          return approved.sort((a, b) => parseInt(b.id) - parseInt(a.id))[0];
      }
      return null;
  }, [stockEntryRequests]);

  const handleNotificationClick = () => {
      if (latestApprovedDakhila) {
          setLastSeenNotificationId(latestApprovedDakhila.id);
          setShowNotificationModal(true);
      }
  };

  interface MenuItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    subItems?: MenuItem[];
    badgeCount?: number; 
  }

  const pendingStockRequestsCount = stockEntryRequests.filter(r => r.status === 'Pending').length;
  
  // Calculate Pending Mag Forms based on role
  const magFaramBadgeCount = useMemo(() => {
      if (currentUser.role === 'STOREKEEPER') {
          return magForms.filter(f => f.status === 'Pending').length;
      }
      if (['ADMIN', 'SUPER_ADMIN', 'APPROVAL'].includes(currentUser.role)) {
          return magForms.filter(f => f.status === 'Verified').length;
      }
      return 0;
  }, [magForms, currentUser.role]);

  const allMenuItems: MenuItem[] = [
    { 
      id: 'dashboard', 
      label: 'ड्यासबोर्ड (Dashboard)', 
      icon: <LayoutDashboard size={20} /> 
    },
    { 
      id: 'services', 
      label: 'सेवा (Services)', 
      icon: <Stethoscope size={20} />,
      subItems: [
        { 
          id: 'tb_leprosy', 
          label: 'क्षयरोग/कुष्ठरोग (TB/Leprosy)',
          icon: <Activity size={16} />
        },
        { 
          id: 'rabies', 
          label: 'रेबिज खोप क्लिनिक (Rabies Vaccine)',
          icon: <Syringe size={16} />
        }
      ]
    },
    { 
      id: 'inventory', 
      label: 'जिन्सी व्यवस्थापन (Inventory)', 
      icon: <Package size={20} />,
      subItems: [
        { id: 'stock_entry_approval', label: 'स्टक प्रविष्टि अनुरोध (Stock Requests)', icon: <ClipboardCheck size={16} />, badgeCount: pendingStockRequestsCount }, 
        { id: 'jinshi_maujdat', label: 'जिन्सी मौज्दात (Inventory Stock)', icon: <Warehouse size={16} /> }, 
        { id: 'form_suchikaran', label: 'फर्म सुचीकरण (Firm Listing)', icon: <ClipboardList size={16} /> },
        { id: 'quotation', label: 'सामानको कोटेशन (Quotation)', icon: <FileSpreadsheet size={16} /> },
        { id: 'mag_faram', label: 'माग फारम (Demand Form)', icon: <FilePlus size={16} />, badgeCount: magFaramBadgeCount },
        { id: 'kharid_adesh', label: 'खरिद आदेश (Purchase Order)', icon: <ShoppingCart size={16} /> },
        { id: 'nikasha_pratibedan', label: 'निकासा प्रतिवेदन (Issue Report)', icon: <FileOutput size={16} /> },
        { id: 'sahayak_jinshi_khata', label: 'सहायक जिन्सी खाता (Sub. Ledger)', icon: <BookOpen size={16} /> },
        { id: 'jinshi_khata', label: 'जिन्सी खाता (Inventory Ledger)', icon: <Book size={16} /> },
        { id: 'dakhila_pratibedan', label: 'दाखिला प्रतिवेदन (Entry Report)', icon: <Archive size={16} /> },
        { id: 'jinshi_firta_khata', label: 'जिन्सी फिर्ता खाता (Return Ledger)', icon: <RotateCcw size={16} /> },
        { id: 'marmat_adesh', label: 'मर्मत आवेदन/आदेश (Maintenance)', icon: <Wrench size={16} /> },
        { id: 'dhuliyauna_faram', label: 'लिलाम / धुल्याउने (Disposal)', icon: <Trash2 size={16} /> },
        { id: 'log_book', label: 'लग बुक (Log Book)', icon: <Scroll size={16} /> },
      ]
    },
    { 
      id: 'report', 
      label: 'रिपोर्ट (Report)', 
      icon: <FileText size={20} />,
      subItems: [
        { id: 'report_tb_leprosy', label: 'क्षयरोग/कुष्ठरोग रिपोर्ट (TB/Leprosy)', icon: <Activity size={16} /> },
        { id: 'report_rabies', label: 'रेबिज रिपोर्ट (Rabies Report)', icon: <Syringe size={16} /> },
        { id: 'report_inventory_monthly', label: 'जिन्सी मासिक प्रतिवेदन (Monthly Report)', icon: <BarChart3 size={16} /> }
      ]
    },
    { 
      id: 'settings', 
      label: 'सेटिङ (Settings)', 
      icon: <Settings size={20} />,
      subItems: [
        { id: 'general_setting', label: 'सामान्य सेटिङ (General Setting)', icon: <Sliders size={16} /> },
        { id: 'store_setup', label: 'स्टोर सेटअप (Store Setup)', icon: <Store size={16} /> }, 
        { 
            id: 'prayog_setup', 
            label: 'प्रयोग सेटअप (Prayog Setup)', 
            icon: <UserCog size={16} />,
            subItems: [
                { id: 'user_management', label: 'प्रयोगकर्ता सेटअप (User Setup)', icon: <Users size={16} /> },
            ]
        },
        { 
            id: 'security', 
            label: 'सुरक्षा (Security)', 
            icon: <ShieldCheck size={16} />,
            subItems: [
                { id: 'change_password', label: 'पासवर्ड परिवर्तन (Change Password)', icon: <KeyRound size={16} /> }
            ]
        },
        { id: 'database_management', label: 'डाटाबेस व्यवस्थापन (Database Management)', icon: <Database size={16} /> },
      ]
    },
  ];

  const menuItems = allMenuItems.reduce<MenuItem[]>((acc, item) => {
    if (item.id === 'dashboard') {
      acc.push(item);
      return acc;
    }

    if (item.id === 'settings') {
      const isSuperOrAdmin = currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'ADMIN';
      
      const allowedSubItems = item.subItems?.filter(subItem => {
        if (subItem.id === 'security') return true; 
        if (subItem.id === 'store_setup') return isSuperOrAdmin; 
        return isSuperOrAdmin; 
      });

      if (allowedSubItems && allowedSubItems.length > 0) {
        acc.push({ ...item, subItems: allowedSubItems });
      }
      return acc;
    }

    const isSuperOrAdmin = currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'ADMIN';
    if (isSuperOrAdmin) {
      acc.push(item);
      return acc;
    }

    const allowedMenus = currentUser.allowedMenus || [];
    const isParentAllowed = allowedMenus.includes(item.id);

    let filteredSubItems: MenuItem[] = [];
    if (item.subItems) {
      if (isParentAllowed) {
        filteredSubItems = item.subItems.filter(subItem => {
             if (subItem.id === 'stock_entry_approval') {
                 return ['ADMIN', 'SUPER_ADMIN', 'APPROVAL'].includes(currentUser.role);
             }
             return true;
        });
      } else {
        filteredSubItems = item.subItems.filter(subItem => {
             if (subItem.id === 'stock_entry_approval') {
                 return ['ADMIN', 'SUPER_ADMIN', 'APPROVAL'].includes(currentUser.role) && allowedMenus.includes(subItem.id);
             }
             return allowedMenus.includes(subItem.id)
        });
      }
    }

    if (isParentAllowed || filteredSubItems.length > 0) {
      const newItem = { ...item };
      if (filteredSubItems.length > 0) {
        newItem.subItems = filteredSubItems;
      }
      acc.push(newItem);
    }
    
    return acc;
  }, []);

  const handleMenuClick = (item: MenuItem) => {
    if (item.subItems) {
      setExpandedMenu(expandedMenu === item.id ? null : item.id);
    } else {
      setActiveItem(item.id);
      setExpandedMenu(null);
      setExpandedSubMenu(null);
      setIsSidebarOpen(false); 
    }
  };

  const handleSubItemClick = (subItemId: string) => {
    setActiveItem(subItemId);
    setIsSidebarOpen(false); 
  };

  const handleLevel3Click = (subItemId: string) => {
    setExpandedSubMenu(expandedSubMenu === subItemId ? null : subItemId);
  };

  const getActiveLabel = () => {
    const findLabel = (items: MenuItem[]): string | undefined => {
      for (const item of items) {
        if (item.id === activeItem) return item.label;
        if (item.subItems) {
          const childLabel = findLabel(item.subItems);
          if (childLabel) return childLabel;
        }
      }
      return undefined;
    };
    return findLabel(allMenuItems) || activeItem;
  };

  const handleDakhilaFromPo = (po: PurchaseOrderEntry) => {
      setPendingPoDakhila(po);
      setActiveItem('jinshi_maujdat');
  };

  const renderContent = () => {
    switch (activeItem) {
      case 'general_setting':
        return <GeneralSetting settings={generalSettings} onUpdateSettings={onUpdateGeneralSettings} />;
      case 'dashboard':
        // ... Statistics logic
        const totalRabiesRegistered = rabiesPatients.length;
        const todayDate = new Date().toISOString().split('T')[0];
        let totalScheduledToday = 0;
        let visitedToday = 0;
        let totalPendingVisits = 0;
        rabiesPatients.forEach(p => {
            const doseToday = p.schedule.find(d => d.date === todayDate);
            if (doseToday) {
                totalScheduledToday++;
                if (doseToday.status === 'Given') visitedToday++;
            }
            const pendingForPatient = p.schedule.filter(s => s.status === 'Pending').length;
            totalPendingVisits += pendingForPatient;
        });
        const dosesPerVisit = 2;
        const dosesPerVial10 = 10;
        const dosesPerVial5 = 5;
        const totalDosesNeeded = totalPendingVisits * dosesPerVisit;
        const estimatedVialsNeeded10 = Math.ceil(totalDosesNeeded / dosesPerVial10);
        const estimatedVialsNeeded5 = Math.ceil(totalDosesNeeded / dosesPerVial5);
        const today = new Date();
        const threeMonthsFromNow = new Date();
        threeMonthsFromNow.setMonth(today.getMonth() + 3);
        const isExpiringSoon = (expiryDateAd?: string) => {
            if (!expiryDateAd) return false;
            const exp = new Date(expiryDateAd);
            return exp >= today && exp <= threeMonthsFromNow;
        };
        const expiringMedicines = inventoryItems.filter(item => {
            const isMed = item.itemClassification?.toLowerCase().includes('medicine') || item.itemClassification?.toLowerCase().includes('aausadi');
            return isMed && isExpiringSoon(item.expiryDateAd);
        });
        const expiringSurgicals = inventoryItems.filter(item => {
            const isSurg = item.itemClassification?.toLowerCase().includes('surgical');
            return isSurg && isExpiringSoon(item.expiryDateAd);
        });
        const isAdminOrApproval = ['ADMIN', 'SUPER_ADMIN', 'APPROVAL'].includes(currentUser.role);
        const isStoreKeeper = currentUser.role === 'STOREKEEPER';
        const isAccount = currentUser.role === 'ACCOUNT';
        
        let pendingMagFormsCount = 0;
        if (isStoreKeeper) {
            pendingMagFormsCount = magForms.filter(f => f.status === 'Pending').length;
        } else if (isAdminOrApproval) {
            pendingMagFormsCount = magForms.filter(f => f.status === 'Verified').length;
        }

        let pendingPurchaseOrders = 0;
        let pendingIssueReports = 0;
        let pendingStockEntries = 0;
        if (isAdminOrApproval) {
            pendingPurchaseOrders = purchaseOrders.filter(p => p.status === 'Account Verified').length;
            pendingIssueReports = issueReports.filter(r => r.status === 'Pending Approval').length;
            pendingStockEntries = stockEntryRequests.filter(s => s.status === 'Pending').length;
        } else if (isAccount) {
            pendingPurchaseOrders = purchaseOrders.filter(p => p.status === 'Pending Account').length;
        }
        return (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                <div>
                    <div className="flex items-center gap-3 border-b border-slate-200 pb-4 mb-6">
                        <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                            <Activity size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800 font-nepali">मुख्य जानकारी (General Overview)</h2>
                            <p className="text-sm text-slate-500">संस्थाको हालको अवस्था</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white p-5 rounded-xl border border-indigo-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Syringe size={80} className="text-indigo-600" />
                            </div>
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600 group-hover:bg-indigo-100 transition-colors">
                                    <Syringe size={24} />
                                </div>
                            </div>
                            <h3 className="text-3xl font-bold text-slate-800 mb-1">{totalRabiesRegistered}</h3>
                            <p className="text-sm font-medium text-slate-500 font-nepali">रेबिज खोप दर्ता संख्या</p>
                            <p className="text-xs text-slate-400 mt-1">Total Rabies Registered</p>
                        </div>
                        <div className="bg-white p-5 rounded-xl border border-teal-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Clock size={80} className="text-teal-600" />
                            </div>
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-teal-50 rounded-lg text-teal-600 group-hover:bg-teal-100 transition-colors">
                                    <Clock size={24} />
                                </div>
                                {(totalScheduledToday > 0 && totalScheduledToday > visitedToday) && (
                                    <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                                        Action Needed
                                    </span>
                                )}
                            </div>
                            <h3 className="text-3xl font-bold text-slate-800 mb-1">
                                <span className="text-green-600">{visitedToday}</span> / {totalScheduledToday}
                            </h3>
                            <p className="text-sm font-medium text-slate-500 font-nepali">आजको खोप (आएको / आउनुपर्ने)</p>
                            <p className="text-xs text-slate-400 mt-1">Today's Visits (Visited / Scheduled)</p>
                        </div>
                        {(isStoreKeeper || isAdminOrApproval) && (
                            <div className="bg-white p-5 rounded-xl border border-blue-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Calculator size={80} className="text-blue-600" />
                                </div>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-blue-50 rounded-lg text-blue-600 group-hover:bg-blue-100 transition-colors">
                                        <Calculator size={24} />
                                    </div>
                                    <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                        Stock Est.
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex justify-between items-end">
                                        <span className="text-sm text-slate-600 font-nepali">बाँकी फलोअप:</span>
                                        <span className="font-bold text-slate-800">{totalPendingVisits}</span>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <span className="text-sm text-slate-600 font-nepali">आवश्यक डोज:</span>
                                        <span className="font-bold text-slate-800">{totalDosesNeeded}</span>
                                    </div>
                                    <div className="border-t border-slate-100 my-2 pt-2 space-y-1">
                                        <div className="flex justify-between items-end">
                                            <span className="text-sm font-bold text-blue-700 font-nepali">अनुमानित भायल:</span>
                                            <span className="text-lg font-bold text-blue-700">{estimatedVialsNeeded10}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div 
                            onClick={() => setExpiryModalInfo({ title: 'म्याद सकिन लागेको औषधि (Expiring Medicines)', items: expiringMedicines })}
                            className="bg-white p-5 rounded-xl border border-red-100 shadow-sm hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                <AlertTriangle size={80} className="text-red-600" />
                            </div>
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-red-50 rounded-lg text-red-600 group-hover:bg-red-100 transition-colors">
                                    <Pill size={24} />
                                </div>
                            </div>
                            <h3 className="text-3xl font-bold text-slate-800 mb-1">{expiringMedicines.length}</h3>
                            <p className="text-sm font-medium text-slate-500 font-nepali">म्याद सकिन लागेको औषधि</p>
                        </div>
                    </div>
                </div>
                {(isAdminOrApproval || isAccount || isStoreKeeper) && (
                    <div className="mt-8 pt-4 border-t border-slate-200">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                                <LayoutDashboard size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-800 font-nepali">
                                    कार्यवाही आवश्यक (Actions Pending)
                                </h2>
                                <p className="text-sm text-slate-500">तपाईंको भूमिका अनुसार कारबाहीको लागि अनुरोधहरू</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {(isAdminOrApproval || isStoreKeeper) && (
                                <div 
                                    onClick={() => setActiveItem('mag_faram')}
                                    className="bg-white p-5 rounded-xl border border-blue-100 shadow-sm hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <FilePlus size={60} className="text-blue-600" />
                                    </div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-blue-50 rounded-lg text-blue-600 group-hover:bg-blue-100 transition-colors">
                                            <FilePlus size={24} />
                                        </div>
                                        {pendingMagFormsCount > 0 && (
                                            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                                                {pendingMagFormsCount} Pending
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-800 mb-1">{pendingMagFormsCount}</h3>
                                    <p className="text-sm font-medium text-slate-500 font-nepali">
                                        {isStoreKeeper ? 'माग फारम प्रमाणिकरण अनुरोध' : 'माग फारम स्वीकृत अनुरोध'}
                                    </p>
                                    <div className="mt-4 flex items-center gap-2 text-xs font-bold text-blue-600 group-hover:gap-3 transition-all">
                                        <span>View Requests</span>
                                        <ArrowRightCircle size={14} />
                                    </div>
                                </div>
                            )}
                            {/* ... Other admin action boxes */}
                        </div>
                    </div>
                )}
            </div>
        );
      case 'user_management':
        return (
          <UserManagement 
            currentUser={currentUser}
            users={users}
            onAddUser={onAddUser}
            onUpdateUser={onUpdateUser}
            onDeleteUser={onDeleteUser}
          />
        );
      case 'change_password':
        return (
          <ChangePassword 
            currentUser={currentUser}
            users={users}
            onChangePassword={onChangePassword}
          />
        );
      case 'store_setup':
        return (
          <StoreSetup
            currentFiscalYear={currentFiscalYear}
            stores={stores}
            onAddStore={onAddStore}
            onUpdateStore={onUpdateStore}
            onDeleteStore={onDeleteStore}
            inventoryItems={inventoryItems} 
            onUpdateInventoryItem={onUpdateInventoryItem} 
          />
        );
      case 'tb_leprosy':
        return (
          <TBPatientRegistration 
            currentFiscalYear={currentFiscalYear}
          />
        );
      case 'rabies':
        return (
          <RabiesRegistration 
            currentFiscalYear={currentFiscalYear}
            patients={rabiesPatients}
            onAddPatient={onAddRabiesPatient}
            onUpdatePatient={onUpdateRabiesPatient}
          />
        );
      case 'report_rabies':
        return (
          <RabiesReport 
            currentFiscalYear={currentFiscalYear}
            currentUser={currentUser}
            patients={rabiesPatients}
          />
        );
      case 'mag_faram':
        return (
          <MagFaram 
             currentFiscalYear={currentFiscalYear}
             currentUser={currentUser}
             existingForms={magForms}
             onSave={onSaveMagForm}
             inventoryItems={inventoryItems} 
             stores={stores} 
             generalSettings={generalSettings}
          />
        );
      case 'kharid_adesh':
        return (
            <KharidAdesh 
                orders={purchaseOrders}
                currentFiscalYear={currentFiscalYear}
                onSave={onUpdatePurchaseOrder}
                currentUser={currentUser}
                firms={firms} 
                quotations={quotations} 
                onDakhilaClick={handleDakhilaFromPo}
                generalSettings={generalSettings} 
            />
        );
      case 'nikasha_pratibedan':
        return (
            <NikashaPratibedan 
                reports={issueReports}
                onSave={onUpdateIssueReport} 
                currentUser={currentUser}
                currentFiscalYear={currentFiscalYear}
                generalSettings={generalSettings}
            />
        );
      case 'form_suchikaran': 
        return (
            <FirmListing
                currentFiscalYear={currentFiscalYear}
                firms={firms}
                onAddFirm={onAddFirm}
            />
        );
      case 'quotation': 
        return (
            <Quotation
                currentFiscalYear={currentFiscalYear}
                firms={firms}
                quotations={quotations}
                onAddQuotation={onAddQuotation}
                inventoryItems={inventoryItems} 
            />
        );
      case 'jinshi_maujdat': 
        return (
            <JinshiMaujdat
                currentFiscalYear={currentFiscalYear}
                currentUser={currentUser} 
                inventoryItems={inventoryItems}
                onAddInventoryItem={onAddInventoryItem}
                onUpdateInventoryItem={onUpdateInventoryItem}
                stores={stores}
                onRequestStockEntry={onRequestStockEntry}
                pendingPoDakhila={pendingPoDakhila} 
                onClearPendingPoDakhila={() => setPendingPoDakhila(null)} 
            />
        );
      case 'stock_entry_approval':
        return (
            <StockEntryApproval
                requests={stockEntryRequests}
                currentUser={currentUser}
                onApprove={onApproveStockEntry}
                onReject={onRejectStockEntry}
                stores={stores}
            />
        );
      case 'dakhila_pratibedan':
        return (
            <DakhilaPratibedan 
                dakhilaReports={dakhilaReports}
                onSaveDakhilaReport={onSaveDakhilaReport}
                currentFiscalYear={currentFiscalYear}
                currentUser={currentUser}
                stockEntryRequests={stockEntryRequests}
                onApproveStockEntry={onApproveStockEntry}
                onRejectStockEntry={onRejectStockEntry}
                generalSettings={generalSettings}
            />
        );
      case 'sahayak_jinshi_khata': 
        return (
            <SahayakJinshiKhata
                currentFiscalYear={currentFiscalYear}
                currentUser={currentUser}
                inventoryItems={inventoryItems}
                issueReports={issueReports}
                dakhilaReports={dakhilaReports}
                users={users} 
                returnEntries={returnEntries}
                generalSettings={generalSettings} 
            />
        );
      case 'jinshi_khata':
        return (
            <JinshiKhata
                currentFiscalYear={currentFiscalYear}
                inventoryItems={inventoryItems}
                issueReports={issueReports}
                dakhilaReports={dakhilaReports}
                returnEntries={returnEntries}
                generalSettings={generalSettings}
            />
        );
      case 'jinshi_firta_khata':
        return (
            <JinshiFirtaFaram
                currentFiscalYear={currentFiscalYear}
                currentUser={currentUser}
                inventoryItems={inventoryItems}
                returnEntries={returnEntries}
                onSaveReturnEntry={onSaveReturnEntry}
                issueReports={issueReports}
                generalSettings={generalSettings}
            />
        );
      case 'marmat_adesh':
        return (
            <MarmatAdesh
                currentFiscalYear={currentFiscalYear}
                currentUser={currentUser}
                marmatEntries={marmatEntries}
                onSaveMarmatEntry={onSaveMarmatEntry}
                inventoryItems={inventoryItems} 
                generalSettings={generalSettings}
            />
        );
      case 'dhuliyauna_faram':
        return (
            <DhuliyaunaFaram
                currentFiscalYear={currentFiscalYear}
                currentUser={currentUser}
                inventoryItems={inventoryItems}
                dhuliyaunaEntries={dhuliyaunaEntries}
                onSaveDhuliyaunaEntry={onSaveDhuliyaunaEntry}
                stores={stores}
            />
        );
      case 'log_book':
        return (
            <LogBook 
                currentUser={currentUser}
                currentFiscalYear={currentFiscalYear}
                inventoryItems={inventoryItems}
                logBookEntries={logBookEntries}
                onAddLogEntry={onSaveLogBookEntry}
            />
        );
      case 'report_inventory_monthly':
        return (
          <InventoryMonthlyReport
            currentFiscalYear={currentFiscalYear}
            currentUser={currentUser}
            inventoryItems={inventoryItems}
            stores={stores}
            magForms={magForms}
            onSaveMagForm={onSaveMagForm}
            generalSettings={generalSettings}
          />
        );
      case 'database_management':
        return (
          <DatabaseManagement 
            currentUser={currentUser}
            users={users}
            inventoryItems={inventoryItems}
            magForms={magForms}
            purchaseOrders={purchaseOrders}
            issueReports={issueReports}
            rabiesPatients={rabiesPatients}
            firms={firms}
            stores={stores}
            onClearData={onClearData} 
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-20 md:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:relative z-30 h-full
        bg-slate-900 text-white flex flex-col shadow-xl
        transition-all duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64 md:w-0 md:translate-x-0 md:overflow-hidden'}
      `}>
        <div className="p-6 border-b border-slate-800 flex items-center gap-3 bg-slate-950 shrink-0">
            <div className="bg-primary-600 p-2 rounded-lg shadow-lg shadow-primary-500/20">
                <Activity size={20} className="text-white" />
            </div>
            <div className={`transition-opacity duration-300 ${isSidebarOpen || (window.innerWidth < 768) ? 'opacity-100' : 'opacity-0 md:opacity-100'}`}>
                <h2 className="font-nepali font-bold text-lg leading-tight tracking-wide whitespace-nowrap">{APP_NAME}</h2>
                <p className="text-xs text-slate-400 font-nepali whitespace-nowrap">{currentUser.organizationName || ORG_NAME}</p>
            </div>
        </div>
        
        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
             {menuItems.map((item) => (
               <div key={item.id}>
                  {/* Level 1 Menu Item */}
                  <button 
                    onClick={() => handleMenuClick(item)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
                      activeItem === item.id 
                        ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/20' 
                        : (expandedMenu === item.id ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800')
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`${activeItem === item.id ? 'text-white' : 'group-hover:text-primary-400'} transition-colors`}>
                        {item.icon}
                      </div>
                      <span className="font-medium font-nepali whitespace-nowrap">{item.label}</span>
                    </div>
                    
                    {item.subItems && (
                      <div className="text-slate-500">
                        {expandedMenu === item.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </div>
                    )}
                  </button>

                  {/* Level 2 Sub Menu */}
                  {item.subItems && expandedMenu === item.id && (
                    <div className="mt-1 ml-4 pl-3 border-l border-slate-700 space-y-1">
                      {item.subItems.map((subItem) => (
                        <div key={subItem.id}>
                            <button
                                onClick={() => subItem.subItems ? handleLevel3Click(subItem.id) : handleSubItemClick(subItem.id)}
                                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm transition-colors ${
                                    activeItem === subItem.id
                                    ? 'bg-slate-800 text-primary-300 font-medium'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    {subItem.icon}
                                    <span className="font-nepali whitespace-nowrap">{subItem.label}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {subItem.badgeCount !== undefined && subItem.badgeCount > 0 && (
                                        <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[1.2rem] text-center">
                                            {subItem.badgeCount}
                                        </span>
                                    )}
                                    {subItem.subItems && (expandedSubMenu === subItem.id ? <ChevronDown size={14} /> : <ChevronRight size={14} />)}
                                </div>
                            </button>
                            
                            {/* Level 3 Sub Menu */}
                            {subItem.subItems && expandedSubMenu === subItem.id && (
                                <div className="mt-1 ml-4 pl-3 border-l border-slate-700 space-y-1">
                                    {subItem.subItems.map(level3Item => (
                                        <button
                                            key={level3Item.id}
                                            onClick={() => handleSubItemClick(level3Item.id)}
                                            className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
                                                activeItem === level3Item.id
                                                ? 'bg-slate-800 text-primary-300 font-medium'
                                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                                            }`}
                                        >
                                            {level3Item.icon}
                                            <span className="font-nepali whitespace-nowrap">{level3Item.label}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                      ))}
                    </div>
                  )}
               </div>
             ))}
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-950 shrink-0">
            <button 
                onClick={onLogout}
                className="flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 w-full rounded-xl transition-all duration-200 group"
            >
                <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                <span className="font-medium whitespace-nowrap">लगआउट (Logout)</span>
            </button>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
        {/* Mobile Header */}
        <header className="bg-white border-b border-slate-200 p-4 flex md:hidden items-center justify-between shadow-sm z-10 shrink-0">
            <div className="flex items-center gap-3">
                 <button 
                    onClick={() => setIsSidebarOpen(true)}
                    className="bg-primary-600 p-1.5 rounded-md hover:bg-primary-700 transition-colors"
                 >
                    <Menu size={18} className="text-white" />
                </button>
                <span className="font-bold text-slate-700 font-nepali">{APP_NAME}</span>
            </div>
            <div className="flex items-center gap-4">
                {latestApprovedDakhila && (
                    <button 
                        onClick={handleNotificationClick}
                        className={`relative p-1 transition-colors ${latestApprovedDakhila ? 'text-slate-600 hover:text-slate-800' : 'text-slate-300'}`}
                    >
                        <Bell size={20} />
                        {latestApprovedDakhila.id !== lastSeenNotificationId && (
                            <span className="absolute top-0 right-0 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                        )}
                    </button>
                )}
                <button onClick={onLogout} className="text-slate-500 hover:text-red-500">
                    <LogOut size={20} />
                </button>
            </div>
        </header>

        {/* Top Bar (Desktop) */}
        <div className="hidden md:flex bg-white border-b border-slate-200 px-8 py-4 justify-between items-center shadow-sm z-10 shrink-0">
            <div className="flex items-center gap-4">
               <button 
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
                  title={isSidebarOpen ? "Hide Menu" : "Show Menu"}
               >
                  <Menu size={24} />
               </button>

               <h2 className="text-lg font-semibold text-slate-700">ड्यासबोर्ड (Dashboard)</h2>
               
               <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100 text-sm font-medium">
                  <Calendar size={14} />
                  <span className="font-nepali">आ.व. {fiscalYearLabel}</span>
               </div>
            </div>

            <div className="flex items-center gap-6">
                 <div className="relative">
                    <button 
                        onClick={handleNotificationClick}
                        className={`p-2 rounded-full hover:bg-slate-100 transition-colors ${latestApprovedDakhila ? 'text-slate-600' : 'text-slate-300 cursor-not-allowed'}`}
                        title={latestApprovedDakhila ? "Latest Approved Stock Entry" : "No recent notifications"}
                        disabled={!latestApprovedDakhila}
                    >
                        <Bell size={22} />
                        {latestApprovedDakhila && latestApprovedDakhila.id !== lastSeenNotificationId && (
                            <span className="absolute top-1.5 right-2 h-3 w-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                        )}
                    </button>
                 </div>

                 <div className="flex items-center gap-3">
                     <div className="text-right">
                        <p className="text-sm font-bold text-slate-800">{currentUser.username}</p>
                        <p className="text-xs text-slate-500">{currentUser.role}</p>
                    </div>
                    <div className="w-10 h-10 bg-primary-100 border-2 border-primary-200 text-primary-700 rounded-full flex items-center justify-center font-bold shadow-sm uppercase">
                        {currentUser.username.charAt(0)}
                    </div>
                </div>
            </div>
        </div>

        {/* Dashboard Content Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-50/50 p-4 md:p-6 relative scroll-smooth scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
             {renderContent()}
        </main>
      </div>

      {/* Notification Modal */}
      {showNotificationModal && latestApprovedDakhila && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setShowNotificationModal(false)}></div>
              
              <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                  <div className="px-6 py-4 border-b border-green-100 flex justify-between items-center bg-green-50">
                      <div className="flex items-center gap-3">
                          <div className="bg-green-100 p-2 rounded-lg text-green-600">
                              <CheckCircle2 size={24} />
                          </div>
                          <div>
                              <h3 className="font-bold text-slate-800 text-lg font-nepali">भर्खरै दाखिला भएको विवरण</h3>
                              <p className="text-xs text-slate-600">मिति: {latestApprovedDakhila.requestDateBs}</p>
                          </div>
                      </div>
                      <button onClick={() => setShowNotificationModal(false)} className="p-2 hover:bg-green-100 rounded-full text-green-600 transition-colors">
                          <X size={20} />
                      </button>
                  </div>

                  <div className="p-0 overflow-y-auto max-h-[60vh]">
                      <table className="w-full text-sm text-left">
                          <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                              <tr>
                                  <th className="px-6 py-3 w-16 text-center">क्र.सं.</th>
                                  <th className="px-6 py-3">सामानको नाम</th>
                                  <th className="px-6 py-3 text-center">परिमाण</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                              {latestApprovedDakhila.items.map((item, index) => (
                                  <tr key={index} className="hover:bg-slate-50">
                                      <td className="px-6 py-3 text-center text-slate-500">{index + 1}</td>
                                      <td className="px-6 py-3 font-medium text-slate-800">{item.itemName}</td>
                                      <td className="px-6 py-3 text-center font-bold text-green-600 bg-green-50/30">
                                          {item.currentQuantity}
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>

                  <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                      <button onClick={() => setShowNotificationModal(false)} className="px-6 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium">Close</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
