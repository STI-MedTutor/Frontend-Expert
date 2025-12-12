'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, MoreHorizontal, FileText, Activity,
  User, Calendar, ChevronDown, Edit2, Check, X, AlertCircle, Download, Plus, Trash2, Tag
} from 'lucide-react';
import type { ClinicalCase } from '../../types/clinicalCase';
import { clinicalCasesService } from '../../services/clinicalCasesService';
import { useToast } from '../../stores/toastStore';
import ClinicalCaseModal from './ClinicalCaseModal';

export default function ClinicalCasesTable() {
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
  const [availableNiveaux, setAvailableNiveaux] = useState<string[]>([]);

  // Inline Editing State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<ClinicalCase>>({});

  // Error state
  const [error, setError] = useState<string | null>(null);

  const toast = useToast();

  useEffect(() => {
    loadCases();
    loadFilters();
  }, []);

  const loadCases = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await clinicalCasesService.getCases(
        filterPathologie || undefined,
        filterNiveau || undefined
      );
      setCases(data);
    } catch (err: any) {
      const errorMsg = err.message || "Erreur lors du chargement des cas cliniques";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const loadFilters = async () => {
    try {
      const [pathologies, niveaux] = await Promise.all([
        clinicalCasesService.getAvailablePathologies(),
        clinicalCasesService.getAvailableNiveaux()
      ]);
      setAvailablePathologies(pathologies);
      setAvailableNiveaux(niveaux);
    } catch (err) {
      console.error('Erreur chargement filtres:', err);
    }
  };

  // Recharger quand les filtres changent
  useEffect(() => {
    if (!isLoading) {
      loadCases();
    }
  }, [filterPathologie, filterNiveau]);

  const handleEditClick = (c: ClinicalCase) => {
    setEditingId(c.id);
    setEditForm({
      consultation_reason: c.consultation_reason,
      medical_folder_page: { ...c.medical_folder_page }
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSaveEdit = async (id: string) => {
    try {
      setCases(prev => prev.map(c => c.id === id ? { ...c, ...editForm, medical_folder_page: { ...c.medical_folder_page, ...editForm.medical_folder_page } } : c));
      setEditingId(null);

      await clinicalCasesService.updateCase(id, editForm);
      toast.success("Modifications enregistrées");
    } catch (error) {
      toast.error("Erreur lors de la sauvegarde");
      loadCases();
    }
  };

  const handleDeleteCase = async (id: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer ce cas clinique ?`)) return;

    try {
      await clinicalCasesService.deleteCase(id);
      setCases(prev => prev.filter(c => c.id !== id));
      toast.success("Cas supprimé avec succès");
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const openFullModal = (c: ClinicalCase) => {
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

  return (
    <div className="w-full space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col gap-4 bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher un patient, symptôme, pathologie..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
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
                ? 'bg-indigo-100 border-indigo-300 text-indigo-700'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
            >
              <Filter className="w-4 h-4" />
              Filtres
              {(filterPathologie || filterNiveau) && (
                <span className="w-2 h-2 bg-indigo-500 rounded-full" />
              )}
            </button>
            <button
              onClick={() => {
                setSelectedCase(null);
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium shadow-lg shadow-emerald-200"
            >
              <Plus className="w-4 h-4" />
              Nouveau Cas
            </button>
            <button
              onClick={() => loadCases()}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium shadow-lg shadow-indigo-200"
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
                    className="px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
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
                    className="px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
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

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
          <button onClick={loadCases} className="ml-auto text-sm underline">Réessayer</button>
        </div>
      )}

      {/* Table Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-100/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-4 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Patient</th>
                <th className="px-4 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Motif</th>
                <th className="px-4 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Diagnostic</th>
                <th className="px-4 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Pathologie</th>
                <th className="px-4 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Niveau</th>
                <th className="px-4 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <AnimatePresence>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                      <div className="flex justify-center items-center gap-3">
                        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                        Chargement des données...
                      </div>
                    </td>
                  </tr>
                ) : filteredCases.map((c) => (
                  <motion.tr
                    key={c.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="group hover:bg-indigo-50/30 transition-colors"
                  >
                    {/* Patient Column */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-md ${c.patient?.gender === 'Féminin' ? 'bg-pink-400' : 'bg-blue-400'
                          }`}>
                          {c.patient?.first_name?.[0] || '?'}{c.patient?.last_name?.[0] || '?'}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{c.patient?.first_name || 'Inconnu'} {c.patient?.last_name || ''}</div>
                          <div className="text-xs text-slate-500">
                            {c.patient?.birth_date ? `${new Date().getFullYear() - new Date(c.patient.birth_date).getFullYear()} ans` : 'Âge inconnu'}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Motif Column (Editable) */}
                    <td className="px-4 py-4">
                      {editingId === c.id ? (
                        <input
                          type="text"
                          value={editForm.consultation_reason || ''}
                          onChange={(e) => setEditForm({ ...editForm, consultation_reason: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                          autoFocus
                        />
                      ) : (
                        <div className="text-sm font-medium text-slate-700 max-w-[180px] truncate" title={c.consultation_reason}>
                          {c.consultation_reason || 'Non spécifié'}
                        </div>
                      )}
                    </td>

                    {/* Diagnostic Column (Editable) */}
                    <td className="px-4 py-4">
                      {editingId === c.id ? (
                        <input
                          type="text"
                          value={editForm.medical_folder_page?.diagnostic || ''}
                          onChange={(e) => setEditForm({
                            ...editForm,
                            medical_folder_page: {
                              ...c.medical_folder_page,
                              diagnostic: e.target.value,
                              ...editForm.medical_folder_page
                            } as any
                          })}
                          className="w-full px-3 py-2 bg-white border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200 max-w-[150px] truncate">
                            {c.medical_folder_page?.diagnostic || 'En attente'}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Pathologie Column */}
                    <td className="px-4 py-4">
                      {c.metadata?.pathologie ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700 border border-indigo-200">
                          {c.metadata.pathologie}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-sm">-</span>
                      )}
                    </td>

                    {/* Niveau Column */}
                    <td className="px-4 py-4">
                      {getNiveauBadge(c.metadata?.niveau_complexite)}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {editingId === c.id ? (
                          <>
                            <button
                              onClick={() => handleSaveEdit(c.id)}
                              className="p-2 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200 transition-colors"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEditClick(c)}
                              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                              title="Modification rapide"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCase(c.id)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                              title="Supprimer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openFullModal(c)}
                              className="flex items-center gap-2 px-3 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all text-xs font-bold"
                            >
                              Détails
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Footer / Pagination */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
          <span className="text-sm text-slate-500">Affichage de {filteredCases.length} cas</span>
          <div className="flex gap-2">
            <button className="px-3 py-1 text-sm border border-slate-200 rounded-lg bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50">Précédent</button>
            <button className="px-3 py-1 text-sm border border-slate-200 rounded-lg bg-white text-slate-600 hover:bg-slate-50">Suivant</button>
          </div>
        </div>
      </div>

      {/* Complex Modal */}
      <ClinicalCaseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        caseData={selectedCase}
        onSave={async (updatedCase: ClinicalCase) => {
          if (selectedCase) {
            // Mode édition
            await clinicalCasesService.updateCase(updatedCase.id, updatedCase);
            toast.success("Dossier complet mis à jour");
          } else {
            // Mode création
            await clinicalCasesService.createCase(updatedCase);
            toast.success("Nouveau cas créé avec succès");
          }
          loadCases();
          setIsModalOpen(false);
        }}
      />
    </div>
  );
}
