import { useState, useEffect } from 'react';
import { LogService } from '../services/logService';
import type { SystemLog, LogFilters } from '../types/lead';
import Card from './ui/Card';
import SectionHeader from './ui/SectionHeader';
import Table from './ui/Table';
import Input from './ui/Input';
import Select from './ui/Select';
import Button from './ui/Button';
import { Filter, FileText, ArrowLeft } from 'lucide-react';

interface LogsListProps {
  onShowLeads?: () => void;
}

export function LogsList({ onShowLeads }: LogsListProps) {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<LogFilters>({});
  const [stats, setStats] = useState({
    total: 0,
    porTipo: {} as Record<string, number>,
    porUsuario: {} as Record<string, number>,
    porColecao: {} as Record<string, number>
  });

  useEffect(() => {
    loadLogs();
    loadStats();
  }, []);

  const loadLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await LogService.getLogs(filters);
      setLogs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar logs');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await LogService.getLogStats();
      setStats(data);
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
    }
  };

  const handleFilterChange = (key: keyof LogFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined
    }));
  };

  const handleApplyFilters = () => {
    loadLogs();
  };

  const handleClearFilters = () => {
    setFilters({});
    setTimeout(() => loadLogs(), 0);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getActionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      login: 'Login',
      logout: 'Logout',
      export: 'Exportação',
      delete: 'Exclusão',
      view: 'Visualização',
      filter: 'Filtro',
      other: 'Outro'
    };
    return labels[type] || type;
  };

  const getActionTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      login: 'bg-green-100 text-green-800',
      logout: 'bg-gray-100 text-gray-800',
      export: 'bg-blue-100 text-blue-800',
      delete: 'bg-red-100 text-red-800',
      view: 'bg-purple-100 text-purple-800',
      filter: 'bg-yellow-100 text-yellow-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  if (loading && logs.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando logs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <div className="text-center py-12">
          <div className="text-red-600 text-lg mb-4">⚠️ {error}</div>
          <Button onClick={loadLogs}>Tentar Novamente</Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="text-sm text-gray-600 mb-1">Total de Logs</div>
          <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <div className="text-sm text-gray-600 mb-1">Logins</div>
          <div className="text-3xl font-bold text-green-600">{stats.porTipo.login || 0}</div>
        </Card>
        
        <Card className="bg-gradient-to-br from-red-50 to-red-100">
          <div className="text-sm text-gray-600 mb-1">Exclusões</div>
          <div className="text-3xl font-bold text-red-600">{stats.porTipo.delete || 0}</div>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
          <div className="text-sm text-gray-600 mb-1">Exportações</div>
          <div className="text-3xl font-bold text-purple-600">{stats.porTipo.export || 0}</div>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <SectionHeader icon={Filter} title="Filtros" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          <Input
            label="Buscar"
            placeholder="Buscar em ação, usuário, detalhes..."
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />

          <Select
            label="Tipo de Ação"
            value={filters.actionType || ''}
            onChange={(value) => handleFilterChange('actionType', value as string)}
            options={[
              { value: '', label: 'Todos' },
              { value: 'login', label: 'Login' },
              { value: 'logout', label: 'Logout' },
              { value: 'export', label: 'Exportação' },
              { value: 'delete', label: 'Exclusão' },
              { value: 'view', label: 'Visualização' },
              { value: 'filter', label: 'Filtro' },
              { value: 'other', label: 'Outro' }
            ]}
          />

          <Input
            label="Data Início"
            type="date"
            value={filters.dataInicio || ''}
            onChange={(e) => handleFilterChange('dataInicio', e.target.value)}
          />

          <Input
            label="Data Fim"
            type="date"
            value={filters.dataFim || ''}
            onChange={(e) => handleFilterChange('dataFim', e.target.value)}
          />
        </div>

        <div className="flex gap-2 mt-4">
          <Button onClick={handleApplyFilters}>Aplicar Filtros</Button>
          <Button variant="secondary" onClick={handleClearFilters}>
            Limpar Filtros
          </Button>
          {onShowLeads && (
            <Button 
              variant="outline" 
              onClick={onShowLeads}
              className="border-orange-300 text-orange-600 hover:bg-orange-50 hover:border-orange-400"
            >
              <div className="flex items-center w-full justify-center">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar aos Leads
              </div>
            </Button>
          )}
        </div>
      </Card>

      {/* Tabela de Logs */}
      <Card>
        <SectionHeader 
          icon={FileText}
          title="Logs do Sistema" 
          subtitle={`${logs.length} registro${logs.length !== 1 ? 's' : ''} encontrado${logs.length !== 1 ? 's' : ''}`}
        />

        {logs.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            Nenhum log encontrado
          </div>
        ) : (
          <div className="mt-4">
            <Table
              columns={[
                {
                  key: 'timestamp',
                  header: 'Data/Hora',
                  render: (log) => formatDate(log.timestamp),
                  className: 'whitespace-nowrap'
                },
                {
                  key: 'userEmail',
                  header: 'Usuário',
                  render: (log) => log.userEmail
                },
                {
                  key: 'actionType',
                  header: 'Tipo',
                  render: (log) => (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionTypeColor(log.actionType)}`}>
                      {getActionTypeLabel(log.actionType)}
                    </span>
                  )
                },
                {
                  key: 'action',
                  header: 'Ação',
                  render: (log) => log.action
                },
                {
                  key: 'details',
                  header: 'Detalhes',
                  render: (log) => log.details || '-'
                },
                {
                  key: 'collection',
                  header: 'Coleção',
                  render: (log) => log.collection || '-'
                }
              ]}
              data={logs}
              emptyMessage="Nenhum log encontrado"
            />
          </div>
        )}
      </Card>
    </div>
  );
}

