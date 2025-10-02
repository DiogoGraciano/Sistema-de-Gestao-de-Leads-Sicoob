import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth } from '../config/firebase';
import { LogService } from './logService';

export class AuthService {
  /**
   * Faz login com email e senha
   */
  static async signIn(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Registrar log de login
      await LogService.logAction(
        'Login realizado',
        'login',
        `Usuário: ${email}`
      );
      
      return userCredential.user;
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      throw new Error('Falha na autenticação');
    }
  }

  /**
   * Faz logout
   */
  static async signOut(): Promise<void> {
    try {
      const userEmail = auth.currentUser?.email || 'N/A';
      
      // Registrar log de logout
      await LogService.logAction(
        'Logout realizado',
        'logout',
        `Usuário: ${userEmail}`
      );
      
      await signOut(auth);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      throw new Error('Falha ao fazer logout');
    }
  }

  /**
   * Observa mudanças no estado de autenticação
   */
  static onAuthStateChange(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, callback);
  }

  /**
   * Retorna o usuário atual
   */
  static getCurrentUser(): User | null {
    return auth.currentUser;
  }
}
