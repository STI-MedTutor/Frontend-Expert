import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, School, Clock, Trash2, BookOpen, ToggleLeft, ToggleRight, Calendar, Award, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { casEcoleService } from '../services/casEcoleService';
import { authService } from '../services/authService';
import type { CasEcole } from '../types/casEcole';
import { useToast } from '../stores/toastStore';

export default function SchoolClinicalCases() {
    const navigate = useNavigate();
    const [cases, setCases] = useState<CasEcole[]>([]);
    const [loading, setLoading] = useState(true);
    const toast = useToast();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const user = await authService.getCurrentUser();
            const data = await casEcoleService.getAllCasEcole(user.id);
            setCases(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleActif = async (id: string) => {
        try {
            const updatedCase = await casEcoleService.toggleActif(id);
            setCases(cases.map(c => c.id === id ? updatedCase : c));
            toast.success(updatedCase.actif ? "Cas activé" : "Cas désactivé");
        } catch (err) {
            console.error(err);
            toast.error("Erreur lors du changement d'état");
        }
    };

    const handleDeleteClick = async (id: string) => {
        if (window.confirm("Voulez-vous vraiment supprimer ce cas d'école ?")) {
            try {
                await casEcoleService.deleteCasEcole(id);
                setCases(cases.filter(c => c.id !== id));
                toast.success("Cas d'école supprimé");
            } catch (err) {
                console.error(err);
                toast.error("Erreur lors de la suppression");
            }
        }
    };


    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Cas Cliniques d'École</h1>
                        <p className="text-slate-600 mt-2">Gérez vos évaluations et exercices pédagogiques</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => navigate('/cas-ecole/create')}
                            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors shadow-sm shadow-purple-200"
                        >
                            <Plus size={20} />
                            Nouveau Cas d'École
                        </button>
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {cases.map((cas, index) => (
                        <motion.div
                            key={cas.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="group relative bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl hover:shadow-purple-500/10 hover:border-purple-200 transition-all duration-300"
                        >
                            {/* Status Badge & Actions Overlay */}
                            <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
                                <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${cas.actif
                                    ? 'bg-green-500 text-white shadow-lg shadow-green-500/20'
                                    : 'bg-slate-400 text-white shadow-lg shadow-slate-400/20'
                                    }`}>
                                    {cas.actif ? 'Actif' : 'Brouillon'}
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <button
                                        onClick={() => handleToggleActif(cas.id)}
                                        className="p-2 bg-white/90 backdrop-blur-sm text-slate-600 hover:text-purple-600 rounded-full shadow-sm border border-slate-100 transition-all"
                                        title={cas.actif ? "Désactiver" : "Activer"}
                                    >
                                        {cas.actif ? <ToggleRight size={18} className="text-green-600" /> : <ToggleLeft size={18} />}
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClick(cas.id)}
                                        className="p-2 bg-white/90 backdrop-blur-sm text-slate-600 hover:text-red-600 rounded-full shadow-sm border border-slate-100 transition-all"
                                        title="Supprimer"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Card Header with Gradient Accent */}
                            <div className="h-24 bg-gradient-to-br from-purple-50 to-indigo-50 relative overflow-hidden">
                                <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-200/20 rounded-full blur-2xl group-hover:bg-purple-400/30 transition-colors duration-500" />
                                <div className="absolute -left-4 -bottom-4 w-20 h-20 bg-indigo-200/20 rounded-full blur-xl group-hover:bg-indigo-400/30 transition-colors duration-500" />

                                <div className="absolute bottom-4 left-6">
                                    <div className="flex items-center gap-2 text-xs font-bold text-purple-600/80 uppercase tracking-widest mb-1">
                                        <Award size={14} />
                                        {cas.cas_clinique.metadata?.niveau_complexite || 'Débutant'}
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 pt-4">
                                <h3 className="text-xl font-bold text-slate-900 mb-4 group-hover:text-purple-700 transition-colors line-clamp-2 leading-tight">
                                    {cas.titre}
                                </h3>

                                <div className="space-y-4 mb-6">
                                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl group-hover:bg-purple-50/50 transition-colors">
                                        <div className="w-8 h-8 rounded-xl bg-white shadow-sm flex items-center justify-center text-purple-600">
                                            <School size={16} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Établissement & Classe</span>
                                            <span className="text-sm font-semibold text-slate-700 truncate max-w-[180px]">{cas.ecole_nom} • {cas.classe_nom}</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                                            <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                                                <BookOpen size={14} />
                                            </div>
                                            <span className="truncate">{cas.cas_clinique.metadata?.pathologie || "Pathologie inconnue"}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                                            <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                                                <Clock size={14} />
                                            </div>
                                            <span>{cas.temps_limite_minutes} min</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
                                        <Calendar size={12} />
                                        {new Date(cas.date_creation).toLocaleDateString()}
                                    </div>
                                    <button
                                        onClick={() => navigate(`/cas-ecole/edit/${cas.id}`)}
                                        className="flex items-center gap-1 text-xs font-bold text-purple-600 hover:text-purple-700 transition-colors group/btn"
                                    >
                                        Détails
                                        <ChevronRight size={14} className="group-hover/btn:translate-x-0.5 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    {cases.length === 0 && !loading && (
                        <div className="col-span-full text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                            <School size={48} className="mx-auto text-slate-300 mb-4" />
                            <h3 className="text-lg font-medium text-slate-900">Aucun cas d'école</h3>
                            <p className="text-slate-500 mb-6">Commencez par créer votre premier cas pédagogique.</p>
                            <button
                                onClick={() => navigate('/cas-ecole/create')}
                                className="text-purple-600 font-medium hover:text-indigo-700"
                            >
                                Créer un cas maintenant &rarr;
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
