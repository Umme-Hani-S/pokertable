import React, { useState, useEffect } from 'react';
import type { Player } from '@/../../shared/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Input } from './ui/input';

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
  placeholder = 'Select item...'
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredItems, setFilteredItems] = useState(items);
  const [isOpen, setIsOpen] = useState(false);
  
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
  }, [searchTerm, items]);
  
  // Get the selected item name for display
  const selectedItemName = selectedId ? items.find(item => item.id === selectedId)?.name : '';
  
  return (
    <div className="relative">
      {/* Visible input field for typing */}
      <Input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onFocus={() => setIsOpen(true)}
        className="w-full"
      />
      
      {/* Results dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredItems.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500">No results found</div>
          ) : (
            filteredItems.map(item => (
              <div
                key={item.id}
                className={`px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  selectedId === item.id ? 'bg-blue-50 dark:bg-blue-900' : ''
                }`}
                onClick={() => {
                  onSelect(item.id);
                  setSearchTerm(item.name);
                  setIsOpen(false);
                }}
              >
                {item.name}
              </div>
            ))
          )}
        </div>
      )}
      
      {/* Clickaway handler */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default AutocompleteSelect;