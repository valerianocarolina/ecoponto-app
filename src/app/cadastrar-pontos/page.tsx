"use client";

import styles from "./styles.module.css";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  MapPin,
  Recycle,
  ExternalLink,
} from "lucide-react";

import { ProtectedRoute } from "@/components/ProtectedRoute/ProtectedRoute";
import { ConfirmDialog } from "@/components/ConfirmDialog/ConfirmDialog";
import { createPoint, getPoint, updatePoint } from "@/services/points";
import { MATERIAL_LABELS, MaterialType } from "@/util/materials";
import {
  emptySchedule,
  parseScheduleInput,
  scheduleToApiHorario,
  type Schedule,
} from "@/lib/schedule";
import { HoursSchedule } from "@/components/HoursScredule/HoursScredule";
import { ImageCapture } from "@/components/ImageCapture/ImageCapture";
import { PrimaryButton } from "@/components/PrimaryButton/PrimaryButton";
import { TextField } from "@/components/TextField/TextField";
import { routes } from "@/routes/routes";

const ALL: MaterialType[] = [
  "plastico",
  "vidro",
  "papel",
  "metal",
  "eletronico",
  "oleo",
];

export default function CadastrarPonto() {
  return (
    <Suspense fallback={<div className={styles.layout} />}>
      <CadastrarPontoContent />
    </Suspense>
  );
}

function CadastrarPontoContent() {
  const link = "https://buscacepinter.correios.com.br/";
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [pointLoading, setPointLoading] = useState(false);
  const [saveConfirmOpen, setSaveConfirmOpen] = useState(false);

  const searchParams = useSearchParams();
  const pointId = searchParams.get("id");
  const editing = Boolean(pointId);

  const [imageUrl, setImageUrl] = useState("");

  const [form, setForm] = useState({
    nome: "",
    cep: "",
    logradouro: "",
    numero: "",
    bairro: "",
    cidade: "",
    uf: "",
  });

  const [schedule, setSchedule] = useState<Schedule>(emptySchedule());
  const [materials, setMaterials] = useState<MaterialType[]>([]);


  function setField(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleCep(value: string) {
    const clean = value.replace(/\D/g, "").slice(0, 8);
    const masked = clean.replace(/(\d{5})(\d)/, "$1-$2");

    setField("cep", masked);

    if (clean.length === 8) {
      setCepLoading(true);

      try {
        const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
        const data = await res.json();

        if (!data.erro) {
          setForm((prev) => ({
            ...prev,
            logradouro: data.logradouro || "",
            bairro: data.bairro || "",
            cidade: data.localidade || "",
            uf: data.uf || "",
          }));
        }
      } catch {}

      setCepLoading(false);
    }
  }

  function toggleMaterial(m: MaterialType) {
    setMaterials((prev) =>
      prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]
    );
  }

  useEffect(() => {
    if (!pointId) return;

    async function loadPoint() {
      setPointLoading(true);

      try {
        const point = await getPoint(pointId || "");

        setForm({
          nome: point.nome || "",
          cep: point.cep || "",
          logradouro: point.logradouro || "",
          numero: point.numero || "",
          bairro: point.bairro || "",
          cidade: point.cidade || "",
          uf: point.uf || "",
        });

        setSchedule(parseScheduleInput(point.horario || ""));
        setMaterials(point.tags || []);
        setImageUrl(point.imagem || "");
      } catch (err) {
        console.error(err);
        alert("Erro ao carregar dados do ponto para edicao");
      } finally {
        setPointLoading(false);
      }
    }

    loadPoint();
  }, [pointId]);

  async function geocode(address: string) {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          address
        )}&limit=1`
      );

      const data = await res.json();

      if (data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
        };
      }
    } catch {}

    return null;
  }

  async function handleSubmit(e: any) {
    e.preventDefault();

    if (
      !form.nome ||
      !form.logradouro ||
      !form.cep ||
      !form.bairro ||
      !form.cidade ||
      !form.uf ||
      materials.length === 0
    ) {
      alert("Preencha os campos obrigatorios");
      return;
    }

    setSaveConfirmOpen(true);
  }

  async function handleConfirmSave() {
    setLoading(true);

    try {
      const endereco = `${form.logradouro}, ${form.numero} - ${form.bairro}, ${form.cidade} - ${form.uf}`;
      const payload = {
        nome: form.nome,
        cep: form.cep,
        logradouro: form.logradouro,
        numero: form?.numero || "S/N",
        bairro: form.bairro,
        cidade: form.cidade,
        uf: form.uf,
        endereco,
        tags: materials,
        imagem: imageUrl || "",
        horario: scheduleToApiHorario(schedule),
      };

      if (editing && pointId) {
        await updatePoint(pointId, payload);
      } else {
        await createPoint(payload);
      }

      router.push(routes.meusPontos);
    } catch (err) {
      alert(editing ? "Erro ao atualizar ponto" : "Erro ao cadastrar ponto");
      setSaveConfirmOpen(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ProtectedRoute requiredType="cooperative">
      <div className={styles.layout}>
        <header className={styles.header}>
          <button onClick={() => router.back()} className={styles.backBtn}>
            <ArrowLeft className={styles.backIcon} />
          </button>

          <div className={styles.headerInfo}>
            <MapPin className={styles.headerIcon} />
            <h1 className={styles.headerTitle}>
              {editing ? "Editar Ponto" : "Novo Ponto de Coleta"}
            </h1>
          </div>
        </header>

        <div className={styles.content}>
          {pointLoading ? (
            <div className={styles.loading}>
              <Loader2 />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.form}>
              <TextField label="Nome do ponto" value={form.nome} placeholder="EcoPonto Centro" onChange={(e) => setField("nome", e.target.value)}/>

            <div className={styles.cepWrap}>
              <TextField label="CEP" value={form.cep} placeholder="00000-000" onChange={(e) => handleCep(e.target.value)}/>
              {cepLoading && <Loader2 className={styles.cepSpinner} />}
            <span
              onClick={() => window.open(link, "_blank")}
              className={styles.link}
            >
              Não sabe o CEP? Consulte nos Correios <ExternalLink size={12} />
            </span>
            </div>

            <TextField label="Logradouro" value={form.logradouro} placeholder="Rua, Avenida..." onChange={(e) => setField("logradouro", e.target.value)}/>

            <div className={styles.row}>
              <TextField label="Numero" style={{ width: '156px'}} value={form.numero} placeholder="123" onChange={(e) => setField("numero", e.target.value)}/>
              <TextField label="Bairro" style={{ width: '312px'}} value={form.bairro} placeholder="Centro" onChange={(e) => setField("bairro", e.target.value)} />
            </div>
            <div className={styles.row}>
              <TextField label="Cidade" style={{ width: '312px'}} value={form.cidade} placeholder="Sao Paulo" onChange={(e) => setField("cidade", e.target.value)}/>
              <TextField label="UF" style={{ width: '156px'}} value={form.uf} placeholder="SP" onChange={(e) => setField("uf", e.target.value)}/>
            </div>

            <div>
              <label className={styles.label}>Horario de funcionamento</label>
              <HoursSchedule schedule={schedule} onChange={setSchedule} />
            </div>

            <div>

            <label className={styles.label}>Materiais aceitos</label>
            <div className={styles.materialsGrid}>
              {ALL.map((m) => (
                <button
                key={m}
                type="button"
                onClick={() => toggleMaterial(m)}
                className={
                  materials.includes(m)
                  ? styles.materialChipActive
                  : styles.materialChip
                }
                >
                  <Recycle className={styles.materialChipIcon} />
                  {MATERIAL_LABELS[m]}
                </button>
              ))}
            </div>
            </div>

            <ImageCapture onImageUrl={setImageUrl} />

            <PrimaryButton type="submit" disabled={loading}>
              {loading ? <Loader2 size={16} /> : editing ? "Atualizar ponto" : "Cadastrar ponto"}
            </PrimaryButton>
          </form>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={saveConfirmOpen}
        title={editing ? "Salvar alterações" : "Criar ponto de coleta"}
        description={editing ? "Tem certeza que deseja salvar as alterações neste ponto?" : "Tem certeza que deseja criar este ponto de coleta?"}
        onConfirm={handleConfirmSave}
        onCancel={() => setSaveConfirmOpen(false)}
        loading={loading}
      />
    </ProtectedRoute>
  );
}