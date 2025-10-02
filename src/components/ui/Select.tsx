import React, { forwardRef, useState, useRef, useEffect } from 'react';
import { clsx } from 'clsx';
import { ChevronDown, Check, Search } from 'lucide-react';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends Omit<React.HTMLAttributes<HTMLButtonElement>, 'onChange' | 'value' | 'defaultValue'> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  variant?: 'default' | 'modern' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  options: SelectOption[];
  placeholder?: string;
  value?: string | number;
  defaultValue?: string | number;
  onChange?: (value: string | number) => void;
  name?: string;
  disabled?: boolean;
  required?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  noOptionsText?: string;
}

const Select = forwardRef<HTMLInputElement, SelectProps>(
  ({ 
    label, 
    error, 
    helperText, 
    leftIcon, 
    className, 
    id, 
    variant = 'modern', 
    size = 'md', 
    options, 
    placeholder = 'Selecione uma opção',
    value,
    defaultValue,
    onChange,
    name,
    disabled = false,
    required = false,
    onClick,
    onKeyDown,
    searchable = false,
    searchPlaceholder = 'Pesquisar...',
    noOptionsText = 'Nenhuma opção encontrada',
  }, _ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useState(value || defaultValue || '');
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);
    const hiddenInputRef = useRef<HTMLInputElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    
    const inputId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

    const sizeClasses = {
      sm: 'py-2 px-3 text-sm',
      md: 'py-3 px-4 text-sm',
      lg: 'py-4 px-5 text-base',
    };

    const variantClasses = {
      default: 'border-gray-300 focus:border-orange-500 focus:ring-orange-500 rounded-md',
      modern: 'border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 rounded-xl bg-white transition-all duration-200',
      minimal: 'border-0 border-b-2 border-gray-200 focus:border-orange-500 rounded-none bg-transparent',
    };

    // Filtrar opções baseado no termo de pesquisa
    const filteredOptions = searchable && searchTerm 
      ? options.filter(option => 
          option.label.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : options;

    // Encontrar a opção selecionada
    const selectedOption = options.find(option => option.value === selectedValue);

    // Fechar dropdown quando clicar fora
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsOpen(false);
          setHighlightedIndex(-1);
          setSearchTerm('');
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Focar no input de pesquisa quando abrir (se searchable)
    useEffect(() => {
      if (isOpen && searchable && searchInputRef.current) {
        setTimeout(() => {
          searchInputRef.current?.focus();
        }, 100);
      }
    }, [isOpen, searchable]);

    // Atualizar valor quando prop value mudar
    useEffect(() => {
      if (value !== undefined) {
        setSelectedValue(value);
      }
    }, [value]);

    // Navegação por teclado
    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (disabled) return;

      switch (event.key) {
        case 'Enter':
        case ' ':
          event.preventDefault();
          if (isOpen && highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
            handleOptionSelect(filteredOptions[highlightedIndex]);
          } else if (!searchable) {
            setIsOpen(!isOpen);
          }
          break;
        case 'ArrowDown':
          event.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
          } else {
            setHighlightedIndex(prev => 
              prev < filteredOptions.length - 1 ? prev + 1 : 0
            );
          }
          break;
        case 'ArrowUp':
          event.preventDefault();
          if (isOpen) {
            setHighlightedIndex(prev => 
              prev > 0 ? prev - 1 : filteredOptions.length - 1
            );
          }
          break;
        case 'Escape':
          setIsOpen(false);
          setHighlightedIndex(-1);
          setSearchTerm('');
          break;
      }
    };

    // Navegação por teclado específica para o input de pesquisa
    const handleSearchKeyDown = (event: React.KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setHighlightedIndex(0);
          break;
        case 'ArrowUp':
          event.preventDefault();
          setHighlightedIndex(filteredOptions.length - 1);
          break;
        case 'Enter':
          event.preventDefault();
          if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
            handleOptionSelect(filteredOptions[highlightedIndex]);
          } else if (filteredOptions.length === 1) {
            handleOptionSelect(filteredOptions[0]);
          }
          break;
        case 'Escape':
          setIsOpen(false);
          setHighlightedIndex(-1);
          setSearchTerm('');
          break;
      }
    };

    const handleOptionSelect = (option: SelectOption) => {
      if (option.disabled) return;
      
      setSelectedValue(option.value);
      setIsOpen(false);
      setHighlightedIndex(-1);
      setSearchTerm('');
      
      if (onChange) {
        onChange(option.value);
      }

      // Trigger change event no input hidden para compatibilidade com react-hook-form
      if (hiddenInputRef.current) {
        const event = new Event('change', { bubbles: true });
        Object.defineProperty(event, 'target', {
          writable: false,
          value: hiddenInputRef.current
        });
        hiddenInputRef.current.dispatchEvent(event);
      }
    };

    return (
      <div className="w-full" ref={dropdownRef}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        {/* Input hidden para compatibilidade com formulários */}
        <input
          ref={hiddenInputRef}
          type="hidden"
          name={name}
          value={selectedValue}
          required={required}
        />
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
              <div className="h-5 w-5 text-gray-400">{leftIcon}</div>
            </div>
          )}
          
          {/* Trigger button */}
          <button
            type="button"
            id={inputId}
            onClick={(e) => {
              if (!disabled) {
                setIsOpen(!isOpen);
                onClick?.(e);
              }
            }}
            onKeyDown={(e) => {
              handleKeyDown(e);
              onKeyDown?.(e);
            }}
            disabled={disabled}
            className={clsx(
              'block w-full text-left outline-none transition-all duration-200 cursor-pointer',
              variantClasses[variant],
              sizeClasses[size],
              {
                'pl-12': leftIcon,
                'pr-12': true,
                'border-red-300 focus:border-red-500 focus:ring-red-500/20': error,
                'hover:shadow-md': variant === 'modern' && !disabled,
                'text-gray-400': !selectedOption,
                'text-gray-900': selectedOption,
                'opacity-50 cursor-not-allowed': disabled,
                'ring-2 ring-teal-500/20 border-teal-500': isOpen && variant === 'modern',
              },
              className
            )}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </button>
          
          {/* Chevron icon */}
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
            <ChevronDown 
              className={clsx(
                'h-5 w-5 text-gray-400 transition-transform duration-200',
                { 'rotate-180': isOpen }
              )} 
            />
          </div>
          
          {/* Dropdown */}
          {isOpen && (
            <div className="absolute z-50 w-full mt-1 bg-white border-2 border-gray-200 rounded-xl shadow-lg animate-scale-in">
              {searchable && (
                <div className="p-3 border-b border-gray-100">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setHighlightedIndex(-1);
                      }}
                      onKeyDown={handleSearchKeyDown}
                      placeholder={searchPlaceholder}
                      className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>
              )}
              <div className="max-h-48 overflow-auto">
                {filteredOptions.length > 0 ? (
                  filteredOptions.map((option, index) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleOptionSelect(option)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  disabled={option.disabled}
                  className={clsx(
                    'w-full text-left px-4 py-3 transition-all duration-150 flex items-center justify-between group',
                    {
                      'bg-orange-50 border-l-4 border-orange-500 text-orange-900': 
                        highlightedIndex === index && !option.disabled,
                      'bg-gray-50 text-gray-400 cursor-not-allowed': option.disabled,
                      'hover:bg-orange-50': !option.disabled && highlightedIndex !== index,
                      'bg-orange-100 text-orange-900': selectedValue === option.value,
                      'first:rounded-t-lg last:rounded-b-lg': true,
                    }
                  )}
                >
                  <span className={clsx(
                    'text-sm',
                    {
                      'font-medium': selectedValue === option.value,
                      'text-gray-900': !option.disabled && selectedValue !== option.value,
                    }
                  )}>
                    {option.label}
                  </span>
                  {selectedValue === option.value && (
                    <Check className="h-4 w-4 text-orange-600" />
                  )}
                </button>
              ))
            ) : (
              <div className="px-4 py-6 text-center text-gray-500 text-sm">
                {noOptionsText}
              </div>
            )}
              </div>
            </div>
          )}
        </div>
        
        {error && (
          <p className="mt-2 text-sm text-red-600 flex items-center">
            <span className="mr-1">⚠️</span>
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-2 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
