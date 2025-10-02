import React from 'react';
import { 
  Calendar, 
  User, 
  Mail, 
  Gamepad2, 
  Monitor, 
  CheckCircle, 
  XCircle,
  Shield,
  Building2,
  Trophy,
  Timer
} from 'lucide-react';
import type { Lead } from '../types/lead';
import Button from './ui/Button';
import { formatGameTime } from '../utils/dateUtils';

interface LeadViewProps {
  lead: Lead;
  onClose: () => void;
}

const LeadView: React.FC<LeadViewProps> = ({
  lead,
  onClose,
}) => {

  return (
    <div className="space-y-6">
      {/* Header com informações principais */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border border-orange-100 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-100 to-red-100 rounded-full flex items-center justify-center border-2 border-orange-200">
              <User className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{lead.nome}</h2>
              <p className="text-gray-600">Lead registrado em {lead.dataHora}</p>
            </div>
          </div>
          <div className="text-right">
            <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
              lead.ganhou === 'Sim' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {lead.ganhou === 'Sim' ? (
                <>
                  <Trophy className="w-4 h-4 mr-2" />
                  Ganhou
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 mr-2" />
                  Perdeu
                </>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Grid de informações organizadas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card de Informações Pessoais */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-lg">
          <div className="bg-gradient-to-r from-orange-50 to-red-50 px-4 py-3 border-b border-orange-200 rounded-t-xl">
            <div className="flex items-center space-x-2">
              <User className="w-5 h-5 text-orange-600" />
              <h4 className="text-lg font-semibold text-gray-900">Informações Pessoais</h4>
            </div>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Nome Completo</label>
              <p className="text-sm font-medium text-gray-900">{lead.nome}</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Email</label>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <p className="text-sm font-medium text-gray-900">{lead.email}</p>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Cooperativa</label>
              <div className="flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-gray-400" />
                <p className="text-sm font-medium text-gray-900">{lead.custom1 || 'Não informado'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Card de Jogo */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-lg">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-3 border-b border-green-200 rounded-t-xl">
            <div className="flex items-center space-x-2">
              <Gamepad2 className="w-5 h-5 text-green-600" />
              <h4 className="text-lg font-semibold text-gray-900">Informações do Jogo</h4>
            </div>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Nome do Jogo</label>
              <p className="text-sm font-medium text-gray-900">{lead.game_name}</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Plataforma</label>
              <div className="flex items-center space-x-2">
                <Monitor className="w-4 h-4 text-gray-400" />
                <p className="text-sm font-medium text-gray-900">{lead.platform}</p>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Tempo de Jogo</label>
              <div className="flex items-center space-x-2">
                <Timer className="w-4 h-4 text-gray-400" />
                <p className="text-sm font-medium text-gray-900">{formatGameTime(lead.tempo)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Card de Resultado */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-lg">
          <div className="bg-gradient-to-r from-purple-50 to-violet-50 px-4 py-3 border-b border-purple-200 rounded-t-xl">
            <div className="flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-purple-600" />
              <h4 className="text-lg font-semibold text-gray-900">Resultado</h4>
            </div>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Status do Jogo</label>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                lead.ganhou === 'Sim' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {lead.ganhou === 'Sim' ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Ganhou
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 mr-2" />
                    Perdeu
                  </>
                )}
              </span>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Autoriza Contato</label>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                lead.autorizoContato === 'Sim' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {lead.autorizoContato === 'Sim' ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Autoriza
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 mr-2" />
                    Não Autoriza
                  </>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Card de Informações Técnicas */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-lg">
        <div className="bg-gradient-to-r from-gray-50 to-slate-50 px-4 py-3 border-b border-gray-200 rounded-t-xl">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-gray-600" />
            <h4 className="text-lg font-semibold text-gray-900">Informações Técnicas</h4>
          </div>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">ID do Lead</label>
              <p className="text-sm font-medium text-gray-900 font-mono">{lead.id}</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Timestamp Único</label>
              <p className="text-sm font-medium text-gray-900 font-mono">{lead.unique_timestamp}</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Dados Criptografados</label>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                lead.encrypted === 'true' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {lead.encrypted === 'true' ? 'Sim' : 'Não'}
              </span>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Data/Hora do Registro</label>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <p className="text-sm font-medium text-gray-900">{lead.dataHora}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Botão de fechar */}
      <div className="flex justify-end">
        <Button
          onClick={onClose}
          variant="outline"
          className="bg-white hover:bg-orange-50 border-orange-200 text-orange-700 hover:border-orange-300 transition-all duration-300 rounded-xl px-6 py-2"
        >
          Fechar
        </Button>
      </div>
    </div>
  );
};

export default LeadView;
