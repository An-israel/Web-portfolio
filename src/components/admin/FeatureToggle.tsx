'use client';

import { useState } from 'react';
import { Switch } from '@/components/ui/switch';

interface FeatureToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => Promise<void> | void;
  label?: string;
  disabled?: boolean;
}

export function FeatureToggle({ checked, onChange, label, disabled }: FeatureToggleProps) {
  const [loading, setLoading] = useState(false);
  const [localChecked, setLocalChecked] = useState(checked);

  async function handleChange(val: boolean) {
    setLocalChecked(val);
    setLoading(true);
    try {
      await onChange(val);
    } catch {
      // Revert on error
      setLocalChecked(!val);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={localChecked}
        onCheckedChange={handleChange}
        disabled={disabled || loading}
      />
      {label && <span className="text-xs text-[var(--muted)]">{label}</span>}
    </div>
  );
}
