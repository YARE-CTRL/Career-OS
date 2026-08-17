import type { OnboardingData } from './onboardingSchema';

export const mockInjectors = {
  // Caso 1: Payload sano (Control)
  healthy: (): OnboardingData => ({
    name: "Juan Pérez",
    role: "Frontend Developer",
    level: "Estudiante",
    goal: "Quiero conseguir mi primer empleo como Junior Frontend en 6 meses usando React y Next.js",
    sector: "Fintech",
    hoursPerWeek: 20,
    technologies: ["HTML", "CSS", "JS", "React"],
    courses: ["React Udemy", "FreeCodeCamp"],
    projects: ["Calculadora", "To-Do List"]
  }),

  // Caso 2: Textos masivos (Buffer Overflow attempt)
  massiveText: (): OnboardingData => ({
    name: "A".repeat(10000), // Nombre gigantesco
    role: "B".repeat(50000), // Rol masivo
    level: "Estudiante",
    goal: "C".repeat(100000), // Goal ultra masivo para estresar Zod/JSON parse
    sector: "Tech",
    hoursPerWeek: 20,
    technologies: Array.from({ length: 1000 }, (_, i) => `Tech${i}`),
    courses: [],
    projects: []
  }),

  // Caso 3: Valores Numéricos Extremos e Inválidos (Zod Stress)
  extremeNumbers: () => ({
    name: "John",
    role: "Dev",
    level: "Estudiante",
    goal: "Conseguir trabajo pronto para pagar deudas",
    sector: "Salud",
    hoursPerWeek: -50, // Horas negativas (Zod debería bloquear)
    technologies: ["React"],
    courses: [],
    projects: []
  } as unknown as OnboardingData), // Forzamos tipado para pruebas

  // Caso 4: Inyección SQL y XSS 
  maliciousInjection: (): OnboardingData => ({
    name: "<script>alert('XSS')</script>",
    role: "DROP TABLE users;--",
    level: "Practicante",
    goal: "SELECT * FROM secrets WHERE 1=1; <img src='x' onerror='alert(1)'> Quiero ser admin de la base de datos",
    sector: "Cybersecurity",
    hoursPerWeek: 40,
    technologies: ["Injection"],
    courses: [],
    projects: []
  })
};

// Función helper para usar en la consola del navegador
if (typeof window !== 'undefined') {
  (window as any).__INJECT_MOCKS__ = mockInjectors;
}
