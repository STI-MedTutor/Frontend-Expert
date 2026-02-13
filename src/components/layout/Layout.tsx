import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "../../lib/utils";
import { User, Activity, Menu, X, LogOut, GraduationCap, Shield } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../stores/authStore";
import doctorAvatar from "../../assets/doctor-avatar.png";
import { useTranslation } from "react-i18next";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "../ui/tooltip";

export default function Layout({ children }: { children: React.ReactNode }) {
    const { t, i18n } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const { isAuthenticated, user, userType, logout } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

    const toggleLanguage = () => {
        const newLang = i18n.language === 'fr' ? 'en' : 'fr';
        i18n.changeLanguage(newLang);
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    // Close profile menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target.closest('.profile-menu-container')) {
                setIsProfileMenuOpen(false);
            }
        };

        if (isProfileMenuOpen) {
            document.addEventListener('click', handleClickOutside);
        }

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [isProfileMenuOpen]);

    // Debug: Log authentication state
    useEffect(() => {
        console.log('🔐 Layout - Auth state:', { isAuthenticated, user: user?.prenom || 'No user' });
    }, [isAuthenticated, user]);

    const navItems = [
        {
            name: t("nav.cases"),
            description: t("nav.casesDesc"),
            path: "/cases",
            icon: Activity,
        },
        ...(user?.is_teacher || user?.is_enseignant ? [{
            name: t("nav.schoolCases"),
            description: t("nav.schoolCasesDesc"),
            path: "/cas-ecole",
            icon: GraduationCap,
        }] : []),
        ...(userType === 'gerant' ? [{
            name: t("nav.admin"),
            description: t("nav.adminDesc"),
            path: "/admin",
            icon: Shield,
        }] : []),
        {
            name: t("nav.profile"),
            description: t("nav.profile"),
            path: "/profile",
            icon: User,
        },
    ];
    return (
        <div className="min-h-screen flex flex-col">
            <nav className="sticky top-4 z-50 mx-28 mt-4 rounded-2xl border border-white/20 bg-white/80 backdrop-blur-xl shadow-sm transition-all duration-300">
                <div className="container mx-auto flex h-16 items-center justify-between px-6">
                    <Link to="/" className="flex items-center gap-2 group">
                        <img
                            src="/logo-med.png"
                            alt="MedExpert Logo"
                            className="h-10 w-auto object-contain transition-transform group-hover:scale-105"
                        />
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                            MedExpert
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-4">
                        {isAuthenticated && navItems.filter(item => item.path !== '/profile').map((item) => (
                            <TooltipProvider key={item.path}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Link
                                            to={item.path}
                                            className={cn(
                                                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                                                location.pathname.startsWith(item.path)
                                                    ? "text-primary bg-purple-50/50 scale-105 shadow-sm font-semibold"
                                                    : "text-slate-600 hover:text-primary hover:bg-slate-50"
                                            )}
                                        >
                                            <item.icon className="h-4 w-4" />
                                            {item.name}
                                        </Link>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{item.description}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        ))}

                        <div className="h-6 w-px bg-slate-200 mx-2" />

                        {isAuthenticated ? (
                            <div className="relative profile-menu-container">
                                <button
                                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                    className="flex items-center gap-3 px-3 py-2 rounded-full text-sm font-medium text-slate-600 hover:text-primary hover:bg-slate-50 transition-all border border-slate-200 hover:border-purple-200"
                                >
                                    <img
                                        src={doctorAvatar}
                                        alt="Profile"
                                        className="h-8 w-8 rounded-full object-cover border-2 border-primary"
                                    />
                                    <span className="font-semibold">
                                        Dr {user?.prenom} {user?.nom}
                                    </span>
                                </button>

                                <AnimatePresence>
                                    {isProfileMenuOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50"
                                        >
                                            <Link
                                                to="/profile"
                                                onClick={() => setIsProfileMenuOpen(false)}
                                                className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                                            >
                                                <User className="h-4 w-4" />
                                                {t("nav.myProfile")}
                                            </Link>
                                            <div className="h-px bg-slate-200 my-1" />
                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                            >
                                                <LogOut className="h-4 w-4" />
                                                {t("nav.logout")}
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <>
                                <Link to="/login">
                                    <button className="text-sm font-medium text-slate-600 hover:text-primary transition-colors px-4 py-2">
                                        {t("nav.login")}
                                    </button>
                                </Link>
                                <Link to="/register">
                                    <button className="text-sm font-medium bg-primary text-white px-5 py-2.5 rounded-full hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5">
                                        {t("nav.register")}
                                    </button>
                                </Link>
                            </>
                        )}

                        <div className="h-6 w-px bg-slate-200 mx-2" />

                        {/* Language Switcher */}
                        <button
                            onClick={toggleLanguage}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600 hover:bg-primary hover:text-white transition-all border border-slate-200 uppercase"
                        >
                            {i18n.language === 'fr' ? 'EN' : 'FR'}
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 text-slate-600"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>

                {/* Mobile Nav */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="md:hidden overflow-hidden border-t border-slate-100"
                        >
                            <div className="flex flex-col p-4 gap-2">
                                {isAuthenticated && (
                                    <>
                                        {/* Mobile Profile Header */}
                                        <div className="flex items-center gap-3 px-4 py-3 mb-2 bg-gradient-to-r from-purple-50 to-fuchsia-50 rounded-xl border border-purple-100">
                                            <img
                                                src={doctorAvatar}
                                                alt="Profile"
                                                className="h-12 w-12 rounded-full object-cover border-2 border-primary"
                                            />
                                            <div>
                                                <p className="text-sm font-bold text-slate-800">
                                                    Dr {user?.prenom} {user?.nom}
                                                </p>
                                                <p className="text-xs text-slate-500 capitalize">
                                                    {user?.domaine_expertise || 'Expert médical'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="h-px bg-slate-200 my-1" />
                                    </>
                                )}

                                {/* Mobile Language Switcher */}
                                <div className="px-4 py-2">
                                    <button
                                        onClick={toggleLanguage}
                                        className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold bg-slate-100 text-slate-600 hover:bg-primary hover:text-white transition-all border border-slate-200 uppercase"
                                    >
                                        <span>Langue / Language</span>
                                        <span className="bg-white/20 px-2 py-0.5 rounded-lg">
                                            {i18n.language === 'fr' ? 'EN' : 'FR'}
                                        </span>
                                    </button>
                                </div>

                                {isAuthenticated && navItems.map((item) => (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={cn(
                                            "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                                            location.pathname === item.path
                                                ? "bg-purple-50 text-primary"
                                                : "text-slate-600 hover:bg-slate-50"
                                        )}
                                    >
                                        <item.icon className="h-5 w-5" />
                                        {item.name}
                                    </Link>
                                ))}

                                {!isAuthenticated && (
                                    <>
                                        <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                                            <button className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50">
                                                Connexion
                                            </button>
                                        </Link>
                                        <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                                            <button className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium bg-primary text-white hover:bg-primary/90">
                                                S'inscrire
                                            </button>
                                        </Link>
                                    </>
                                )}

                                {isAuthenticated && (
                                    <>
                                        <div className="h-px bg-slate-200 my-2" />
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50"
                                        >
                                            <LogOut className="h-5 w-5" />
                                            Déconnexion
                                        </button>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            <main className="flex-1 container mx-auto px-4 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {children}
                </motion.div>
            </main>
        </div>
    );
}
