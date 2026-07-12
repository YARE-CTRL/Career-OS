"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, type Variants } from "framer-motion";
import { useCareerStore } from "@/store";
import {
  Brain,
  BookOpen,
  Briefcase,
  Code,
  ExternalLink,
  LayoutDashboard,
  Target,
  Sparkles,
  ArrowRight,
  LogOut,
} from "lucide-react";

// ─── Animation Variants ───────────────────────────────────────────────────────

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

// ─── Helper Functions ─────────────────────────────────────────────────────────

// Map item type to icon
const getTypeIcon = (type: string) => {
  switch (type) {
    case 'course': return <BookOpen size={16} className="text-blue-400" />;
    case 'project': return <Code size={16} className="text-purple-400" />;
    case 'practice': return <Target size={16} className="text-green-400" />;
    default: return <Briefcase size={16} className="text-text-main/70" />;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'course': return "bg-blue-500/10 border-blue-500/20";
    case 'project': return "bg-purple-500/10 border-purple-500/20";
    case 'practice': return "bg-green-500/10 border-green-500/20";
    default: return "bg-surface border-text-main/10";
  }
};

// ─── Main Dashboard Page ──────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();
  const { profile, roadmap, notionUrl, clearStore } = useCareerStore();
  const [isMounted, setIsMounted] = useState(false);

  // Avoid hydration errors with zustand persist
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handle Empty State / Redirection
  useEffect(() => {
    if (isMounted && !profile) {
      router.push("/onboarding");
    }
  }, [isMounted, profile, router]);

  if (!isMounted || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  // AI Copilot Logic: find the first 'todo' task or default
  const nextTask = roadmap?.find(item => item.status === 'todo') || roadmap?.[0];

  const handleLogout = () => {
    clearStore();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-background text-text-main pb-24">
      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-text-main/10 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-text-main font-black text-lg tracking-tight">
              CAREER{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                OS AI
              </span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold bg-surface px-3 py-1.5 rounded-full border border-text-main/10 hidden sm:inline-block">
              Nivel: <span className="text-primary">{profile.level}</span>
            </span>
            <button 
              onClick={handleLogout}
              className="text-text-main/50 hover:text-red-400 transition-colors p-2"
              title="Cerrar sesión (Borrar datos)"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 pt-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-8"
        >
          {/* ─── Greeting Section ────────────────────────────────────────── */}
          <motion.div variants={itemVariants} className="flex flex-col gap-2">
            <h1 className="text-3xl sm:text-4xl font-black text-white">
              Hola <span className="text-primary">{profile.name.split(' ')[0]}</span>, semana 1 de tu roadmap.
            </h1>
            <p className="text-text-main/50 text-lg">
              Objetivo (6 meses): <strong className="text-text-main/80 font-medium">{profile.goal}</strong>
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* ─── Left Column (Roadmap & Workspaces) ────────────────────── */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              
              {/* Workspace Widget */}
              <motion.div variants={itemVariants} className="bg-surface rounded-3xl p-6 sm:p-8 border border-text-main/5 hover:border-primary/20 transition-all shadow-lg">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <div>
                    <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                      <LayoutDashboard size={20} className="text-primary" />
                      Tu Sistema Central
                    </h2>
                    <p className="text-text-main/50 text-sm mt-1">
                      Gestiona tu progreso en tu workspace dedicado.
                    </p>
                  </div>
                  {notionUrl ? (
                    <a
                      href={notionUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary px-4 py-2 rounded-full font-semibold text-sm transition-all border border-primary/20"
                    >
                      Ver Workspace en Notion
                      <ExternalLink size={14} className="group-hover:translate-x-0.5 transition-transform" />
                    </a>
                  ) : (
                    <span className="text-xs px-3 py-1 bg-text-main/10 rounded-full text-text-main/40">Workspace local</span>
                  )}
                </div>
                
                {/* Stats row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-background/50 rounded-2xl p-4 border border-text-main/5">
                    <p className="text-text-main/40 text-xs font-bold uppercase tracking-wider mb-1">Horas Semanales</p>
                    <p className="text-2xl font-black">{profile.hoursPerWeek}h</p>
                  </div>
                  <div className="bg-background/50 rounded-2xl p-4 border border-text-main/5">
                    <p className="text-text-main/40 text-xs font-bold uppercase tracking-wider mb-1">Sector</p>
                    <p className="text-lg font-bold text-secondary truncate" title={profile.sector}>{profile.sector}</p>
                  </div>
                  <div className="bg-background/50 rounded-2xl p-4 border border-text-main/5">
                    <p className="text-text-main/40 text-xs font-bold uppercase tracking-wider mb-1">Rol</p>
                    <p className="text-sm font-bold truncate" title={profile.role}>{profile.role}</p>
                  </div>
                </div>
              </motion.div>

              {/* Roadmap Widget */}
              <motion.div variants={itemVariants} className="bg-surface rounded-3xl p-6 sm:p-8 border border-text-main/5">
                <h2 className="text-xl font-bold flex items-center gap-2 text-white mb-2">
                  <Target size={20} className="text-primary" />
                  Roadmap Generado por IA
                </h2>
                <p className="text-text-main/50 text-sm mb-6">
                  Basado en tus habilidades actuales, este es tu camino hacia tu objetivo.
                </p>

                <div className="flex flex-col gap-4">
                  {roadmap && roadmap.length > 0 ? (
                    roadmap.map((item, index) => (
                      <div 
                        key={item.id || index}
                        className={`flex flex-col sm:flex-row gap-4 p-4 rounded-2xl border transition-colors hover:border-primary/40 ${getTypeColor(item.type)}`}
                      >
                        <div className="w-10 h-10 rounded-full bg-background/50 flex items-center justify-center flex-shrink-0 shadow-inner">
                          {getTypeIcon(item.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <h3 className="font-bold text-white text-base">{item.title}</h3>
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-full bg-background/50 text-text-main/60">
                              {item.type}
                            </span>
                          </div>
                          <p className="text-text-main/70 text-sm leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-text-main/40 border-2 border-dashed border-text-main/10 rounded-2xl">
                      No se encontró un roadmap.
                    </div>
                  )}
                </div>
              </motion.div>

            </div>

            {/* ─── Right Column (Copilot & Actions) ──────────────────────── */}
            <div className="flex flex-col gap-6">
              
              {/* IA Copilot Box */}
              <motion.div variants={itemVariants} className="relative bg-secondary overflow-hidden rounded-3xl p-6 sm:p-8 border border-secondary/50 shadow-xl shadow-secondary/10">
                {/* Glow decor */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-[40px] rounded-full pointer-events-none" />
                
                <h2 className="text-lg font-bold flex items-center gap-2 text-white mb-4 relative z-10">
                  <Sparkles size={20} className="text-white" />
                  Copiloto Semanal
                </h2>
                
                <div className="relative z-10 bg-black/10 rounded-2xl p-4 backdrop-blur-sm border border-white/10">
                  <p className="text-white/90 text-sm leading-relaxed mb-4">
                    Basado en tu perfil de <strong className="text-white">{profile.level}</strong> en <strong className="text-white">{profile.sector}</strong>, te sugiero enfocarte primero en:
                  </p>
                  
                  {nextTask ? (
                    <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                      <p className="font-bold text-white text-sm flex items-center gap-2 mb-1">
                        <ArrowRight size={14} className="text-primary" />
                        {nextTask.title}
                      </p>
                      <p className="text-white/60 text-xs">Alineado a tu meta de 6 meses.</p>
                    </div>
                  ) : (
                    <p className="text-white/60 text-sm italic">Sigue tu ritmo establecido.</p>
                  )}
                  
                  <button className="w-full mt-4 bg-white text-secondary font-bold py-2.5 rounded-xl text-sm shadow-md hover:bg-white/90 transition-colors">
                    Pedir consejo específico
                  </button>
                </div>
              </motion.div>

              {/* Skills Widget */}
              <motion.div variants={itemVariants} className="bg-surface rounded-3xl p-6 border border-text-main/5">
                <h2 className="text-base font-bold flex items-center gap-2 text-white mb-4">
                  <Brain size={18} className="text-primary" />
                  Habilidades Registradas
                </h2>
                <div className="flex flex-wrap gap-2">
                  {profile.technologies.length > 0 ? (
                    profile.technologies.map(tech => (
                      <span key={tech} className="px-2.5 py-1 bg-background/80 border border-text-main/10 rounded-lg text-xs font-semibold text-text-main/80">
                        {tech}
                      </span>
                    ))
                  ) : (
                    <span className="text-text-main/40 text-xs">No hay habilidades registradas.</span>
                  )}
                </div>
              </motion.div>

            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
