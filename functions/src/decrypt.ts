/**
 * Cloud Function para descriptografia segura
 * A chave de criptografia nunca é exposta ao frontend
 * A chave é obtida das variáveis de ambiente do Firebase Functions
 */

import {onRequest, HttpsError} from "firebase-functions/v2/https";
import {Request, Response} from "express";
import * as logger from "firebase-functions/logger";
import {defineString} from "firebase-functions/params";
import * as admin from "firebase-admin";

// Inicializar Firebase Admin se ainda não foi inicializado
if (!admin.apps.length) {
  admin.initializeApp();
}

// Definir a variável de ambiente (alternativa ao Secret Manager)
const encryptionKeySecret = defineString("ENCRYPTION_KEY");

// Cache para a chave (evita múltiplas chamadas ao Secret Manager)
let cachedEncryptionKey: string | null = null;

// Campos que foram criptografados (mesma lista do Unity e frontend)
const ENCRYPTED_FIELDS = new Set([
  "email", "telefone", "cpf", "cnpj", "nome", "empresa", "custom1",
]);

/**
 * Verifica se uma string é Base64 válida
 * @param {string | undefined} str - String a ser verificada
 * @return {boolean} True se a string é Base64 válida
 */
function isValidBase64(str: string | undefined): boolean {
  if (!str || typeof str !== "string") return false;

  try {
    // Verificar se é Base64 válido
    const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
    if (!base64Regex.test(str) || str.length % 4 !== 0) {
      return false;
    }

    // Tentar decodificar
    Buffer.from(str, "base64");
    return true;
  } catch {
    return false;
  }
}

/**
 * Descriptografa uma string usando AES (Node.js)
 * @param {string} encryptedText - Texto criptografado em Base64
 * @param {string} key - Chave de criptografia
 * @return {Promise<string>} Texto descriptografado
 */
async function decryptAES(encryptedText: string, key: string): Promise<string> {
  try {
    const crypto = await import("crypto");

    // Processar chave (mesmo processo do C# e frontend)
    const processedKey = key.padEnd(32).substring(0, 32);
    const keyBuffer = Buffer.from(processedKey, "utf-8");

    // Decodificar Base64
    const encryptedBuffer = Buffer.from(encryptedText, "base64");

    // Extrair IV dos primeiros 16 bytes
    const iv = encryptedBuffer.slice(0, 16);

    // Extrair dados criptografados
    const cipherText = encryptedBuffer.slice(16);

    // Criar decipher
    const decipher = crypto.createDecipheriv("aes-256-cbc", keyBuffer, iv);

    // Descriptografar
    let decrypted = decipher.update(cipherText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    // Converter para string
    return decrypted.toString("utf-8");
  } catch (error) {
    throw new Error(`Erro na descriptografia AES: ${error}`);
  }
}

/**
 * Descriptografa uma string (pode ser dupla criptografia)
 * @param {string} encryptedText - Texto criptografado
 * @param {string} encryptionKey - Chave de criptografia
 * @return {Promise<Object>} Resultado com success, data e error
 */
async function decryptString(
  encryptedText: string,
  encryptionKey: string
): Promise<{success: boolean; data: string; error?: string}> {
  if (!encryptedText) {
    return {success: true, data: encryptedText};
  }

  if (!encryptionKey || encryptionKey.length < 32) {
    return {
      success: false,
      data: encryptedText,
      error: "Chave de criptografia inválida",
    };
  }

  try {
    // Primeira descriptografia
    let firstDecrypt: string;
    try {
      firstDecrypt = await decryptAES(encryptedText, encryptionKey);
    } catch (error) {
      // Se falhar, retornar texto original
      return {success: false, data: encryptedText, error: String(error)};
    }

    // Verificar se o resultado ainda é Base64 válido e longo o suficiente
    if (isValidBase64(firstDecrypt) && firstDecrypt.length > 20) {
      try {
        // Segunda descriptografia (dupla criptografia)
        const secondDecrypt = await decryptAES(firstDecrypt, encryptionKey);
        return {success: true, data: secondDecrypt};
      } catch (error) {
        // Se a segunda descriptografia falhar, usar a primeira
        return {success: true, data: firstDecrypt};
      }
    }

    return {success: true, data: firstDecrypt};
  } catch (error) {
    return {
      success: false,
      data: encryptedText,
      error: `Erro na descriptografia: ${error}`,
    };
  }
}

/**
 * Descriptografa um objeto Lead
 * @param {Record<string, any>} lead - Objeto lead com campos criptografados
 * @param {string} encryptionKey - Chave de criptografia
 * @return {Promise<Record<string, any>>} Lead com campos descriptografados
 */
async function decryptLead(
  lead: Record<string, unknown>,
  encryptionKey: string
): Promise<Record<string, unknown>> {
  const decryptedLead = {...lead};

  // Descriptografar campos que precisam ser descriptografados
  for (const [key, value] of Object.entries(lead)) {
    if (
      ENCRYPTED_FIELDS.has(key) &&
      typeof value === "string" &&
      value.trim()
    ) {
      try {
        const result = await decryptString(value, encryptionKey);
        if (result.success) {
          decryptedLead[key] = result.data;
        } else {
          logger.warn(`Falha ao descriptografar campo ${key}:`, result.error);
          // Manter valor original se falhar
          decryptedLead[key] = value;
        }
      } catch (error) {
        logger.warn(`Erro ao descriptografar campo ${key}:`, error);
        // Manter valor original se falhar
        decryptedLead[key] = value;
      }
    }
  }

  return decryptedLead;
}

/**
 * Obtém a chave de criptografia do Firebase Secret Manager
 */
async function getEncryptionKey(): Promise<string> {
  // Usar cache se disponível
  if (cachedEncryptionKey) {
    return cachedEncryptionKey;
  }

  try {
    // Obter a chave do Secret Manager
    const encryptionKey = encryptionKeySecret.value();

    if (!encryptionKey || encryptionKey.length < 32) {
      throw new Error("Chave de criptografia inválida ou não configurada");
    }

    // Armazenar em cache
    cachedEncryptionKey = encryptionKey;
    return encryptionKey;
  } catch (error) {
    logger.error(
      "Erro ao obter chave de criptografia do Secret Manager:",
      error
    );
    throw new Error("Não foi possível obter a chave de criptografia");
  }
}

/**
 * Verifica o token de autenticação do Firebase
 * @param {string | undefined} authHeader - Header Authorization
 * @return {Promise<admin.auth.DecodedIdToken>} Token decodificado
 */
async function verifyAuthToken(
  authHeader: string | undefined
): Promise<admin.auth.DecodedIdToken> {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new HttpsError(
      "unauthenticated",
      "Token de autenticação não fornecido"
    );
  }

  const token = authHeader.split("Bearer ")[1];
  try {
    return await admin.auth().verifyIdToken(token);
  } catch (error) {
    logger.error("Erro ao verificar token:", error);
    throw new HttpsError(
      "unauthenticated",
      "Token de autenticação inválido"
    );
  }
}

/**
 * Cloud Function HTTP para descriptografar um lead
 * Requer autenticação do usuário via Bearer token
 */
export const decryptLeadData = onRequest(
  {
    cors: true,
  },
  async (req: Request, res: Response) => {
    // Tratar requisições OPTIONS (preflight CORS)
    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }

    try {
      // Verificar autenticação
      await verifyAuthToken(req.headers.authorization);

      // Obter chave de criptografia
      let encryptionKey: string;
      try {
        encryptionKey = await getEncryptionKey();
      } catch (error) {
        logger.error("Erro ao obter chave de criptografia:", error);
        res.status(500).json({
          success: false,
          error: "Configuração de descriptografia não disponível",
        });
        return;
      }

      // Validar dados de entrada
      const {lead} = req.body;
      if (!lead || typeof lead !== "object") {
        res.status(400).json({
          success: false,
          error: "O parâmetro 'lead' é obrigatório e deve ser um objeto",
        });
        return;
      }

      // Descriptografar o lead
      const decryptedLead = await decryptLead(lead, encryptionKey);
      res.status(200).json({success: true, data: decryptedLead});
    } catch (error) {
      if (error instanceof HttpsError) {
        res.status(error.httpErrorCode.status || 500).json({
          success: false,
          error: error.message,
        });
        return;
      }

      logger.error("Erro ao descriptografar lead:", error);
      res.status(500).json({
        success: false,
        error: `Erro ao descriptografar dados: ${error}`,
      });
    }
  }
);

/**
 * Cloud Function HTTP para descriptografar múltiplos leads
 * Requer autenticação do usuário via Bearer token
 */
export const decryptLeadsData = onRequest(
  {
    cors: true,
  },
  async (req: Request, res: Response) => {
    // Tratar requisições OPTIONS (preflight CORS)
    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }

    try {
      // Verificar autenticação
      await verifyAuthToken(req.headers.authorization);

      // Obter chave de criptografia
      let encryptionKey: string;
      try {
        encryptionKey = await getEncryptionKey();
      } catch (error) {
        logger.error("Erro ao obter chave de criptografia:", error);
        res.status(500).json({
          success: false,
          error: "Configuração de descriptografia não disponível",
        });
        return;
      }

      // Validar dados de entrada
      const {leads} = req.body;
      if (!Array.isArray(leads)) {
        res.status(400).json({
          success: false,
          error: "O parâmetro 'leads' é obrigatório e deve ser um array",
        });
        return;
      }

      // Descriptografar todos os leads
      const decryptedLeads = [];
      for (const lead of leads) {
        try {
          const decryptedLead = await decryptLead(lead, encryptionKey);
          decryptedLeads.push(decryptedLead);
        } catch (error) {
          logger.warn("Erro ao descriptografar lead:", error);
          // Adicionar lead original se falhar
          decryptedLeads.push(lead);
        }
      }

      res.status(200).json({success: true, data: decryptedLeads});
    } catch (error) {
      if (error instanceof HttpsError) {
        res.status(error.httpErrorCode.status || 500).json({
          success: false,
          error: error.message,
        });
        return;
      }

      logger.error("Erro ao descriptografar leads:", error);
      res.status(500).json({
        success: false,
        error: `Erro ao descriptografar dados: ${error}`,
      });
    }
  }
);

