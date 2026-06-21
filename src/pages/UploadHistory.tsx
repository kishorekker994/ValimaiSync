import { useState } from 'react';
import { CheckCircle2, Clock, AlertCircle, Loader2, FileImage, X, Edit3, Save, Trash2 } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Dropzone from '../components/ui/Dropzone';
import { useWorkouts } from '../hooks/useWorkouts';
import { UploadFile } from '../types';
import { formatDuration } from '../utils/formatters';

const statusConfig: Record<UploadFile['status'], { icon: any; color: string; label: string }> = {
  queued: { icon: Clock, color: 'var(--color-text-muted)', label: 'Queued' },
  processing: { icon: Loader2, color: 'var(--color-accent)', label: 'Processing' },
  verified: { icon: CheckCircle2, color: 'var(--color-warning)', label: 'Verified' },
  committed: { icon: CheckCircle2, color: 'var(--color-success)', label: 'Committed' },
  error: { icon: AlertCircle, color: 'var(--color-error)', label: 'Error' },
};

function VerificationModal({ file, onClose, onSave }: {
  file: UploadFile;
  onClose: () => void;
  onSave: (data: any) => void;
}) {
  const [formData, setFormData] = useState({
    calories: file.parsedData?.calories || Math.floor(Math.random() * 500 + 300),
    avgHR: file.parsedData?.avgHR || Math.floor(Math.random() * 40 + 110),
    durationSeconds: file.parsedData?.durationSeconds || Math.floor(Math.random() * 2000 + 1500),
    mets: file.parsedData?.mets || 6.5,
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-fade-in-up">
      <div className="bg-[var(--color-neu-surface)] shadow-[var(--shadow-neu-raised)] rounded-[var(--radius-xl)] w-full max-w-md p-6 border border-[var(--color-neu-border)]">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-[var(--color-text-primary)] font-[var(--font-heading)]">
            Verify Parsed Data
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-[var(--radius-sm)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-neu-raised)] transition-colors cursor-pointer border-none bg-transparent">
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
            Duration preview: <span className="text-[var(--color-accent)] font-medium">{formatDuration(formData.durationSeconds)}</span>
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
  const { uploads, loading, error, addUpload, commitWorkout, deleteUpload } = useWorkouts();
  const [verifyFile, setVerifyFile] = useState<UploadFile | null>(null);

  const handleFilesAdded = async (files: File[]) => {
    for (const f of files) {
      await addUpload({
        name: f.name,
        status: 'verified', // Skip processing step for demo
        uploadedAt: new Date().toISOString(),
      });
    }
  };

  const handleSave = async (data: any) => {
    if (!verifyFile) return;
    await commitWorkout(verifyFile.id, data);
    setVerifyFile(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this upload? The associated workout data will also be removed from the dashboard.")) {
      await deleteUpload(id);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-[var(--color-text-muted)]">Loading uploads...</div>;
  }

  if (error) {
    return (
      <div className="p-8 text-center text-[var(--color-error)] flex flex-col items-center gap-2">
        <AlertCircle size={32} />
        <p>Failed to load uploads: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)] font-[var(--font-heading)]">
          Upload History
        </h1>
        <p className="text-[var(--color-text-secondary)] text-sm mt-1">
          Upload workout screenshots for processing
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
            Upload Queue
          </h3>
          <span className="text-xs text-[var(--color-text-muted)]">
            {uploads.length} files
          </span>
        </div>

        {uploads.length === 0 ? (
          <p className="text-center text-[var(--color-text-muted)] py-4 text-sm">No uploads yet.</p>
        ) : (
          <div className="space-y-2.5">
            {uploads.map((upload) => {
              const status = statusConfig[upload.status];
              const StatusIcon = status.icon;
              return (
                <div
                  key={upload.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-[var(--radius-md)] bg-[var(--color-neu-inset)] shadow-[var(--shadow-neu-inset)] transition-all duration-200 hover:bg-[var(--color-neu-surface)] gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 flex-shrink-0 rounded-[var(--radius-sm)] bg-[var(--color-neu-surface)] shadow-[var(--shadow-neu-button)] flex items-center justify-center">
                      <FileImage size={16} className="text-[var(--color-text-muted)]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[var(--color-text-primary)] truncate max-w-[200px]">{upload.name}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">
                        {new Date(upload.uploadedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    {/* Parsed Data Preview */}
                    {upload.parsedData && (
                      <div className="hidden lg:flex items-center gap-3 text-xs text-[var(--color-text-secondary)]">
                        <span>{upload.parsedData.calories} kcal</span>
                        <span>{upload.parsedData.avgHR} bpm</span>
                      </div>
                    )}

                    {/* Status Badge */}
                    <div
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                      style={{ backgroundColor: `${status.color}18`, color: status.color }}
                    >
                      <StatusIcon size={13} className={upload.status === 'processing' ? 'animate-spin' : ''} />
                      {status.label}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      {(upload.status === 'verified' || upload.status === 'processing') && (
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Edit3 size={13} />}
                          onClick={() => setVerifyFile(upload)}
                          title="Verify Data"
                        >
                          <span className="hidden sm:inline">Verify</span>
                        </Button>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[var(--color-error)] hover:bg-[var(--color-error)]/10"
                        onClick={() => handleDelete(upload.id)}
                        title="Delete Upload"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Verification Modal */}
      {verifyFile && (
        <VerificationModal file={verifyFile} onClose={() => setVerifyFile(null)} onSave={handleSave} />
      )}
    </div>
  );
}
