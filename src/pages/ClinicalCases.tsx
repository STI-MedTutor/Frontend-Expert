import ClinicalCasesTable from "../components/cases/ClinicalCasesTable";

export default function ClinicalCases() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-emerald-50/20 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-2">
                        Gestion des Cas Cliniques
                    </h1>
                    <p className="text-slate-600">
                        Explorez et gérez les dossiers patients de manière complète et détaillée.
                    </p>
                </div>

                <ClinicalCasesTable />
            </div>
        </div>
    );
}
