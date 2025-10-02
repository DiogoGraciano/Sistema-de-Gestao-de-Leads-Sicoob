import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  QueryConstraint
} from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import type { SystemLog, LogFilters } from '../types/lead';

export class LogService {
  private static readonly COLLECTION_NAME = 'log';

  /**
   * Verifica se o usuário está autenticado
   */
  private static checkAuth(): void {
    if (!auth.currentUser) {
      throw new Error('Usuário não autenticado');
    }
  }

  /**
   * Registra uma ação do usuário no log
   */
  static async logAction(
    action: string,
    actionType: SystemLog['actionType'],
    details?: string,
    collectionName?: string
  ): Promise<void> {
    try {
      this.checkAuth();
      const user = auth.currentUser!;

      const logData = {
        userId: user.uid,
        userEmail: user.email || 'N/A',
        action,
        actionType,
        details: details || '',
        timestamp: Date.now(),
        dateTime: new Date().toISOString(),
        collection: collectionName || ''
      };

      const logsRef = collection(db, this.COLLECTION_NAME);
      await addDoc(logsRef, logData);
    } catch (error) {
      console.error('Erro ao registrar log:', error);
      // Não lança erro para não interromper a operação principal
    }
  }

  /**
   * Busca logs com filtros opcionais
   */
  static async getLogs(filters?: LogFilters): Promise<SystemLog[]> {
    try {
      this.checkAuth();
      const logsRef = collection(db, this.COLLECTION_NAME);
      const constraints: QueryConstraint[] = [];

      // Aplicar filtros
      if (filters?.actionType) {
        constraints.push(where('actionType', '==', filters.actionType));
      }

      if (filters?.userEmail) {
        constraints.push(where('userEmail', '==', filters.userEmail));
      }

      // Ordenar por timestamp decrescente (mais recentes primeiro)
      constraints.push(orderBy('timestamp', 'desc'));

      const q = query(logsRef, ...constraints);
      const querySnapshot = await getDocs(q);
      
      let logs: SystemLog[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as SystemLog));

      // Aplicar filtro de busca no cliente
      if (filters?.search) {
        const searchTerm = filters.search.toLowerCase();
        logs = logs.filter(log => 
          log.action.toLowerCase().includes(searchTerm) ||
          log.userEmail.toLowerCase().includes(searchTerm) ||
          (log.details && log.details.toLowerCase().includes(searchTerm)) ||
          (log.collection && log.collection.toLowerCase().includes(searchTerm))
        );
      }

      // Aplicar filtro de data no cliente
      if (filters?.dataInicio || filters?.dataFim) {
        logs = logs.filter(log => {
          const logDate = new Date(log.dateTime);
          const startDate = filters.dataInicio ? new Date(filters.dataInicio) : null;
          const endDate = filters.dataFim ? new Date(filters.dataFim) : null;
          
          if (startDate && logDate < startDate) return false;
          if (endDate && logDate > endDate) return false;
          
          return true;
        });
      }

      return logs;
    } catch (error) {
      console.error('Erro ao buscar logs:', error);
      throw new Error('Falha ao carregar logs');
    }
  }

  /**
   * Obtém estatísticas dos logs
   */
  static async getLogStats(): Promise<{
    total: number;
    porTipo: Record<string, number>;
    porUsuario: Record<string, number>;
    porColecao: Record<string, number>;
  }> {
    try {
      this.checkAuth();
      const logs = await this.getLogs();
      
      const stats = {
        total: logs.length,
        porTipo: {} as Record<string, number>,
        porUsuario: {} as Record<string, number>,
        porColecao: {} as Record<string, number>
      };

      // Contar por tipo
      logs.forEach(log => {
        stats.porTipo[log.actionType] = (stats.porTipo[log.actionType] || 0) + 1;
        stats.porUsuario[log.userEmail] = (stats.porUsuario[log.userEmail] || 0) + 1;
        if (log.collection) {
          stats.porColecao[log.collection] = (stats.porColecao[log.collection] || 0) + 1;
        }
      });

      return stats;
    } catch (error) {
      console.error('Erro ao obter estatísticas de logs:', error);
      throw new Error('Falha ao carregar estatísticas de logs');
    }
  }
}

