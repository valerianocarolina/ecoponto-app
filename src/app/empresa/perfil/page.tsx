"use client";

import styles from "./styles.module.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Fingerprint } from "lucide-react";

import { PageHeader } from "@/components/PageHeader/PageHeader";
import { ConfirmDialog } from "@/components/ConfirmDialog/ConfirmDialog";
import { TextField } from "@/components/TextField/TextField";
import { SmallButtonWithIcon } from "@/components/SmallButtonWithIcon/SmallButtonWithIcon";
import { ProtectedRoute } from "@/components/ProtectedRoute/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { getEmpresa, updateEmpresa, deleteEmpresa } from "@/services/empresa";
import { useBiometricAuth } from "@/hooks/useBiometricAuth";
import { toast } from "sonner";

export default function EmpresaPerfil() {
  const router = useRouter();
  const { logout, updateUser } = useAuth();
  const { supported: bioSupported, enrolled: bioEnrolled, enroll: bioEnroll, unenroll: bioUnenroll } = useBiometricAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [name, setName] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const company = await getEmpresa();
        setName(company.nome || "");
        setCnpj(company.cnpj || "");
        setPhone(company.telefone || "");
        setEmail(company.email || "");
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      const response = await updateEmpresa({
        nome: name,
        telefone: phone,
        email: email,
      });

      const updatedCompany = response?.cooperativa || response;
      if (updatedCompany) {
        updateUser({
          nome: updatedCompany.nome || name,
          email: updatedCompany.email || email,
          telefone: updatedCompany.telefone || phone,
        });
      }

      setShowSaveConfirm(false);
    } catch (error) {
      console.error("Erro ao salvar:", error);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteAccount() {
    setDeleting(true);
    try {
      await deleteEmpresa();
      bioUnenroll();
      logout();
      router.push("/");
    } catch (error) {
      console.error(error);
      setDeleting(false);
    }
  }

  const toggleBiometric = async () => {
    if (bioEnrolled) {
      bioUnenroll();
      toast.success("Biometria desativada.");
    } else {
      const ok = await bioEnroll();
      if (ok) toast.success("Biometria ativada!");
      else toast.error("Seu dispositivo não suporta biometria.");
    }
  };

  if (loading) {
    return (
      <ProtectedRoute requiredType="cooperative">
        <div className={styles.layout}>
          <div className={styles.loading}>
            <Loader2 className={styles.loadingIcon} />
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredType="cooperative">
      <div className={styles.layout}>
        <PageHeader
          title="Dados da Empresa"
          onBackClick={() => router.push("/meus-pontos")}
        />

        <div className={styles.content}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Informações</h2>

            <TextField
              label="Nome da empresa"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <TextField
              label="CNPJ"
              value={cnpj}
              onChange={() => {}}
              disabled
            />

            <TextField
              label="Telefone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(00) 00000-0000"
            />

            <TextField
              label="E-mail de contato"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contato@empresa.com"
            />

            <div className={styles.actions}>
              <SmallButtonWithIcon
                fullWidth
                disabled={saving}
                onClick={() => setShowSaveConfirm(true)}
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : "Salvar alterações"}
              </SmallButtonWithIcon>

              {bioSupported && (
                <SmallButtonWithIcon
                  fullWidth
                  variant="secondary"
                  onClick={toggleBiometric}
                >
                  <Fingerprint size={16} />
                  {bioEnrolled ? "Desativar Biometria" : "Ativar Login Biométrico"}
                </SmallButtonWithIcon>
              )}
            </div>
          </section>

          <section className={`${styles.section} ${styles.dangerSection}`}>
            <h2 className={`${styles.sectionTitle} ${styles.dangerTitle}`}>
              Zona de perigo
            </h2>
            <p className={styles.dangerText}>
              Ao excluir sua conta, todos os pontos de coleta cadastrados serão removidos permanentemente.
            </p>
            <div className={styles.actions}>
              <SmallButtonWithIcon variant="danger" fullWidth disabled={deleting} onClick={() => setShowDeleteConfirm(true)}>
                {deleting ? <Loader2 size={16} className="animate-spin" /> : "Excluir conta"}
              </SmallButtonWithIcon>
            </div>
          </section>
        </div>

        <ConfirmDialog
          open={showSaveConfirm}
          title="Salvar alterações?"
          description="Os dados da empresa serão atualizados."
          onConfirm={handleSave}
          onCancel={() => setShowSaveConfirm(false)}
          loading={saving}
        />

        <ConfirmDialog
          open={showDeleteConfirm}
          title="Excluir conta da empresa?"
          description="Esta ação é irreversível. Todos os pontos de coleta serão removidos permanentemente."
          onConfirm={handleDeleteAccount}
          onCancel={() => setShowDeleteConfirm(false)}
          loading={deleting}
          variant="destructive"
        />
      </div>
    </ProtectedRoute>
  );
}
