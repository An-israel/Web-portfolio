'use client';

import { useState, useRef } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  bucket?: string;
  folder?: string;
  className?: string;
}

export function ImageUploader({
  value,
  onChange,
  bucket = 'project-images',
  folder = 'covers',
  className,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be smaller than 5MB.');
      return;
    }

    setError('');
    setUploading(true);

    try {
      const supabase = createClient();
      const ext = file.name.split('.').pop() || 'jpg';
      const filename = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filename, file, { upsert: false });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from(bucket).getPublicUrl(filename);

      onChange(publicUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed. Try again.');
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function handleClear() {
    onChange('');
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <div className={cn('space-y-3', className)}>
      {value ? (
        <div className="relative rounded-sm overflow-hidden border border-[var(--line)]">
          <img
            src={value}
            alt="Preview"
            className="w-full h-40 object-cover"
          />
          <button
            type="button"
            onClick={handleClear}
            className="absolute top-2 right-2 p-1.5 bg-black/70 rounded-sm text-white hover:bg-black/90 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="relative border-2 border-dashed border-[var(--line)] rounded-sm p-8 text-center cursor-pointer hover:border-[var(--gold)] transition-colors group"
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-[var(--gold)]" />
              <p className="text-sm text-[var(--muted)]">Uploading...</p>
            </div>
          ) : (
            <>
              <Upload className="w-6 h-6 text-[var(--muted)] mx-auto mb-3 group-hover:text-[var(--gold)] transition-colors" />
              <p className="text-sm text-[var(--muted)]">
                Drop an image here or{' '}
                <span className="text-[var(--gold)] underline">browse</span>
              </p>
              <p className="text-xs text-[var(--muted)]/60 mt-1">PNG, JPG, WebP &mdash; max 5MB</p>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleInputChange}
      />

      {/* Manual URL input */}
      <div className="flex gap-2">
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Or paste image URL..."
          className="flex-1 h-9 px-3 text-xs border border-[var(--line)] bg-[var(--bg)] text-[var(--muted)] rounded-sm focus:outline-none focus:ring-1 focus:ring-[var(--gold)]"
        />
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
