import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Trash2, 
  Search, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Calendar,
  User,
  Mail,
  Clock,
  Eye,
  Building2,
  FileText
} from 'lucide-react';
import Table from './ui/Table';
import Button from './ui/Button';
import Input from './ui/Input';
import Select from './ui/Select';
import Modal from './ui/Modal';
import { FiltersPanel } from './ui/FiltersPanel';
import LeadView from './LeadView';
import type { Lead, LeadFilters, ExportOptions } from '../types/lead';
import { LeadService, COLLECTIONS, type CollectionKey } from '../services/leadService';
import { exportLeads, formatLeadData, getExportFieldOptions } from '../utils/exportUtils';

interface LeadsListProps {
  onShowLogs?: () => void;
}

const LeadsList: React.FC<LeadsListProps> = ({ onShowLogs }) => {
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<LeadFilters>({});
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showLeadView, setShowLeadView] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [currentCollection, setCurrentCollection] = useState<CollectionKey>('leads_word_scramble_001');
  const [deleteMode, setDeleteMode] = useState<'single' | 'multiple' | 'all'>('single');
  const [leadToDelete, setLeadToDelete] = useState<string>('');
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'csv',
    includeFields: ['nome', 'email', 'game_name', 'platform', 'ganhou', 'tempo', 'dataHora', 'custom1']
  });
  const [stats, setStats] = useState({
    total: 0,
    ganhou: 0,
    perdeu: 0,
    autorizouContato: 0,
    naoAutorizouContato: 0,
    porPlataforma: {} as Record<string, number>,
    porJogo: {} as Record<string, number>
  });

  // Carregar leads
  const loadLeads = async () => {
    try {
      setIsLoading(true);
      // Definir a coleção atual no serviço
      LeadService.setCollection(currentCollection);
      const [leadsData, statsData] = await Promise.all([
        LeadService.getLeads(filters),
        LeadService.getLeadStats()
      ]);
      setFilteredLeads(leadsData);
      setStats(statsData);
    } catch (error) {
      console.error('Erro ao carregar leads:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, [filters, currentCollection]);

  // Aplicar filtros
  const applyFilters = () => {
    loadLeads();
  };

  // Limpar filtros
  const clearFilters = () => {
    setFilters({});
  };

  // Contar filtros ativos
  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => value && value !== '').length;
  };

  // Selecionar/deselecionar lead
  const toggleLeadSelection = (leadId: string) => {
    setSelectedLeads(prev => 
      prev.includes(leadId) 
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    );
  };

  // Deselecionar todos
  const deselectAllLeads = () => {
    setSelectedLeads([]);
  };

  // Excluir lead
  const handleDeleteLead = async (leadId: string) => {
    try {
      await LeadService.deleteLead(leadId);
      await loadLeads();
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Erro ao excluir lead:', error);
    }
  };

  // Excluir múltiplos leads
  const handleDeleteMultipleLeads = async () => {
    try {
      await LeadService.deleteMultipleLeads(selectedLeads);
      setSelectedLeads([]);
      await loadLeads();
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Erro ao excluir leads:', error);
    }
  };

  // Excluir todos os leads
  const handleDeleteAllLeads = async () => {
    try {
      await LeadService.deleteAllLeads();
      await loadLeads();
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Erro ao excluir todos os leads:', error);
    }
  };

  // Exportar leads
  const handleExport = async () => {
    await exportLeads(filteredLeads, exportOptions);
    setShowExportModal(false);
  };

  // Visualizar lead
  const handleViewLead = (lead: Lead) => {
    setSelectedLead(lead);
    setShowLeadView(true);
  };

  // Fechar visualização de lead
  const handleCloseLeadView = () => {
    setShowLeadView(false);
    setSelectedLead(null);
  };

  // Configurar colunas da tabela
  const columns = [
    {
      key: 'select',
      header: '',
      render: (lead: Lead) => (
        <input
          type="checkbox"
          checked={selectedLeads.includes(lead.id)}
          onChange={() => toggleLeadSelection(lead.id)}
          className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
        />
      ),
      className: 'w-12'
    },
    {
      key: 'nome',
      header: 'Nome',
      render: (lead: Lead) => (
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4 text-gray-400" />
          <span className="font-medium">{lead.nome}</span>
        </div>
      )
    },
    {
      key: 'email',
      header: 'Email',
      render: (lead: Lead) => (
        <div className="flex items-center space-x-2">
          <Mail className="h-4 w-4 text-gray-400" />
          <span className="text-sm">{lead.email}</span>
        </div>
      )
    },
    {
      key: 'ganhou',
      header: 'Resultado',
      render: (lead: Lead) => (
        <div className="flex items-center space-x-2">
          {lead.ganhou === 'Sim' ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <XCircle className="h-4 w-4 text-red-500" />
          )}
          <span className={lead.ganhou === 'Sim' ? 'text-green-600' : 'text-red-600'}>
            {lead.ganhou}
          </span>
        </div>
      )
    },
    {
      key: 'tempo',
      header: 'Tempo',
      render: (lead: Lead) => (
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-gray-400" />
          <span>{formatLeadData(lead, 'tempo')}</span>
        </div>
      )
    },
    {
      key: 'dataHora',
      header: 'Data/Hora',
      render: (lead: Lead) => (
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span className="text-sm">{lead.dataHora}</span>
        </div>
      )
    },
    {
      key: 'custom1',
      header: 'Cooperativa',
      render: (lead: Lead) => (
        <div className="flex items-center space-x-2">
          <Building2 className="h-4 w-4 text-gray-400" />
          <span className="text-sm">{lead.custom1 || 'Não informado'}</span>
        </div>
      )
    },
    {
      key: 'autorizoContato',
      header: 'Autoriza Contato',
      render: (lead: Lead) => (
        <div className="flex items-center space-x-2">
          {lead.autorizoContato === 'Sim' ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <XCircle className="h-4 w-4 text-red-500" />
          )}
          <span className={lead.autorizoContato === 'Sim' ? 'text-green-600' : 'text-red-600'}>
            {lead.autorizoContato}
          </span>
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Ações',
      render: (lead: Lead) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleViewLead(lead)}
            title="Visualizar lead"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              setLeadToDelete(lead.id);
              setDeleteMode('single');
              setShowDeleteModal(true);
            }}
            title="Excluir lead"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
      className: 'w-32'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Cabeçalho com estatísticas */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center flex-wrap space-y-4 justify-between mb-4">
          <div>
            <p className="text-sm text-gray-600 mt-1">
              Coleção atual: <span className="font-semibold text-orange-600">{COLLECTIONS[currentCollection]}</span>
            </p>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={loadLeads}
              isLoading={isLoading}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
            {onShowLogs && (
              <Button
                variant="outline"
                onClick={onShowLogs}
                className="border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400"
              >
                <FileText className="h-4 w-4 mr-2" />
                Ver Logs
              </Button>
            )}
            <Button
              variant="primary"
              onClick={() => setShowExportModal(true)}
              disabled={filteredLeads.length === 0}
              className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Seletor de Coleção */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Selecionar Coleção de Leads
          </label>
          <div className="flex space-x-4">
            {Object.entries(COLLECTIONS).map(([key, name]) => (
              <button
                key={key}
                onClick={() => setCurrentCollection(key as CollectionKey)}
                className={`px-4 py-2 rounded-xl border-2 transition-all ${
                  currentCollection === key
                    ? 'border-orange-500 bg-gradient-to-r from-orange-50 to-red-50 text-orange-700 font-semibold shadow-md'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-orange-300 hover:bg-orange-50'
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 border border-orange-100">
            <div className="text-2xl font-bold text-orange-600">{stats.total}</div>
            <div className="text-sm text-orange-800">Total de Leads</div>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-100 rounded-xl p-4 border border-green-100">
            <div className="text-2xl font-bold text-green-600">{stats.ganhou}</div>
            <div className="text-sm text-green-800">Ganharam</div>
          </div>
          <div className="bg-gradient-to-r from-red-50 to-rose-100 rounded-xl p-4 border border-red-100">
            <div className="text-2xl font-bold text-red-600">{stats.perdeu}</div>
            <div className="text-sm text-red-800">Perderam</div>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-cyan-100 rounded-xl p-4 border border-blue-100">
            <div className="text-2xl font-bold text-blue-600">{stats.autorizouContato}</div>
            <div className="text-sm text-blue-800">Autorizaram Contato</div>
          </div>
          <div className="bg-gradient-to-r from-purple-50 to-violet-100 rounded-xl p-4 border border-purple-100">
            <div className="text-2xl font-bold text-purple-600">{stats.naoAutorizouContato}</div>
            <div className="text-sm text-purple-800">Não Autorizaram</div>
          </div>
          <div className="bg-gradient-to-r from-amber-50 to-orange-100 rounded-xl p-4 border border-amber-100">
            <div className="text-2xl font-bold text-amber-600">{Object.keys(stats.porPlataforma).length}</div>
            <div className="text-sm text-amber-800">Plataformas</div>
          </div>
        </div>
      </div>

      {/* Painel de filtros */}
      <FiltersPanel
        title="Filtros de Busca"
        onApply={applyFilters}
        onClear={clearFilters}
        activeFiltersCount={getActiveFiltersCount()}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Input
            label="Buscar"
            placeholder="Nome, email, jogo..."
            value={filters.search || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            leftIcon={<Search className="h-4 w-4" />}
          />
          <Select
            label="Resultado"
            options={[
              { value: '', label: 'Todos os resultados' },
              { value: 'Sim', label: 'Ganhou' },
              { value: 'Não', label: 'Perdeu' }
            ]}
            value={filters.ganhou || ''}
            onChange={(value) => setFilters(prev => ({ ...prev, ganhou: value as string }))}
          />
          
          <Select
            label="Autoriza Contato"
            options={[
              { value: '', label: 'Todos' },
              { value: 'Sim', label: 'Autoriza' },
              { value: 'Não', label: 'Não autoriza' }
            ]}
            value={filters.autorizoContato || ''}
            onChange={(value) => setFilters(prev => ({ ...prev, autorizoContato: value as string }))}
          />
          
          <Input
            label="Data Início"
            type="date"
            value={filters.dataInicio || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, dataInicio: e.target.value }))}
          />
          
          <Input
            label="Data Fim"
            type="date"
            value={filters.dataFim || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, dataFim: e.target.value }))}
          />
        </div>
      </FiltersPanel>

      {/* Ações em lote */}
      {selectedLeads.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <span className="text-yellow-800">
                {selectedLeads.length} lead{selectedLeads.length !== 1 ? 's' : ''} selecionado{selectedLeads.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={deselectAllLeads}
              >
                Deselecionar Todos
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  setDeleteMode('multiple');
                  setShowDeleteModal(true);
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir Selecionados
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Tabela de leads */}
      <Table
        columns={columns}
        data={filteredLeads}
        isLoading={isLoading}
        title={`Leads - ${COLLECTIONS[currentCollection]}`}
        showRowNumbers
        emptyMessage="Nenhum lead encontrado com os filtros aplicados"
      />

      {/* Modal de confirmação de exclusão */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirmar Exclusão"
        size="md"
      >
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-red-100 rounded-full">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {deleteMode === 'single' && 'Excluir Lead'}
                {deleteMode === 'multiple' && 'Excluir Leads Selecionados'}
                {deleteMode === 'all' && 'Excluir Todos os Leads'}
              </h3>
              <p className="text-sm text-gray-500">
                {deleteMode === 'single' && 'Tem certeza que deseja excluir este lead? Esta ação não pode ser desfeita.'}
                {deleteMode === 'multiple' && `Tem certeza que deseja excluir ${selectedLeads.length} leads selecionados? Esta ação não pode ser desfeita.`}
                {deleteMode === 'all' && 'Tem certeza que deseja excluir TODOS os leads? Esta ação não pode ser desfeita.'}
              </p>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (deleteMode === 'single') {
                  handleDeleteLead(leadToDelete);
                } else if (deleteMode === 'multiple') {
                  handleDeleteMultipleLeads();
                } else {
                  handleDeleteAllLeads();
                }
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal de exportação */}
      <Modal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        title="Exportar Leads"
        size="lg"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Formato
              </label>
              <Select
                options={[
                  { value: 'csv', label: 'CSV' },
                  { value: 'xlsx', label: 'Excel (XLSX)' }
                ]}
                value={exportOptions.format}
                onChange={(value) => setExportOptions(prev => ({ ...prev, format: value as 'csv' | 'xlsx' }))}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total de registros
              </label>
              <div className="p-3 bg-gray-50 rounded-lg">
                <span className="text-lg font-semibold text-gray-800">
                  {filteredLeads.length} lead{filteredLeads.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Campos para exportar
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-4">
              {getExportFieldOptions().map(field => (
                <label key={field.value} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeFields.includes(field.value)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setExportOptions(prev => ({
                          ...prev,
                          includeFields: [...prev.includeFields, field.value]
                        }));
                      } else {
                        setExportOptions(prev => ({
                          ...prev,
                          includeFields: prev.includeFields.filter(f => f !== field.value)
                        }));
                      }
                    }}
                    className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                  />
                  <span className="text-sm text-gray-700">{field.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowExportModal(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleExport}
              disabled={exportOptions.includeFields.length === 0}
              className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal de visualização de lead */}
      <Modal
        isOpen={showLeadView}
        onClose={handleCloseLeadView}
        title={`Harmonika Games - Visualizar Lead: ${selectedLead?.nome || ''}`}
        size="xl"
      >
        {selectedLead && (
          <LeadView
            lead={selectedLead}
            onClose={handleCloseLeadView}
          />
        )}
      </Modal>
    </div>
  );
};

export default LeadsList;
