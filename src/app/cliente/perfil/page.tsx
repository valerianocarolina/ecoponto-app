"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Recycle, Save, LogOut, Fingerprint, Bell, BellOff, Trash2 } from "lucide-react";
import { PrimaryButton } from "@/components/PrimaryButton/PrimaryButton";
import { TextField } from "@/components/TextField/TextField";
import { useBiometricAuth } from "@/hooks/useBiometricAuth";
import { useNotifications } from "@/hooks/useNotifications";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/services/api";
import { ConfirmDialog } from "@/components/ConfirmDialog/ConfirmDialog";
import s from "./Perfil.module.css";
import { routes } from "@/routes/routes";

export default function ClientePerfil() {
  const router = useRouter();
  const { user, logout, updateUser, loading: authLoading } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { supported: bioSupported, enrolled: bioEnrolled, enroll: bioEnroll, unenroll: bioUnenroll } = useBiometricAuth();
  const { permission: notifPermission, supported: notifSupported, requestPermission } = useNotifications();

  useEffect(() => {
    if (authLoading) return;
    if (user) {
      setName(user.nome || "");
      setEmail(user.email || "");
      setLoading(false);
    } else {
      router.push(routes.loginCliente);
    }
  }, [user, authLoading, router]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiFetch("/usuarios/perfil", {
        method: "PUT",
        body: JSON.stringify({ nome: name }),
      });
      updateUser({ nome: name });
      toast.success("Perfil atualizado!");
    } catch (error) {
      toast.error("Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push(routes.loginCliente);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      // Aqui você pode adicionar uma chamada para a API para excluir a conta
      // await apiFetch("/usuarios/conta", { method: "DELETE" });
      
      // Desenrolar biometria
      bioUnenroll();
      
      // Fazer logout
      logout();
      
      toast.success("Conta removida. Seus dados foram excluídos.");
      router.push(routes.home);
    } catch (error) {
      toast.error("Erro ao excluir conta.");
    } finally {
      setDeleting(false);
    }
  };

  const toggleBiometric = async () => {
    if (!bioSupported) {
      toast.error("Seu dispositivo não suporta biometria.");
      return;
    }

    if (bioEnrolled) {
      bioUnenroll();
      toast.success("Biometria desativada.");
    } else {
      const ok = await bioEnroll();
      if (ok) toast.success("Biometria ativada!");
      else toast.error("Seu dispositivo não suporta biometria.");
    }
  };

  const toggleNotifications = async () => {
    if (notifPermission === "granted") {
      toast.info("Para desativar notificações, use as configurações do navegador.");
    } else {
      const result = await requestPermission();
      if (result === "granted") toast.success("Notificações ativadas!");
      else toast.error("Permissão negada.");
    }
  };

  if (authLoading || loading) return (
    <div className={s.loadingScreen}>
      <Loader2 style={{ height: "1.5rem", width: "1.5rem", animation: "spin 1s linear infinite", color: "hsl(var(--primary))" }} />
    </div>
  );

  return (
    <div className={s.layout}>
      <header className={s.header}>
        <button onClick={() => router.push(routes.mapa)} className={s.backBtn}>
          <ArrowLeft className={s.backIcon} />
        </button>
        <div className={s.headerInfo}>
          <Recycle className={s.headerIcon} />
          <h1 className={s.headerTitle}>Meu Perfil</h1>
        </div>
      </header>
      <div className={s.content}>
        <div className={s.fields}>
          <TextField
            label="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Seu nome"
          />
          <TextField
            label="Email"
            value={email}
            onChange={() => {}}
            disabled
          />
          <p className={s.emailHint}>O email não pode ser alterado</p>
          <PrimaryButton onClick={() => setShowSaveConfirm(true)} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Salvar Alterações
          </PrimaryButton>
          <button onClick={toggleBiometric} className={`${s.secondaryButton}`}>
            <Fingerprint className="h-4 w-4" />
            {bioSupported
              ? bioEnrolled
                ? "Desativar Biometria"
                : "Ativar Login Biométrico"
              : "Biometria indisponível"}
          </button>
          {notifSupported && (
            <button onClick={toggleNotifications} className={`${s.secondaryButton}`}>
              {notifPermission === "granted" ? <><Bell className="h-4 w-4" /> Notificações Ativadas</> : <><BellOff className="h-4 w-4" /> Ativar Notificações</>}
            </button>
          )}
          <button onClick={handleLogout} className={`${s.secondaryButton}`}>
            <LogOut className="h-4 w-4" />
            Sair da Conta
          </button>
          <div className={s.divider}>
            <button 
              onClick={() => setShowDeleteConfirm(true)} 
              className={`${s.dangerButton}`}
            >
              <Trash2 className="h-4 w-4" />
              Excluir Conta
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={showSaveConfirm}
        title="Salvar alterações?"
        description="Seus dados pessoais serão atualizados."
        onConfirm={() => { setShowSaveConfirm(false); handleSave(); }}
        onCancel={() => setShowSaveConfirm(false)}
      />

      <ConfirmDialog
        open={showDeleteConfirm}
        title="Excluir conta?"
        description="Esta ação é irreversível. Todos os seus dados serão removidos permanentemente."
        onConfirm={() => { setShowDeleteConfirm(false); handleDelete(); }}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}