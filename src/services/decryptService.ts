/**
 * Serviço de descriptografia para dados do Firebase
 * Baseado no código C# FirebaseDataDecryptor
 */

// Chave de criptografia obtida das variáveis de ambiente
const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY || "";

// Validar se a chave de criptografia está configurada
if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length < 32) {
  console.warn(
    '⚠️ AVISO: Chave de criptografia não configurada ou inválida.\n' +
    'Por favor, defina VITE_ENCRYPTION_KEY no arquivo .env'
  );
}

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
   * Verifica se a chave de criptografia é válida
   */
  private static isKeyValid(): boolean {
    return typeof ENCRYPTION_KEY === 'string' && ENCRYPTION_KEY.length >= 32;
  }

  /**
   * Verifica se uma string é Base64 válida
   */
  private static isValidBase64(str: string | undefined): boolean {
    if (!str || typeof str !== 'string') return false;
    
    try {
      // Verificar se é Base64 válido
      const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
      if (!base64Regex.test(str) || str.length % 4 !== 0) {
        return false;
      }
      
      // Tentar decodificar
      atob(str);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Descriptografa uma string usando AES
   */
  private static async decryptAES(encryptedText: string, key: string): Promise<string> {
    try {
      // Processar chave (mesmo processo do C#)
      const processedKey = key.padEnd(32).substring(0, 32);
      const keyBytes = new TextEncoder().encode(processedKey);
      
      // Decodificar Base64
      const encryptedBytes = Uint8Array.from(atob(encryptedText), c => c.charCodeAt(0));
      
      // Extrair IV dos primeiros 16 bytes
      const iv = encryptedBytes.slice(0, 16);
      
      // Extrair dados criptografados
      const cipherBytes = encryptedBytes.slice(16);
      
      // Importar chave
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyBytes,
        { name: 'AES-CBC' },
        false,
        ['decrypt']
      );
      
      // Descriptografar
      const decryptedBytes = await crypto.subtle.decrypt(
        { name: 'AES-CBC', iv: iv },
        cryptoKey,
        cipherBytes
      );
      
      // Converter para string
      return new TextDecoder().decode(decryptedBytes);
    } catch (error) {
      throw new Error(`Erro na descriptografia AES: ${error}`);
    }
  }

  /**
   * Descriptografa uma string (pode ser dupla criptografia)
   */
  public static async decryptString(encryptedText: string): Promise<DecryptResult> {
    if (!encryptedText) {
      return { success: true, data: encryptedText };
    }

    if (!this.isKeyValid()) {
      return { 
        success: false, 
        data: encryptedText, 
        error: "Chave de criptografia inválida" 
      };
    }

    try {
      // Primeira descriptografia
      let firstDecrypt: string;
      try {
        firstDecrypt = await this.decryptAES(encryptedText, ENCRYPTION_KEY);
      } catch (error) {
        // Se falhar, retornar texto original
        return { success: false, data: encryptedText, error: String(error) };
      }

      // Verificar se o resultado ainda é Base64 válido e longo o suficiente
      if (this.isValidBase64(firstDecrypt) && firstDecrypt.length > 20) {
        try {
          // Segunda descriptografia (dupla criptografia)
          const secondDecrypt = await this.decryptAES(firstDecrypt, ENCRYPTION_KEY);
          return { success: true, data: secondDecrypt };
        } catch (error) {
          // Se a segunda descriptografia falhar, usar a primeira
          return { success: true, data: firstDecrypt };
        }
      }

      return { success: true, data: firstDecrypt };
    } catch (error) {
      return { 
        success: false, 
        data: encryptedText, 
        error: `Erro na descriptografia: ${error}` 
      };
    }
  }

  /**
   * Verifica se um campo deve ser descriptografado
   */
  public static shouldDecryptField(fieldName: string): boolean {
    return ENCRYPTED_FIELDS.has(fieldName);
  }

  /**
   * Descriptografa um objeto Lead
   */
  public static async decryptLead(lead: any): Promise<any> {
    const decryptedLead = { ...lead };
    
    // Descriptografar campos que precisam ser descriptografados
    for (const [key, value] of Object.entries(lead)) {
      if (this.shouldDecryptField(key) && typeof value === 'string' && value.trim()) {
        try {
          const result = await this.decryptString(value);
          if (result.success) {
            decryptedLead[key] = result.data;
          } else {
            console.warn(`Falha ao descriptografar campo ${key}:`, result.error);
            // Manter valor original se falhar
            decryptedLead[key] = value;
          }
        } catch (error) {
          console.warn(`Erro ao descriptografar campo ${key}:`, error);
          // Manter valor original se falhar
          decryptedLead[key] = value;
        }
      }
    }
    
    return decryptedLead;
  }

  /**
   * Descriptografa uma lista de leads
   */
  public static async decryptLeads(leads: any[]): Promise<any[]> {
    const decryptedLeads = [];
    
    for (const lead of leads) {
      try {
        const decryptedLead = await this.decryptLead(lead);
        decryptedLeads.push(decryptedLead);
      } catch (error) {
        console.warn('Erro ao descriptografar lead:', error);
        // Adicionar lead original se falhar
        decryptedLeads.push(lead);
      }
    }
    
    return decryptedLeads;
  }

  /**
   * Obtém a lista de campos que são criptografados
   */
  public static getEncryptedFields(): string[] {
    return Array.from(ENCRYPTED_FIELDS);
  }
}

