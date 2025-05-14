import React, { useState, useEffect, useRef } from 'react';
import type { Player } from '@/../../shared/types';
import { Input } from './ui/input';
import { Check, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AutocompleteSelectProps {
  items: Player[];
  selectedId: number | '';
  onSelect: (id: number) => void;
  placeholder?: string;
}

const AutocompleteSelect: React.FC<AutocompleteSelectProps> = ({
  items,
  selectedId,
  onSelect,
  placeholder = 'Select player...'
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredItems, setFilteredItems] = useState(items);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  
  // Update search term when selected item changes
  useEffect(() => {
    if (selectedId) {
      const selected = items.find(item => item.id === selectedId);
      if (selected) {
        setSearchTerm(selected.name);
      }
    }
  }, [selectedId, items]);
  
  // Update filtered items when search term changes
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredItems(items);
    } else {
      const filtered = items.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredItems(filtered);
    }
    setHighlightedIndex(-1);
  }, [searchTerm, items]);
  
  // Scroll to highlighted item
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const listItems = listRef.current.querySelectorAll('[data-item]');
      if (listItems[highlightedIndex]) {
        listItems[highlightedIndex].scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        });
      }
    }
  }, [highlightedIndex]);
  
  // Keyboard navigation handler
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
      }
      return;
    }
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredItems.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredItems.length) {
          const selected = filteredItems[highlightedIndex];
          onSelect(selected.id);
          setSearchTerm(selected.name);
          setIsOpen(false);
          inputRef.current?.blur();
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
    }
  };
  
  // Reset the search term to show selected item name when focus is lost
  const handleBlur = () => {
    setTimeout(() => {
      if (selectedId) {
        const selected = items.find(item => item.id === selectedId);
        if (selected) {
          setSearchTerm(selected.name);
        }
      } else {
        setSearchTerm('');
      }
      setIsOpen(false);
    }, 200); // Small delay to allow click to register first
  };
  
  // Get display text for the input
  const displayValue = () => {
    if (searchTerm) return searchTerm;
    if (selectedId) {
      const selected = items.find(item => item.id === selectedId);
      return selected ? selected.name : '';
    }
    return '';
  };
  
  return (
    <div className="relative">
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={displayValue()}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onClick={() => setIsOpen(true)}
          onFocus={() => setIsOpen(true)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="w-full pr-8"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
      </div>
      
      {isOpen && (
        <div 
          ref={listRef}
          className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {filteredItems.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500">No results found</div>
          ) : (
            filteredItems.map((item, index) => (
              <div
                key={item.id}
                data-item
                className={cn(
                  "px-3 py-2 flex items-center cursor-pointer",
                  highlightedIndex === index && "bg-gray-100 dark:bg-gray-700",
                  selectedId === item.id && "bg-blue-50 dark:bg-blue-900"
                )}
                onClick={() => {
                  onSelect(item.id);
                  setSearchTerm(item.name);
                  setIsOpen(false);
                }}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                <span className="flex-grow">{item.name}</span>
                {selectedId === item.id && <Check className="h-4 w-4 ml-2 text-blue-500" />}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default AutocompleteSelect;