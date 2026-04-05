"use client";

import styles from "./styles.module.css";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  MapPin,
  Recycle,
  ExternalLink,
} from "lucide-react";

import { ProtectedRoute } from "@/components/ProtectedRoute/ProtectedRoute";
import { createPoint } from "@/services/points";
import { MATERIAL_LABELS, MaterialType } from "@/util/materials";
import {
  emptySchedule,
  scheduleToString,
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
  const link = "https://buscacepinter.correios.com.br/";
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);

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
      alert("Preencha os campos obrigatórios");
      return;
    }

    setLoading(true);

    const endereco = `${form.logradouro}, ${form.numero} - ${form.bairro}, ${form.cidade} - ${form.uf}`;

    const coords = await geocode(endereco);

    const horario = scheduleToString(schedule);

    await createPoint({
      nome: form.nome,
      endereco,
      horario,
      tags: materials,
      imagem: imageUrl,
      lat: coords?.lat,
      lng: coords?.lng,
    });

    setLoading(false);
    router.push(routes.meusPontos);
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
              Novo Ponto de Coleta
            </h1>
          </div>
        </header>

        <div className={styles.content}>
          <form onSubmit={handleSubmit} className={styles.form}>
            <TextField label="Nome do ponto*" value={form.nome} placeholder="EcoPonto Centro" onChange={(e) => setField("nome", e.target.value)}/>

            <div className={styles.cepWrap}>
              <TextField label="CEP *" value={form.cep} placeholder="00000-000" onChange={(e) => handleCep(e.target.value)}/>
              {cepLoading && <Loader2 className={styles.cepSpinner} />}
            <span
              onClick={() => window.open(link, "_blank")}
              className={styles.link}
            >
              Não sabe o CEP? Consulte nos Correios <ExternalLink size={12} />
            </span>
            </div>

            <TextField label="Logradouro *" value={form.logradouro} placeholder="Rua, Avenida..." onChange={(e) => setField("logradouro", e.target.value)}/>

            <div className={styles.row}>
              <TextField label="Número" style={{ width: '156px'}} value={form.numero} placeholder="123" onChange={(e) => setField("numero", e.target.value)}/>
              <TextField label="Bairro *" style={{ width: '312px'}} value={form.bairro} placeholder="Centro" onChange={(e) => setField("bairro", e.target.value)} />
            </div>
            <div className={styles.row}>
              <TextField label="Cidade *" style={{ width: '312px'}} value={form.cidade} placeholder="São Paulo" onChange={(e) => setField("cidade", e.target.value)}/>
              <TextField label="UF *" style={{ width: '156px'}} value={form.uf} placeholder="SP" onChange={(e) => setField("uf", e.target.value)}/>
            </div>

            <div>
              <label className={styles.label}>Horário de funcionamento *</label>
              <HoursSchedule schedule={schedule} onChange={setSchedule} />
            </div>

            <div>

            <label className={styles.label}>Materiais aceitos *</label>
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
              {loading ? <Loader2 size={16} /> : "Cadastrar ponto"}
            </PrimaryButton>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}