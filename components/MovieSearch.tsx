
import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';

interface MovieSearchProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
  disabled: boolean;
}

export const MovieSearch: React.FC<MovieSearchProps> = ({ onSearch, isLoading, disabled }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto mt-8">
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-400 transition-colors">
          <Search size={20} />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={disabled ? "Primero vincula un archivo Excel..." : "Escribe el nombre de la película..."}
          disabled={disabled}
          className="block w-full pl-12 pr-24 py-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <button
          type="submit"
          disabled={disabled || isLoading || !query.trim()}
          className="absolute inset-y-2 right-2 px-6 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-500 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Buscar'}
        </button>
      </div>
    </form>
  );
};
