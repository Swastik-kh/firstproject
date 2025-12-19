
import React, { useState, useEffect, useMemo } from 'react';
import { Save, RotateCcw, Syringe, Calendar, FileDigit, User, Phone, MapPin, CalendarRange, Clock, CheckCircle2, Search, X, AlertTriangle } from 'lucide-react';
import { Input } from './Input';
import { Select } from './Select';
import { NepaliDatePicker } from './NepaliDatePicker';
import { RabiesPatient, VaccinationDose, Option } from '../types';
// @ts-ignore
import NepaliDate from 'nepali-date-converter';

interface RabiesRegistrationProps {
  currentFiscalYear: string;
  patients: RabiesPatient[];
  onAddPatient: (patient: RabiesPatient) => void;
  onUpdatePatient: (patient: RabiesPatient) => void;
}

const nepaliMonthOptions = [
  { id: '01', value: '01', label: 'बैशाख (01)' },
  { id: '02', value: '02', label: 'जेठ (02)' },
  { id: '03', value: '03', label: 'असार (03)' },
  { id: '04', value: '04', label: 'साउन (04)' },
  { id: '05', value: '05', label: 'भदौ (05)' },
  { id: '06', value: '06', label: 'असोज (06)' },
  { id: '07', value: '07', label: 'कार्तिक (07)' },
  { id: '08', value: '08', label: 'मंसिर (08)' },
  { id: '09', value: '09', label: 'पुष (09)' },
  { id: '10', value: '10', label: 'माघ (10)' },
  { id: '11', value: '11', label: 'फागुन (11)' },
  { id: '12', value: '12', label: 'चैत्र (12)' },
];

export const RabiesRegistration: React.FC<RabiesRegistrationProps> = ({ 
  currentFiscalYear, 
  patients, 
  onAddPatient, 
  onUpdatePatient 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [modalDateBs, setModalDateBs] = useState('');
  const [doseUpdateError, setDoseUpdateError] = useState<string | null>(null);
  
  const [selectedDoseInfo, setSelectedDoseInfo] = useState<{
      patient: RabiesPatient;
      doseIndex: number;
      dose: VaccinationDose;
  } | null>(null);

  const getTodayDateAd = () => new Date().toISOString().split('T')[0];

  const generateRegNo = () => {
    const fyClean = currentFiscalYear.replace('/', '');
    const maxNum = patients
      .filter(p => p.fiscalYear === currentFiscalYear && p.regNo.startsWith(`R-${fyClean}-`))
      .map(p => {
          const parts = p.regNo.split('-');
          return parts.length > 2 ? parseInt(parts[2]) : 0;
      })
      .reduce((max, num) => Math.max(max, num), 0);
    return `R-${fyClean}-${String(maxNum + 1).padStart(3, '0')}`;
  };

  const [formData, setFormData] = useState<RabiesPatient>({
    id: '',
    fiscalYear: currentFiscalYear,
    regNo: '',
    regMonth: '',
    regDateBs: '',
    regDateAd: '',
    name: '',
    age: '',
    sex: '',
    address: '',
    phone: '',
    animalType: '',
    exposureCategory: '',
    bodyPart: '',
    exposureDateBs: '',
    regimen: 'Intradermal',
    schedule: []
  });

  useEffect(() => {
    const today = new NepaliDate();
    const todayBs = today.format('YYYY-MM-DD');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    
    setFormData(prev => ({
      ...prev,
      regNo: generateRegNo(),
      regDateBs: todayBs,
      regMonth: month,
      regDateAd: new Date().toISOString().split('T')[0],
      exposureDateBs: todayBs
    }));
  }, [currentFiscalYear, patients.length]);

  const handleRegDateBsChange = (val: string) => {
    let month = formData.regMonth;
    let adDateStr = formData.regDateAd;

    if (val) {
        try {
            const parts = val.split(/[-/]/);
            if (parts.length === 3) {
                const [y, m, d] = parts.map(Number);
                month = String(m).padStart(2, '0');
                const nd = new NepaliDate(y, m - 1, d);
                adDateStr = nd.toJsDate().toISOString().split('T')[0];
            }
        } catch (e) {
            console.error("Date conversion error", e);
        }
    }

    setFormData(prev => {
        const updated = {
            ...prev,
            regDateBs: val,
            regMonth: month,
            regDateAd: adDateStr
        };
        updated.schedule = calculateSchedule(adDateStr, prev.regimen);
        return updated;
    });
  };

  const calculateSchedule = (startDateAd: string, regimen: string): VaccinationDose[] => {
      if (!startDateAd) return [];
      
      const start = new Date(startDateAd);
      const schedule: VaccinationDose[] = [];
      const days = regimen === 'Intradermal' ? [0, 3, 7] : [0, 3, 7, 14, 28];

      days.forEach(dayOffset => {
          const doseDate = new Date(start);
          doseDate.setDate(start.getDate() + dayOffset);
          schedule.push({
              day: dayOffset,
              date: doseDate.toISOString().split('T')[0],
              status: 'Pending'
          });
      });

      return schedule;
  };

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!formData.name || !formData.regDateBs) {
          alert("कृपया आवश्यक विवरणहरू भर्नुहोस्");
          return;
      }

      const newPatient = {
          ...formData,
          id: Date.now().toString(),
          schedule: calculateSchedule(formData.regDateAd, formData.regimen)
      };

      onAddPatient(newPatient);
      handleReset();
      alert('बिरामी सफलतापूर्वक दर्ता भयो');
  };

  const handleReset = () => {
    const today = new NepaliDate();
    setFormData({
        id: '',
        fiscalYear: currentFiscalYear,
        regNo: generateRegNo(),
        regMonth: String(today.getMonth() + 1).padStart(2, '0'),
        regDateBs: today.format('YYYY-MM-DD'),
        regDateAd: new Date().toISOString().split('T')[0],
        name: '', age: '', sex: '', address: '', phone: '',
        animalType: '', exposureCategory: '', bodyPart: '',
        exposureDateBs: today.format('YYYY-MM-DD'),
        regimen: 'Intradermal',
        schedule: []
    });
  };

  const confirmDoseUpdate = () => {
      if (!selectedDoseInfo) return;
      setDoseUpdateError(null);

      if (!modalDateBs) {
          setDoseUpdateError("कृपया खोप लगाएको मिति छान्नुहोस्");
          return;
      }
      
      const { patient, doseIndex, dose } = selectedDoseInfo;
      let givenDateAd = '';
      try {
          const parts = modalDateBs.split(/[-/]/);
          const [y, m, d] = parts.map(Number);
          const nd = new NepaliDate(y, m - 1, d);
          givenDateAd = nd.toJsDate().toISOString().split('T')[0];
      } catch (e) {
          setDoseUpdateError("मिति ढाँचा मिलेन");
          return;
      }

      if (dose.day !== 0 && givenDateAd < dose.date) {
          setDoseUpdateError("तपाईंले छान्नुभएको मिति खोप तालिका भन्दा अगाडि छ।");
          return;
      }

      const updatedSchedule = [...patient.schedule];
      updatedSchedule[doseIndex] = {
          ...updatedSchedule[doseIndex],
          status: 'Given',
          givenDate: givenDateAd
      };

      onUpdatePatient({ ...patient, schedule: updatedSchedule });
      setSelectedDoseInfo(null);
  };

  const handleDoseClick = (p: RabiesPatient, idx: number, dose: VaccinationDose) => {
      setSelectedDoseInfo({ patient: p, doseIndex: idx, dose });
      setDoseUpdateError(null);
      try {
          const scheduledDate = new Date(dose.date);
          const nd = new NepaliDate(scheduledDate);
          setModalDateBs(nd.format('YYYY-MM-DD'));
      } catch (e) {
          setModalDateBs('');
      }
  };

  const filteredPatients = patients.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.regNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const todayAd = getTodayDateAd();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
            <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                <Syringe size={24} />
            </div>
            <div>
                <h2 className="text-xl font-bold text-slate-800 font-nepali">रेबिज खोप दर्ता (Rabies Registration)</h2>
                <p className="text-sm text-slate-500 font-nepali">नयाँ बिरामी दर्ता र खोप तालिका व्यवस्थापन</p>
            </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-3 bg-indigo-50 p-4 rounded-lg border border-indigo-100 flex items-center gap-4">
                  <div className="bg-white p-2 rounded border border-indigo-200">
                      <FileDigit size={20} className="text-indigo-600" />
                  </div>
                  <div>
                      <label className="text-xs font-bold text-indigo-500 uppercase tracking-wide">दर्ता नम्बर (Reg No)</label>
                      <input value={formData.regNo} readOnly className="bg-transparent font-mono text-lg font-bold text-slate-800 outline-none w-full" />
                  </div>
                  <div className="ml-auto text-right">
                      <label className="text-xs font-bold text-indigo-500 uppercase tracking-wide">आर्थिक वर्ष</label>
                      <div className="font-nepali font-medium text-slate-700">{currentFiscalYear}</div>
                  </div>
              </div>

              <div className="md:col-span-1">
                 <NepaliDatePicker 
                    label="दर्ता मिति (BS)"
                    value={formData.regDateBs}
                    onChange={handleRegDateBsChange}
                    required
                 />
              </div>

              <Select 
                  label="दर्ता महिना"
                  value={formData.regMonth}
                  onChange={e => setFormData({...formData, regMonth: e.target.value})}
                  options={nepaliMonthOptions}
                  icon={<CalendarRange size={16} />}
              />
              
              <Input 
                  label="अंग्रेजी मिति (AD)"
                  value={formData.regDateAd}
                  readOnly
                  className="bg-slate-50 text-slate-500"
                  icon={<Calendar size={16} />}
              />

              <Input 
                  label="बिरामीको नाम"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  required
                  placeholder="Full Name"
                  icon={<User size={16} />}
              />

              <div className="grid grid-cols-2 gap-4">
                  <Input label="उमेर" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} required placeholder="Yr" type="number" />
                  <Select 
                      label="लिङ्ग"
                      value={formData.sex}
                      onChange={e => setFormData({...formData, sex: e.target.value})}
                      options={[{id: 'm', value: 'Male', label: 'पुरुष'}, {id: 'f', value: 'Female', label: 'महिला'}, {id: 'o', value: 'Other', label: 'अन्य'}]}
                      required
                  />
              </div>

              <Input label="सम्पर्क नं" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required placeholder="98XXXXXXXX" icon={<Phone size={16} />} />

              <div className="md:col-span-2">
                  <Input label="ठेगाना" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} required placeholder="Municipality-Ward, District" icon={<MapPin size={16} />} />
              </div>

              <Select 
                  label="टोक्ने जनावर"
                  value={formData.animalType}
                  onChange={e => setFormData({...formData, animalType: e.target.value})}
                  options={[{id:'dog',value:'Dog',label:'कुकुर'}, {id:'monkey',value:'Monkey',label:'बाँदर'}, {id:'cat',value:'Cat',label:'विरालो'}, {id:'other',value:'Other',label:'अन्य'}]}
                  required
              />

              <div className="md:col-span-3 pt-4 border-t border-slate-100 flex justify-end gap-3">
                  <button type="button" className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg flex items-center gap-2" onClick={handleReset}><RotateCcw size={18} /> रिसेट</button>
                  <button type="submit" className="px-6 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg shadow-sm flex items-center gap-2 font-medium font-nepali"><Save size={18} /> दर्ता गर्नुहोस्</button>
              </div>
          </form>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-center gap-4">
              <h3 className="font-semibold text-slate-700 font-nepali">बिरामी फलोअप सूची (Follow-up List)</h3>
              <div className="relative w-full sm:w-64">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                      type="text" 
                      placeholder="नाम वा दर्ता नं खोज्नुहोस्..." 
                      className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                  />
              </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-600 font-medium">
                  <tr>
                      <th className="px-6 py-3">दर्ता नं</th>
                      <th className="px-6 py-3">बिरामी विवरण</th>
                      <th className="px-6 py-3">खोप तालिका (Follow-up)</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                  {filteredPatients.length === 0 ? (
                      <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-400 italic font-nepali">डाटा फेला परेन</td></tr>
                  ) : (
                      filteredPatients.map(p => (
                          <tr key={p.id} className="hover:bg-slate-50">
                              <td className="px-6 py-4 font-mono font-medium text-indigo-600">{p.regNo}</td>
                              <td className="px-6 py-4">
                                  <div className="font-medium text-slate-800">{p.name}</div>
                                  <div className="text-xs text-slate-500 font-nepali">{p.age} वर्ष / {p.sex}</div>
                              </td>
                              <td className="px-6 py-4">
                                  <div className="flex items-center gap-2">
                                      {p.schedule.map((dose, idx) => (
                                          <button 
                                              key={idx}
                                              type="button"
                                              onClick={() => handleDoseClick(p, idx, dose)}
                                              className={`flex flex-col items-center justify-center w-12 h-14 rounded-lg border transition-all ${
                                                  dose.status === 'Given' ? 'bg-green-50 border-green-200 text-green-700' :
                                                  dose.date === todayAd ? 'bg-orange-50 border-orange-200 text-orange-700 animate-pulse ring-2 ring-orange-100' :
                                                  'bg-slate-50 border-slate-200 text-slate-400'
                                              }`}
                                          >
                                              <span className="text-[10px] font-bold uppercase">D{dose.day}</span>
                                              {dose.status === 'Given' ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                                              <span className="text-[9px] mt-0.5">{dose.date.split('-').slice(1).join('-')}</span>
                                          </button>
                                      ))}
                                  </div>
                              </td>
                          </tr>
                      ))
                  )}
              </tbody>
            </table>
          </div>
      </div>

      {selectedDoseInfo && (
          <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-12 sm:pt-24">
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedDoseInfo(null)}></div>
              <div className="relative bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
                  <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-indigo-50/50">
                      <div className="flex items-center gap-2">
                          <Syringe size={20} className="text-indigo-600"/>
                          <h3 className="font-bold text-slate-800 font-nepali text-sm">खोप विवरण (Update Vaccine Status)</h3>
                      </div>
                      <button type="button" onClick={() => setSelectedDoseInfo(null)} className="p-2 hover:bg-white/50 rounded-full transition-colors"><X size={20} className="text-slate-400"/></button>
                  </div>
                  
                  <div className="p-6 space-y-4">
                      <div className="text-center">
                          <h4 className="text-lg font-bold text-slate-800">{selectedDoseInfo.patient.name}</h4>
                          <p className="text-xs font-medium bg-slate-100 inline-block px-3 py-1 rounded-full mt-2 font-nepali">
                              तालिका मिति (Scheduled Date): {selectedDoseInfo.dose.date}
                          </p>
                      </div>

                      {selectedDoseInfo.dose.status === 'Given' ? (
                          <div className="bg-green-50 border border-green-100 p-3 rounded-lg text-center font-nepali text-green-700">
                              <CheckCircle2 size={18} className="mx-auto mb-1" /> खोप लगाइसकियो
                              <p className="text-xs mt-1">लगाएको मिति: {selectedDoseInfo.dose.givenDate}</p>
                          </div>
                      ) : (
                          <div className="space-y-3">
                              <NepaliDatePicker label="खोप लगाएको मिति (Given Date - BS)" value={modalDateBs} onChange={setModalDateBs} />
                              {doseUpdateError && (
                                <div className="flex items-center gap-2 text-[10px] text-red-500 font-medium bg-red-50 p-2 rounded border border-red-100">
                                  <AlertTriangle size={14} />
                                  <span>{doseUpdateError}</span>
                                </div>
                              )}
                          </div>
                      )}
                  </div>

                  <div className="p-4 border-t border-slate-100 flex gap-3 bg-slate-50">
                      <button type="button" onClick={() => setSelectedDoseInfo(null)} className="flex-1 py-2 text-slate-600 font-medium font-nepali hover:bg-slate-200 rounded-lg transition-colors text-sm">रद्द (Cancel)</button>
                      {selectedDoseInfo.dose.status !== 'Given' && (
                          <button type="button" onClick={confirmDoseUpdate} className="flex-1 py-2 bg-green-600 text-white rounded-lg font-medium shadow-sm font-nepali hover:bg-green-700 transition-colors text-sm">सुरक्षित (Confirm)</button>
                      )}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
