import { useCallback, useState, useRef } from 'react';
import { Upload, Image, X } from 'lucide-react';

interface DropzoneFile {
  id: string;
  file: File;
  preview?: string;
}

interface DropzoneProps {
  onFilesAdded: (files: File[]) => void;
  maxFiles?: number;
}

export default function Dropzone({ onFilesAdded, maxFiles = 10 }: DropzoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [queuedFiles, setQueuedFiles] = useState<DropzoneFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(e.type === 'dragenter' || e.type === 'dragover');
  }, []);

  const processFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files)
      .filter((f) => f.type.startsWith('image/'))
      .slice(0, maxFiles - queuedFiles.length)
      .map((file) => ({
        id: `f-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        file,
        preview: URL.createObjectURL(file),
      }));

    setQueuedFiles((prev) => [...prev, ...newFiles]);
    onFilesAdded(newFiles.map((f) => f.file));
  }, [maxFiles, queuedFiles.length, onFilesAdded]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    processFiles(e.dataTransfer.files);
  }, [processFiles]);

  const removeFile = (id: string) => {
    setQueuedFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file?.preview) URL.revokeObjectURL(file.preview);
      return prev.filter((f) => f.id !== id);
    });
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative flex flex-col items-center justify-center gap-3 p-10
          rounded-[var(--radius-lg)] border-2 border-dashed cursor-pointer
          transition-all duration-300
          ${
            isDragActive
              ? 'border-[var(--color-accent)] bg-[var(--color-accent-glow)] shadow-[var(--shadow-glow-accent)]'
              : 'border-[var(--color-neu-border)] bg-[var(--color-neu-inset)] hover:border-[var(--color-text-muted)] hover:bg-[var(--color-neu-surface)]/40'
          }
        `}
      >
        <div className={`
          p-4 rounded-full transition-all duration-300
          ${isDragActive
            ? 'bg-[var(--color-accent)]/20 text-[var(--color-accent)]'
            : 'bg-[var(--color-neu-surface)] shadow-[var(--shadow-neu-button)] text-[var(--color-text-muted)]'
          }
        `}>
          <Upload size={28} />
        </div>
        <div className="text-center">
          <p className="text-[var(--color-text-primary)] font-medium">
            {isDragActive ? 'Drop screenshots here' : 'Drag & drop workout screenshots'}
          </p>
          <p className="text-[var(--color-text-muted)] text-sm mt-1">
            PNG, JPG up to 10MB each • Max {maxFiles} files
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => processFiles(e.target.files)}
        />
      </div>

      {/* Queued Files */}
      {queuedFiles.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {queuedFiles.map((f) => (
            <div
              key={f.id}
              className="relative group bg-[var(--color-neu-surface)] shadow-[var(--shadow-neu-raised)] rounded-[var(--radius-md)] overflow-hidden"
            >
              {f.preview ? (
                <img src={f.preview} alt={f.file.name} className="w-full h-24 object-cover" />
              ) : (
                <div className="w-full h-24 flex items-center justify-center bg-[var(--color-neu-inset)]">
                  <Image size={24} className="text-[var(--color-text-muted)]" />
                </div>
              )}
              <div className="p-2">
                <p className="text-xs text-[var(--color-text-secondary)] truncate">{f.file.name}</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); removeFile(f.id); }}
                className="absolute top-1 right-1 p-1 rounded-full bg-[var(--color-neu-base)]/80 text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
