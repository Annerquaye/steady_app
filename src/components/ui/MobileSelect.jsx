import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

const isMobile = () =>
  typeof window !== 'undefined' &&
  (window.innerWidth < 768 || /iPhone|iPad|Android/i.test(navigator.userAgent));

/**
 * On mobile: renders a bottom-sheet Drawer for native pick-list feel.
 * On desktop: falls back to the standard Radix Select.
 */
export function MobileSelect({ value, onValueChange, placeholder, options, className }) {
  const [open, setOpen] = useState(false);
  const mobile = isMobile();

  const selected = options.find(o => o.value === value);

  if (!mobile) {
    return (
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className={className}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map(o => (
            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm text-left",
          !selected && "text-muted-foreground",
          className
        )}
      >
        {selected ? selected.label : placeholder}
        <svg className="w-4 h-4 opacity-50 ml-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
        </svg>
      </button>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{placeholder || 'Select an option'}</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-8 space-y-1">
            {options.map(o => (
              <button
                key={o.value}
                type="button"
                onClick={() => { onValueChange(o.value); setOpen(false); }}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-medium transition-colors",
                  value === o.value
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-secondary"
                )}
              >
                {o.label}
                {value === o.value && <Check className="w-4 h-4" />}
              </button>
            ))}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}