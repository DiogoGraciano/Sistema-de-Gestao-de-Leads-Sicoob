/**
 * Serviço de descriptografia para dados do Firebase
 * Agora usa Cloud Functions HTTP para manter a chave de criptografia segura no backend
 */

import { auth, firebaseConfig } from "../config/firebase";

// URL base das Cloud Functions HTTP
const getFunctionUrl = (functionName: string): string => {
  const region = "us-central1";
  const projectId = firebaseConfig.projectId;
  return `https://${region}-${projectId}.cloudfunctions.net/${functionName}`;
};

/**
 * Obtém o token de autenticação do usuário atual
 */
const getAuthToken = async (): Promise<string> => {
  if (!auth.currentUser) {
    throw new Error("Usuário não autenticado");
  }
  return await auth.currentUser.getIdToken();
};

// Campos que foram criptografados (mesma lista do Unity)
const ENCRYPTED_FIELDS = new Set([
  "email", "telefone", "cpf", "cnpj", "nome", "empresa", "custom1"
]);

export interface DecryptResult {
  success: boolean;
  data: string;
  error?: string;
}

export class DecryptService {

  /**
   * Verifica se um campo deve ser descriptografado
   */
  public static shouldDecryptField(fieldName: string): boolean {
    return ENCRYPTED_FIELDS.has(fieldName);
  }

  /**
   * Descriptografa um objeto Lead usando Cloud Function HTTP
   * A chave de criptografia nunca é exposta ao frontend
   */
  public static async decryptLead(lead: any): Promise<any> {
    try {
      const token = await getAuthToken();
      const url = getFunctionUrl("decryptLeadData");
      
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ lead }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Erro desconhecido" }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json() as { success: boolean; data: any; error?: string };
      
      if (result.success) {
        return result.data;
      } else {
        console.warn("Falha ao descriptografar lead:", result.error);
        // Retornar lead original se falhar
        return lead;
      }
    } catch (error) {
      console.error("Erro ao chamar Cloud Function de descriptografia:", error);
      // Retornar lead original se falhar
      return lead;
    }
  }

  /**
   * Descriptografa uma lista de leads usando Cloud Function HTTP
   * Mais eficiente que descriptografar um por um
   * A chave de criptografia nunca é exposta ao frontend
   */
  public static async decryptLeads(leads: any[]): Promise<any[]> {
    if (leads.length === 0) {
      return [];
    }

    try {
      const token = await getAuthToken();
      const url = getFunctionUrl("decryptLeadsData");
      
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ leads }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Erro desconhecido" }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json() as { success: boolean; data: any[]; error?: string };
      
      if (result.success) {
        return result.data;
      } else {
        console.warn("Falha ao descriptografar leads:", result.error);
        // Retornar leads originais se falhar
        return leads;
      }
    } catch (error) {
      console.error("Erro ao chamar Cloud Function de descriptografia:", error);
      // Retornar leads originais se falhar
      return leads;
    }
  }

  /**
   * Obtém a lista de campos que são criptografados
   */
  public static getEncryptedFields(): string[] {
    return Array.from(ENCRYPTED_FIELDS);
  }
}

