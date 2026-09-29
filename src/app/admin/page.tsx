"use client";

import { useState } from "react";
import { Loader2, CheckCircle, AlertCircle, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

export default function AdminPage() {
  const [secret, setSecret] = useState("");
  const [userId, setUserId] = useState("");
  const [planId, setPlanId] = useState("monthly");
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleGrantAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/admin/grant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, secret, planId }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Error al otorgar acceso");
      }

      setResult({ success: true, message: data.message });
      setUserId(""); // clear input after success
    } catch (err: any) {
      setResult({ success: false, message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      
      <div className="flex items-center gap-2 mb-8 text-primary">
        <ShieldAlert size={32} />
        <h1 className="text-2xl font-black tracking-tight text-white">Panel de Administración</h1>
      </div>

      <Card className="w-full max-w-md bg-surface border-white/10 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-white">Otorgar Plan Pro</CardTitle>
          <CardDescription className="text-white/50">
            Pega el User ID que recibiste por WhatsApp para activar su cuenta manualmente.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleGrantAccess} className="space-y-4">
            
            <div className="space-y-2">
              <label className="text-xs font-semibold text-white/70">Contraseña Maestra (ADMIN_SECRET)</label>
              <Input 
                type="password" 
                placeholder="********"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                required
                className="bg-background/50 border-white/10 text-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-white/70">ID del Usuario (User ID)</label>
              <Input 
                type="text" 
                placeholder="ej. clr12345..."
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                required
                className="bg-background/50 border-white/10 text-white font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-white/70">Plan a otorgar</label>
              <select 
                value={planId}
                onChange={(e) => setPlanId(e.target.value)}
                className="flex h-9 w-full rounded-md border border-white/10 bg-background/50 px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 text-white"
              >
                <option value="monthly">Plan Pro (9.900 COP - Único)</option>
              </select>
            </div>

            {result && (
              <div className={`p-3 rounded-lg flex items-start gap-2 text-sm ${result.success ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                {result.success ? <CheckCircle size={18} className="shrink-0 mt-0.5" /> : <AlertCircle size={18} className="shrink-0 mt-0.5" />}
                <p>{result.message}</p>
              </div>
            )}

            <Button 
              type="submit" 
              disabled={loading || !secret || !userId}
              className="w-full bg-primary hover:bg-primary/80 text-background font-bold mt-2"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : "Activar Cuenta"}
            </Button>
          </form>
        </CardContent>
      </Card>

    </div>
  );
}
