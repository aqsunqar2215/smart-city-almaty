import React from 'react';
import { Ban, Crosshair, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { AvoidArea } from '@/types/ecoRouting';
import { ECO_ROUTING_TEXT } from '@/lib/ecoRoutingTexts';

interface AvoidAreaPanelProps {
  areas: AvoidArea[];
  selectedAreaId: string | null;
  isAddingMode: boolean;
  onToggleAddingMode: () => void;
  onSelectArea: (id: string) => void;
  onRadiusChange: (id: string, radiusM: number) => void;
  onToggleArea: (id: string, enabled: boolean) => void;
  onRemoveArea: (id: string) => void;
  onClearAll: () => void;
}

const AvoidAreaPanel: React.FC<AvoidAreaPanelProps> = ({
  areas,
  selectedAreaId,
  isAddingMode,
  onToggleAddingMode,
  onSelectArea,
  onRadiusChange,
  onToggleArea,
  onRemoveArea,
  onClearAll,
}) => {
  return (
    <div className="bg-white dark:bg-card/40 backdrop-blur-xl border border-border/50 rounded-3xl p-6 shadow-2xl space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
          <Ban className="h-4 w-4 text-rose-500" />
          {ECO_ROUTING_TEXT.labels.avoidAreas}
        </h4>
        {areas.length > 0 && (
          <Button variant="ghost" size="sm" onClick={onClearAll} className="h-7 px-2 text-[10px] uppercase tracking-widest font-bold">
            {ECO_ROUTING_TEXT.avoid.clearAll}
          </Button>
        )}
      </div>

      <Button
        type="button"
        onClick={onToggleAddingMode}
        className={`w-full rounded-xl h-10 text-xs font-bold uppercase tracking-wider ${
          isAddingMode ? 'bg-rose-500 hover:bg-rose-600 text-white' : 'bg-primary hover:bg-primary/90 text-white'
        }`}
      >
        <Crosshair className="h-4 w-4 mr-2" />
        {isAddingMode ? ECO_ROUTING_TEXT.avoid.addingArea : ECO_ROUTING_TEXT.avoid.addArea}
      </Button>

      {areas.length === 0 && (
        <p className="text-[11px] text-muted-foreground font-medium">{ECO_ROUTING_TEXT.avoid.empty}</p>
      )}

      <div className="space-y-3">
        {areas.map((area, idx) => {
          const selected = area.id === selectedAreaId;
          return (
            <div
              key={area.id}
              className={`rounded-2xl border p-3 transition-colors ${
                selected ? 'border-rose-400/50 bg-rose-500/10' : 'border-border bg-muted/25'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => onSelectArea(area.id)}
                  className="text-left"
                >
                  <p className="text-xs font-bold text-foreground">Area {idx + 1}</p>
                  <p className="text-[10px] text-muted-foreground font-mono">
                    {area.lat.toFixed(4)}, {area.lng.toFixed(4)}
                  </p>
                </button>
                <div className="flex items-center gap-1">
                  <Switch
                    checked={area.enabled}
                    onCheckedChange={(checked) => onToggleArea(area.id, checked)}
                    className="data-[state=checked]:bg-rose-500"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveArea(area.id)}
                    className="h-7 w-7 text-rose-500 hover:text-rose-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              <label className="block text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">
                {ECO_ROUTING_TEXT.avoid.radius}: {Math.round(area.radiusM)} m
              </label>
              <input
                type="range"
                min={200}
                max={2000}
                step={50}
                value={area.radiusM}
                onChange={(event) => onRadiusChange(area.id, Number(event.target.value))}
                className="w-full accent-rose-500"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AvoidAreaPanel;
