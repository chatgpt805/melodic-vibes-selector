
import React from "react";
import { Check } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useMusic } from "@/contexts/MusicContext";

// Country data with codes, names and flags
const countries = [
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "NP", name: "Nepal", flag: "🇳🇵" },
  { code: "IN", name: "India", flag: "🇮🇳" },
  { code: "JP", name: "Japan", flag: "🇯🇵" },
  { code: "KR", name: "South Korea", flag: "🇰🇷" },
  { code: "BR", name: "Brazil", flag: "🇧🇷" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "MX", name: "Mexico", flag: "🇲🇽" },
  { code: "ES", name: "Spain", flag: "🇪🇸" },
  { code: "IT", name: "Italy", flag: "🇮🇹" },
  { code: "RU", name: "Russia", flag: "🇷🇺" },
];

interface CountrySelectorProps {
  className?: string;
}

const CountrySelector: React.FC<CountrySelectorProps> = ({ className }) => {
  const { searchFilters, updateSearchFilters } = useMusic();
  const [open, setOpen] = React.useState(false);
  
  const selectedCountry = countries.find(c => c.code === searchFilters.regionCode) || countries[0];

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            role="combobox" 
            aria-expanded={open} 
            className="min-w-[180px] justify-between bg-slate-800 border-slate-700 hover:bg-slate-700"
          >
            <span className="flex items-center gap-2">
              <span className="text-xl">{selectedCountry.flag}</span> 
              <span className="text-sm">{selectedCountry.name}</span>
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0 glass-morph">
          <Command>
            <CommandInput placeholder="Search country..." className="h-9" />
            <CommandList>
              <CommandEmpty>No country found.</CommandEmpty>
              <CommandGroup heading="Countries">
                {countries.map((country) => (
                  <CommandItem
                    key={country.code}
                    value={country.name}
                    onSelect={() => {
                      updateSearchFilters({ regionCode: country.code });
                      setOpen(false);
                    }}
                    className="text-sm cursor-pointer hover:bg-muted"
                  >
                    <span className="mr-2 text-lg">{country.flag}</span>
                    {country.name}
                    {country.code === searchFilters.regionCode && (
                      <Check className="ml-auto h-4 w-4" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default CountrySelector;
