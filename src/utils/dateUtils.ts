/**
 * Utilitários para formatação segura de datas
 */

/**
 * Verifica se o valor é um Timestamp do Firebase
 */
function isFirebaseTimestamp(value: any): boolean {
  return value && 
         typeof value === 'object' && 
         (value.seconds !== undefined || value._seconds !== undefined);
}

/**
 * Converte um Timestamp do Firebase para Date
 */
function firebaseTimestampToDate(timestamp: any): Date {
  if (timestamp.seconds !== undefined) {
    return new Date(timestamp.seconds * 1000);
  } else if (timestamp._seconds !== undefined) {
    return new Date(timestamp._seconds * 1000);
  } else if (timestamp.toDate && typeof timestamp.toDate === 'function') {
    return timestamp.toDate();
  }
  throw new Error('Formato de timestamp do Firebase não reconhecido');
}

/**
 * Formata uma data de forma segura, evitando "Invalid Date"
 */
export function formatDateSafe(dateValue: any, options?: Intl.DateTimeFormatOptions): string {
  if (!dateValue) {
    return 'Data não disponível';
  }

  let date: Date;

  // Se já é um objeto Date
  if (dateValue instanceof Date) {
    date = dateValue;
  }
  // Se é um Timestamp do Firebase
  else if (isFirebaseTimestamp(dateValue)) {
    try {
      date = firebaseTimestampToDate(dateValue);
    } catch (error) {
      return 'Erro ao converter timestamp do Firebase';
    }
  }
  // Se é um número (timestamp)
  else if (typeof dateValue === 'number') {
    // Verificar se é timestamp em segundos ou milissegundos
    if (dateValue > 1000000000000) {
      // Timestamp em milissegundos
      date = new Date(dateValue);
    } else if (dateValue > 1000000000) {
      // Timestamp em segundos
      date = new Date(dateValue * 1000);
    } else if (dateValue > 0) {
      // Pode ser um timestamp em microssegundos (como unique_timestamp)
      date = new Date(dateValue / 1000);
    } else {
      return 'Data inválida (timestamp zero ou negativo)';
    }
  }
  // Se é uma string
  else if (typeof dateValue === 'string') {
    // Tentar converter para número primeiro
    const numericValue = parseFloat(dateValue);
    if (!isNaN(numericValue) && numericValue > 0) {
      return formatDateSafe(numericValue, options);
    }
    
    // Verificar se é uma data ISO do Firebase
    if (dateValue.includes('T') && dateValue.includes('Z')) {
      date = new Date(dateValue);
    }
    // Verificar se é uma data no formato brasileiro
    else if (dateValue.includes('/')) {
      const parts = dateValue.split('/');
      if (parts.length === 3) {
        // Formato DD/MM/YYYY
        const day = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1; // Mês é 0-indexado
        const year = parseInt(parts[2]);
        date = new Date(year, month, day);
      } else {
        date = new Date(dateValue);
      }
    }
    // Tentar parsear como data padrão
    else {
      date = new Date(dateValue);
    }
  }
  else {
    return 'Formato de data inválido';
  }

  // Verificar se a data é válida e não é epoch (1970)
  if (isNaN(date.getTime()) || date.getTime() === 0) {
    return 'Data inválida';
  }

  // Verificar se não é uma data muito antiga (antes de 2000)
  if (date.getFullYear() < 2000) {
    return 'Data muito antiga ou inválida';
  }

  // Formatação padrão se não especificada
  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options
  };

  try {
    return date.toLocaleDateString('pt-BR', defaultOptions);
  } catch (error) {
    return 'Erro ao formatar data';
  }
}

/**
 * Formata uma data para exibição completa
 */
export function formatDateTime(dateValue: any): string {
  return formatDateSafe(dateValue, {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Formata uma data para exibição curta
 */
export function formatDateShort(dateValue: any): string {
  return formatDateSafe(dateValue, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

/**
 * Formata um timestamp único (como unique_timestamp)
 */
export function formatUniqueTimestamp(timestamp: any): string {
  if (!timestamp) {
    return 'Timestamp não disponível';
  }

  const numericValue = parseFloat(timestamp);
  if (isNaN(numericValue) || numericValue <= 0) {
    return 'Timestamp inválido';
  }

  let date: Date;

  // Tentar diferentes interpretações do timestamp
  if (numericValue > 1000000000000) {
    // Timestamp em milissegundos
    date = new Date(numericValue);
  } else if (numericValue > 1000000000) {
    // Timestamp em segundos
    date = new Date(numericValue * 1000);
  } else {
    // Timestamp em microssegundos (unique_timestamp)
    date = new Date(numericValue / 1000);
  }
  
  if (isNaN(date.getTime()) || date.getTime() === 0) {
    return 'Timestamp inválido';
  }

  // Verificar se não é uma data muito antiga
  if (date.getFullYear() < 2000) {
    return 'Timestamp muito antigo ou inválido';
  }

  return date.toLocaleString('pt-BR');
}

/**
 * Formata tempo de jogo
 */
export function formatGameTime(timeValue: any): string {
  if (!timeValue) {
    return 'Tempo não disponível';
  }

  const numericValue = parseFloat(timeValue);
  if (isNaN(numericValue)) {
    return String(timeValue);
  }

  // Se o tempo está em segundos, converter para mm:ss
  const minutes = Math.floor(numericValue / 60);
  const seconds = Math.floor(numericValue % 60);
  
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Formata especificamente o campo dataHora dos leads
 */
export function formatLeadDateTime(dateValue: any): string {
  if (!dateValue || dateValue === '' || dateValue === '0' || dateValue === 0) {
    return 'Data não disponível';
  }

  // Se é uma string vazia ou apenas espaços
  if (typeof dateValue === 'string' && dateValue.trim() === '') {
    return 'Data não disponível';
  }

  // Tentar formatação normal primeiro
  const formatted = formatDateSafe(dateValue);
  
  // Se retornou uma mensagem de erro, tentar outras abordagens
  if (formatted.includes('inválida') || formatted.includes('antiga')) {
    // Verificar se é um timestamp muito pequeno que pode ser válido
    const numericValue = parseFloat(dateValue);
    if (!isNaN(numericValue) && numericValue > 0) {
      // Tentar interpretar como timestamp em segundos desde 2020
      if (numericValue < 1000000000) {
        // Pode ser timestamp relativo a 2020-01-01
        const baseDate = new Date('2020-01-01');
        const date = new Date(baseDate.getTime() + (numericValue * 1000));
        if (!isNaN(date.getTime()) && date.getFullYear() >= 2020) {
          return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
        }
      }
    }
    
    return 'Data não disponível';
  }

  return formatted;
}
