import { useState } from 'react';
import { CheckCircle2, Clock, AlertCircle, Loader2, FileImage, X, Edit3, Save } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Dropzone from '../components/ui/Dropzone';
import { mockUploads, UploadFile } from '../data/mockData';
import { formatDuration } from '../utils/formatters';

const statusConfig: Record<UploadFile['status'], { icon: any; color: string; label: string }> = {
  queued: { icon: Clock, color: '#6B7280', label: 'Queued' },
  processing: { icon: Loader2, color: '#3B82F6', label: 'Processing' },
  verified: { icon: CheckCircle2, color: '#CCFF00', label: 'Verified' },
  committed: { icon: CheckCircle2, color: '#22C55E', label: 'Committed' },
  error: { icon: AlertCircle, color: '#EF4444', label: 'Error' },
};

function VerificationModal({ file, onClose, onSave }: {
  file: UploadFile;
  onClose: () => void;
  onSave: (data: any) => void;
}) {
  const [formData, setFormData] = useState({
    calories: file.parsedData?.calories ?? 0,
    avgHR: file.parsedData?.avgHR ?? 0,
    durationSeconds: file.parsedData?.durationSeconds ?? 0,
    mets: file.parsedData?.mets ?? 0,
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in-up">
      <div className="bg-[var(--color-neu-surface)] shadow-[var(--shadow-neu-raised)] rounded-[var(--radius-xl)] w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-[var(--color-text-primary)] font-[var(--font-heading)]">
            Verify Parsed Data
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-[var(--radius-sm)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-neu-raised)]/50 transition-colors cursor-pointer border-none bg-transparent">
            <X size={18} />
          </button>
        </div>

        <p className="text-sm text-[var(--color-text-secondary)] mb-4">
          <FileImage size={14} className="inline mr-1.5" />
          {file.name}
        </p>

        <div className="space-y-4">
          {[
            { key: 'calories', label: 'Calories (kcal)', type: 'number' },
            { key: 'avgHR', label: 'Avg Heart Rate (bpm)', type: 'number' },
            { key: 'durationSeconds', label: 'Duration (seconds)', type: 'number' },
            { key: 'mets', label: 'METs', type: 'number' },
          ].map(({ key, label, type }) => (
            <div key={key}>
              <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1.5 uppercase tracking-wider">
                {label}
              </label>
              <input
                type={type}
                value={formData[key as keyof typeof formData]}
                onChange={(e) => setFormData((prev) => ({ ...prev, [key]: parseFloat(e.target.value) || 0 }))}
                className="
                  w-full px-4 py-2.5 rounded-[var(--radius-md)]
                  bg-[var(--color-neu-inset)] shadow-[var(--shadow-neu-inset)]
                  text-[var(--color-text-primary)] text-sm font-medium
                  border-none outline-none
                  focus:shadow-[var(--shadow-glow-accent)]
                  transition-shadow duration-200
                "
              />
            </div>
          ))}
        </div>

        {formData.durationSeconds > 0 && (
          <p className="text-xs text-[var(--color-text-muted)] mt-2">
            Duration preview: <span className="text-[var(--color-accent)]">{formatDuration(formData.durationSeconds)}</span>
          </p>
        )}

        <div className="flex gap-3 mt-6">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button variant="primary" icon={<Save size={16} />} onClick={() => onSave(formData)} className="flex-1">
            Confirm & Save
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function UploadHistory() {
  const [uploads, setUploads] = useState(mockUploads);
  const [verifyFile, setVerifyFile] = useState<UploadFile | null>(null);

  const handleFilesAdded = (files: File[]) => {
    const newUploads: UploadFile[] = files.map((f, i) => ({
      id: `u-new-${Date.now()}-${i}`,
      name: f.name,
      status: 'queued',
      uploadedAt: new Date().toISOString(),
    }));
    setUploads((prev) => [...newUploads, ...prev]);
  };

  const handleSave = (data: any) => {
    if (!verifyFile) return;
    setUploads((prev) =>
      prev.map((u) =>
        u.id === verifyFile.id ? { ...u, status: 'committed' as const, parsedData: data } : u
      )
    );
    setVerifyFile(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)] font-[var(--font-heading)]">
          Upload History
        </h1>
        <p className="text-[var(--color-text-secondary)] text-sm mt-1">
          Upload workout screenshots for OCR processing
        </p>
      </div>

      {/* Upload Zone */}
      <Card variant="raised">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4 font-[var(--font-heading)]">
          Upload Screenshots
        </h3>
        <Dropzone onFilesAdded={handleFilesAdded} />
      </Card>

      {/* Processing Queue */}
      <Card variant="raised">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)] font-[var(--font-heading)]">
            Processing Queue
          </h3>
          <span className="text-xs text-[var(--color-text-muted)]">
            {uploads.length} files
          </span>
        </div>

        <div className="space-y-2.5">
          {uploads.map((upload) => {
            const status = statusConfig[upload.status];
            const StatusIcon = status.icon;
            return (
              <div
                key={upload.id}
                className="flex items-center justify-between p-3.5 rounded-[var(--radius-md)] bg-[var(--color-neu-inset)] shadow-[var(--shadow-neu-inset)] transition-all duration-200 hover:bg-[var(--color-neu-surface)]/50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-[var(--radius-sm)] bg-[var(--color-neu-surface)] shadow-[var(--shadow-neu-button)] flex items-center justify-center">
                    <FileImage size={16} className="text-[var(--color-text-muted)]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--color-text-primary)]">{upload.name}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {new Date(upload.uploadedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Parsed Data Preview */}
                  {upload.parsedData && (
                    <div className="hidden sm:flex items-center gap-3 text-xs text-[var(--color-text-secondary)]">
                      <span>{upload.parsedData.calories} kcal</span>
                      <span>{upload.parsedData.avgHR} bpm</span>
                    </div>
                  )}

                  {/* Status Badge */}
                  <div
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                    style={{ backgroundColor: `${status.color}18`, color: status.color }}
                  >
                    <StatusIcon size={13} className={upload.status === 'processing' ? 'animate-spin' : ''} />
                    {status.label}
                  </div>

                  {/* Verify Button */}
                  {(upload.status === 'verified' || upload.status === 'processing') && (
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Edit3 size={13} />}
                      onClick={() => setVerifyFile(upload)}
                    >
                      Verify
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Verification Modal */}
      {verifyFile && (
        <VerificationModal file={verifyFile} onClose={() => setVerifyFile(null)} onSave={handleSave} />
      )}
    </div>
  );
}
