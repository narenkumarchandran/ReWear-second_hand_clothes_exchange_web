
import React from 'react';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="w-9 h-9">
          {theme === 'light' ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-40 p-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start"
          onClick={toggleTheme}
        >
          {theme === 'light' ? (
            <>
              <Moon className="h-4 w-4 mr-2" />
              Dark Mode
            </>
          ) : (
            <>
              <Sun className="h-4 w-4 mr-2" />
              Light Mode
            </>
          )}
        </Button>
      </PopoverContent>
    </Popover>
  );
};

export default ThemeToggle;
