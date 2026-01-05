import ClinicalCasesTable from "../components/cases/ClinicalCasesTable";
import { useTranslation } from "react-i18next";

export default function ClinicalCases() {
    const { t } = useTranslation();
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-fuchsia-50/20 p-6">
            <div className="max-w-[95%] mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-2">
                        {t("casesPage.title")}
                    </h1>
                    <p className="text-slate-600">
                        {t("casesPage.subtitle")}
                    </p>
                </div>

                <ClinicalCasesTable />
            </div>
        </div>
    );
}
