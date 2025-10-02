import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, FunnelX, Search, SlidersHorizontal } from 'lucide-react';
import Button from './Button';
import Card from './Card';

interface FiltersPanelProps {
  title?: string;
  children: React.ReactNode;
  onApply?: () => void;
  onClear?: () => void;
  showActionButtons?: boolean;
  defaultCollapsed?: boolean;
  activeFiltersCount?: number;
}

export const FiltersPanel: React.FC<FiltersPanelProps> = ({
  title = 'Filtros',
  children,
  onApply,
  onClear,
  showActionButtons = true,
  defaultCollapsed = true,
  activeFiltersCount = 0
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [isAnimating, setIsAnimating] = useState(false);

  const toggleCollapse = () => {
    setIsAnimating(true);
    setIsCollapsed(!isCollapsed);
  };

  useEffect(() => {
    if (isAnimating) {
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isAnimating]);

  return (
    <Card 
      variant="gradient" 
      shadow="lg" 
      className="overflow-hidden border-l-4 border-l-orange-500"
    >
      <div className="relative">
        {/* Cabeçalho do painel */}
        <div className="px-6 py-4 bg-gradient-to-r from-orange-50 to-red-50 border-b border-gray-100">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-3">
              <button
                onClick={toggleCollapse}
                className={`
                  group relative p-2 rounded-lg transition-all duration-300 
                  ${isCollapsed 
                    ? 'bg-white hover:bg-orange-50 text-orange-600 shadow-sm' 
                    : 'bg-orange-100 hover:bg-orange-200 text-orange-700 shadow-md'
                  }
                  hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2
                `}
                aria-label={isCollapsed ? 'Expandir filtros' : 'Colapsar filtros'}
              >
                <div className="relative">
                  {isCollapsed ? (
                    <ChevronDown className={`h-5 w-5 transition-transform duration-300 ${isAnimating ? 'rotate-180' : ''}`} />
                  ) : (
                    <ChevronUp className={`h-5 w-5 transition-transform duration-300 ${isAnimating ? 'rotate-180' : ''}`} />
                  )}
                </div>
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-orange-400 to-red-400 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
              </button>
              
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <SlidersHorizontal className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
                    <span>{title}</span>
                    {activeFiltersCount > 0 && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 animate-pulse">
                        {activeFiltersCount} ativo{activeFiltersCount !== 1 ? 's' : ''}
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {isCollapsed ? 'Clique para expandir filtros' : 'Configure os filtros abaixo'}
                  </p>
                </div>
              </div>
            </div>
            
            {showActionButtons && !isCollapsed && (
              <div className="flex items-center space-x-3">
                {onClear && (
                  <Button 
                    onClick={onClear} 
                    variant="outline" 
                    size="sm"
                    className="bg-white hover:bg-red-50 border-red-200 text-red-600 hover:border-red-300 transition-all duration-200"
                  >
                    <FunnelX className="h-4 w-4 mr-2" />
                    Limpar
                  </Button>
                )}
                {onApply && (
                  <Button 
                    onClick={onApply} 
                    variant="primary" 
                    size="sm"
                    className="shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Aplicar Filtros
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Área de conteúdo dos filtros */}
        <div 
          className={`
            transition-all duration-300 ease-in-out overflow-hidden
            ${isCollapsed ? 'max-h-0 opacity-0' : 'max-h-[2000px] opacity-100'}
          `}
        >
          <div className="p-6 bg-white">
            <div className={`
              transform transition-all duration-300 ease-out
              ${isCollapsed ? 'translate-y-4 scale-95' : 'translate-y-0 scale-100'}
            `}>
              {children}
            </div>
            
            {/* Botões de ação na parte inferior para telas menores */}
            {showActionButtons && (
              <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 md:hidden">
                {onClear && (
                  <Button 
                    onClick={onClear} 
                    variant="outline" 
                    size="sm"
                    className="w-full sm:w-auto bg-white hover:bg-red-50 border-red-200 text-red-600 hover:border-red-300"
                  >
                    <FunnelX className="h-4 w-4 mr-2" />
                    Limpar Filtros
                  </Button>
                )}
                {onApply && (
                  <Button 
                    onClick={onApply} 
                    variant="primary" 
                    size="sm"
                    className="w-full sm:w-auto shadow-lg hover:shadow-xl"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Aplicar Filtros
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Indicador de filtros ativos quando colapsado */}
        {isCollapsed && activeFiltersCount > 0 && (
          <div className="px-6 py-3 bg-gradient-to-r from-orange-50 to-red-50 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                {activeFiltersCount} filtro{activeFiltersCount !== 1 ? 's' : ''} ativo{activeFiltersCount !== 1 ? 's' : ''}
              </span>
              {onClear && (
                <button
                  onClick={onClear}
                  className="text-orange-600 hover:text-orange-700 font-medium hover:underline transition-colors duration-200"
                >
                  Limpar tudo
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
