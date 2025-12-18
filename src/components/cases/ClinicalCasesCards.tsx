import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Edit2, User, Download, Activity } from 'lucide-react';
import type { ClinicalCase } from '../../types/clinicalCase';
import { clinicalCasesService } from '../../services/clinicalCasesService';
import { useToast } from '../../stores/toastStore';
import ClinicalCaseModal from './ClinicalCaseModal';

export default function ClinicalCasesCards() {
    const [cases, setCases] = useState<ClinicalCase[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCase, setSelectedCase] = useState<ClinicalCase | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Filtres
    const [showFilters, setShowFilters] = useState(false);
    const [filterPathologie, setFilterPathologie] = useState('');
    const [filterNiveau, setFilterNiveau] = useState('');
    const [availablePathologies, setAvailablePathologies] = useState<string[]>([]);

    const toast = useToast();

    useEffect(() => {
        loadCases();
        loadFilters();
    }, []);

    const loadCases = async () => {
        setIsLoading(true);
        try {
            const data = await clinicalCasesService.getCases(
                filterPathologie || undefined,
                filterNiveau || undefined
            );
            setCases(data);
        } catch (err: any) {
            toast.error(err.message || "Erreur lors du chargement des cas");
        } finally {
            setIsLoading(false);
        }
    };

    const loadFilters = async () => {
        try {
            const pathologies = await clinicalCasesService.getAvailablePathologies();
            setAvailablePathologies(pathologies);
        } catch (err) {
            console.error('Erreur chargement filtres:', err);
        }
    };

    useEffect(() => {
        if (!isLoading) {
            loadCases();
        }
    }, [filterPathologie, filterNiveau]);

    const openModal = (c: ClinicalCase) => {
        setSelectedCase(c);
        setIsModalOpen(true);
    };

    const handleDownloadJson = () => {
        const jsonString = JSON.stringify(cases, null, 2);
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "clinical_cases.json";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Fichier JSON téléchargé");
    };

    const filteredCases = cases.filter(c =>
        (c.patient?.last_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.consultation_reason || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.medical_folder_page?.diagnostic || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.metadata?.pathologie || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getNiveauBadge = (niveau?: string) => {
        switch (niveau) {
            case 'debutant':
                return <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-emerald-100 text-emerald-700">🟢 Débutant</span>;
            case 'intermediaire':
                return <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-amber-100 text-amber-700">🟡 Intermédiaire</span>;
            case 'avance':
                return <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-red-100 text-red-700">🔴 Avancé</span>;
            default:
                return <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-slate-100 text-slate-500">-</span>;
        }
    };

    const calculateAge = (birthDate: string) => {
        if (!birthDate) return "";
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    return (
        <div className="w-full space-y-6">
            {/* Toolbar */}
            <div className="flex flex-col gap-4 bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Rechercher un patient, pathologie..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                        />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        <button
                            onClick={handleDownloadJson}
                            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors font-medium"
                        >
                            <Download className="w-4 h-4" />
                            JSON
                        </button>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl transition-colors font-medium ${showFilters || filterPathologie || filterNiveau
                                ? 'bg-purple-100 border-purple-300 text-primary'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            <Filter className="w-4 h-4" />
                            Filtres
                            {(filterPathologie || filterNiveau) && (
                                <span className="w-2 h-2 bg-primary rounded-full" />
                            )}
                        </button>
                        <button
                            onClick={() => loadCases()}
                            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-medium shadow-lg shadow-primary/20"
                        >
                            <Activity className="w-4 h-4" />
                            Rafraîchir
                        </button>
                    </div>
                </div>

                {/* Filters Panel */}
                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-200">
                                <div className="flex items-center gap-2">
                                    <label className="text-sm font-medium text-slate-500">Pathologie:</label>
                                    <select
                                        value={filterPathologie}
                                        onChange={(e) => setFilterPathologie(e.target.value)}
                                        className="px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm"
                                    >
                                        <option value="">Toutes</option>
                                        {availablePathologies.map(p => (
                                            <option key={p} value={p}>{p}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex items-center gap-2">
                                    <label className="text-sm font-medium text-slate-500">Niveau:</label>
                                    <select
                                        value={filterNiveau}
                                        onChange={(e) => setFilterNiveau(e.target.value)}
                                        className="px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm"
                                    >
                                        <option value="">Tous</option>
                                        <option value="debutant">🟢 Débutant</option>
                                        <option value="intermediaire">🟡 Intermédiaire</option>
                                        <option value="avance">🔴 Avancé</option>
                                    </select>
                                </div>
                                {(filterPathologie || filterNiveau) && (
                                    <button
                                        onClick={() => { setFilterPathologie(''); setFilterNiveau(''); }}
                                        className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        Réinitialiser
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Cards Grid */}
            {isLoading ? (
                <div className="flex justify-center items-center py-20">
                    <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <AnimatePresence>
                        {filteredCases.map((c) => (
                            <motion.div
                                key={c.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-purple-100/50 transition-all duration-300 overflow-hidden cursor-pointer"
                                onClick={() => openModal(c)}
                            >
                                {/* Card Header */}
                                <div className="bg-gradient-to-r from-purple-50 to-fuchsia-50 p-4 border-b border-slate-100">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-md ${c.patient?.gender === 'F' ? 'bg-pink-400' : 'bg-blue-400'
                                                }`}>
                                                {c.patient?.first_name?.[0] || '?'}{c.patient?.last_name?.[0] || '?'}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-900 text-lg">
                                                    {c.patient?.first_name} {c.patient?.last_name}
                                                </h3>
                                                <p className="text-xs text-slate-500">
                                                    {calculateAge(c.patient?.birth_date || '')} ans • {c.patient?.gender === 'F' ? 'Femme' : 'Homme'}
                                                </p>
                                            </div>
                                        </div>
                                        {getNiveauBadge(c.metadata?.niveau_complexite)}
                                    </div>
                                </div>

                                {/* Card Body */}
                                <div className="p-4 space-y-3">
                                    {/* Consultation Info */}
                                    <div>
                                        <p className="text-sm font-semibold text-primary line-clamp-2">
                                            {c.consultation_reason}
                                        </p>
                                    </div>

                                    {/* Pathologie */}
                                    {c.metadata?.pathologie && (
                                        <div className="flex items-center gap-2">
                                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200">
                                                {c.metadata.pathologie}
                                            </span>
                                        </div>
                                    )}

                                    {/* Vitals */}
                                    <div className="flex gap-2 text-xs">
                                        <span className="px-2 py-1 bg-slate-100 rounded-md border border-slate-200 flex items-center gap-1">
                                            🌡️ {c.medical_folder_page?.parameters?.temperature || '-'}°C
                                        </span>
                                        <span className="px-2 py-1 bg-slate-100 rounded-md border border-slate-200 flex items-center gap-1">
                                            ❤️ {c.medical_folder_page?.parameters?.blood_pressure || '-'}
                                        </span>
                                    </div>
                                </div>

                                {/* Card Footer - Edit Button (always visible) */}
                                <div className="px-4 pb-4">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            openModal(c);
                                        }}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary/90 text-white rounded-lg hover:bg-primary transition-colors text-sm font-medium shadow-sm"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                        Modifier
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            )}

            {/* Empty State */}
            {!isLoading && filteredCases.length === 0 && (
                <div className="text-center py-20">
                    <User className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500 text-lg">Aucun cas trouvé</p>
                </div>
            )}

            {/* Modal */}
            <ClinicalCaseModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                caseData={selectedCase}
                onSave={async (updatedCase: ClinicalCase) => {
                    await clinicalCasesService.updateCase(updatedCase.id, updatedCase);
                    loadCases();
                    setIsModalOpen(false);
                    toast.success("Dossier mis à jour");
                }}
            />
        </div>
    );
}
