import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, CheckCircle2 } from 'lucide-react';

interface RejectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason: string, rejectedElements: string[]) => void;
    caseTitle: string;
}

const REJECTABLE_ELEMENTS = [
    { id: 'patient', label: 'Informations Patient' },
    { id: 'diagnostic', label: 'Diagnostic' },
    { id: 'exam_requests', label: 'Examens' },
    { id: 'prescriptions', label: 'Prescriptions' },
    { id: 'consultation_reason', label: 'Motif de consultation' },
    { id: 'medical_folder', label: 'Dossier Médical' }
];

export default function RejectionModal({ isOpen, onClose, onConfirm, caseTitle }: RejectionModalProps) {
    const [reason, setReason] = useState('');
    const [selectedElements, setSelectedElements] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);

    const handleToggleElement = (elementId: string) => {
        setSelectedElements(prev =>
            prev.includes(elementId)
                ? prev.filter(id => id !== elementId)
                : [...prev, elementId]
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!reason.trim()) {
            setError('Veuillez saisir une raison pour le rejet.');
            return;
        }
        if (selectedElements.length === 0) {
            setError('Veuillez cocher au moins un élément rejeté.');
            return;
        }
        onConfirm(reason, selectedElements);
        setReason('');
        setSelectedElements([]);
        setError(null);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200"
                    >
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">Rejeter le cas clinique</h3>
                                <p className="text-sm text-slate-500 truncate max-w-[300px]">{caseTitle}</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                            >
                                <X size={20} className="text-slate-500" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-600 text-sm font-medium"
                                >
                                    <AlertCircle size={16} />
                                    {error}
                                </motion.div>
                            )}

                            {/* Reason */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 block">
                                    Raison du rejet <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={reason}
                                    onChange={(e) => {
                                        setReason(e.target.value);
                                        if (error) setError(null);
                                    }}
                                    placeholder="Expliquez pourquoi ce cas est rejeté..."
                                    className="w-full h-32 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all resize-none text-slate-700"
                                />
                            </div>

                            {/* Elements */}
                            <div className="space-y-3">
                                <label className="text-sm font-bold text-slate-700 block">
                                    Éléments rejetés <span className="text-red-500">*</span>
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    {REJECTABLE_ELEMENTS.map((element) => (
                                        <button
                                            key={element.id}
                                            type="button"
                                            onClick={() => handleToggleElement(element.id)}
                                            className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${selectedElements.includes(element.id)
                                                    ? 'bg-red-50 border-red-200 text-red-700 shadow-sm'
                                                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                                                }`}
                                        >
                                            <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${selectedElements.includes(element.id)
                                                    ? 'bg-red-500 border-red-500 text-white'
                                                    : 'bg-white border-slate-300'
                                                }`}>
                                                {selectedElements.includes(element.id) && <CheckCircle2 size={14} />}
                                            </div>
                                            <span className="text-xs font-semibold">{element.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 px-6 py-3 border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-6 py-3 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 transition-all shadow-lg shadow-red-200"
                                >
                                    Confirmer le rejet
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
