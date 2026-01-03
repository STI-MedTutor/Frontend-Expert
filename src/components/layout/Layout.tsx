import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "../../lib/utils";
import { User, Activity, Menu, X, LogOut, GraduationCap, Shield } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../stores/authStore";
import doctorAvatar from "../../assets/doctor-avatar.png";

export default function Layout({ children }: { children: React.ReactNode }) {
    const location = useLocation();
    const navigate = useNavigate();
    const { isAuthenticated, user, userType, logout } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

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
            name: "Gestion Cas Cliniques",
            path: "/cases",
            icon: Activity,
        },
        ...(user?.is_teacher || user?.is_enseignant ? [{
            name: "Cas clinique d'école",
            path: "/cas-ecole",
            icon: GraduationCap,
        }] : []),
        ...(userType === 'gerant' ? [{
            name: "Administration",
            path: "/admin",
            icon: Shield,
        }] : []),
        {
            name: "Profil Expert",
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
                        {isAuthenticated && (
                            <Link
                                to="/cases"
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                                    location.pathname === "/cases"
                                        ? "text-primary bg-purple-50/50"
                                        : "text-slate-600 hover:text-primary hover:bg-slate-50"
                                )}
                            >
                                <Activity className="h-4 w-4" />
                                Gestion Cas Cliniques
                            </Link>
                        )}
                        {isAuthenticated && (!!user?.is_teacher || !!user?.is_enseignant) && (
                            <Link
                                to="/cas-ecole"
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                                    location.pathname === "/cas-ecole"
                                        ? "text-primary bg-purple-50/50"
                                        : "text-slate-600 hover:text-primary hover:bg-slate-50"
                                )}
                            >
                                <GraduationCap className="h-4 w-4" />
                                Cas clinique d'école
                            </Link>
                        )}
                        {isAuthenticated && userType === 'gerant' && (
                            <Link
                                to="/admin"
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                                    location.pathname.startsWith("/admin")
                                        ? "text-indigo-600 bg-indigo-50"
                                        : "text-slate-600 hover:text-indigo-600 hover:bg-slate-50"
                                )}
                            >
                                <Shield className="h-4 w-4" />
                                Administration
                            </Link>
                        )}

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
                                                Mon Profil
                                            </Link>
                                            <div className="h-px bg-slate-200 my-1" />
                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                            >
                                                <LogOut className="h-4 w-4" />
                                                Déconnexion
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <>
                                <Link to="/login">
                                    <button className="text-sm font-medium text-slate-600 hover:text-primary transition-colors px-4 py-2">
                                        Connexion
                                    </button>
                                </Link>
                                <Link to="/register">
                                    <button className="text-sm font-medium bg-primary text-white px-5 py-2.5 rounded-full hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5">
                                        S'inscrire
                                    </button>
                                </Link>
                            </>
                        )}
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
