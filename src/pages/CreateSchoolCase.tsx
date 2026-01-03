import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    ArrowLeft, Save, Search, Filter, Clock, AlertTriangle,
    CheckCircle, GraduationCap, Users, ChevronRight, ChevronLeft, FileText,
    X, User, Activity, Stethoscope, TestTube, Pill, Building2, Tag, Plus, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { casEcoleService } from '../services/casEcoleService';
import { clinicalCasesService } from '../services/clinicalCasesService';
import { authService } from '../services/authService';
import { DOMAINES_EXPERTISE_LIST } from '../constants/api';

import type { ClinicalCase, ExamRequest, Prescription, Hospitalisation } from '../types/clinicalCase';

export default function CreateSchoolCase() {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [activeTab, setActiveTab] = useState('identity');

    // Data
    const [availableCases, setAvailableCases] = useState<ClinicalCase[]>([]);
    const [selectedCase, setSelectedCase] = useState<ClinicalCase | null>(null);
    const [pathologies, setPathologies] = useState<string[]>([]);
    const [showPathologySuggestions, setShowPathologySuggestions] = useState(false);
    const [user, setUser] = useState<any>(null);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDomaine, setFilterDomaine] = useState('');
    const [filterNiveau, setFilterNiveau] = useState('');
    const [newExamName, setNewExamName] = useState('');

    // Form Data
    const [formData, setFormData] = useState({
        titre: '',
        ecole_id: 0,
        ecole_nom: '',
        classe_id: 0,
        classe_nom: '',
        temps_limite_minutes: 30,
        penalite_par_minute: 1
    });

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        try {
            const currentUser = await authService.getCurrentUser();
            setUser(currentUser);

            if (currentUser.etablissement) {
                setFormData(prev => ({ ...prev, ecole_nom: currentUser.etablissement || '' }));
            }

            const cases = await clinicalCasesService.getCases();
            setAvailableCases(cases);

            // Fetch available pathologies
            const paths = await clinicalCasesService.getAvailablePathologies();
            // Add some default common pathologies if list is empty or to supplement
            const commonPathologies = [
                "Paludisme", "Fièvre Typhoïde", "Grippe", "Diabète type 2",
                "Hypertension Artérielle", "Pneumonie", "Bronchite",
                "Gastro-entérite", "Infection Urinaire", "Tuberculose"
            ];
            const uniquePaths = Array.from(new Set([...paths, ...commonPathologies])).sort();
            setPathologies(uniquePaths);

            // Check for loaded case from navigation state
            if (location.state?.loadedCase) {
                // Legacy support or if we re-introduce loading from another source
                const loadedCase = location.state.loadedCase as ClinicalCase;
                setSelectedCase(loadedCase);
                setStep(2);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const filteredCases = availableCases.filter(c => {
        const matchesSearch = (
            (c.metadata?.pathologie || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (c.consultation_reason || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
        const matchesDomaine = !filterDomaine || c.metadata?.domaine === filterDomaine;
        const matchesNiveau = !filterNiveau || c.metadata?.niveau_complexite === filterNiveau;

        return matchesSearch && matchesDomaine && matchesNiveau;
    });

    const handleNext = () => {
        if (step === 1 && !selectedCase) return;
        // Step 2 is customization, always valid to proceed if case is selected
        if (step === 3 && (!formData.titre || !formData.ecole_nom || !formData.classe_nom)) return;
        setStep(prev => prev + 1);
    };

    // Helper functions for Case Customization
    const updatePatient = (field: string, value: any) => {
        setSelectedCase(prev => prev ? ({
            ...prev,
            patient: { ...prev.patient, [field]: value }
        }) : null);
    };

    const updateParameters = (field: string, value: any) => {
        setSelectedCase(prev => prev ? ({
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
        setSelectedCase(prev => prev ? ({
            ...prev,
            medical_folder_page: { ...prev.medical_folder_page, [field]: value }
        }) : null);
    };

    const updateMetadata = (field: string, value: any) => {
        setSelectedCase(prev => {
            if (!prev) return null;
            const currentMetadata = prev.metadata || {
                pathologie: 'Non spécifié',
                niveau_complexite: 'debutant' as const
            };
            return {
                ...prev,
                metadata: {
                    ...currentMetadata,
                    [field]: value
                }
            } as ClinicalCase;
        });
    };

    const addExam = (examName: string) => {
        setSelectedCase(prev => {
            if (!prev) return null;
            const newExam: ExamRequest = {
                add_date: new Date().toISOString(),
                exam_name: examName,
                exam_status: 'pending',
                exam: {
                    exam_name: examName,
                    exam_cost: 0,
                    exam_description: ''
                },
                results: []
            };
            return {
                ...prev,
                exam_requests: [...(prev.exam_requests || []), newExam]
            };
        });
    };

    const removeExam = (index: number) => {
        setSelectedCase(prev => {
            if (!prev) return null;
            const updatedExams = [...(prev.exam_requests || [])];
            updatedExams.splice(index, 1);
            return { ...prev, exam_requests: updatedExams };
        });
    };

    const addPrescription = () => {
        setSelectedCase(prev => {
            if (!prev) return null;
            const newPrescription: Prescription = {
                add_date: new Date().toISOString(),
                drugs: []
            };
            return {
                ...prev,
                prescriptions: [...(prev.prescriptions || []), newPrescription]
            };
        });
    };

    const removePrescription = (index: number) => {
        setSelectedCase(prev => {
            if (!prev) return null;
            const updatedPrescriptions = [...(prev.prescriptions || [])];
            updatedPrescriptions.splice(index, 1);
            return { ...prev, prescriptions: updatedPrescriptions };
        });
    };

    const addHospitalisation = () => {
        setSelectedCase(prev => {
            if (!prev) return null;
            const newHospitalisation: Hospitalisation = {
                at_date: new Date().toISOString(),
                bed_label: '',
                is_active: true,
                payment_status: 'pending',
                room: {
                    room_label: '',
                    beds: 1,
                    busy_beds: 0,
                    price: 0,
                    type: 'Standard'
                }
            };
            return {
                ...prev,
                hospitalisations: [...(prev.hospitalisations || []), newHospitalisation]
            };
        });
    };

    const removeHospitalisation = (index: number) => {
        setSelectedCase(prev => {
            if (!prev) return null;
            const updatedHospitalisations = [...(prev.hospitalisations || [])];
            updatedHospitalisations.splice(index, 1);
            return { ...prev, hospitalisations: updatedHospitalisations };
        });
    };

    const handleCreateFromScratch = () => {
        const now = new Date().toISOString();
        const emptyCase: ClinicalCase = {
            id: `new-${Date.now()}`,
            consultation_date: now,
            consultation_price: 0,
            consultation_reason: '',
            consultation_notes: '',
            payment_status: 'paid',
            state: 'completed',
            state_patient: 'stable',
            consultation_type: {
                type_doctor: 'Généraliste',
                price: 0
            },
            patient: {
                id: `p-${Date.now()}`,
                add_date: now,
                first_name: 'Nouveau',
                last_name: 'Patient',
                birth_date: now.split('T')[0],
                gender: 'Masculin',
                phone_number: '',
                address: '',
                email: '',
                condition: 'stable',
                status: 'active'
            },
            medical_folder_page: {
                diagnostic: '',
                doctor_note: '',
                nurse_note: '',
                parameters: {
                    temperature: 37,
                    blood_pressure: '120/80',
                    heart_rate: 70,
                    weight: 70,
                    chronical_diseases: '',
                    allergies: '',
                    current_medication: '',
                    family_medical_history: ''
                }
            },
            metadata: {
                pathologie: '',
                domaine: DOMAINES_EXPERTISE_LIST[0] || 'Général',
                niveau_complexite: 'debutant'
            },
            exam_requests: [],
            prescriptions: [],
            hospitalisations: []
        };
        setSelectedCase(emptyCase);
        setStep(2);
    };

    const tabs = [
        { id: 'identity', label: 'Identité', icon: User },
        { id: 'clinical', label: 'Clinique', icon: Activity },
        { id: 'medical', label: 'Dossier', icon: Stethoscope },
        { id: 'history', label: 'Antécédents', icon: FileText },
        { id: 'exams', label: 'Examens', icon: TestTube, count: selectedCase?.exam_requests?.length },
        { id: 'prescriptions', label: 'Ordonnances', icon: Pill, count: selectedCase?.prescriptions?.length },
        { id: 'hospitalisations', label: 'Hospitalisation', icon: Building2, count: selectedCase?.hospitalisations?.length },
        { id: 'metadata', label: 'Métadonnées', icon: Tag },
    ];

    const handleBack = () => setStep(prev => prev - 1);

    const handleSubmit = async () => {
        if (!selectedCase || !user) return;

        try {
            setLoading(true);
            await casEcoleService.createCasEcole({
                titre: formData.titre,
                ecole_id: formData.ecole_id || 1,
                ecole_nom: formData.ecole_nom || "École par défaut",
                classe_id: formData.classe_id || 1,
                classe_nom: formData.classe_nom || "Classe par défaut",
                professeur_id: parseInt(user.id),
                professeur_nom: `${user.prenom} ${user.nom}`,
                professeur_email: user.email,
                cas_clinique: selectedCase,
                temps_limite_minutes: formData.temps_limite_minutes,
                penalite_par_minute: formData.penalite_par_minute
            });
            navigate('/cas-ecole');
        } catch (err) {
            console.error(err);
            alert("Erreur lors de la création du cas d'école");
        } finally {
            setLoading(false);
        }
    };

    const getNiveauBadge = (niveau?: string) => {
        switch (niveau) {
            case 'debutant': return <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-emerald-100 text-emerald-700">Débutant</span>;
            case 'intermediaire': return <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-amber-100 text-amber-700">Intermédiaire</span>;
            case 'avance': return <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-red-100 text-red-700">Avancé</span>;
            default: return <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-slate-100 text-slate-500">-</span>;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => navigate('/cas-ecole')}
                        className="flex items-center text-slate-500 hover:text-slate-900 transition-colors"
                    >
                        <ArrowLeft size={20} className="mr-2" />
                        Annuler
                    </button>

                    {/* Progress Steps */}
                    <div className="flex items-center gap-4">
                        {[1, 2, 3, 4].map((s) => (
                            <div key={s} className="flex items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step >= s ? 'bg-primary text-white' : 'bg-slate-200 text-slate-500'
                                    }`}>
                                    {s}
                                </div>
                                {s < 4 && <div className={`w-12 h-1 mx-2 rounded-full ${step > s ? 'bg-primary' : 'bg-slate-200'}`} />}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden min-h-[600px] flex flex-col">
                    {/* Step Content */}
                    <div className="flex-1 p-8">
                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <div className="text-center mb-8">
                                        <h1 className="text-2xl font-bold text-slate-900">Sélectionnez un cas clinique</h1>
                                        <p className="text-slate-500">Choisissez le cas de base pour votre évaluation</p>
                                    </div>

                                    {/* Filters */}
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                        <div className="md:col-span-5 relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                            <input
                                                type="text"
                                                placeholder="Rechercher (pathologie, motif...)"
                                                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                        </div>
                                        <div className="md:col-span-3">
                                            <select
                                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                                                value={filterDomaine}
                                                onChange={(e) => setFilterDomaine(e.target.value)}
                                            >
                                                <option value="">Tous les domaines</option>
                                                {DOMAINES_EXPERTISE_LIST.map(d => (
                                                    <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="md:col-span-3">
                                            <select
                                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                                                value={filterNiveau}
                                                onChange={(e) => setFilterNiveau(e.target.value)}
                                            >
                                                <option value="">Tous les niveaux</option>
                                                <option value="debutant">Débutant</option>
                                                <option value="intermediaire">Intermédiaire</option>
                                                <option value="avance">Avancé</option>
                                            </select>
                                        </div>
                                        <div className="md:col-span-1 flex justify-center">
                                            <div className="w-full h-full flex items-center justify-center bg-white border border-slate-200 rounded-lg text-slate-400">
                                                <Filter className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* List & Preview */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[400px]">
                                        {/* List */}
                                        <div className="border border-slate-200 rounded-xl overflow-y-auto pr-2">
                                            {filteredCases.length === 0 ? (
                                                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                                    <Search className="w-8 h-8 mb-2" />
                                                    <p>Aucun cas trouvé</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-2 p-2">
                                                    {/* Option: Create from scratch */}
                                                    <div
                                                        onClick={handleCreateFromScratch}
                                                        className="p-4 rounded-lg border-2 border-dashed border-purple-200 bg-purple-50/30 hover:bg-purple-50 hover:border-purple-400 cursor-pointer transition-all group flex items-center gap-4 mb-4"
                                                    >
                                                        <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                            <Plus size={20} />
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-purple-900">Partir de zéro</div>
                                                            <div className="text-xs text-purple-600">Créer un nouveau cas clinique entièrement personnalisé</div>
                                                        </div>
                                                    </div>

                                                    {filteredCases.map(c => (
                                                        <div
                                                            key={c.id}
                                                            onClick={() => setSelectedCase(c)}
                                                            className={`p-4 rounded-lg border cursor-pointer transition-all ${selectedCase?.id === c.id
                                                                ? 'bg-purple-50 border-primary shadow-sm ring-1 ring-primary'
                                                                : 'bg-white border-slate-100 hover:border-purple-200 hover:bg-slate-50'
                                                                }`}
                                                        >
                                                            <div className="flex justify-between items-start mb-1">
                                                                <span className="font-semibold text-slate-900 line-clamp-1">
                                                                    {c.metadata?.pathologie || 'Pathologie inconnue'}
                                                                </span>
                                                                {getNiveauBadge(c.metadata?.niveau_complexite)}
                                                            </div>
                                                            <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                                                                <span>{c.metadata?.domaine || 'Général'}</span>
                                                                <span>•</span>
                                                                <span>{c.patient?.gender === 'M' ? 'Homme' : 'Femme'} {c.patient?.birth_date ? `${new Date().getFullYear() - new Date(c.patient.birth_date).getFullYear()} ans` : 'Âge inconnu'}</span>
                                                                {c.medical_folder_page?.diagnostic && (
                                                                    <>
                                                                        <span>•</span>
                                                                        <span className="font-medium text-slate-700">Diag: {c.medical_folder_page.diagnostic}</span>
                                                                    </>
                                                                )}
                                                            </div>
                                                            <div className="text-sm text-slate-600 line-clamp-2">
                                                                {c.consultation_reason}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Preview */}
                                        <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 flex flex-col">
                                            {selectedCase ? (
                                                <>
                                                    <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-200">
                                                        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-md ${selectedCase.patient?.gender === 'Féminin' ? 'bg-pink-400' : 'bg-blue-400'
                                                            }`}>
                                                            {selectedCase.patient?.first_name?.[0]}{selectedCase.patient?.last_name?.[0]}
                                                        </div>
                                                        <div>
                                                            <h3 className="text-xl font-bold text-slate-900">
                                                                {selectedCase.patient?.first_name} {selectedCase.patient?.last_name}
                                                            </h3>
                                                            <p className="text-slate-500">
                                                                {selectedCase.patient?.birth_date ? `${new Date().getFullYear() - new Date(selectedCase.patient.birth_date).getFullYear()} ans` : 'Âge inconnu'} • {selectedCase.patient?.gender}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-4 flex-1 overflow-y-auto">
                                                        <div>
                                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Motif de consultation</label>
                                                            <p className="text-slate-700 mt-1">{selectedCase.consultation_reason}</p>
                                                        </div>
                                                        <div>
                                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Diagnostic Final</label>
                                                            <p className="text-slate-700 mt-1 font-medium bg-white p-3 rounded-lg border border-slate-200">
                                                                {selectedCase.medical_folder_page?.diagnostic || 'Non défini'}
                                                            </p>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Domaine</label>
                                                                <p className="text-slate-700 mt-1">{selectedCase.metadata?.domaine || '-'}</p>
                                                            </div>
                                                            <div>
                                                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Complexité</label>
                                                                <p className="text-slate-700 mt-1 capitalize">{selectedCase.metadata?.niveau_complexite || '-'}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                                                    <FileText className="w-12 h-12 mb-4 opacity-50" />
                                                    <p className="text-center">Sélectionnez un cas dans la liste<br />pour voir les détails</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {step === 2 && selectedCase && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="h-full flex flex-col"
                                >
                                    <div className="text-center mb-6">
                                        <h1 className="text-2xl font-bold text-slate-900">Personnalisation du cas</h1>
                                        <p className="text-slate-500">Modifiez les détails du cas pour l'adapter à votre évaluation</p>
                                    </div>

                                    {/* Tabs */}
                                    <div className="flex px-4 border-b border-slate-200 bg-white mb-6 overflow-x-auto">
                                        {tabs.map((tab) => (
                                            <button
                                                key={tab.id}
                                                onClick={() => setActiveTab(tab.id)}
                                                className={`
                                                    relative flex items-center gap-2 px-4 py-3 text-sm font-bold transition-colors whitespace-nowrap
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

                                    {/* Content */}
                                    <div className="flex-1 overflow-y-auto pr-2">
                                        {/* TAB: IDENTITY */}
                                        {activeTab === 'identity' && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div className="space-y-6">
                                                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                                        <User className="w-5 h-5 text-primary" />
                                                        Informations Patient
                                                    </h3>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <label className="text-xs font-bold text-slate-500 uppercase">Prénom</label>
                                                            <input
                                                                type="text"
                                                                value={selectedCase.patient?.first_name || ''}
                                                                onChange={(e) => updatePatient('first_name', e.target.value)}
                                                                className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-xs font-bold text-slate-500 uppercase">Nom</label>
                                                            <input
                                                                type="text"
                                                                value={selectedCase.patient?.last_name || ''}
                                                                onChange={(e) => updatePatient('last_name', e.target.value)}
                                                                className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-xs font-bold text-slate-500 uppercase">Date de Naissance</label>
                                                            <input
                                                                type="date"
                                                                value={selectedCase.patient?.birth_date ? selectedCase.patient.birth_date.split('T')[0] : ''}
                                                                onChange={(e) => updatePatient('birth_date', e.target.value)}
                                                                className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-xs font-bold text-slate-500 uppercase">Sexe</label>
                                                            <select
                                                                value={selectedCase.patient?.gender || ''}
                                                                onChange={(e) => updatePatient('gender', e.target.value)}
                                                                className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                                                            >
                                                                <option value="">Sélectionner</option>
                                                                <option value="Masculin">Masculin</option>
                                                                <option value="Féminin">Féminin</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-6">
                                                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                                                        Motif de Consultation
                                                    </h3>
                                                    <div className="space-y-4">
                                                        <div className="space-y-2">
                                                            <label className="text-xs font-bold text-slate-500 uppercase">Motif Principal</label>
                                                            <input
                                                                type="text"
                                                                value={selectedCase.consultation_reason || ''}
                                                                onChange={(e) => setSelectedCase({ ...selectedCase, consultation_reason: e.target.value })}
                                                                className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary outline-none font-medium"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-xs font-bold text-slate-500 uppercase">Notes Préliminaires</label>
                                                            <textarea
                                                                rows={4}
                                                                value={selectedCase.consultation_notes || ''}
                                                                onChange={(e) => setSelectedCase({ ...selectedCase, consultation_notes: e.target.value })}
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
                                                        Constantes Vitales
                                                    </h3>
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                                        <div className="space-y-2">
                                                            <label className="text-xs font-bold text-slate-500 uppercase">Température (°C)</label>
                                                            <input
                                                                type="number"
                                                                step="0.1"
                                                                value={selectedCase.medical_folder_page?.parameters?.temperature || ''}
                                                                onChange={(e) => updateParameters('temperature', parseFloat(e.target.value))}
                                                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-xs font-bold text-slate-500 uppercase">Tension (mmHg)</label>
                                                            <input
                                                                type="text"
                                                                value={selectedCase.medical_folder_page?.parameters?.blood_pressure || ''}
                                                                onChange={(e) => updateParameters('blood_pressure', e.target.value)}
                                                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-xs font-bold text-slate-500 uppercase">Fréquence Card. (bpm)</label>
                                                            <input
                                                                type="number"
                                                                value={selectedCase.medical_folder_page?.parameters?.heart_rate || ''}
                                                                onChange={(e) => updateParameters('heart_rate', parseFloat(e.target.value))}
                                                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-xs font-bold text-slate-500 uppercase">Poids (kg)</label>
                                                            <input
                                                                type="number"
                                                                step="0.1"
                                                                value={selectedCase.medical_folder_page?.parameters?.weight || ''}
                                                                onChange={(e) => updateParameters('weight', parseFloat(e.target.value))}
                                                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-slate-500 uppercase">Note Infirmière</label>
                                                    <textarea
                                                        rows={6}
                                                        value={selectedCase.medical_folder_page?.nurse_note || ''}
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
                                                    <label className="text-xs font-bold text-slate-500 uppercase">Diagnostic Suspecté</label>
                                                    <input
                                                        type="text"
                                                        value={selectedCase.medical_folder_page?.diagnostic || ''}
                                                        onChange={(e) => updateFolder('diagnostic', e.target.value)}
                                                        className="w-full p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none font-bold text-lg"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-slate-500 uppercase">Note du Médecin</label>
                                                    <textarea
                                                        rows={10}
                                                        value={selectedCase.medical_folder_page?.doctor_note || ''}
                                                        onChange={(e) => updateFolder('doctor_note', e.target.value)}
                                                        className="w-full p-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary outline-none leading-relaxed font-serif text-lg text-slate-700"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* TAB: HISTORY */}
                                        {activeTab === 'history' && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-slate-500 uppercase">Maladies Chroniques</label>
                                                    <textarea
                                                        rows={3}
                                                        value={selectedCase.medical_folder_page?.parameters?.chronical_diseases || ''}
                                                        onChange={(e) => updateParameters('chronical_diseases', e.target.value)}
                                                        className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-slate-500 uppercase">Allergies</label>
                                                    <textarea
                                                        rows={3}
                                                        value={selectedCase.medical_folder_page?.parameters?.allergies || ''}
                                                        onChange={(e) => updateParameters('allergies', e.target.value)}
                                                        className="w-full p-3 bg-red-50 border border-red-100 rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-red-800"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-slate-500 uppercase">Médication Actuelle</label>
                                                    <textarea
                                                        rows={3}
                                                        value={selectedCase.medical_folder_page?.parameters?.current_medication || ''}
                                                        onChange={(e) => updateParameters('current_medication', e.target.value)}
                                                        className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-slate-500 uppercase">Antécédents Familiaux</label>
                                                    <textarea
                                                        rows={3}
                                                        value={selectedCase.medical_folder_page?.parameters?.family_medical_history || ''}
                                                        onChange={(e) => updateParameters('family_medical_history', e.target.value)}
                                                        className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* TAB: METADATA */}
                                        {activeTab === 'metadata' && (
                                            <div className="space-y-6">
                                                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                                    <Tag className="w-5 h-5 text-primary" />
                                                    Métadonnées STI
                                                </h3>
                                                <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        <div className="space-y-2 relative">
                                                            <label className="text-xs font-bold text-slate-500 uppercase">Pathologie</label>
                                                            <input
                                                                type="text"
                                                                value={selectedCase.metadata?.pathologie || ''}
                                                                onChange={(e) => updateMetadata('pathologie', e.target.value)}
                                                                onFocus={() => setShowPathologySuggestions(true)}
                                                                onBlur={() => setTimeout(() => setShowPathologySuggestions(false), 200)}
                                                                className="w-full p-3 bg-purple-50 border border-purple-200 rounded-xl focus:ring-2 focus:ring-primary outline-none font-bold text-primary"
                                                                placeholder="Ex: Paludisme"
                                                            />
                                                            {showPathologySuggestions && (
                                                                <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                                                                    {pathologies
                                                                        .filter(p => p.toLowerCase().includes((selectedCase.metadata?.pathologie || '').toLowerCase()))
                                                                        .map((path, index) => (
                                                                            <button
                                                                                key={index}
                                                                                className="w-full text-left px-4 py-2 hover:bg-purple-50 text-slate-700 hover:text-primary transition-colors"
                                                                                onClick={() => {
                                                                                    updateMetadata('pathologie', path);
                                                                                    setShowPathologySuggestions(false);
                                                                                }}
                                                                            >
                                                                                {path}
                                                                            </button>
                                                                        ))}
                                                                    {pathologies.filter(p => p.toLowerCase().includes((selectedCase.metadata?.pathologie || '').toLowerCase())).length === 0 && (
                                                                        <div className="px-4 py-2 text-slate-400 text-sm italic">
                                                                            Aucune suggestion
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-xs font-bold text-slate-500 uppercase">Niveau de Complexité</label>
                                                            <select
                                                                value={selectedCase.metadata?.niveau_complexite || ''}
                                                                onChange={(e) => updateMetadata('niveau_complexite', e.target.value)}
                                                                className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary outline-none font-medium"
                                                            >
                                                                <option value="">Sélectionner</option>
                                                                <option value="debutant">🟢 Débutant</option>
                                                                <option value="intermediaire">🟡 Intermédiaire</option>
                                                                <option value="avance">🔴 Avancé</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* TAB: EXAMS */}
                                        {activeTab === 'exams' && (
                                            <div className="space-y-6">
                                                <div className="flex justify-between items-center">
                                                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                                        <TestTube className="w-5 h-5 text-blue-500" />
                                                        Examens Demandés
                                                    </h3>
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="text"
                                                            placeholder="Nom de l'examen (ex: NFS, Radio thorax...)"
                                                            className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                                            value={newExamName}
                                                            onChange={(e) => setNewExamName(e.target.value)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter' && newExamName.trim()) {
                                                                    addExam(newExamName.trim());
                                                                    setNewExamName('');
                                                                }
                                                            }}
                                                        />
                                                        <button
                                                            onClick={() => {
                                                                if (newExamName.trim()) {
                                                                    addExam(newExamName.trim());
                                                                    setNewExamName('');
                                                                }
                                                            }}
                                                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-bold whitespace-nowrap"
                                                        >
                                                            <Plus size={18} />
                                                            Ajouter
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 gap-4">
                                                    {selectedCase.exam_requests?.length === 0 ? (
                                                        <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400">
                                                            Aucun examen demandé pour ce cas.
                                                        </div>
                                                    ) : (
                                                        selectedCase.exam_requests?.map((exam, idx) => (
                                                            <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-center group">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                                                                        {idx + 1}
                                                                    </div>
                                                                    <div>
                                                                        <div className="font-bold text-slate-900">{exam.exam_name}</div>
                                                                        <div className="text-xs text-slate-500">Statut: {exam.exam_status}</div>
                                                                    </div>
                                                                </div>
                                                                <button
                                                                    onClick={() => removeExam(idx)}
                                                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                                >
                                                                    <Trash2 size={18} />
                                                                </button>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* TAB: PRESCRIPTIONS */}
                                        {activeTab === 'prescriptions' && (
                                            <div className="space-y-6">
                                                <div className="flex justify-between items-center">
                                                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                                        <Pill className="w-5 h-5 text-purple-500" />
                                                        Ordonnances
                                                    </h3>
                                                    <button
                                                        onClick={addPrescription}
                                                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors text-sm font-bold"
                                                    >
                                                        <Plus size={18} />
                                                        Nouvelle ordonnance
                                                    </button>
                                                </div>

                                                <div className="grid grid-cols-1 gap-6">
                                                    {selectedCase.prescriptions?.length === 0 ? (
                                                        <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400">
                                                            Aucune ordonnance pour ce cas.
                                                        </div>
                                                    ) : (
                                                        selectedCase.prescriptions?.map((presc, idx) => (
                                                            <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 relative group">
                                                                <div className="flex justify-between items-start">
                                                                    <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">Ordonnance #{idx + 1}</div>
                                                                    <button
                                                                        onClick={() => removePrescription(idx)}
                                                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                                    >
                                                                        <Trash2 size={18} />
                                                                    </button>
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <label className="text-xs font-bold text-slate-500 uppercase">Note de l'ordonnance</label>
                                                                    <textarea
                                                                        rows={2}
                                                                        value={presc.note || ''}
                                                                        onChange={(e) => {
                                                                            const updated = [...(selectedCase.prescriptions || [])];
                                                                            updated[idx] = { ...updated[idx], note: e.target.value };
                                                                            setSelectedCase({ ...selectedCase, prescriptions: updated });
                                                                        }}
                                                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                                                                        placeholder="Instructions générales..."
                                                                    />
                                                                </div>
                                                                <div className="space-y-4">
                                                                    <div className="flex justify-between items-center">
                                                                        <label className="text-xs font-bold text-slate-500 uppercase">Médicaments</label>
                                                                        <button
                                                                            onClick={() => {
                                                                                const updated = [...(selectedCase.prescriptions || [])];
                                                                                updated[idx] = {
                                                                                    ...updated[idx],
                                                                                    drugs: [...(updated[idx].drugs || []), {
                                                                                        quantity: 1,
                                                                                        dosage: '',
                                                                                        instructions: '',
                                                                                        frequency: '',
                                                                                        duration: '',
                                                                                        medicament: { name: '', price: 0, current_stock: 0 }
                                                                                    }]
                                                                                };
                                                                                setSelectedCase({ ...selectedCase, prescriptions: updated });
                                                                            }}
                                                                            className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1"
                                                                        >
                                                                            <Plus size={14} />
                                                                            Ajouter un médicament
                                                                        </button>
                                                                    </div>

                                                                    <div className="space-y-3">
                                                                        {presc.drugs?.length === 0 ? (
                                                                            <div className="text-center py-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400 text-xs">
                                                                                Aucun médicament ajouté.
                                                                            </div>
                                                                        ) : (
                                                                            presc.drugs?.map((drug, drugIdx) => (
                                                                                <div key={drugIdx} className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-3 relative group/drug">
                                                                                    <button
                                                                                        onClick={() => {
                                                                                            const updated = [...(selectedCase.prescriptions || [])];
                                                                                            const updatedDrugs = [...(updated[idx].drugs || [])];
                                                                                            updatedDrugs.splice(drugIdx, 1);
                                                                                            updated[idx] = { ...updated[idx], drugs: updatedDrugs };
                                                                                            setSelectedCase({ ...selectedCase, prescriptions: updated });
                                                                                        }}
                                                                                        className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-red-500 opacity-0 group-hover/drug:opacity-100 transition-opacity"
                                                                                    >
                                                                                        <X size={14} />
                                                                                    </button>
                                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                                        <div className="space-y-1">
                                                                                            <label className="text-[10px] font-bold text-slate-400 uppercase">Nom du médicament</label>
                                                                                            <input
                                                                                                type="text"
                                                                                                value={drug.medicament.name}
                                                                                                onChange={(e) => {
                                                                                                    const updated = [...(selectedCase.prescriptions || [])];
                                                                                                    const updatedDrugs = [...(updated[idx].drugs || [])];
                                                                                                    updatedDrugs[drugIdx] = {
                                                                                                        ...updatedDrugs[drugIdx],
                                                                                                        medicament: { ...updatedDrugs[drugIdx].medicament, name: e.target.value }
                                                                                                    };
                                                                                                    updated[idx] = { ...updated[idx], drugs: updatedDrugs };
                                                                                                    setSelectedCase({ ...selectedCase, prescriptions: updated });
                                                                                                }}
                                                                                                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                                                                                                placeholder="Ex: Paracétamol"
                                                                                            />
                                                                                        </div>
                                                                                        <div className="space-y-1">
                                                                                            <label className="text-[10px] font-bold text-slate-400 uppercase">Dosage</label>
                                                                                            <input
                                                                                                type="text"
                                                                                                value={drug.dosage}
                                                                                                onChange={(e) => {
                                                                                                    const updated = [...(selectedCase.prescriptions || [])];
                                                                                                    const updatedDrugs = [...(updated[idx].drugs || [])];
                                                                                                    updatedDrugs[drugIdx] = { ...updatedDrugs[drugIdx], dosage: e.target.value };
                                                                                                    updated[idx] = { ...updated[idx], drugs: updatedDrugs };
                                                                                                    setSelectedCase({ ...selectedCase, prescriptions: updated });
                                                                                                }}
                                                                                                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                                                                                                placeholder="Ex: 500mg"
                                                                                            />
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                                                        <div className="space-y-1">
                                                                                            <label className="text-[10px] font-bold text-slate-400 uppercase">Fréquence</label>
                                                                                            <input
                                                                                                type="text"
                                                                                                value={drug.frequency}
                                                                                                onChange={(e) => {
                                                                                                    const updated = [...(selectedCase.prescriptions || [])];
                                                                                                    const updatedDrugs = [...(updated[idx].drugs || [])];
                                                                                                    updatedDrugs[drugIdx] = { ...updatedDrugs[drugIdx], frequency: e.target.value };
                                                                                                    updated[idx] = { ...updated[idx], drugs: updatedDrugs };
                                                                                                    setSelectedCase({ ...selectedCase, prescriptions: updated });
                                                                                                }}
                                                                                                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                                                                                                placeholder="Ex: 3x/jour"
                                                                                            />
                                                                                        </div>
                                                                                        <div className="space-y-1">
                                                                                            <label className="text-[10px] font-bold text-slate-400 uppercase">Durée</label>
                                                                                            <input
                                                                                                type="text"
                                                                                                value={drug.duration}
                                                                                                onChange={(e) => {
                                                                                                    const updated = [...(selectedCase.prescriptions || [])];
                                                                                                    const updatedDrugs = [...(updated[idx].drugs || [])];
                                                                                                    updatedDrugs[drugIdx] = { ...updatedDrugs[drugIdx], duration: e.target.value };
                                                                                                    updated[idx] = { ...updated[idx], drugs: updatedDrugs };
                                                                                                    setSelectedCase({ ...selectedCase, prescriptions: updated });
                                                                                                }}
                                                                                                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                                                                                                placeholder="Ex: 5 jours"
                                                                                            />
                                                                                        </div>
                                                                                        <div className="space-y-1">
                                                                                            <label className="text-[10px] font-bold text-slate-400 uppercase">Quantité</label>
                                                                                            <input
                                                                                                type="number"
                                                                                                value={drug.quantity}
                                                                                                onChange={(e) => {
                                                                                                    const updated = [...(selectedCase.prescriptions || [])];
                                                                                                    const updatedDrugs = [...(updated[idx].drugs || [])];
                                                                                                    updatedDrugs[drugIdx] = { ...updatedDrugs[drugIdx], quantity: parseInt(e.target.value) || 0 };
                                                                                                    updated[idx] = { ...updated[idx], drugs: updatedDrugs };
                                                                                                    setSelectedCase({ ...selectedCase, prescriptions: updated });
                                                                                                }}
                                                                                                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                                                                                            />
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            ))
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* TAB: HOSPITALISATIONS */}
                                        {activeTab === 'hospitalisations' && (
                                            <div className="space-y-6">
                                                <div className="flex justify-between items-center">
                                                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                                        <Building2 className="w-5 h-5 text-amber-500" />
                                                        Hospitalisations
                                                    </h3>
                                                    <button
                                                        onClick={addHospitalisation}
                                                        className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors text-sm font-bold"
                                                    >
                                                        <Plus size={18} />
                                                        Ajouter une hospitalisation
                                                    </button>
                                                </div>

                                                <div className="grid grid-cols-1 gap-4">
                                                    {selectedCase.hospitalisations?.length === 0 ? (
                                                        <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400">
                                                            Aucune hospitalisation prévue.
                                                        </div>
                                                    ) : (
                                                        selectedCase.hospitalisations?.map((hosp, idx) => (
                                                            <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-center group">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                                                                        H
                                                                    </div>
                                                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                                                                        <div className="space-y-1">
                                                                            <label className="text-[10px] font-bold text-slate-400 uppercase">Lit</label>
                                                                            <input
                                                                                type="text"
                                                                                value={hosp.bed_label || ''}
                                                                                onChange={(e) => {
                                                                                    const updated = [...(selectedCase.hospitalisations || [])];
                                                                                    updated[idx] = { ...updated[idx], bed_label: e.target.value };
                                                                                    setSelectedCase({ ...selectedCase, hospitalisations: updated });
                                                                                }}
                                                                                placeholder="Ex: Lit 01"
                                                                                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                                                                            />
                                                                        </div>
                                                                        <div className="space-y-1">
                                                                            <label className="text-[10px] font-bold text-slate-400 uppercase">Chambre</label>
                                                                            <input
                                                                                type="text"
                                                                                value={hosp.room.room_label || ''}
                                                                                onChange={(e) => {
                                                                                    const updated = [...(selectedCase.hospitalisations || [])];
                                                                                    updated[idx] = {
                                                                                        ...updated[idx],
                                                                                        room: { ...updated[idx].room, room_label: e.target.value }
                                                                                    };
                                                                                    setSelectedCase({ ...selectedCase, hospitalisations: updated });
                                                                                }}
                                                                                placeholder="Ex: Chambre 10"
                                                                                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                                                                            />
                                                                        </div>
                                                                        <div className="space-y-1">
                                                                            <label className="text-[10px] font-bold text-slate-400 uppercase">Type</label>
                                                                            <select
                                                                                value={hosp.room.type || 'Standard'}
                                                                                onChange={(e) => {
                                                                                    const updated = [...(selectedCase.hospitalisations || [])];
                                                                                    updated[idx] = {
                                                                                        ...updated[idx],
                                                                                        room: { ...updated[idx].room, type: e.target.value }
                                                                                    };
                                                                                    setSelectedCase({ ...selectedCase, hospitalisations: updated });
                                                                                }}
                                                                                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                                                                            >
                                                                                <option value="Standard">Standard</option>
                                                                                <option value="VIP">VIP</option>
                                                                                <option value="Urgence">Urgence</option>
                                                                                <option value="Soins Intensifs">Soins Intensifs</option>
                                                                            </select>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <button
                                                                    onClick={() => removeHospitalisation(idx)}
                                                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                                >
                                                                    <Trash2 size={18} />
                                                                </button>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="max-w-2xl mx-auto"
                                >
                                    <div className="text-center mb-8">
                                        <h1 className="text-2xl font-bold text-slate-900">Paramètres de l'évaluation</h1>
                                        <p className="text-slate-500">Configurez les modalités de l'exercice pour vos étudiants</p>
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Titre de l'exercice</label>
                                            <input
                                                type="text"
                                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                                                placeholder="Ex: Évaluation Cardiologie - Groupe A - 2024"
                                                value={formData.titre}
                                                onChange={e => setFormData({ ...formData, titre: e.target.value })}
                                                autoFocus
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Établissement</label>
                                                <div className="relative">
                                                    <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                                    <input
                                                        type="text"
                                                        className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                                                        value={formData.ecole_nom}
                                                        onChange={e => setFormData({ ...formData, ecole_nom: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Classe / Groupe</label>
                                                <div className="relative">
                                                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                                    <input
                                                        type="text"
                                                        className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                                                        placeholder="Ex: Master 1"
                                                        value={formData.classe_nom}
                                                        onChange={e => setFormData({ ...formData, classe_nom: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-amber-50 border border-amber-100 rounded-xl p-6 space-y-6">
                                            <h3 className="font-semibold text-amber-900 flex items-center gap-2">
                                                <Clock className="w-5 h-5" />
                                                Contraintes de temps
                                            </h3>

                                            <div className="grid grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-sm font-medium text-amber-800 mb-1">Durée limite (min)</label>
                                                    <input
                                                        type="number"
                                                        min="5"
                                                        max="180"
                                                        className="w-full px-4 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none bg-white"
                                                        value={formData.temps_limite_minutes}
                                                        onChange={e => setFormData({ ...formData, temps_limite_minutes: parseInt(e.target.value) })}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-amber-800 mb-1">Pénalité (pts/min)</label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        className="w-full px-4 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none bg-white"
                                                        value={formData.penalite_par_minute}
                                                        onChange={e => setFormData({ ...formData, penalite_par_minute: parseInt(e.target.value) })}
                                                    />
                                                </div>
                                            </div>
                                            <p className="text-xs text-amber-700 flex items-start gap-2">
                                                <AlertTriangle className="w-4 h-4 shrink-0" />
                                                Les étudiants pourront dépasser le temps limite, mais chaque minute supplémentaire réduira leur note finale selon la pénalité définie.
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {step === 4 && (
                                <motion.div
                                    key="step3"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="max-w-2xl mx-auto text-center"
                                >
                                    <div className="mb-8">
                                        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <CheckCircle className="w-10 h-10" />
                                        </div>
                                        <h1 className="text-2xl font-bold text-slate-900">Vérification</h1>
                                        <p className="text-slate-500">Relisez les informations avant de valider la création</p>
                                    </div>

                                    <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 text-left space-y-6 mb-8">
                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cas Clinique</label>
                                                <p className="font-semibold text-slate-900">{selectedCase?.metadata?.pathologie}</p>
                                                <p className="text-sm text-slate-500">{selectedCase?.patient?.first_name} {selectedCase?.patient?.last_name}</p>
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Titre Exercice</label>
                                                <p className="font-semibold text-slate-900">{formData.titre}</p>
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Groupe Cible</label>
                                                <p className="font-semibold text-slate-900">{formData.ecole_nom}</p>
                                                <p className="text-sm text-slate-500">{formData.classe_nom}</p>
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Paramètres</label>
                                                <p className="font-semibold text-slate-900">{formData.temps_limite_minutes} min</p>
                                                <p className="text-sm text-slate-500">-{formData.penalite_par_minute} pts / min sup.</p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Footer / Navigation */}
                    <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-between items-center">
                        <button
                            onClick={handleBack}
                            disabled={step === 1}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-colors ${step === 1
                                ? 'text-slate-300 cursor-not-allowed'
                                : 'text-slate-600 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200'
                                }`}
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Précédent
                        </button>

                        {step < 4 ? (
                            <button
                                onClick={handleNext}
                                disabled={
                                    (step === 1 && !selectedCase) ||
                                    (step === 3 && (!formData.titre || !formData.ecole_nom || !formData.classe_nom))
                                }
                                className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed"
                            >
                                Suivant
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="flex items-center gap-2 px-8 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Créer le cas d'école
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
