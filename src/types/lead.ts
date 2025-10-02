export interface Lead {
  id: string;
  autorizoContato: string;
  custom1: string; // Campo para Cooperativa
  dataHora: string;
  email: string;
  encrypted: string;
  game_name: string;
  ganhou: string;
  nome: string;
  platform: string;
  tempo: string;
  unique_timestamp: string;
}

export interface LeadFilters {
  game_name?: string;
  platform?: string;
  ganhou?: string;
  autorizoContato?: string;
  dataInicio?: string;
  dataFim?: string;
  search?: string;
}

export interface ExportOptions {
  format: 'csv' | 'xlsx';
  includeFields: string[];
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface SystemLog {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  actionType: 'login' | 'logout' | 'export' | 'delete' | 'view' | 'filter' | 'other';
  details?: string;
  timestamp: number;
  dateTime: string;
  collection?: string;
}

export interface LogFilters {
  actionType?: string;
  userEmail?: string;
  dataInicio?: string;
  dataFim?: string;
  search?: string;
}
