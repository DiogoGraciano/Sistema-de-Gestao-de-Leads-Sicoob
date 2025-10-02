import type { Lead, ExportOptions } from '../types/lead';
import { formatUniqueTimestamp, formatGameTime, formatLeadDateTime } from './dateUtils';
import { LogService } from '../services/logService';

/**
 * Converte leads para CSV
 */
export function exportToCSV(leads: Lead[], options: ExportOptions): string {
  const headers = options.includeFields;
  const csvHeaders = headers.join(',');
  
  const csvRows = leads.map(lead => {
    return headers.map(field => {
      const value = (lead as any)[field] || '';
      // Escapar aspas duplas e quebras de linha
      const escapedValue = String(value).replace(/"/g, '""');
      return `"${escapedValue}"`;
    }).join(',');
  });
  
  return [csvHeaders, ...csvRows].join('\n');
}

/**
 * Converte leads para XLSX (formato simplificado)
 */
export function exportToXLSX(leads: Lead[], options: ExportOptions): string {
  // Para simplificar, vamos gerar um CSV com extensão .xlsx
  // Em uma implementação real, você usaria uma biblioteca como xlsx
  return exportToCSV(leads, options);
}

/**
 * Baixa arquivo
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Exporta leads para arquivo
 */
export async function exportLeads(leads: Lead[], options: ExportOptions): Promise<void> {
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `leads_${timestamp}.${options.format}`;
  
  let content: string;
  let mimeType: string;
  
  if (options.format === 'csv') {
    content = exportToCSV(leads, options);
    mimeType = 'text/csv;charset=utf-8;';
  } else {
    content = exportToXLSX(leads, options);
    mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  }
  
  downloadFile(content, filename, mimeType);
  
  // Registrar log de exportação
  await LogService.logAction(
    'Exportação de leads',
    'export',
    `${leads.length} leads exportados em formato ${options.format.toUpperCase()}`
  );
}

/**
 * Formata dados para exibição
 */
export function formatLeadData(lead: Lead, field: string): string {
  const value = (lead as any)[field];
  
  // Remover console.log desnecessário
  // console.log(value);
  
  switch (field) {
    case 'dataHora':
      return formatLeadDateTime(value);
    case 'tempo':
      return formatGameTime(value);
    case 'unique_timestamp':
      return formatUniqueTimestamp(value);
    case 'ganhou':
    case 'autorizoContato':
      return value === 'Sim' ? '✅ Sim' : '❌ Não';
    case 'encrypted':
      return value === 'true' ? '🔒 Criptografado' : '🔓 Não criptografado';
    default:
      return String(value || '');
  }
}

/**
 * Obtém opções de campos para exportação
 */
export function getExportFieldOptions(): Array<{ value: string; label: string }> {
  return [
    { value: 'id', label: 'ID' },
    { value: 'nome', label: 'Nome' },
    { value: 'email', label: 'Email' },
    { value: 'game_name', label: 'Jogo' },
    { value: 'platform', label: 'Plataforma' },
    { value: 'ganhou', label: 'Ganhou' },
    { value: 'tempo', label: 'Tempo (s)' },
    { value: 'autorizoContato', label: 'Autoriza Contato' },
    { value: 'dataHora', label: 'Data/Hora' },
    { value: 'unique_timestamp', label: 'Timestamp Único' },
    { value: 'encrypted', label: 'Criptografado' },
    { value: 'custom1', label: 'Campo Customizado' }
  ];
}
