
import React from "react";
import { useMusic } from "@/contexts/MusicContext";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import CountrySelector from "./CountrySelector";
import { Button } from "@/components/ui/button";
import { emotionToMusicMap, EmotionTypes } from "@/lib/emotions";

const MusicFilters: React.FC = () => {
  const { searchFilters, updateSearchFilters, searchMusicVideos } = useMusic();

  const handleTimeFilterChange = (value: string) => {
    updateSearchFilters({ isClassic: value === "classic" });
  };

  const handleEmotionFilter = (emotion: EmotionTypes) => {
    searchMusicVideos(emotionToMusicMap[emotion], searchFilters);
  };

  return (
    <div className="glass-morph p-4 rounded-lg my-4 animate-enter">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Country</h3>
          <CountrySelector />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Time Period</h3>
          <ToggleGroup
            type="single"
            defaultValue={searchFilters.isClassic ? "classic" : "new"}
            onValueChange={handleTimeFilterChange}
            className="justify-start"
          >
            <ToggleGroupItem value="new" className="text-sm" aria-label="New Releases">
              New Releases
            </ToggleGroupItem>
            <ToggleGroupItem value="classic" className="text-sm" aria-label="Old Classics">
              Old Classics
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="englishOnly" 
            checked={searchFilters.language === "english"}
            onCheckedChange={(checked) => {
              updateSearchFilters({ language: checked ? "english" : "" });
            }}
          />
          <Label htmlFor="englishOnly" className="text-sm font-medium cursor-pointer">
            English Only
          </Label>
        </div>
      </div>

      <div className="mt-4">
        <h3 className="text-sm font-medium text-muted-foreground mb-2">Quick Mood Filters</h3>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => handleEmotionFilter("happy")}>Happy</Button>
          <Button size="sm" variant="outline" onClick={() => handleEmotionFilter("sad")}>Sad</Button>
          <Button size="sm" variant="outline" onClick={() => handleEmotionFilter("energetic")}>Energetic</Button>
          <Button size="sm" variant="outline" onClick={() => handleEmotionFilter("relaxed")}>Relaxed</Button>
          <Button size="sm" variant="outline" onClick={() => handleEmotionFilter("romantic")}>Romantic</Button>
          <Button size="sm" variant="outline" onClick={() => handleEmotionFilter("focused")}>Focused</Button>
        </div>
      </div>
    </div>
  );
};

export default MusicFilters;
