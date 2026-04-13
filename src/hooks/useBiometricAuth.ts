import { useState, useEffect } from "react";

const BIOMETRIC_ENROLLED_KEY = "biometricEnrolled";
const BIOMETRIC_AUTH_CACHE_KEY = "biometricAuthCache";

type BiometricAuthCache = {
  token: string;
  user: {
    nome?: string;
    email?: string;
    telefone?: string;
  };
  tipo: "user" | "cooperative";
  expiresAt: number;
};

function randomChallenge() {
  const challenge = new Uint8Array(32);
  crypto.getRandomValues(challenge);
  return challenge;
}

export function useBiometricAuth() {
  const [supported, setSupported] = useState(false);
  const [enrolled, setEnrolled] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "PublicKeyCredential" in window) {
      setSupported(true);
      const enrolledStatus = localStorage.getItem(BIOMETRIC_ENROLLED_KEY) === "true";
      setEnrolled(enrolledStatus);
    }
  }, []);

  const enroll = async (): Promise<boolean> => {
    if (!supported) return false;

    try {
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: randomChallenge(),
          rp: { name: "EcoPonto" },
          user: {
            id: new Uint8Array(16),
            name: "user",
            displayName: "User",
          },
          pubKeyCredParams: [{ alg: -7, type: "public-key" }],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required",
            residentKey: "preferred",
          },
          timeout: 60000,
          attestation: "none",
        },
      });

      if (credential) {
        localStorage.setItem(BIOMETRIC_ENROLLED_KEY, "true");

        const currentAuth = localStorage.getItem("auth");
        if (currentAuth) {
          try {
            const parsed = JSON.parse(currentAuth) as BiometricAuthCache;
            if (parsed?.token && parsed?.tipo && parsed?.expiresAt) {
              localStorage.setItem(BIOMETRIC_AUTH_CACHE_KEY, JSON.stringify(parsed));
            }
          } catch {
            // ignore invalid auth payload
          }
        }

        setEnrolled(true);
        return true;
      }
    } catch (error) {
      console.error("Biometric enrollment failed:", error);
    }
    return false;
  };

  const authenticate = async (): Promise<boolean> => {
    if (!supported || !enrolled) return false;

    try {
      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge: randomChallenge(),
          userVerification: "required",
          timeout: 60000,
        },
      });

      return Boolean(assertion);
    } catch (error) {
      console.error("Biometric authentication failed:", error);
      return false;
    }
  };

  const saveAuthCache = (payload: BiometricAuthCache) => {
    localStorage.setItem(BIOMETRIC_AUTH_CACHE_KEY, JSON.stringify(payload));
  };

  const getAuthCache = (): BiometricAuthCache | null => {
    const raw = localStorage.getItem(BIOMETRIC_AUTH_CACHE_KEY);
    if (!raw) return null;

    try {
      const parsed = JSON.parse(raw) as BiometricAuthCache;
      if (!parsed?.token || !parsed?.tipo || !parsed?.expiresAt) {
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  };

  const unenroll = () => {
    localStorage.removeItem(BIOMETRIC_ENROLLED_KEY);
    localStorage.removeItem(BIOMETRIC_AUTH_CACHE_KEY);
    setEnrolled(false);
  };

  return {
    supported,
    enrolled,
    enroll,
    authenticate,
    saveAuthCache,
    getAuthCache,
    unenroll,
  };
}