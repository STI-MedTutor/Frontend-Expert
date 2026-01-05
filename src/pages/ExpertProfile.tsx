import { useState, useEffect } from "react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { User, LayoutDashboard, FileText, Plus, Loader2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import doctorAvatar from "../assets/doctor-avatar.png";
import { userService } from "../services/userService";
import { useAuth } from "../stores/authStore";
import { expertService } from "../services/expertService";
import { clinicalCasesService } from "../services/clinicalCasesService";
import { useTranslation } from "react-i18next";

export default function ExpertProfile() {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<"profile" | "activity">("profile");
    const [profile, setProfile] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string>("");
    const [successMessage, setSuccessMessage] = useState<string>("");
    const [stats, setStats] = useState({
        totalCases: 0,
        publishedCases: 0,
        schoolActivity: [] as number[],
        schoolLabels: [] as string[],
        recentActivities: [] as any[]
    });

    const expertises = [
        'cardiologie', 'neurologie', 'pneumologie', 'gastro-enterologie', 'nephrologie',
        'endocrinologie', 'rhumatologie', 'dermatologie', 'pediatrie', 'geriatrie',
        'psychiatrie', 'medecine-generale', 'chirurgie-generale', 'gynecologie',
        'urologie', 'ophtalmologie', 'orl', 'oncologie', 'hematologie', 'infectiologie', 'autre'
    ];

    useEffect(() => {
        const loadData = async () => {
            try {
                // 1. Load Profile
                const profileData = await userService.getProfile();
                setProfile({
                    ...profileData,
                    avatar: doctorAvatar
                });

                // 2. Load Clinical Cases Stats
                const cases = await clinicalCasesService.getCases();
                const total = cases.length;
                // Assuming all fetched cases are 'published' or active for now as we don't have a status field
                const published = total;

                // 3. Load School Stats (if teacher)
                let schoolStats: { school_case_activity: number[]; school_case_labels: string[]; recent_activities: any[] } = { school_case_activity: [], school_case_labels: [], recent_activities: [] };
                // Check both fields for robustness
                if (profileData.is_enseignant || profileData.is_teacher) {
                    try {
                        schoolStats = await expertService.getExpertStats(profileData.id);
                    } catch (e) {
                        console.error("Failed to load school stats", e);
                    }
                }



                setStats({
                    totalCases: total,
                    publishedCases: published,
                    schoolActivity: schoolStats.school_case_activity || [],
                    schoolLabels: schoolStats.school_case_labels || [],
                    recentActivities: schoolStats.recent_activities || []
                });

            } catch (err: any) {
                setError(err.message || "Erreur lors du chargement du profil");
                // Fallback to user from auth store if available
                if (user) {
                    setProfile({ ...user, avatar: doctorAvatar });
                }
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [user]);

    const handleSaveProfile = async () => {
        if (!profile) return;

        setIsSaving(true);
        setError("");
        setSuccessMessage("");

        try {
            const updated = await userService.updateProfile({
                nom: profile.nom,
                prenom: profile.prenom,
                email: profile.email,
                domaine_expertise: profile.domaine_expertise,
                etablissement: profile.etablissement,
                annees_experience: profile.annees_experience,
                is_enseignant: profile.is_enseignant,
            });
            setProfile({ ...updated, avatar: doctorAvatar });
            setSuccessMessage(t("profile.updateSuccess"));
            setTimeout(() => setSuccessMessage(""), 3000);
        } catch (err: any) {
            setError(err.message || t("profile.updateError"));
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center space-y-2">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
                    <p className="text-slate-600">{t("profile.loadError")}</p>
                    {error && <p className="text-sm text-red-600">{error}</p>}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                        {activeTab === "profile" ? t("profile.title") : t("profile.dashboard")}
                    </h1>
                    <p className="text-slate-500">
                        {activeTab === "profile"
                            ? t("profile.subtitle_profile")
                            : t("profile.subtitle_activity")}
                    </p>
                </div>
                {error && (
                    <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                        <AlertCircle className="h-4 w-4" />
                        <span>{error}</span>
                    </div>
                )}
                {successMessage && (
                    <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-lg">
                        <span>{successMessage}</span>
                    </div>
                )}
                <div className="flex bg-white/50 p-1 rounded-xl border border-white/60 backdrop-blur-sm">
                    <button
                        onClick={() => setActiveTab("profile")}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${activeTab === "profile"
                            ? "bg-primary text-white shadow-lg shadow-primary/20"
                            : "bg-white text-slate-600 hover:bg-slate-50"
                            }`}
                    >
                        <User className="w-4 h-4" /> {t("profile.profileTab")}
                    </button>
                    {(profile?.is_enseignant || profile?.is_teacher) && (
                        <button
                            onClick={() => setActiveTab("activity")}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${activeTab === "activity"
                                ? "bg-primary text-white shadow-lg shadow-primary/20"
                                : "bg-white text-slate-600 hover:bg-slate-50"
                                }`}
                        >
                            <LayoutDashboard className="w-4 h-4" /> {t("profile.activityTab")}
                        </button>
                    )}
                </div>
            </div>

            <AnimatePresence mode="wait">
                {activeTab === "profile" ? (
                    <motion.div
                        key="profile"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                    >
                        {/* Left Column: Static Profile Card */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="flex flex-col items-center text-center p-8">
                                <div className="relative mb-6">
                                    <div className="h-48 w-48 rounded-full p-1 bg-gradient-to-tr from-purple-400 to-fuchsia-400 shadow-2xl">
                                        <img
                                            src={profile.avatar}
                                            alt="Dr. Profile"
                                            className="w-full h-full object-cover rounded-full border-4 border-white"
                                        />
                                    </div>
                                    <div className="absolute bottom-4 right-4 h-6 w-6 bg-green-500 border-4 border-white rounded-full"></div>
                                </div>
                                <h2 className="text-3xl font-bold text-slate-900 mb-1">{profile.prenom} {profile.nom}</h2>
                                <p className="text-primary font-medium text-lg mb-2 capitalize">{profile.domaine_expertise}</p>
                                <div className="flex flex-col items-center gap-1 mb-6">
                                    <p className="text-slate-600 font-medium">{profile.etablissement}</p>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                                        {profile.annees_experience} {t("profile.years")}
                                    </span>
                                </div>
                                <div className="flex gap-4 w-full max-w-xs justify-center">
                                    <div className="flex-1 bg-white/40 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/50 shadow-sm max-w-[150px]">
                                        <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">{t("profile.stats.totalCases")}</p>
                                        <p className="text-2xl font-bold text-slate-800">{stats.totalCases}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Editable Form */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="rounded-3xl border border-purple-100/50 bg-white/40 backdrop-blur-xl p-8 shadow-sm">
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                        <User className="h-5 w-5 text-primary" />
                                        {t("profile.personalInfo")}
                                    </h2>
                                    <span className="text-xs font-medium px-3 py-1 rounded-full bg-purple-50 text-primary border border-purple-100">
                                        {t("profile.editMode")}
                                    </span>
                                </div>

                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-2 group">
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1 group-focus-within:text-primary transition-colors">{t("profile.lastName")}</label>
                                        <Input
                                            value={profile.nom}
                                            onChange={(e) => setProfile({ ...profile, nom: e.target.value })}
                                            className="bg-white/60 border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all h-11"
                                        />
                                    </div>
                                    <div className="space-y-2 group">
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1 group-focus-within:text-primary transition-colors">{t("profile.firstName")}</label>
                                        <Input
                                            value={profile.prenom}
                                            onChange={(e) => setProfile({ ...profile, prenom: e.target.value })}
                                            className="bg-white/60 border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all h-11"
                                        />
                                    </div>
                                    <div className="space-y-2 group md:col-span-2">
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1 group-focus-within:text-primary transition-colors">{t("profile.expertise")}</label>
                                        <select
                                            value={profile.domaine_expertise}
                                            onChange={(e) => setProfile({ ...profile, domaine_expertise: e.target.value })}
                                            className="w-full h-11 rounded-md border border-slate-200 bg-white/60 px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/10 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                                        >
                                            {expertises.map(exp => (
                                                <option key={exp} value={exp}>{exp.charAt(0).toUpperCase() + exp.slice(1).replace('-', ' ')}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2 group">
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1 group-focus-within:text-primary transition-colors">{t("profile.institution")}</label>
                                        <Input
                                            value={profile.etablissement}
                                            onChange={(e) => setProfile({ ...profile, etablissement: e.target.value })}
                                            className="bg-white/60 border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all h-11"
                                        />
                                    </div>
                                    <div className="space-y-2 group">
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1 group-focus-within:text-primary transition-colors">{t("profile.experience")}</label>
                                        <Input
                                            type="number"
                                            value={profile.annees_experience}
                                            onChange={(e) => setProfile({ ...profile, annees_experience: parseInt(e.target.value) || 0 })}
                                            className="bg-white/60 border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all h-11"
                                        />
                                    </div>
                                    <div className="space-y-2 group">
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1 group-focus-within:text-primary transition-colors">{t("profile.status")}</label>
                                        <div className="flex items-center gap-2 h-11 px-3 bg-white/60 border border-slate-200 rounded-md">
                                            <input
                                                type="checkbox"
                                                checked={profile.is_enseignant || false}
                                                onChange={(e) => setProfile({ ...profile, is_enseignant: e.target.checked })}
                                                className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                                            />
                                            <span className="text-sm text-slate-700">{t("profile.teacher")}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2 group md:col-span-2">
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1 group-focus-within:text-primary transition-colors">{t("profile.email")}</label>
                                        <Input
                                            value={profile.email}
                                            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                            className="bg-white/60 border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all h-11"
                                        />
                                    </div>
                                </div>
                            </div>



                            <div className="flex justify-end gap-4">
                                <Button
                                    variant="ghost"
                                    className="hover:bg-slate-100 text-slate-600"
                                    onClick={() => window.location.reload()}
                                >
                                    {t("common.cancel")}
                                </Button>
                                <Button
                                    className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white shadow-lg shadow-primary/20 border-0"
                                    onClick={handleSaveProfile}
                                    disabled={isSaving}
                                >
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            {t("profile.saving")}
                                        </>
                                    ) : (
                                        t("profile.saveChanges")
                                    )}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="activity"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                    >
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                { label: t("profile.stats.publishedCases"), value: stats.publishedCases.toString(), trend: "", color: "text-green-600", icon: FileText },
                            ].map((stat, i) => (
                                <div key={i} className="rounded-2xl border border-white/60 bg-white/60 backdrop-blur-md p-6 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                                        <stat.icon className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <div className="flex items-baseline gap-2">
                                        <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
                                        <span className={`text-xs font-medium ${stat.color}`}>{stat.trend}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Charts Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Chart: Activités des Cas Cliniques d'École (Visible only for teachers) */}
                            {(profile?.is_enseignant || profile?.is_teacher) && (
                                <div className="rounded-3xl border border-white/60 bg-white/60 backdrop-blur-md p-6 shadow-sm">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="font-bold text-slate-800">{t("profile.stats.schoolActivity")}</h3>
                                        <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">{t("profile.stats.lastWeeks")}</span>
                                    </div>
                                    <div className="h-64 flex flex-col justify-between relative pt-4">
                                        {/* Y-Axis Labels & Grid Lines */}
                                        <div className="absolute inset-0 flex flex-col justify-between text-[10px] text-slate-400 pointer-events-none pb-8">
                                            <div className="border-b border-slate-100 w-full flex justify-between"><span>{Math.max(...stats.schoolActivity, 5)}</span></div>
                                            <div className="border-b border-slate-100 w-full flex justify-between"><span>{Math.floor(Math.max(...stats.schoolActivity, 5) / 2)}</span></div>
                                            <div className="border-b border-slate-200 w-full flex justify-between font-bold"><span>0</span></div>
                                        </div>

                                        <div className="flex-1 flex items-end gap-4 relative z-10 px-2">
                                            {/* Bar Chart Implementation */}
                                            {(stats.schoolActivity.length > 0 ? stats.schoolActivity : [0, 0, 0, 0]).map((count, index) => {
                                                const max = Math.max(...stats.schoolActivity, 5);
                                                const height = (count / max) * 100;
                                                const label = stats.schoolLabels[index] || `W${index + 1}`;

                                                return (
                                                    <div key={index} className="flex-1 flex flex-col justify-end items-center group h-full">
                                                        <div
                                                            className="w-full bg-slate-50 rounded-t-lg relative group-hover:bg-slate-100 transition-all duration-300 shadow-inner overflow-hidden border border-slate-100/50"
                                                            style={{ height: '100%' }}
                                                        >
                                                            <motion.div
                                                                initial={{ height: 0 }}
                                                                animate={{ height: `${height}%` }}
                                                                transition={{ duration: 1, ease: "easeOut" }}
                                                                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary to-accent group-hover:from-primary/80 group-hover:to-accent/80 transition-all shadow-[0_-4px_12px_rgba(var(--primary-rgb),0.2)]"
                                                            />

                                                            {/* Tooltip */}
                                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded shadow-xl opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 z-20 whitespace-nowrap">
                                                                {count} {t("profile.stats.totalCases")}
                                                            </div>
                                                        </div>
                                                        <span className="text-[10px] font-bold text-slate-400 mt-3 uppercase tracking-tighter">{label}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Activity Feed */}
                            <div className="rounded-3xl border border-white/60 bg-white/60 backdrop-blur-md p-6 shadow-sm">
                                <h3 className="font-bold text-slate-800 mb-6">{t("profile.stats.recentActivity")}</h3>
                                <div className="space-y-4">
                                    {stats.recentActivities.length > 0 ? (
                                        stats.recentActivities.map((item, i) => (
                                            <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/50 transition-colors">
                                                <div className={`h-10 w-10 rounded-full flex items-center justify-center bg-purple-100 text-primary`}>
                                                    <Plus className="h-5 w-5" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-slate-800">{item.text}</p>
                                                    <p className="text-xs text-slate-500">{item.time}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center text-slate-500 py-4">
                                            {t("profile.stats.noActivity")}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div >
    );
}
