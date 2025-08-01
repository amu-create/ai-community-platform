'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useDebounce } from '@/hooks/use-debounce';

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  onSearch?: (query: string) => void;
}

export function SearchBar({ 
  placeholder = 'AI 리소스 검색...', 
  className = '',
  onSearch 
}: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debouncedQuery = useDebounce(query, 300);

  // Fetch suggestions
  useEffect(() => {
    if (debouncedQuery && debouncedQuery.length >= 2) {
      fetch(`/api/search/suggestions?q=${encodeURIComponent(debouncedQuery)}`)
        .then(res => res.json())
        .then(data => setSuggestions(data))
        .catch(() => setSuggestions([]));
    } else {
      setSuggestions([]);
    }
  }, [debouncedQuery]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  }, [query]);

  const handleSearch = useCallback((searchQuery: string) => {
    setShowSuggestions(false);
    
    if (onSearch) {
      onSearch(searchQuery);
    } else {
      // Default behavior: navigate to search results page
      const params = new URLSearchParams(searchParams);
      if (searchQuery) {
        params.set('q', searchQuery);
      } else {
        params.delete('q');
      }
      router.push(`/resources?${params.toString()}`);
    }
  }, [onSearch, router, searchParams]);

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    handleSearch(suggestion);
  };

  const clearSearch = () => {
    setQuery('');
    handleSearch('');
  };

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(suggestions.length > 0)}
            placeholder={placeholder}
            className="pl-10 pr-10"
          />
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
              onClick={clearSearch}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </form>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              className="w-full px-4 py-2 text-left hover:bg-accent transition-colors"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}