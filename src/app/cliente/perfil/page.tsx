"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Recycle, Fingerprint, Bell, BellOff, LogOut, Trash2 } from "lucide-react";
import { SmallButtonWithIcon } from "@/components/SmallButtonWithIcon/SmallButtonWithIcon";
import { TextField } from "@/components/TextField/TextField";
import { ProtectedRoute } from "@/components/ProtectedRoute/ProtectedRoute";
import { useBiometricAuth } from "@/hooks/useBiometricAuth";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/services/api";
import { ConfirmDialog } from "@/components/ConfirmDialog/ConfirmDialog";
import { subscribeToPush, unsubscribeFromPush, getPushSubscription } from "@/services/push";
import s from "./Perfil.module.css";
import { routes } from "@/routes/routes";

async function getCityFromGeolocation(): Promise<string> {
  return new Promise((resolve) => {
    if (!("geolocation" in navigator)) return resolve("");
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}`
          );
          const data = await res.json();
          resolve(data.address?.city || data.address?.town || data.address?.village || "");
        } catch {
          resolve("");
        }
      },
      () => resolve(""),
      { timeout: 5000 }
    );
  });
}

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
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [pushSubscribed, setPushSubscribed] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>("default");
  const { supported: bioSupported, enrolled: bioEnrolled, enroll: bioEnroll, unenroll: bioUnenroll } = useBiometricAuth();

  useEffect(() => {
    if (authLoading) return;
    if (user) {
      setName(user.nome || "");
      setEmail(user.email || "");
      setLoading(false);
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotifPermission(Notification.permission);
    }
    getPushSubscription().then((sub) => setPushSubscribed(!!sub));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiFetch("/usuarios/perfil", {
        method: "PUT",
        body: JSON.stringify({ nome: name }),
      });
      updateUser({ nome: name });
      toast.success("Perfil atualizado!");
    } catch {
      toast.error("Erro ao salvar.");
    } finally {
      setSaving(false);
      setShowSaveConfirm(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      bioUnenroll();
      logout();
      toast.success("Conta removida. Seus dados foram excluídos.");
      router.push(routes.home);
    } catch {
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

  const togglePushNotifications = async () => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      toast.error("Push notifications não suportadas neste navegador.");
      return;
    }

    setPushLoading(true);
    try {
      if (pushSubscribed) {
        const ok = await unsubscribeFromPush();
        if (ok) {
          setPushSubscribed(false);
          toast.success("Notificações push desativadas.");
        } else {
          toast.error("Erro ao desativar notificações.");
        }
      } else {
        const permission = await Notification.requestPermission();
        setNotifPermission(permission);
        if (permission !== "granted") {
          toast.error("Permissão de notificação negada.");
          return;
        }
        const cidade = await getCityFromGeolocation();
        const ok = await subscribeToPush(cidade);
        if (ok) {
          setPushSubscribed(true);
          toast.success("Notificações push ativadas! Você receberá avisos de novos pontos próximos.");
        } else {
          toast.error("Erro ao ativar notificações push.");
        }
      }
    } finally {
      setPushLoading(false);
    }
  };

  if (authLoading || loading) return (
    <div className={s.loadingScreen}>
      <Loader2 style={{ height: "1.5rem", width: "1.5rem", color: "hsl(var(--primary))" }} className="animate-spin" />
    </div>
  );

  return (
    <ProtectedRoute requiredType="user">
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
          <section className={s.section}>
            <h2 className={s.sectionTitle}>Informações</h2>
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
            <div className={s.actions}>
              <SmallButtonWithIcon
                fullWidth
                disabled={saving}
                onClick={() => setShowSaveConfirm(true)}
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : "Salvar alterações"}
              </SmallButtonWithIcon>
            </div>
          </section>

          <section className={s.section}>
            <h2 className={s.sectionTitle}>Segurança e Notificações</h2>
            <div className={s.actions}>
              {bioSupported && (
                <SmallButtonWithIcon
                  fullWidth
                  variant="secondary"
                  icon={<Fingerprint size={16} />}
                  onClick={toggleBiometric}
                >
                  {bioEnrolled ? "Desativar Biometria" : "Ativar Login Biométrico"}
                </SmallButtonWithIcon>
              )}
              {"serviceWorker" in (typeof navigator !== "undefined" ? navigator : {}) && (
                <SmallButtonWithIcon
                  fullWidth
                  variant="secondary"
                  disabled={pushLoading}
                  icon={pushSubscribed ? <Bell size={16} /> : <BellOff size={16} />}
                  onClick={togglePushNotifications}
                >
                  {pushLoading
                    ? "Aguarde..."
                    : pushSubscribed
                    ? "Desativar Notificações Push"
                    : "Ativar Notificações Push"}
                </SmallButtonWithIcon>
              )}
              <SmallButtonWithIcon
                fullWidth
                variant="secondary"
                icon={<LogOut size={16} />}
                onClick={() => setShowLogoutConfirm(true)}
              >
                Sair da Conta
              </SmallButtonWithIcon>
            </div>
          </section>

          <section className={`${s.section} ${s.dangerSection}`}>
            <h2 className={`${s.sectionTitle} ${s.dangerTitle}`}>Zona de perigo</h2>
            <p className={s.dangerText}>
              Ao excluir sua conta, todos os seus dados serão removidos permanentemente.
            </p>
            <div className={s.actions}>
              <SmallButtonWithIcon
                fullWidth
                variant="danger"
                icon={<Trash2 size={16} />}
                disabled={deleting}
                onClick={() => setShowDeleteConfirm(true)}
              >
                {deleting ? "Excluindo..." : "Excluir Conta"}
              </SmallButtonWithIcon>
            </div>
          </section>
        </div>

        <ConfirmDialog
          open={showSaveConfirm}
          title="Salvar alterações?"
          description="Seus dados pessoais serão atualizados."
          onConfirm={handleSave}
          onCancel={() => setShowSaveConfirm(false)}
          loading={saving}
        />

        <ConfirmDialog
          open={showLogoutConfirm}
          title="Sair da conta"
          description="Tem certeza que deseja sair?"
          onConfirm={() => { logout(); router.push(routes.loginCliente); }}
          onCancel={() => setShowLogoutConfirm(false)}
        />

        <ConfirmDialog
          open={showDeleteConfirm}
          title="Excluir conta?"
          description="Esta ação é irreversível. Todos os seus dados serão removidos permanentemente."
          onConfirm={() => { setShowDeleteConfirm(false); handleDelete(); }}
          onCancel={() => setShowDeleteConfirm(false)}
          loading={deleting}
          variant="destructive"
        />
      </div>
    </ProtectedRoute>
  );
}