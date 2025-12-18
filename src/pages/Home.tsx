import { Button } from "../components/ui/Button";
import { Link } from "react-router-dom";
import { ArrowRight, Activity, ShieldCheck, Users, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import heroImage from "../assets/patient2.png";

export default function Home() {
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="flex flex-col space-y-20 py-12">
            {/* Hero Section */}
            <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    className="space-y-8 text-left relative z-10"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    {/* Decorative Elements */}
                    <div className="absolute -top-20 -left-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl -z-10 animate-pulse" />
{/* Badge 
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 backdrop-blur-sm border border-white/60 text-primary text-sm font-medium shadow-sm">
                        <Sparkles className="w-4 h-4" />
                        <span>Nouvelle version disponible</span>
                    </div>
                    */}

                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight text-slate-900">
                        L’expertise des cas cliniques <br />
                        <span className="bg-gradient-to-r from-primary via-accent to-purple-600 bg-clip-text text-transparent">
                            à portée de main
                        </span>
                    </h1>

                    <p className="max-w-xl text-xl text-slate-600 leading-relaxed">
                        La plateforme dérivée de MedTutor pour la gestion des cas cliniques ,
                        Une interface moderne, intuitive et sécurisée pour les professionnels de santé.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <Link to="/cases">
                            <Button size="lg" variant="gradient" className="gap-2 w-full sm:w-auto text-lg h-14 px-8 rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/30">
                                Gérer les Cas Cliniques <ArrowRight className="h-5 w-5" />
                            </Button>
                        </Link>
                        <Link to="/profile">
                            <Button variant="glass" size="lg" className="gap-2 w-full sm:w-auto text-lg h-14 px-8 rounded-2xl">
                                Mon Profil <Users className="h-5 w-5" />
                            </Button>
                        </Link>
                    </div>
                </motion.div>

                <div className="relative flex justify-center lg:justify-end">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/20 rounded-full blur-3xl -z-10 animate-pulse delay-700" />

                    {/* Holographic Container */}
                    <div className="relative w-full max-w-lg">
                        {/* Scanning Line */}
                        <motion.div
                            className="absolute left-0 right-0 h-1 bg-primary shadow-[0_0_20px_rgba(63,23,83,0.8)] z-20"
                            initial={{ top: "0%", opacity: 0 }}
                            animate={{
                                top: ["0%", "100%"],
                                opacity: [0, 1, 1, 0]
                            }}
                            transition={{
                                duration: 2.5,
                                ease: "easeInOut",
                                times: [0, 0.1, 0.9, 1]
                            }}
                        />

                        {/* Image Reveal */}
                        <motion.div
                            initial={{ clipPath: "inset(0 0 100% 0)", filter: "brightness(2) blur(10px)" }}
                            animate={{
                                clipPath: "inset(0 0 0% 0)",
                                filter: "brightness(1) blur(0px)"
                            }}
                            transition={{
                                duration: 2.5,
                                ease: "easeInOut"
                            }}
                        >
                            <motion.img
                                src={heroImage}
                                alt="Medical Intelligence"
                                className="w-full object-contain drop-shadow-2xl"
                                animate={{
                                    y: [0, -15, 0],
                                }}
                                transition={{
                                    duration: 6,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                    delay: 2.5 // Start floating after reveal
                                }}
                            />
                        </motion.div>

                        {/* Construction Particles */}
                        {[...Array(10)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute w-1 h-1 bg-primary rounded-full z-30"
                                initial={{
                                    opacity: 0,
                                    x: Math.random() * 400 - 200,
                                    y: Math.random() * 400 - 200
                                }}
                                animate={{
                                    opacity: [0, 1, 0],
                                    x: 0,
                                    y: 0,
                                    scale: [0, 1.5, 0]
                                }}
                                transition={{
                                    duration: 2,
                                    delay: Math.random() * 1.5,
                                    ease: "circOut"
                                }}
                                style={{
                                    left: "50%",
                                    top: "50%"
                                }}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <motion.div
                className="grid grid-cols-1 gap-8 sm:grid-cols-3 w-full max-w-6xl mx-auto px-4"
                variants={container}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-100px" }}
            >
                <motion.div variants={item} className="group flex flex-col items-center text-center space-y-4 rounded-3xl border border-white/40 bg-white/60 backdrop-blur-md p-8 shadow-xl shadow-slate-200/50 transition-all hover:-translate-y-1 hover:bg-white/80 hover:shadow-2xl hover:shadow-primary/10">
                    <div className="rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 p-4 text-primary shadow-inner group-hover:scale-110 transition-transform duration-300">
                        <Activity className="h-8 w-8" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800">Gestion Intuitive</h3>
                    <p className="text-slate-600 leading-relaxed">
                        Créez, modifiez et suivez vos cas cliniques avec une facilité déconcertante grâce à nos outils intelligents.
                    </p>
                </motion.div>

                <motion.div variants={item} className="group flex flex-col items-center text-center space-y-4 rounded-3xl border border-white/40 bg-white/60 backdrop-blur-md p-8 shadow-xl shadow-slate-200/50 transition-all hover:-translate-y-1 hover:bg-white/80 hover:shadow-2xl hover:shadow-teal-500/10">
                    <div className="rounded-2xl bg-gradient-to-br from-fuchsia-50 to-fuchsia-100 p-4 text-accent shadow-inner group-hover:scale-110 transition-transform duration-300">
                        <ShieldCheck className="h-8 w-8" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800">Sécurité Maximale</h3>
                    <p className="text-slate-600 leading-relaxed">
                        Vos données et celles de vos patients sont protégées par les meilleurs standards de chiffrement.
                    </p>
                </motion.div>

                <motion.div variants={item} className="group flex flex-col items-center text-center space-y-4 rounded-3xl border border-white/40 bg-white/60 backdrop-blur-md p-8 shadow-xl shadow-slate-200/50 transition-all hover:-translate-y-1 hover:bg-white/80 hover:shadow-2xl hover:shadow-teal-500/10">
                    <div className="rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 p-4 text-purple-600 shadow-inner group-hover:scale-110 transition-transform duration-300">
                        <Users className="h-8 w-8" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800">Communauté Expert</h3>
                    <p className="text-slate-600 leading-relaxed">
                        Rejoignez une communauté d'experts, partagez vos connaissances et collaborez sur des cas complexes.
                    </p>
                </motion.div>
            </motion.div>
        </div>
    );
}
