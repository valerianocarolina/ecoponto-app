"use client";

import styles from "./styles.module.css";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  MapPin,
  Recycle,
  ExternalLink,
} from "lucide-react";

import { ProtectedRoute } from "@/components/ProtectedRoute/ProtectedRoute";
import { createPoint, getPoint, updatePoint } from "@/services/points";
import { MATERIAL_LABELS, MaterialType } from "@/util/materials";
import {
  emptySchedule,
  parseHoursToSchedule,
  scheduleToString,
  type Schedule,
} from "@/lib/schedule";
import { HoursSchedule } from "@/components/HoursScredule/HoursScredule";
import { ImageCapture } from "@/components/ImageCapture/ImageCapture";
import { PrimaryButton } from "@/components/PrimaryButton/PrimaryButton";
import { TextField } from "@/components/TextField/TextField";
import { routes } from "@/routes/routes";
import { formatSchedule } from "@/util/formatSchedule";
import { useTranslations } from "next-intl";

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
  const t = useTranslations("CadastraPonto");

  const [loading, setLoading] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [pointLoading, setPointLoading] = useState(false);

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

        setSchedule(parseHoursToSchedule(point.horario || ""));
        setMaterials(point.tags || []);
        setImageUrl(point.imagem || "");
      } catch (err) {
        console.error(err);
        alert(t("fetchData"));
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
      alert(t("incompleteData"));
      return;
    }

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
        horario: scheduleToString(schedule),
      };

      if (editing && pointId) {
        await updatePoint(pointId, payload);
      } else {
        await createPoint(payload);
      }

      router.push(routes.meusPontos);
    } catch (err) {
      alert(editing ? t("updateData") : t("createData"));
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
              {editing ? t("editPoint") : t("createPoint")}
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
              <TextField label={t("name")} value={form.nome} placeholder={t("namePlaceholder")} onChange={(e) => setField("nome", e.target.value)}/>

            <div className={styles.cepWrap}>
              <TextField label={t("cep")} value={form.cep} placeholder={t("cepPlaceholder")} onChange={(e) => handleCep(e.target.value)}/>
              {cepLoading && <Loader2 className={styles.cepSpinner} />}
            <span
              onClick={() => window.open(link, "_blank")}
              className={styles.link}
            >
              Não sabe o CEP? Consulte nos Correios <ExternalLink size={12} />
            </span>
            </div>

            <TextField label={t("logradouro")} value={form.logradouro} placeholder={t("logradouroPlaceholder")} onChange={(e) => setField("logradouro", e.target.value)}/>

            <div className={styles.row}>
              <TextField label={t("number")} style={{ width: '156px'}} value={form.numero} placeholder={t("numberPlaceholder")} onChange={(e) => setField("numero", e.target.value)}/>
              <TextField label={t("bairro")} style={{ width: '312px'}} value={form.bairro} placeholder={t("bairroPlaceholder")} onChange={(e) => setField("bairro", e.target.value)} />
            </div>
            <div className={styles.row}>
              <TextField label={t("city")} style={{ width: '312px'}} value={form.cidade} placeholder={t("cityPlaceholder")} onChange={(e) => setField("cidade", e.target.value)}/>
              <TextField label={t("state")} style={{ width: '156px'}} value={form.uf} placeholder={t("statePlaceholder")} onChange={(e) => setField("uf", e.target.value)}/>
            </div>

            <div>
              <label className={styles.label}>{t("hour")}</label>
              <HoursSchedule schedule={schedule} onChange={setSchedule} />
            </div>

            <div>

            <label className={styles.label}>{t("aceptedMaterials")}</label>
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
              {loading ? <Loader2 size={16} /> : editing ? t("updatePoint") : t("savePoint")}
            </PrimaryButton>
          </form>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}