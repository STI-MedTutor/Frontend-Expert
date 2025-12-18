import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Stethoscope, Mail, Lock, ArrowRight, Github, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import authBg from "../assets/auth-bg.png";
import { useAuth } from "../stores/authStore";

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>("");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);
        try {
            await login(
                formData.get('email') as string,
                formData.get('password') as string
            );
            navigate("/ClinicalCases");
        } catch (err: any) {
            setError(err.message || "Erreur de connexion");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            {/* Left Side - Form */}
            <div className="flex items-center justify-center p-8 sm:p-12 lg:p-16 bg-white">
                <motion.div
                    className="w-full max-w-md space-y-8"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="space-y-2">
                        <Link to="/" className="flex items-center gap-2 text-primary font-bold text-xl mb-8">
                            <Stethoscope className="h-6 w-6" />
                            <span>MedExpert</span>
                        </Link>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                            Bon retour
                        </h1>
                        <p className="text-slate-500">
                            Entrez vos identifiants pour accéder à votre espace.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700" htmlFor="email">
                                    Email
                                </label>
                                {error && (
                                    <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                                        <AlertCircle className="h-4 w-4" />
                                        <span>{error}</span>
                                    </div>
                                )}
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="nom@exemple.com"
                                        className="pl-10 bg-slate-50 border-slate-200 focus:bg-white"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-slate-700" htmlFor="password">
                                        Mot de passe
                                    </label>
                                    <Link to="#" className="text-sm font-medium text-primary hover:underline">
                                        Mot de passe oublié ?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        placeholder="••••••••"
                                        className="pl-10 bg-slate-50 border-slate-200 focus:bg-white"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-11 text-base bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>Se connecter <ArrowRight className="ml-2 h-4 w-4" /></>
                            )}
                        </Button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-slate-200" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white px-2 text-slate-500">Ou continuer avec</span>
                            </div>
                        </div>

                        <Button variant="outline" type="button" className="w-full h-11 gap-2 border-slate-200 hover:bg-slate-50 text-slate-700">
                            <Github className="h-4 w-4" /> Google
                        </Button>
                    </form>

                    <p className="text-center text-sm text-slate-600">
                        Pas encore de compte ?{" "}
                        <Link to="/register" className="font-semibold text-primary hover:underline">
                            S'inscrire
                        </Link>
                    </p>
                </motion.div>
            </div>

            {/* Right Side - Image */}
            <div className="hidden lg:block relative bg-slate-900 h-full">
                <div className="absolute inset-0 bg-primary/20 mix-blend-overlay z-10" />
                <img
                    src={authBg}
                    alt="Medical Background"
                    className="absolute inset-0 w-full h-full object-cover opacity-80"
                />
                <div className="absolute bottom-0 left-0 right-0 p-12 z-20 bg-gradient-to-t from-slate-900/90 to-transparent text-white space-y-4">
                    <blockquote className="text-lg font-medium italic opacity-90">
                        "La médecine est une science d'incertitude et un art de probabilité."
                    </blockquote>
                    <p className="text-sm font-semibold text-accent">— William Osler</p>
                </div>
            </div>
        </div>
    );
}
