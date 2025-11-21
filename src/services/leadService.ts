import { 
  collection, 
  getDocs, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy,
  limit,
  startAfter,
  getCountFromServer,
  QueryConstraint,
  DocumentSnapshot
} from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import type { Lead, LeadFilters, PaginatedLeadsResult } from '../types/lead';
import { DecryptService } from './decryptService';
import { LogService } from './logService';

// Configuração das coleções disponíveis
export const COLLECTIONS = {
  'leads_word_scramble_001': 'Riscos e Controles Internos',
  'leads_word_scramble_002': 'Ética',
  'leads_word_scramble_003': 'Segurança da Informação',
  'leads_word_scramble_004': 'Sustentabilidade',
  'leads_quiz_001': 'CIPA'
} as const;

export type CollectionKey = keyof typeof COLLECTIONS;

export class LeadService {
  private static currentCollection: CollectionKey = 'leads_word_scramble_001';

  /**
   * Define a coleção atual
   */
  static setCollection(collection: CollectionKey): void {
    this.currentCollection = collection;
  }

  /**
   * Obtém a coleção atual
   */
  static getCurrentCollection(): CollectionKey {
    return this.currentCollection;
  }

  /**
   * Obtém o nome da coleção atual
   */
  static getCurrentCollectionName(): string {
    return COLLECTIONS[this.currentCollection];
  }
  /**
   * Verifica se o usuário está autenticado
   */
  private static checkAuth(): void {
    if (!auth.currentUser) {
      throw new Error('Usuário não autenticado');
    }
  }

  /**
   * Busca leads paginados com filtros opcionais
   */
  static async getLeads(
    filters?: LeadFilters,
    pageSize: number = 10,
    lastDoc?: DocumentSnapshot
  ): Promise<PaginatedLeadsResult> {
    try {
      this.checkAuth();
      const leadsRef = collection(db, this.currentCollection);
      const constraints: QueryConstraint[] = [];

      // Aplicar filtros do Firestore (apenas os que podem ser indexados)
      if (filters?.game_name) {
        constraints.push(where('game_name', '==', filters.game_name));
      }
      
      if (filters?.platform) {
        constraints.push(where('platform', '==', filters.platform));
      }
      
      if (filters?.ganhou) {
        constraints.push(where('ganhou', '==', filters.ganhou));
      }
      
      if (filters?.autorizoContato) {
        constraints.push(where('autorizoContato', '==', filters.autorizoContato));
      }

      // Ordenar por timestamp decrescente (mais recentes primeiro)
      constraints.push(orderBy('unique_timestamp', 'desc'));

      // Aplicar paginação
      if (lastDoc) {
        constraints.push(startAfter(lastDoc));
      }
      constraints.push(limit(pageSize + 1)); // Buscar um a mais para verificar se há mais páginas

      const q = query(leadsRef, ...constraints);
      const querySnapshot = await getDocs(q);
      
      // Verificar se há mais páginas
      const hasMore = querySnapshot.docs.length > pageSize;
      const docs = hasMore ? querySnapshot.docs.slice(0, pageSize) : querySnapshot.docs;
      const lastDocument = docs.length > 0 ? docs[docs.length - 1] : undefined;

      let leads: Lead[] = docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Lead));

      // Descriptografar campos criptografados
      try {
        leads = await DecryptService.decryptLeads(leads);
      } catch (error) {
        console.warn('Erro ao descriptografar leads:', error);
        // Continuar com dados criptografados se falhar
      }

      // Aplicar filtro de busca no cliente (para campos criptografados)
      if (filters?.search) {
        const searchTerm = filters.search.toLowerCase();
        leads = leads.filter(lead => 
          lead.nome.toLowerCase().includes(searchTerm) ||
          lead.email.toLowerCase().includes(searchTerm) ||
          lead.game_name.toLowerCase().includes(searchTerm) ||
          lead.platform.toLowerCase().includes(searchTerm)
        );
      }

      // Aplicar filtro de data no cliente
      if (filters?.dataInicio || filters?.dataFim) {
        leads = leads.filter(lead => {
          const leadDate = new Date(lead.dataHora);
          const startDate = filters.dataInicio ? new Date(filters.dataInicio) : null;
          const endDate = filters.dataFim ? new Date(filters.dataFim) : null;
          
          if (startDate && leadDate < startDate) return false;
          if (endDate && leadDate > endDate) return false;
          
          return true;
        });
      }

      // Obter total de documentos (query separada para contar, sem paginação)
      const countConstraints: QueryConstraint[] = [];
      if (filters?.game_name) {
        countConstraints.push(where('game_name', '==', filters.game_name));
      }
      if (filters?.platform) {
        countConstraints.push(where('platform', '==', filters.platform));
      }
      if (filters?.ganhou) {
        countConstraints.push(where('ganhou', '==', filters.ganhou));
      }
      if (filters?.autorizoContato) {
        countConstraints.push(where('autorizoContato', '==', filters.autorizoContato));
      }
      const countQuery = query(leadsRef, ...countConstraints);
      const countSnapshot = await getCountFromServer(countQuery);
      const total = countSnapshot.data().count;

      return {
        leads,
        total,
        hasMore,
        lastDoc: lastDocument
      };
    } catch (error) {
      console.error('Erro ao buscar leads:', error);
      throw new Error('Falha ao carregar leads');
    }
  }

  /**
   * Busca todos os leads (sem paginação) - usado para exportação e estatísticas
   */
  static async getAllLeads(filters?: LeadFilters): Promise<Lead[]> {
    try {
      this.checkAuth();
      const leadsRef = collection(db, this.currentCollection);
      const constraints: QueryConstraint[] = [];

      // Aplicar filtros
      if (filters?.game_name) {
        constraints.push(where('game_name', '==', filters.game_name));
      }
      
      if (filters?.platform) {
        constraints.push(where('platform', '==', filters.platform));
      }
      
      if (filters?.ganhou) {
        constraints.push(where('ganhou', '==', filters.ganhou));
      }
      
      if (filters?.autorizoContato) {
        constraints.push(where('autorizoContato', '==', filters.autorizoContato));
      }

      // Ordenar por timestamp decrescente (mais recentes primeiro)
      constraints.push(orderBy('unique_timestamp', 'desc'));

      const q = query(leadsRef, ...constraints);
      const querySnapshot = await getDocs(q);
      
      let leads: Lead[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Lead));

      // Descriptografar campos criptografados
      try {
        leads = await DecryptService.decryptLeads(leads);
      } catch (error) {
        console.warn('Erro ao descriptografar leads:', error);
        // Continuar com dados criptografados se falhar
      }

      // Aplicar filtro de busca no cliente (para campos criptografados)
      if (filters?.search) {
        const searchTerm = filters.search.toLowerCase();
        leads = leads.filter(lead => 
          lead.nome.toLowerCase().includes(searchTerm) ||
          lead.email.toLowerCase().includes(searchTerm) ||
          lead.game_name.toLowerCase().includes(searchTerm) ||
          lead.platform.toLowerCase().includes(searchTerm)
        );
      }

      // Aplicar filtro de data no cliente
      if (filters?.dataInicio || filters?.dataFim) {
        leads = leads.filter(lead => {
          const leadDate = new Date(lead.dataHora);
          const startDate = filters.dataInicio ? new Date(filters.dataInicio) : null;
          const endDate = filters.dataFim ? new Date(filters.dataFim) : null;
          
          if (startDate && leadDate < startDate) return false;
          if (endDate && leadDate > endDate) return false;
          
          return true;
        });
      }

      return leads;
    } catch (error) {
      console.error('Erro ao buscar leads:', error);
      throw new Error('Falha ao carregar leads');
    }
  }

  /**
   * Exclui um lead específico
   */
  static async deleteLead(leadId: string): Promise<void> {
    try {
      this.checkAuth();
      const leadRef = doc(db, this.currentCollection, leadId);
      await deleteDoc(leadRef);
      
      // Registrar log
      await LogService.logAction(
        'Lead excluído',
        'delete',
        `Lead ID: ${leadId}`,
        this.currentCollection
      );
    } catch (error) {
      console.error('Erro ao excluir lead:', error);
      throw new Error('Falha ao excluir lead');
    }
  }

  /**
   * Exclui múltiplos leads
   */
  static async deleteMultipleLeads(leadIds: string[]): Promise<void> {
    try {
      this.checkAuth();
      const deletePromises = leadIds.map(leadId => 
        this.deleteLead(leadId)
      );
      await Promise.all(deletePromises);
      
      // Registrar log (já registrado individualmente, mas adicionamos um log resumo)
      await LogService.logAction(
        'Exclusão múltipla de leads',
        'delete',
        `${leadIds.length} leads excluídos`,
        this.currentCollection
      );
    } catch (error) {
      console.error('Erro ao excluir múltiplos leads:', error);
      throw new Error('Falha ao excluir leads selecionados');
    }
  }

  /**
   * Exclui todos os leads
   */
  static async deleteAllLeads(): Promise<void> {
    try {
      this.checkAuth();
      const leads = await this.getAllLeads();
      const leadIds = leads.map(lead => lead.id);
      await this.deleteMultipleLeads(leadIds);
      
      // Registrar log
      await LogService.logAction(
        'Exclusão de todos os leads',
        'delete',
        `${leadIds.length} leads excluídos`,
        this.currentCollection
      );
    } catch (error) {
      console.error('Erro ao excluir todos os leads:', error);
      throw new Error('Falha ao excluir todos os leads');
    }
  }

  /**
   * Busca leads para exportação
   */
  static async getLeadsForExport(filters?: LeadFilters): Promise<Lead[]> {
    // Usar getAllLeads para exportação (sem paginação)
    return this.getAllLeads(filters);
  }

  /**
   * Obtém estatísticas dos leads
   */
  static async getLeadStats(filters?: LeadFilters): Promise<{
    total: number;
    ganhou: number;
    perdeu: number;
    autorizouContato: number;
    naoAutorizouContato: number;
    porPlataforma: Record<string, number>;
    porJogo: Record<string, number>;
  }> {
    try {
      this.checkAuth();
      // getAllLeads já descriptografa automaticamente
      const leads = await this.getAllLeads(filters);
      
      const stats = {
        total: leads.length,
        ganhou: leads.filter(l => l.ganhou === 'Sim').length,
        perdeu: leads.filter(l => l.ganhou === 'Não').length,
        autorizouContato: leads.filter(l => l.autorizoContato === 'Sim').length,
        naoAutorizouContato: leads.filter(l => l.autorizoContato === 'Não').length,
        porPlataforma: {} as Record<string, number>,
        porJogo: {} as Record<string, number>
      };

      // Contar por plataforma
      leads.forEach(lead => {
        stats.porPlataforma[lead.platform] = (stats.porPlataforma[lead.platform] || 0) + 1;
        stats.porJogo[lead.game_name] = (stats.porJogo[lead.game_name] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      throw new Error('Falha ao carregar estatísticas');
    }
  }
}
