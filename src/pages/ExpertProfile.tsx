import { useState, useEffect } from "react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { User, Activity, LayoutDashboard, Shield, TrendingUp, Users, FileText, Plus, Loader2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import doctorAvatar from "../assets/doctor-avatar.png";
import { userService } from "../services/userService";
import { useAuth } from "../stores/authStore";

export default function ExpertProfile() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<"profile" | "activity">("profile");
    const [profile, setProfile] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string>("");
    const [successMessage, setSuccessMessage] = useState<string>("");

    const expertises = [
        'cardiologie', 'neurologie', 'pneumologie', 'gastro-enterologie', 'nephrologie',
        'endocrinologie', 'rhumatologie', 'dermatologie', 'pediatrie', 'geriatrie',
        'psychiatrie', 'medecine-generale', 'chirurgie-generale', 'gynecologie',
        'urologie', 'ophtalmologie', 'orl', 'oncologie', 'hematologie', 'infectiologie', 'autre'
    ];

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const data = await userService.getProfile();
                setProfile({
                    ...data,
                    avatar: doctorAvatar
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
        loadProfile();
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
            });
            setProfile({ ...updated, avatar: doctorAvatar });
            setSuccessMessage("Profil mis à jour avec succès!");
            setTimeout(() => setSuccessMessage(""), 3000);
        } catch (err: any) {
            setError(err.message || "Erreur lors de la sauvegarde");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center space-y-2">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
                    <p className="text-slate-600">Impossible de charger le profil</p>
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
                        {activeTab === "profile" ? "Gestion du Profil" : "Tableau de Bord Expert"}
                    </h1>
                    <p className="text-slate-500">
                        {activeTab === "profile"
                            ? "Gérez vos informations personnelles et vos préférences."
                            : "Aperçu de l'activité de la plateforme et des performances."}
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
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "profile"
                            ? "bg-white text-teal-700 shadow-sm"
                            : "text-slate-500 hover:text-slate-700"
                            }`}
                    >
                        <User className="h-4 w-4" /> Profil
                    </button>
                    <button
                        onClick={() => setActiveTab("activity")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "activity"
                            ? "bg-white text-teal-700 shadow-sm"
                            : "text-slate-500 hover:text-slate-700"
                            }`}
                    >
                        <LayoutDashboard className="h-4 w-4" /> Activité
                    </button>
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
                                    <div className="h-48 w-48 rounded-full p-1 bg-gradient-to-tr from-teal-400 to-emerald-400 shadow-2xl">
                                        <img
                                            src={profile.avatar}
                                            alt="Dr. Profile"
                                            className="w-full h-full object-cover rounded-full border-4 border-white"
                                        />
                                    </div>
                                    <div className="absolute bottom-4 right-4 h-6 w-6 bg-green-500 border-4 border-white rounded-full"></div>
                                </div>
                                <h2 className="text-3xl font-bold text-slate-900 mb-1">{profile.prenom} {profile.nom}</h2>
                                <p className="text-teal-600 font-medium text-lg mb-2 capitalize">{profile.domaine_expertise}</p>
                                <div className="flex flex-col items-center gap-1 mb-6">
                                    <p className="text-slate-600 font-medium">{profile.etablissement}</p>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                                        {profile.annees_experience} ans d'expérience
                                    </span>
                                </div>
                                <div className="flex gap-4 w-full max-w-xs">
                                    <div className="flex-1 bg-white/40 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/50 shadow-sm">
                                        <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">Cas</p>
                                        <p className="text-2xl font-bold text-slate-800">82</p>
                                    </div>
                                    <div className="flex-1 bg-white/40 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/50 shadow-sm">
                                        <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">Avis</p>
                                        <p className="text-2xl font-bold text-slate-800">4.9</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Editable Form */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="rounded-3xl border border-teal-100/50 bg-white/40 backdrop-blur-xl p-8 shadow-sm">
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                        <User className="h-5 w-5 text-teal-500" />
                                        Informations Personnelles
                                    </h2>
                                    <span className="text-xs font-medium px-3 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-100">
                                        Mode Édition
                                    </span>
                                </div>

                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-2 group">
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1 group-focus-within:text-teal-600 transition-colors">Nom</label>
                                        <Input
                                            value={profile.nom}
                                            onChange={(e) => setProfile({ ...profile, nom: e.target.value })}
                                            className="bg-white/60 border-slate-200 focus:border-teal-400 focus:ring-4 focus:ring-teal-500/10 transition-all h-11"
                                        />
                                    </div>
                                    <div className="space-y-2 group">
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1 group-focus-within:text-teal-600 transition-colors">Prénom</label>
                                        <Input
                                            value={profile.prenom}
                                            onChange={(e) => setProfile({ ...profile, prenom: e.target.value })}
                                            className="bg-white/60 border-slate-200 focus:border-teal-400 focus:ring-4 focus:ring-teal-500/10 transition-all h-11"
                                        />
                                    </div>
                                    <div className="space-y-2 group md:col-span-2">
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1 group-focus-within:text-teal-600 transition-colors">Domaine d'Expertise</label>
                                        <select
                                            value={profile.domaine_expertise}
                                            onChange={(e) => setProfile({ ...profile, domaine_expertise: e.target.value })}
                                            className="w-full h-11 rounded-md border border-slate-200 bg-white/60 px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-500/10 focus-visible:border-teal-400 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                                        >
                                            {expertises.map(exp => (
                                                <option key={exp} value={exp}>{exp.charAt(0).toUpperCase() + exp.slice(1).replace('-', ' ')}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2 group">
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1 group-focus-within:text-teal-600 transition-colors">Établissement</label>
                                        <Input
                                            value={profile.etablissement}
                                            onChange={(e) => setProfile({ ...profile, etablissement: e.target.value })}
                                            className="bg-white/60 border-slate-200 focus:border-teal-400 focus:ring-4 focus:ring-teal-500/10 transition-all h-11"
                                        />
                                    </div>
                                    <div className="space-y-2 group">
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1 group-focus-within:text-teal-600 transition-colors">Années d'Expérience</label>
                                        <Input
                                            type="number"
                                            value={profile.annees_experience}
                                            onChange={(e) => setProfile({ ...profile, annees_experience: parseInt(e.target.value) || 0 })}
                                            className="bg-white/60 border-slate-200 focus:border-teal-400 focus:ring-4 focus:ring-teal-500/10 transition-all h-11"
                                        />
                                    </div>
                                    <div className="space-y-2 group md:col-span-2">
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1 group-focus-within:text-teal-600 transition-colors">Email</label>
                                        <Input
                                            value={profile.email}
                                            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                            className="bg-white/60 border-slate-200 focus:border-teal-400 focus:ring-4 focus:ring-teal-500/10 transition-all h-11"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-3xl border border-teal-100/50 bg-white/40 backdrop-blur-xl p-8 shadow-sm">
                                <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                    <Shield className="h-5 w-5 text-teal-500" />
                                    Sécurité
                                </h2>
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-2 group md:col-span-2">
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Mot de passe actuel</label>
                                        <Input type="password" value="........" className="bg-white/60 border-slate-200 focus:border-teal-400 focus:ring-4 focus:ring-teal-500/10 transition-all h-11" />
                                    </div>
                                    <div className="space-y-2 group">
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Nouveau mot de passe</label>
                                        <Input type="password" placeholder="••••••••" className="bg-white/60 border-slate-200 focus:border-teal-400 focus:ring-4 focus:ring-teal-500/10 transition-all h-11" />
                                    </div>
                                    <div className="space-y-2 group">
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Confirmer</label>
                                        <Input type="password" placeholder="••••••••" className="bg-white/60 border-slate-200 focus:border-teal-400 focus:ring-4 focus:ring-teal-500/10 transition-all h-11" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-4">
                                <Button
                                    variant="ghost"
                                    className="hover:bg-slate-100 text-slate-600"
                                    onClick={() => window.location.reload()}
                                >
                                    Annuler
                                </Button>
                                <Button
                                    className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white shadow-lg shadow-teal-500/20 border-0"
                                    onClick={handleSaveProfile}
                                    disabled={isSaving}
                                >
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Enregistrement...
                                        </>
                                    ) : (
                                        "Enregistrer les modifications"
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
                                { label: "Cas Publiés", value: "82", trend: "+2", color: "text-green-600", icon: FileText },
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
                            {/* Bar Chart Mock */}
                            <div className="rounded-3xl border border-white/60 bg-white/60 backdrop-blur-md p-6 shadow-sm">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="font-bold text-slate-800">Cas Cliniques Populaires</h3>
                                    <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">+8% ce mois</span>
                                </div>
                                <div className="h-48 flex items-end justify-between gap-2 px-2">
                                    {[40, 15, 85, 30, 60].map((h, i) => (
                                        <div key={i} className="w-full flex flex-col items-center gap-2 group">
                                            <div
                                                className="w-full bg-blue-200 rounded-t-lg transition-all duration-500 group-hover:bg-blue-400"
                                                style={{ height: `${h}%` }}
                                            />
                                            <span className="text-xs text-slate-400">
                                                {["Cardio", "Pneumo", "Neuro", "Gastro", "Trauma"][i]}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Line Chart Mock */}
                            <div className="rounded-3xl border border-white/60 bg-white/60 backdrop-blur-md p-6 shadow-sm">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="font-bold text-slate-800">Activité des Simulations</h3>
                                    <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">+15% total</span>
                                </div>
                                <div className="h-48 flex items-end relative">
                                    {/* Simple SVG Line Chart */}
                                    <svg className="w-full h-full overflow-visible" viewBox="0 0 100 50" preserveAspectRatio="none">
                                        <path
                                            d="M0,40 Q10,10 20,25 T40,30 T60,15 T80,35 T100,20"
                                            fill="none"
                                            stroke="#3b82f6"
                                            strokeWidth="2"
                                            vectorEffect="non-scaling-stroke"
                                        />
                                        <path
                                            d="M0,40 Q10,10 20,25 T40,30 T60,15 T80,35 T100,20 V50 H0 Z"
                                            fill="url(#gradient)"
                                            opacity="0.2"
                                        />
                                        <defs>
                                            <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
                                                <stop offset="0%" stopColor="#3b82f6" />
                                                <stop offset="100%" stopColor="white" stopOpacity="0" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                    <div className="absolute bottom-0 w-full flex justify-between text-xs text-slate-400 pt-2">
                                        <span>Sem 1</span>
                                        <span>Sem 2</span>
                                        <span>Sem 3</span>
                                        <span>Sem 4</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Activity Feed */}
                        <div className="rounded-3xl border border-white/60 bg-white/60 backdrop-blur-md p-6 shadow-sm">
                            <h3 className="font-bold text-slate-800 mb-6">Flux d'Activité et Notifications</h3>
                            <div className="space-y-4">
                                {[
                                    { icon: Plus, color: "bg-blue-100 text-blue-600", text: "Nouveau cas 'Crise d'asthme aiguë' publié.", time: "Il y a 2 heures" },
                                    { icon: Activity, color: "bg-green-100 text-green-600", text: "Le modèle de tuteur IA a été mis à jour.", time: "Il y a 1 jour" },
                                    { icon: Shield, color: "bg-yellow-100 text-yellow-600", text: "Taux d'échec élevé détecté sur 'Infarctus'.", time: "Il y a 3 jours" },
                                    { icon: Users, color: "bg-purple-100 text-purple-600", text: "L'étudiant Alex Martin a complété 50 simulations.", time: "Il y a 5 jours" },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/50 transition-colors">
                                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${item.color}`}>
                                            <item.icon className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-slate-800">{item.text}</p>
                                            <p className="text-xs text-slate-500">{item.time}</p>
                                        </div>
                                        <Button variant="ghost" size="icon" className="text-slate-400">
                                            <TrendingUp className="h-4 w-4 rotate-45" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
