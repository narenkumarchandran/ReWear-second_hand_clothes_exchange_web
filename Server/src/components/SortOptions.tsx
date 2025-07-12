
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';

interface SortOptionsProps {
  currentSort: string;
  onSortChange: (sortBy: string) => void;
}

const SortOptions = ({ currentSort, onSortChange }: SortOptionsProps) => {
  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'eco-points-high', label: 'Eco Points: High to Low' },
    { value: 'eco-points-low', label: 'Eco Points: Low to High' },
    { value: 'name-asc', label: 'Name: A to Z' },
    { value: 'name-desc', label: 'Name: Z to A' },
    { value: 'upvotes', label: 'Most Upvoted' },
  ];

  const getCurrentLabel = () => {
    const option = sortOptions.find(opt => opt.value === currentSort);
    return option?.label || 'Sort by';
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="bg-background border-border text-foreground hover:bg-muted">
          {getCurrentLabel()}
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-background border-border">
        {sortOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => onSortChange(option.value)}
            className={`cursor-pointer text-foreground hover:bg-muted ${
              currentSort === option.value ? 'bg-muted' : ''
            }`}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SortOptions;
