import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import "@/styles/global.css";

const font = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "EcoPonto",
  description: "Sistema de pontos de coleta",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={font.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
