"use client";

import Link from "next/link";
import Image from "next/image";
import HeroCTA from "@/components/HeroCTA";
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

import { Meteors } from "@/components/ui/meteors";
import { BorderBeam } from "@/components/ui/border-beam";

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
    <section className="relative min-h-screen flex flex-col items-center justify-center bg-background overflow-hidden px-6 py-24 lg:py-32">
      {/* Meteors Effect */}
      <Meteors number={25} />
      
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

      {/* ─── Two-column layout on large screens ─── */}
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 items-center gap-12 lg:gap-16">

        {/* Left column: text + CTAs */}
        <motion.div
          className="flex flex-col items-center lg:items-start gap-6 text-center lg:text-left"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {/* Animated Badge */}
          <motion.div variants={fadeUp}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-bold shadow-[0_0_15px_rgba(0,212,170,0.2)]">
              <span>⚡</span>
              Potenciado por IA
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeUp}
            className="text-5xl sm:text-7xl font-black tracking-tighter leading-[1.1] text-white"
          >
            Tu Carrera, <br className="hidden lg:block" />
            Tu{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              Roadmap
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={fadeUp}
            className="text-lg sm:text-xl font-medium text-white/60 max-w-xl"
          >
            Deja de adivinar qué estudiar. Nuestra IA analiza tu perfil y mercado para generarte un plan de carrera estructurado y personalizado en segundos.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={fadeUp}
            className="flex flex-col sm:flex-row items-center gap-4 mt-4 w-full sm:w-auto"
          >
            <HeroCTA />
            <a
              href="#como-funciona"
              className="group flex items-center justify-center gap-2 rounded-full border border-white/20 text-white font-semibold text-base px-8 py-4 hover:border-white/40 hover:bg-white/5 transition-all duration-300 w-full sm:w-auto"
            >
              <Play size={16} className="text-white/70 group-hover:text-white" />
              Ver cómo funciona
            </a>
          </motion.div>
        </motion.div>

        {/* Right column: Composed Image */}
        <motion.div
          className="relative w-full aspect-square lg:aspect-auto lg:h-[600px] flex items-center justify-center mt-12 lg:mt-0"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Halo Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />

          {/* Image Container */}
          <div className="relative w-full max-w-[620px] rounded-[40px] border border-white/8 overflow-hidden shadow-2xl shadow-black/50 [clip-path:inset(0px_round_40px)]">
            {/* The Image */}
            <div className="relative w-full h-[400px] sm:h-[500px] lg:h-[550px]">
              <Image
                src="/assets/Hero de la Landing Page - Aspect Ratio 169 o 32 horizontales.jpeg"
                alt="AI Roadmap Generator 3D"
                fill
                priority
                className="object-cover"
              />
              
              {/* Gradient Mask at bottom to blend with bg-background */}
              <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />
            </div>
            
            {/* Floating Badge: IA Activa (Top Right) */}
            <div className="absolute top-6 right-6 flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full px-4 py-2 shadow-lg z-10">
              <span className="relative flex h-2 w-2">
                <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-primary opacity-100"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="text-white text-xs font-bold tracking-wide uppercase">🤖 IA activa</span>
            </div>

            {/* Floating Badge: Generated (Bottom Left) */}
            <div className="absolute bottom-10 left-[-10px] sm:left-[-20px] md:left-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-xl flex items-center gap-3 z-10">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                <CheckCircle size={20} className="text-primary" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">✓ Roadmap generado</p>
                <p className="text-white/50 text-xs">en 30 segundos</p>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
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

const newSolutions = [
  {
    tag: "PLAN DE CARRERA",
    title: "Tu Roadmap Personalizado",
    desc: "La IA analiza tu perfil y genera un plan de acción semana a semana",
    img: "/assets/Feature 1 Rutas de Aprendizaje - Aspect Ratio 11 cuadrado.png"
  },
  {
    tag: "COPILOTO IA",
    title: "Consejo cuando lo necesitas",
    desc: "Un copiloto de IA disponible 24/7 para orientarte en tu carrera",
    img: "/assets/Feature 2 Copiloto IA - Aspect Ratio 11 cuadrado.png"
  },
  {
    tag: "EXPORTA TODO",
    title: "Conecta con tus herramientas",
    desc: "Exporta tu roadmap a Notion, Google Sheets y Google Calendar",
    img: "/assets/Feature 3 Integración y Exportación - Aspect Ratio 11 cuadrado.png"
  }
];

function SolutionSection() {
  return (
    <section className="bg-background py-24 px-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-primary/5 blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-secondary/5 blur-[100px]" />
      </div>

      <motion.div
        className="max-w-6xl mx-auto relative z-10"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={vp}
      >
        <motion.div variants={fadeUp} className="text-center mb-16">
          <SectionLabel>Características</SectionLabel>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Un ecosistema inteligente
          </h2>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {newSolutions.map((sol, i) => (
            <motion.div
              key={i}
              variants={scaleIn}
              className="group relative flex flex-col bg-surface/80 backdrop-blur-md border border-white/8 rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/40"
            >
              <BorderBeam size={200} duration={12} delay={i * 2} />
              
              {/* Top Image Container */}
              <div className="relative w-full h-[220px]">
                <Image
                  src={sol.img}
                  alt={sol.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {/* Gradient mask so it fades into the card body */}
                <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent opacity-90" />
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-surface to-transparent" />
              </div>
              
              {/* Card Body */}
              <div className="relative p-6 pt-0 flex flex-col flex-1 z-10">
                <div className="mb-4">
                  <span className="text-[10px] font-bold tracking-widest text-primary px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
                    {sol.tag}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{sol.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{sol.desc}</p>
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
    desc: "En segundos, recibes un plan de carrera estructurado semana a semana basado en tu perfil, objetivos y sector.",
    icon: Brain,
    bg: "bg-secondary",
    accent: "text-primary",
    textColor: "text-white",
    descColor: "text-white/60",
    numColor: "text-white/10",
  },
  {
    number: "03",
    title: "Revisa tu roadmap en el dashboard",
    desc: "Visualiza tu plan semana a semana, con recursos, criterios de éxito y el estado de cada etapa.",
    icon: BookOpen,
    bg: "bg-surface",
    accent: "text-primary",
    textColor: "text-text-main",
    descColor: "text-text-main/50",
    numColor: "text-primary/20",
  },
  {
    number: "04",
    title: "Consulta al Copiloto IA cuando quieras",
    desc: "Pregúntale al Copiloto dudas de carrera, tecnologías o tu siguiente paso. Respuestas basadas en tu perfil.",
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
  "Genera tu roadmap personalizado con IA",
  "Perfil profesional básico",
  "Acceso al dashboard de carrera",
];

const proFeatures = [
  "Todo lo del plan gratuito",
  "Copiloto IA para consejería de carrera",
  "Exportar roadmap a Notion",
  "Exportar a Google Sheets y Google Calendar",
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
                <span className="text-5xl font-black text-background">9.900</span>
                <span className="text-background/70 font-semibold mb-2">COP</span>
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
            Obtener Career OS AI — 9.900 COP
            <ArrowRight
              size={18}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
          <Link
            href="/onboarding"
            id="cta-final-secondary"
            className="flex items-center justify-center gap-2 rounded-full border border-white/25 text-white font-semibold text-base px-8 py-4 hover:border-white/50 hover:bg-white/10 transition-all duration-300"
          >
            Comenzar gratis
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
          © 2026 Career OS AI. Todos los derechos reservados.
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
