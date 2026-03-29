"use client";

import { useState } from "react";
interface TimeSlot { time: string; status: string }

interface TimeSlotPickerProps {
  slots: TimeSlot[];
  selectedSlot?: string | null;
  onSelect?: (slot: string | null) => void;
}

export default function TimeSlotPicker({ slots, selectedSlot: externalSelected, onSelect }: TimeSlotPickerProps) {
  const [internalSelected, setInternalSelected] = useState<string | null>(null);
  const selected = externalSelected !== undefined ? externalSelected : internalSelected;

  const handleSelect = (time: string) => {
    const newValue = selected === time ? null : time;
    if (onSelect) {
      onSelect(newValue);
    } else {
      setInternalSelected(newValue);
    }
  };

  return (
    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-1.5">
      {slots.map((slot) => {
        const isSelected = selected === slot.time;
        const isBooked = slot.status === "booked";
        const isPopular = slot.status === "popular";

        return (
          <button
            key={slot.time}
            disabled={isBooked}
            onClick={() => handleSelect(slot.time)}
            className={`py-2.5 px-1 text-xs font-mono rounded-sm border transition-all min-h-[44px] relative ${
              isSelected
                ? "bg-brand-cyan/20 border-brand-cyan text-brand-cyan font-bold ring-1 ring-brand-cyan/50"
                : isBooked
                ? "bg-white/[0.02] border-white/5 text-text-muted/30 cursor-not-allowed line-through"
                : isPopular
                ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-400 hover:border-yellow-400"
                : "bg-ui-bg/30 border-ui-border text-text-muted hover:border-brand-cyan/30 hover:text-white"
            }`}
          >
            {slot.time}
            {isPopular && !isSelected && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full" />
            )}
          </button>
        );
      })}
    </div>
  );
}
