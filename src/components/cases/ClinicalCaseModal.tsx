'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { X, User, Activity, FileText, Stethoscope, Save, AlertTriangle, TestTube, Pill, Building2, Calendar, Tag } from 'lucide-react';
import type { ClinicalCase } from '../../types/clinicalCase';

interface ClinicalCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseData: ClinicalCase | null;
  onSave: (updatedCase: ClinicalCase) => void;
}

type Tab = 'identity' | 'clinical' | 'medical' | 'history' | 'exams' | 'prescriptions' | 'hospitalisations' | 'metadata';

export default function ClinicalCaseModal({ isOpen, onClose, caseData, onSave }: ClinicalCaseModalProps) {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>('identity');
  const [formData, setFormData] = useState<ClinicalCase | null>(null);

  useEffect(() => {
    if (caseData) {
      setFormData(JSON.parse(JSON.stringify(caseData))); // Deep copy
    }
  }, [caseData]);

  if (!isOpen || !formData) return null;

  const handleSave = () => {
    if (formData) onSave(formData);
  };

  // Helper to update nested state
  const updatePatient = (field: string, value: any) => {
    setFormData(prev => prev ? ({
      ...prev,
      patient: { ...prev.patient, [field]: value }
    }) : null);
  };

  const updateParameters = (field: string, value: any) => {
    setFormData(prev => prev ? ({
      ...prev,
      medical_folder_page: {
        ...(prev.medical_folder_page || {}),
        parameters: {
          ...(prev.medical_folder_page?.parameters || {}),
          [field]: value
        }
      }
    }) : null);
  };

  const updateFolder = (field: string, value: any) => {
    setFormData(prev => prev ? ({
      ...prev,
      medical_folder_page: { ...prev.medical_folder_page, [field]: value }
    }) : null);
  };

  const updateMetadata = (field: string, value: any) => {
    setFormData(prev => prev ? ({
      ...prev,
      metadata: {
        pathologie: '',
        niveau_complexite: 'debutant',
        ...(prev.metadata || {}),
        [field]: value
      }
    }) : null);
  };

  const tabs = [
    { id: 'identity', label: t('caseModal.tabs.identity'), icon: User },
    { id: 'clinical', label: t('caseModal.tabs.clinical'), icon: Activity },
    { id: 'medical', label: t('caseModal.tabs.medical'), icon: Stethoscope },
    { id: 'history', label: t('caseModal.tabs.history'), icon: FileText },
    { id: 'exams', label: t('caseModal.tabs.exams'), icon: TestTube, count: formData.exam_requests?.length },
    { id: 'prescriptions', label: t('caseModal.tabs.prescriptions'), icon: Pill, count: formData.prescriptions?.length },
    { id: 'hospitalisations', label: t('caseModal.tabs.hospitalisations'), icon: Building2, count: formData.hospitalisations?.length },
    { id: 'metadata', label: t('caseModal.tabs.metadata'), icon: Tag },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
      />

      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 bg-slate-50 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg ${formData.patient?.gender === 'Féminin' ? 'bg-pink-500' : 'bg-blue-500'
              }`}>
              {formData.patient?.first_name?.[0] || '?'}{formData.patient?.last_name?.[0] || '?'}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">
                {formData.patient?.first_name || t('caseModal.patientInfo.unknown')} {formData.patient?.last_name || ''}
              </h2>
              <p className="text-sm text-slate-500 font-medium flex items-center gap-2">
                <span className="bg-slate-200 px-2 py-0.5 rounded text-slate-600 text-xs uppercase tracking-wider">
                  {formData.id}
                </span>
                • {formData.patient?.birth_date ? `${new Date().getFullYear() - new Date(formData.patient.birth_date).getFullYear()} ${t('caseModal.patientInfo.years')}` : t('caseModal.patientInfo.ageUnknown')}
                {formData.metadata?.pathologie && (
                  <span className="bg-purple-100 text-primary px-2 py-0.5 rounded text-xs font-bold">
                    {formData.metadata.pathologie}
                  </span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs - Scrollable */}
        <div className="flex px-4 border-b border-slate-100 bg-white sticky top-0 z-10 overflow-x-auto scrollbar-thin">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`
                relative flex items-center gap-2 px-4 py-4 text-sm font-bold transition-colors whitespace-nowrap
                ${activeTab === tab.id ? 'text-primary' : 'text-slate-400 hover:text-slate-600'}
              `}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-purple-100 text-primary rounded-full">{tab.count}</span>
              )}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                />
              )}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* TAB: IDENTITY */}
              {activeTab === 'identity' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <User className="w-5 h-5 text-primary" />
                      {t('caseModal.patientInfo.title')}
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">{t('caseModal.patientInfo.firstName')}</label>
                        <input
                          type="text"
                          value={formData.patient?.first_name || ''}
                          onChange={(e) => updatePatient('first_name', e.target.value)}
                          className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">{t('caseModal.patientInfo.lastName')}</label>
                        <input
                          type="text"
                          value={formData.patient?.last_name || ''}
                          onChange={(e) => updatePatient('last_name', e.target.value)}
                          className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">{t('caseModal.patientInfo.birthDate')}</label>
                        <input
                          type="date"
                          value={formData.patient?.birth_date ? formData.patient.birth_date.split('T')[0] : ''}
                          onChange={(e) => updatePatient('birth_date', e.target.value)}
                          className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">{t('caseModal.patientInfo.gender')}</label>
                        <select
                          value={formData.patient?.gender || ''}
                          onChange={(e) => updatePatient('gender', e.target.value)}
                          className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                        >
                          <option value="">{t('caseModal.patientInfo.select')}</option>
                          <option value="Masculin">{t('caseModal.patientInfo.male')}</option>
                          <option value="Féminin">{t('caseModal.patientInfo.female')}</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                      {t('caseModal.consultation.title')}
                    </h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">{t('caseModal.consultation.reason')}</label>
                        <input
                          type="text"
                          value={formData.consultation_reason || ''}
                          onChange={(e) => setFormData({ ...formData, consultation_reason: e.target.value })}
                          className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary outline-none font-medium"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">{t('caseModal.consultation.notes')}</label>
                        <textarea
                          rows={4}
                          value={formData.consultation_notes || ''}
                          onChange={(e) => setFormData({ ...formData, consultation_notes: e.target.value })}
                          className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary outline-none resize-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: CLINICAL */}
              {activeTab === 'clinical' && (
                <div className="space-y-8">
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-emerald-500" />
                      {t('caseModal.vitalSigns.title')}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">{t('caseModal.vitalSigns.temperature')}</label>
                        <div className="relative">
                          <input
                            type="number"
                            step="0.1"
                            value={formData.medical_folder_page?.parameters?.temperature || ''}
                            onChange={(e) => updateParameters('temperature', parseFloat(e.target.value))}
                            className="w-full p-3 pl-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-mono text-lg"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">{t('caseModal.vitalSigns.bloodPressure')}</label>
                        <input
                          type="text"
                          value={formData.medical_folder_page?.parameters?.blood_pressure || ''}
                          onChange={(e) => updateParameters('blood_pressure', e.target.value)}
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-mono text-lg"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">{t('caseModal.vitalSigns.heartRate')}</label>
                        <input
                          type="number"
                          value={formData.medical_folder_page?.parameters?.heart_rate || ''}
                          onChange={(e) => updateParameters('heart_rate', parseFloat(e.target.value))}
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-mono text-lg"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">{t('caseModal.vitalSigns.weight')}</label>
                        <input
                          type="number"
                          step="0.1"
                          value={formData.medical_folder_page?.parameters?.weight || ''}
                          onChange={(e) => updateParameters('weight', parseFloat(e.target.value))}
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-mono text-lg"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">{t('caseModal.vitalSigns.nurseNote')}</label>
                    <textarea
                      rows={6}
                      value={formData.medical_folder_page?.nurse_note || ''}
                      onChange={(e) => updateFolder('nurse_note', e.target.value)}
                      className="w-full p-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary outline-none leading-relaxed"
                    />
                  </div>
                </div>
              )}

              {/* TAB: MEDICAL */}
              {activeTab === 'medical' && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">{t('caseModal.medicalFolder.diagnostic')}</label>
                    <input
                      type="text"
                      value={formData.medical_folder_page?.diagnostic || ''}
                      onChange={(e) => updateFolder('diagnostic', e.target.value)}
                      className="w-full p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none font-bold text-lg"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">{t('caseModal.medicalFolder.doctorNote')}</label>
                    <textarea
                      rows={10}
                      value={formData.medical_folder_page?.doctor_note || ''}
                      onChange={(e) => updateFolder('doctor_note', e.target.value)}
                      className="w-full p-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary outline-none leading-relaxed font-serif text-lg text-slate-700"
                      placeholder={t('caseModal.medicalFolder.placeholder')}
                    />
                  </div>
                </div>
              )}

              {/* TAB: HISTORY */}
              {activeTab === 'history' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">{t('caseModal.history.chronicDiseases')}</label>
                    <textarea
                      rows={3}
                      value={formData.medical_folder_page?.parameters?.chronical_diseases || ''}
                      onChange={(e) => updateParameters('chronical_diseases', e.target.value)}
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">{t('caseModal.history.allergies')}</label>
                    <textarea
                      rows={3}
                      value={formData.medical_folder_page?.parameters?.allergies || ''}
                      onChange={(e) => updateParameters('allergies', e.target.value)}
                      className="w-full p-3 bg-red-50 border border-red-100 rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-red-800"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">{t('caseModal.history.currentMedication')}</label>
                    <textarea
                      rows={3}
                      value={formData.medical_folder_page?.parameters?.current_medication || ''}
                      onChange={(e) => updateParameters('current_medication', e.target.value)}
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">{t('caseModal.history.familyHistory')}</label>
                    <textarea
                      rows={3}
                      value={formData.medical_folder_page?.parameters?.family_medical_history || ''}
                      onChange={(e) => updateParameters('family_medical_history', e.target.value)}
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>
              )}

              {/* TAB: EXAMS */}
              {activeTab === 'exams' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <TestTube className="w-5 h-5 text-cyan-500" />
                    {t('caseModal.exams.title')} ({formData.exam_requests?.length || 0})
                  </h3>

                  {formData.exam_requests && formData.exam_requests.length > 0 ? (
                    <div className="space-y-4">
                      {formData.exam_requests.map((exam, idx) => (
                        <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-cyan-100 rounded-xl flex items-center justify-center">
                                <TestTube className="w-5 h-5 text-cyan-600" />
                              </div>
                              <div>
                                <h4 className="font-bold text-slate-800">{exam.exam_name}</h4>
                                <p className="text-sm text-slate-500">{exam.exam?.exam_description}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${exam.exam_status === 'terminé' ? 'bg-emerald-100 text-emerald-700' :
                                exam.exam_status === 'en attente' ? 'bg-amber-100 text-amber-700' :
                                  'bg-blue-100 text-blue-700'
                                }`}>
                                {exam.exam_status}
                              </span>
                              <span className="text-sm font-mono text-slate-400">
                                {exam.exam?.exam_cost?.toFixed(2)} €
                              </span>
                            </div>
                          </div>

                          {exam.notes && (
                            <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl">{exam.notes}</p>
                          )}

                          {/* Results */}
                          {exam.results && exam.results.length > 0 && (
                            <div className="border-t border-slate-100 pt-4 mt-4">
                              <h5 className="text-xs font-bold text-slate-500 uppercase mb-3">{t('caseModal.exams.results')}</h5>
                              {exam.results.map((result, rIdx) => (
                                <div key={rIdx} className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                                  <p className="text-sm text-emerald-800">{result.notes}</p>
                                  {result.exam_file && (
                                    <a href={result.exam_file} className="text-xs text-emerald-600 underline mt-2 inline-block">
                                      📎 {t('caseModal.exams.viewFile')}
                                    </a>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-slate-400">
                      <TestTube className="w-12 h-12 mx-auto mb-4 opacity-30" />
                      <p>{t('caseModal.exams.noExams')}</p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB: PRESCRIPTIONS */}
              {activeTab === 'prescriptions' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Pill className="w-5 h-5 text-green-500" />
                    {t('caseModal.prescriptions.title')} ({formData.prescriptions?.length || 0})
                  </h3>

                  {formData.prescriptions && formData.prescriptions.length > 0 ? (
                    <div className="space-y-4">
                      {formData.prescriptions.map((prescription, idx) => (
                        <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-500">
                              {t('caseModal.prescriptions.prescribedOn')} {new Date(prescription.add_date).toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US')}
                            </span>
                          </div>

                          {prescription.note && (
                            <p className="text-sm text-slate-600 bg-amber-50 p-3 rounded-xl border border-amber-100">{prescription.note}</p>
                          )}

                          {/* Drugs */}
                          <div className="space-y-3">
                            {prescription.drugs?.map((drug, dIdx) => (
                              <div key={dIdx} className="flex items-start gap-4 bg-green-50 border border-green-100 rounded-xl p-4">
                                <div className="w-10 h-10 bg-green-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <Pill className="w-5 h-5 text-green-700" />
                                </div>
                                <div className="flex-1">
                                  <h5 className="font-bold text-slate-800">{drug.medicament?.name}</h5>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-sm">
                                    <span className="bg-white px-2 py-1 rounded text-slate-600">Qté: {drug.quantity}</span>
                                    <span className="bg-white px-2 py-1 rounded text-slate-600">{drug.dosage}</span>
                                    <span className="bg-white px-2 py-1 rounded text-slate-600">{drug.frequency}</span>
                                    <span className="bg-white px-2 py-1 rounded text-slate-600">{drug.duration}</span>
                                  </div>
                                  {drug.instructions && (
                                    <p className="text-xs text-green-700 mt-2">📋 {drug.instructions}</p>
                                  )}
                                </div>
                                <span className="text-sm font-mono text-slate-500">
                                  {drug.medicament?.price?.toFixed(2)} €
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-slate-400">
                      <Pill className="w-12 h-12 mx-auto mb-4 opacity-30" />
                      <p>{t('caseModal.prescriptions.noPrescriptions')}</p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB: HOSPITALISATIONS */}
              {activeTab === 'hospitalisations' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-primary" />
                    {t('caseModal.hospitalisations.title')} ({formData.hospitalisations?.length || 0})
                  </h3>

                  {formData.hospitalisations && formData.hospitalisations.length > 0 ? (
                    <div className="space-y-4">
                      {formData.hospitalisations.map((hosp, idx) => (
                        <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-5">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                <Building2 className="w-6 h-6 text-primary" />
                              </div>
                              <div>
                                <h4 className="font-bold text-slate-800">{hosp.room?.room_label}</h4>
                                <p className="text-sm text-slate-500">{hosp.bed_label} • {t('caseModal.hospitalisations.room')}: {hosp.room?.type}</p>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${hosp.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                                }`}>
                                {hosp.is_active ? t('caseModal.hospitalisations.active') : t('caseModal.hospitalisations.finished')}
                              </span>
                              <span className="text-sm font-mono text-slate-400">
                                {hosp.room?.price?.toFixed(2)} €/{t('caseModal.hospitalisations.day')}
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="bg-slate-50 p-3 rounded-xl">
                              <span className="text-xs text-slate-400 uppercase">{t('caseModal.hospitalisations.entry')}</span>
                              <p className="font-medium text-slate-700">{new Date(hosp.at_date).toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US')}</p>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-xl">
                              <span className="text-xs text-slate-400 uppercase">{t('caseModal.hospitalisations.exit')}</span>
                              <p className="font-medium text-slate-700">
                                {hosp.remove_at ? new Date(hosp.remove_at).toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US') : '-'}
                              </p>
                            </div>
                          </div>

                          {hosp.note && (
                            <p className="text-sm text-slate-600 mt-4 bg-purple-50 p-3 rounded-xl">{hosp.note}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-slate-400">
                      <Building2 className="w-12 h-12 mx-auto mb-4 opacity-30" />
                      <p>{t('caseModal.hospitalisations.noHospitalisations')}</p>
                    </div>
                  )}

                  {/* Appointments */}
                  {formData.appointments && formData.appointments.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
                        <Calendar className="w-5 h-5 text-orange-500" />
                        {t('caseModal.appointments.title')} ({formData.appointments.length})
                      </h3>
                      <div className="space-y-3">
                        {formData.appointments.map((apt, idx) => (
                          <div key={idx} className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex items-center justify-between">
                            <div>
                              <p className="font-medium text-slate-800">{apt.reason}</p>
                              <p className="text-sm text-slate-500">{new Date(apt.at_date).toLocaleString(i18n.language === 'fr' ? 'fr-FR' : 'en-US')}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${apt.status === 'confirmé' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                              }`}>
                              {apt.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB: METADATA */}
              {activeTab === 'metadata' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Tag className="w-5 h-5 text-primary" />
                    {t('caseModal.metadata.title')}
                  </h3>

                  <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">{t('caseModal.metadata.pathology')}</label>
                        <input
                          type="text"
                          value={formData.metadata?.pathologie || ''}
                          onChange={(e) => updateMetadata('pathologie', e.target.value)}
                          className="w-full p-3 bg-purple-50 border border-purple-200 rounded-xl focus:ring-2 focus:ring-primary outline-none font-bold text-primary"
                          placeholder="Ex: Paludisme, Appendicite..."
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">{t('caseModal.metadata.complexity')}</label>
                        <select
                          value={formData.metadata?.niveau_complexite || ''}
                          onChange={(e) => updateMetadata('niveau_complexite', e.target.value)}
                          className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary outline-none font-medium"
                        >
                          <option value="">{t('caseModal.patientInfo.select')}</option>
                          <option value="debutant">🟢 {t('cases.levels.beginner')}</option>
                          <option value="intermediaire">🟡 {t('cases.levels.intermediate')}</option>
                          <option value="avance">🔴 {t('cases.levels.advanced')}</option>
                        </select>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-6">
                      <h4 className="text-sm font-bold text-slate-600 mb-4">{t('caseModal.metadata.consultationInfo')}</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="bg-slate-50 p-3 rounded-xl">
                          <span className="text-xs text-slate-400 uppercase">{t('caseModal.metadata.date')}</span>
                          <p className="font-medium text-slate-700">
                            {formData.consultation_date ? new Date(formData.consultation_date).toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US') : '-'}
                          </p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl">
                          <span className="text-xs text-slate-400 uppercase">{t('caseModal.metadata.price')}</span>
                          <p className="font-medium text-slate-700">{formData.consultation_price?.toFixed(2)} €</p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl">
                          <span className="text-xs text-slate-400 uppercase">{t('caseModal.metadata.state')}</span>
                          <p className="font-medium text-slate-700">{formData.state}</p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl">
                          <span className="text-xs text-slate-400 uppercase">{t('caseModal.metadata.payment')}</span>
                          <p className="font-medium text-slate-700">{formData.payment_status}</p>
                        </div>
                      </div>
                    </div>

                    {formData.metadata?.preuve_integrite && (
                      <div className="bg-slate-100 p-4 rounded-xl">
                        <span className="text-xs text-slate-400 uppercase">{t('caseModal.metadata.integrityHash')}</span>
                        <p className="font-mono text-xs text-slate-600 break-all mt-1">{formData.metadata.preuve_integrite}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-white border-t border-slate-100 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl text-slate-500 font-bold hover:bg-slate-50 transition-colors"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={handleSave}
            className="px-8 py-3 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 hover:scale-105 transition-all flex items-center gap-2"
          >
            <Save className="w-5 h-5" />
            {t('profile.saveChanges')}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
