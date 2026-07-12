"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import {
  AlertTriangle,
  BookOpen,
  Briefcase,
  Brain,
  CheckCircle,
  ChevronRight,
  Layout,
  Play,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  Zap,
  ArrowRight,
  Target,
  Clock,
  Map,
} from "lucide-react";

// ─── Animation Variants ───────────────────────────────────────────────────────

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE },
  },
};

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.7 } },
};

const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.55, ease: EASE },
  },
};

// ─── Reusable viewport trigger ────────────────────────────────────────────────
const vp = { once: true, margin: "-80px" };

// ─── Components ───────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-widest uppercase bg-primary/15 text-primary mb-4">
      {children}
    </span>
  );
}

// ─── SECTION 1: HERO ─────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center bg-background overflow-hidden px-6 py-24">
      {/* Background glow blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-[-5%] right-[10%] w-[400px] h-[400px] rounded-full bg-secondary/10 blur-[100px]" />
      </div>

      {/* Subtle grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(232,232,240,1) 1px, transparent 1px), linear-gradient(90deg, rgba(232,232,240,1) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <motion.div
        className="max-w-4xl mx-auto text-center flex flex-col items-center gap-6"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Tag */}
        <motion.div variants={fadeUp}>
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium">
            <Sparkles size={14} />
            Impulsado por Inteligencia Artificial
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={fadeUp}
          className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter leading-none text-text-main"
        >
          CAREER{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
            OS AI
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          variants={fadeUp}
          className="text-lg sm:text-2xl font-semibold text-text-main/80 max-w-2xl"
        >
          De estudiante a profesional con sistema e IA
        </motion.p>

        {/* Body copy */}
        <motion.p
          variants={fadeUp}
          className="text-base sm:text-lg text-text-main/50 max-w-xl"
        >
          No es una plantilla. Es tu sistema de crecimiento.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          variants={fadeUp}
          className="flex flex-col sm:flex-row gap-4 mt-4"
        >
          <Link
            href="/onboarding"
            id="hero-cta-primary"
            className="group flex items-center justify-center gap-2 rounded-full bg-primary text-background font-bold text-base px-8 py-4 shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-105 transition-all duration-300"
          >
            Empieza gratis hoy
            <ArrowRight
              size={18}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
          <a
            href="#como-funciona"
            id="hero-cta-secondary"
            className="group flex items-center justify-center gap-2 rounded-full border border-text-main/30 text-text-main font-semibold text-base px-8 py-4 hover:border-text-main/70 hover:bg-text-main/5 transition-all duration-300"
          >
            <Play size={16} className="text-primary" />
            Ver cómo funciona
          </a>
        </motion.div>

        {/* Social proof strip */}
        <motion.div
          variants={fadeUp}
          className="flex items-center gap-3 mt-6 text-text-main/40 text-sm"
        >
          <div className="flex -space-x-2">
            {["#00D4AA", "#7B61FF", "#FFB347", "#FF6B6B"].map((c, i) => (
              <div
                key={i}
                className="w-7 h-7 rounded-full border-2 border-background"
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <span>+200 estudiantes ya usan Career OS AI</span>
        </motion.div>
      </motion.div>
    </section>
  );
}

// ─── SECTION 2: EL PROBLEMA ───────────────────────────────────────────────────

const problems = [
  { icon: BookOpen, text: "Cursos dispersos sin estructura" },
  { icon: Target, text: "No sabes qué estudiar después" },
  { icon: Briefcase, text: "Tu CV no refleja lo que realmente sabes" },
  { icon: Clock, text: "Aplicas a empleos sin seguimiento" },
];

function ProblemsSection() {
  return (
    <section className="bg-surface py-24 px-6">
      <motion.div
        className="max-w-5xl mx-auto"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={vp}
      >
        <motion.div variants={fadeUp} className="text-center mb-14">
          <SectionLabel>El Problema</SectionLabel>
          <h2 className="text-3xl sm:text-5xl font-black text-text-main tracking-tight">
            ¿Atrapado en el ciclo junior?
          </h2>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          className="grid grid-cols-1 sm:grid-cols-2 gap-5"
        >
          {problems.map(({ icon: Icon, text }, i) => (
            <motion.div
              key={i}
              variants={scaleIn}
              className="group flex items-start gap-4 bg-background/60 border border-text-main/8 rounded-2xl p-6 hover:border-primary/30 hover:bg-background/80 transition-all duration-300"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center">
                <AlertTriangle size={20} className="text-red-400" />
              </div>
              <div>
                <p className="text-text-main font-medium text-base">{text}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Central highlight */}
        <motion.div
          variants={fadeUp}
          className="mt-14 text-center"
        >
          <div className="inline-block relative">
            <p className="text-2xl sm:text-4xl font-black text-text-main/90 italic">
              "No tienes sistema,{" "}
              <span className="text-red-400 not-italic">tienes caos.</span>"
            </p>
            <div className="absolute -bottom-2 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-red-400/40 to-transparent rounded-full" />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

// ─── SECTION 3: LA SOLUCIÓN ───────────────────────────────────────────────────

const solutions = [
  {
    icon: Layout,
    title: "Notion como base organizada",
    desc: "Todo tu sistema en un único workspace estructurado.",
  },
  {
    icon: Brain,
    title: "IA que analiza tu perfil",
    desc: "Genera tu roadmap personalizado según tus metas.",
  },
  {
    icon: Briefcase,
    title: "Job Tracker integrado",
    desc: "Gestiona cada aplicación con métricas claras.",
  },
  {
    icon: TrendingUp,
    title: "Portfolio de valor real",
    desc: "Demuestra lo que sabes, no solo lo que estudias.",
  },
];

function SolutionSection() {
  return (
    <section className="bg-secondary py-24 px-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-white/5 blur-[80px]" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-primary/10 blur-[60px]" />
      </div>

      <motion.div
        className="max-w-5xl mx-auto relative z-10"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={vp}
      >
        <motion.div variants={fadeUp} className="text-center mb-14">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-widest uppercase bg-white/15 text-white mb-4">
            La Solución
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            UN SISTEMA, NO UNA PLANTILLA
          </h2>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          className="grid grid-cols-1 sm:grid-cols-2 gap-6"
        >
          {solutions.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={i}
              variants={scaleIn}
              className="group flex items-start gap-4 bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-6 hover:bg-white/15 hover:border-white/25 transition-all duration-300"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Icon size={20} className="text-primary" />
              </div>
              <div>
                <p className="text-white font-semibold text-base mb-1">{title}</p>
                <p className="text-white/60 text-sm leading-relaxed">{desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}

// ─── SECTION 4: CÓMO FUNCIONA ─────────────────────────────────────────────────

const steps = [
  {
    number: "01",
    title: "Completa tu perfil en 5 minutos",
    desc: "Cuéntanos tu nivel, tecnologías y metas. Sin formularios interminables.",
    icon: Users,
    bg: "bg-surface",
    accent: "text-primary",
    textColor: "text-text-main",
    descColor: "text-text-main/50",
    numColor: "text-primary/20",
  },
  {
    number: "02",
    title: "La IA genera tu roadmap personalizado",
    desc: "Algoritmos que analizan el mercado laboral y tu perfil para darte el camino exacto.",
    icon: Brain,
    bg: "bg-secondary",
    accent: "text-primary",
    textColor: "text-white",
    descColor: "text-white/60",
    numColor: "text-white/10",
  },
  {
    number: "03",
    title: "Registra cursos, proyectos y aplicaciones",
    desc: "Un dashboard unificado para llevar tu progreso sin perder el hilo.",
    icon: BookOpen,
    bg: "bg-surface",
    accent: "text-primary",
    textColor: "text-text-main",
    descColor: "text-text-main/50",
    numColor: "text-primary/20",
  },
  {
    number: "04",
    title: "Recibe recomendaciones semanales",
    desc: "La IA adapta tu plan según tus avances y el estado del mercado.",
    icon: Sparkles,
    bg: "bg-primary",
    accent: "text-background",
    textColor: "text-background",
    descColor: "text-background/60",
    numColor: "text-background/15",
  },
];

function HowItWorksSection() {
  return (
    <section id="como-funciona" className="py-6 px-0">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={vp}
        className="text-center py-14 px-6 bg-background"
      >
        <SectionLabel>Cómo Funciona</SectionLabel>
        <h2 className="text-3xl sm:text-5xl font-black text-text-main tracking-tight">
          Cuatro pasos. Un sistema completo.
        </h2>
      </motion.div>

      {steps.map(
        (
          { number, title, desc, icon: Icon, bg, accent, textColor, descColor, numColor },
          i
        ) => (
          <motion.div
            key={i}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={vp}
            className={`${bg} py-16 px-6`}
          >
            <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-8 md:gap-16">
              {/* Step number */}
              <div className="relative flex-shrink-0">
                <span
                  className={`text-[96px] sm:text-[120px] font-black leading-none select-none ${numColor}`}
                >
                  {number}
                </span>
                <div
                  className={`absolute inset-0 flex items-center justify-center`}
                >
                  <div
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                      bg === "bg-primary"
                        ? "bg-background/15"
                        : "bg-primary/15"
                    }`}
                  >
                    <Icon
                      size={28}
                      className={
                        bg === "bg-primary" ? "text-background" : "text-primary"
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="text-center md:text-left">
                <p
                  className={`text-xs font-bold tracking-widest uppercase mb-2 ${accent}`}
                >
                  Paso {i + 1}
                </p>
                <h3
                  className={`text-2xl sm:text-3xl font-black mb-3 ${textColor}`}
                >
                  {title}
                </h3>
                <p className={`text-base leading-relaxed max-w-md ${descColor}`}>
                  {desc}
                </p>
              </div>
            </div>
          </motion.div>
        )
      )}
    </section>
  );
}

// ─── SECTION 5: PARA QUIÉN ES ─────────────────────────────────────────────────

const audiences = [
  {
    icon: TrendingUp,
    title: "Juniors buscando mejor empleo",
    desc: "Convierte tu experiencia fragmentada en una narrativa profesional coherente que atraiga a los reclutadores.",
    tag: "Más común",
  },
  {
    icon: Map,
    title: "Estudiantes SENA buscando práctica",
    desc: "Organiza tu portfolio, prepara tu CV técnico y aplica de forma estratégica a empresas que valoran tu perfil.",
    tag: "Ideal para ti",
  },
  {
    icon: Zap,
    title: "Practicantes que quieren crecer",
    desc: "Sigue aprendiendo mientras trabajas. La IA sugiere qué estudiar para avanzar al siguiente nivel.",
    tag: "Modo pro",
  },
];

function ForWhomSection() {
  return (
    <section className="bg-background py-24 px-6">
      <motion.div
        className="max-w-5xl mx-auto"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={vp}
      >
        <motion.div variants={fadeUp} className="text-center mb-14">
          <SectionLabel>Para Quién Es</SectionLabel>
          <h2 className="text-3xl sm:text-5xl font-black text-text-main tracking-tight">
            Diseñado para el talento local
          </h2>
          <p className="text-text-main/50 mt-4 max-w-xl mx-auto">
            Si estás dando tus primeros pasos en tech, Career OS AI es tu ventaja.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {audiences.map(({ icon: Icon, title, desc, tag }, i) => (
            <motion.div
              key={i}
              variants={scaleIn}
              className="group relative bg-surface border border-text-main/8 rounded-3xl p-8 flex flex-col gap-4 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
            >
              {/* Tag */}
              <span className="absolute top-4 right-4 text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full bg-primary/15 text-primary">
                {tag}
              </span>

              <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Icon size={22} className="text-primary" />
              </div>

              <div>
                <h3 className="text-text-main font-bold text-lg mb-2">{title}</h3>
                <p className="text-text-main/50 text-sm leading-relaxed">{desc}</p>
              </div>

              <div className="mt-auto flex items-center gap-1.5 text-primary text-sm font-semibold">
                <span>Quiero empezar</span>
                <ChevronRight size={14} />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}

// ─── SECTION 6: PRECIOS ───────────────────────────────────────────────────────

const starterFeatures = [
  "Perfil profesional",
  "Learning Tracker básico",
  "Job Tracker básico",
];

const proFeatures = [
  "Todo el sistema completo",
  "IA Copiloto activada",
  "Revisiones semanales",
  "Soporte prioritario",
];

function PricingSection() {
  return (
    <section id="precios" className="bg-surface py-24 px-6">
      <motion.div
        className="max-w-4xl mx-auto"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={vp}
      >
        <motion.div variants={fadeUp} className="text-center mb-14">
          <SectionLabel>Precios</SectionLabel>
          <h2 className="text-3xl sm:text-5xl font-black text-text-main tracking-tight">
            Invierte una vez. Crece siempre.
          </h2>
          <p className="text-text-main/50 mt-4">Sin suscripciones. Sin sorpresas.</p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Starter */}
          <motion.div
            variants={scaleIn}
            className="bg-background border border-text-main/10 rounded-3xl p-8 flex flex-col gap-6"
          >
            <div>
              <p className="text-text-main/50 text-sm font-semibold uppercase tracking-widest mb-2">
                Plan Starter
              </p>
              <div className="flex items-end gap-2">
                <span className="text-5xl font-black text-text-main">Gratis</span>
              </div>
              <p className="text-text-main/40 text-sm mt-1">Para empezar a explorar</p>
            </div>

            <ul className="flex flex-col gap-3">
              {starterFeatures.map((f, i) => (
                <li key={i} className="flex items-center gap-3 text-text-main/70">
                  <CheckCircle size={16} className="text-text-main/30 flex-shrink-0" />
                  <span className="text-sm">{f}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/onboarding"
              id="starter-cta"
              className="mt-auto flex items-center justify-center gap-2 w-full py-3.5 rounded-full border border-text-main/20 text-text-main font-semibold text-sm hover:border-text-main/40 hover:bg-text-main/5 transition-all"
            >
              Comenzar gratis
            </Link>
          </motion.div>

          {/* Pro */}
          <motion.div
            variants={scaleIn}
            className="relative bg-primary rounded-3xl p-8 flex flex-col gap-6 shadow-2xl shadow-primary/30"
          >
            {/* Popular badge */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span className="flex items-center gap-1.5 px-4 py-1.5 bg-secondary text-white text-xs font-bold tracking-widest uppercase rounded-full shadow-lg">
                <Star size={11} fill="currentColor" />
                Más popular
              </span>
            </div>

            <div>
              <p className="text-background/60 text-sm font-semibold uppercase tracking-widest mb-2">
                Plan Pro
              </p>
              <div className="flex items-end gap-2">
                <span className="text-5xl font-black text-background">7</span>
                <span className="text-background/70 font-semibold mb-2">USD</span>
              </div>
              <p className="text-background/60 text-sm mt-1">
                Pago único de lanzamiento
              </p>
            </div>

            <ul className="flex flex-col gap-3">
              {proFeatures.map((f, i) => (
                <li key={i} className="flex items-center gap-3 text-background/90">
                  <CheckCircle size={16} className="text-background flex-shrink-0" />
                  <span className="text-sm font-medium">{f}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/onboarding"
              id="pro-cta"
              className="mt-auto flex items-center justify-center gap-2 w-full py-3.5 rounded-full bg-background text-primary font-bold text-sm shadow-lg hover:bg-background/90 hover:scale-[1.02] transition-all duration-200"
            >
              Obtener Plan Pro
              <ArrowRight size={16} />
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}

// ─── SECTION 7: CTA FINAL ─────────────────────────────────────────────────────

function CtaSection() {
  return (
    <section className="bg-secondary py-24 px-6 relative overflow-hidden">
      {/* Decorations */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -right-24 w-[500px] h-[500px] rounded-full bg-white/5 blur-[80px]" />
        <div className="absolute -bottom-24 -left-24 w-[400px] h-[400px] rounded-full bg-primary/15 blur-[80px]" />
      </div>

      <motion.div
        className="max-w-3xl mx-auto text-center relative z-10 flex flex-col items-center gap-8"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={vp}
      >
        <motion.div variants={fadeUp}>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-widest uppercase bg-white/15 text-white mb-4">
            Empieza Hoy
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Empieza a construir tu carrera hoy
          </h2>
        </motion.div>

        {/* Social proof */}
        <motion.div
          variants={fadeUp}
          className="flex flex-col sm:flex-row items-center gap-3"
        >
          <div className="flex -space-x-2">
            {["#00D4AA", "#7B61FF", "#FFB347", "#FF6B6B", "#60BAFF"].map(
              (c, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full border-2 border-secondary"
                  style={{ backgroundColor: c }}
                />
              )
            )}
          </div>
          <p className="text-white/70 text-sm">
            <strong className="text-white">Más de 200 estudiantes</strong> ya
            usan Career OS AI
          </p>
        </motion.div>

        {/* Buttons */}
        <motion.div
          variants={fadeUp}
          className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
        >
          <Link
            href="/onboarding"
            id="cta-final-primary"
            className="group flex items-center justify-center gap-2 rounded-full bg-primary text-background font-bold text-base px-8 py-4 shadow-xl shadow-primary/30 hover:shadow-primary/50 hover:scale-105 transition-all duration-300"
          >
            Obtener Career OS AI — 7 USD
            <ArrowRight
              size={18}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
          <Link
            href="/dashboard"
            id="cta-final-secondary"
            className="flex items-center justify-center gap-2 rounded-full border border-white/25 text-white font-semibold text-base px-8 py-4 hover:border-white/50 hover:bg-white/10 transition-all duration-300"
          >
            <Play size={16} />
            Ver demo gratis
          </Link>
        </motion.div>

        {/* Guarantee */}
        <motion.p variants={fadeIn} className="text-white/40 text-xs">
          ✓ Sin tarjeta de crédito · ✓ Acceso inmediato · ✓ Soporte incluido
        </motion.p>
      </motion.div>
    </section>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="bg-background border-t border-text-main/8 py-8 px-6">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="text-text-main font-black text-lg tracking-tight">
          CAREER{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
            OS AI
          </span>
        </span>
        <p className="text-text-main/30 text-sm">
          © 2025 Career OS AI. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <main className="min-h-screen overflow-x-hidden">
      <HeroSection />
      <ProblemsSection />
      <SolutionSection />
      <HowItWorksSection />
      <ForWhomSection />
      <PricingSection />
      <CtaSection />
      <Footer />
    </main>
  );
}
