import { useState } from 'react';
import { CheckCircle2, Clock, AlertCircle, Loader2, FileImage, X, Edit3, Save, Trash2, RotateCcw } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Dropzone from '../components/ui/Dropzone';
import { useWorkouts } from '../hooks/useWorkouts';
import { UploadFile } from '../types';
import { formatDuration } from '../utils/formatters';
import Tesseract from 'tesseract.js';

const statusConfig: Record<UploadFile['status'], { icon: any; color: string; label: string }> = {
  queued: { icon: Clock, color: 'var(--color-on-surface-variant)', label: 'Queued' },
  processing: { icon: Loader2, color: 'var(--color-primary)', label: 'Processing' },
  verified: { icon: CheckCircle2, color: '#F0A030', label: 'Verified' },
  committed: { icon: CheckCircle2, color: 'var(--color-success-emerald)', label: 'Committed' },
  error: { icon: AlertCircle, color: '#FF3B30', label: 'Error' },
};

// Zone label map in order they appear in the screenshot (left to right)
const ZONE_ORDER = ['Normal', 'Warm Up', 'Fat Burning', 'Aerobic', 'Anaerobic', 'Extreme'];
const ZONE_COLORS = ['#8E8E93', '#5AC8FA', '#34C759', '#FFCC00', '#FF9500', '#FF3B30'];

/**
 * Parses OCR text extracted from Samsung Health Training screenshots.
 *
 * Screen layout (top to bottom):
 *   - Date header:  "19th Jun - 1 Activity"
 *   - Workout name: "Evening Free Workout"
 *   - Stats row:    "<calories> Cal  Calories    <avgHR> bpm  Avg.HR    <min>.<sec>  Duration"
 *   - METs row:     "<mets>  METs"
 *   - Heart Rate graph (x-axis 0..60 min, every 15 min)
 *   - Zone bars with percentages: 6 numbers (Normal Warmup FatBurn Aerobic Anaerobic Extreme)
 */
function parseOcrText(rawText: string): {
  calories: number;
  avgHR: number;
  durationSeconds: number;
  mets: number;
  date: string;
  hrZones: { name: string; color: string; percentage: number; minutes: number }[];
} {
  // ----- Normalise -----
  // Keep original for multi-line patterns; make a flat version for single-line patterns
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
  const flat = rawText.replace(/\r?\n/g, ' ').replace(/\s+/g, ' ');

  // ── 1. Calories ──────────────────────────────────────────────────────────────
  // Pattern A: "<number> Cal" with optional small-text suffix (e.g. "583 Cal")
  // Pattern B: label "Calories" appears a couple of lines after the number
  let calories = 0;
  const calLineMatch = flat.match(/(\d{2,4})\s*(?:Cal\b|Kcal\b)/i);
  if (calLineMatch) {
    calories = parseInt(calLineMatch[1], 10);
  }
  if (!calories) {
    // Try finding a large 3-4 digit number near "Calories" label
    const caloriesLabelIdx = lines.findIndex(l => /^Calories$/i.test(l));
    if (caloriesLabelIdx > 0) {
      // Look in the previous 1-3 lines for a number
      for (let i = caloriesLabelIdx - 1; i >= Math.max(0, caloriesLabelIdx - 3); i--) {
        const m = lines[i].match(/^(\d{2,4})/);
        if (m) { calories = parseInt(m[1], 10); break; }
      }
    }
  }
  if (!calories) {
    // last-resort: first 3-4 digit number in text
    const m = flat.match(/\b(\d{3,4})\b/);
    if (m) calories = parseInt(m[1], 10);
  }

  // ── 2. Average Heart Rate ─────────────────────────────────────────────────────
  // Pattern A: "<number> bpm" (could be "120 bpm" or "120bpm")
  // Pattern B: label "Avg.HR" or "Avg. HR" appears a couple of lines after the number
  let avgHR = 0;
  const bpmMatch = flat.match(/(\d{2,3})\s*bpm\b/i);
  if (bpmMatch) {
    avgHR = parseInt(bpmMatch[1], 10);
  }
  if (!avgHR) {
    const avgHRLabelIdx = lines.findIndex(l => /Avg\.?\s*HR/i.test(l));
    if (avgHRLabelIdx > 0) {
      for (let i = avgHRLabelIdx - 1; i >= Math.max(0, avgHRLabelIdx - 3); i--) {
        const m = lines[i].match(/^(\d{2,3})/);
        if (m) { avgHR = parseInt(m[1], 10); break; }
      }
    }
  }
  if (!avgHR) {
    // Fallback: second 2-3 digit number in flat text (after calories)
    const nums = [...flat.matchAll(/\b(\d{2,3})\b/g)];
    // Filter out numbers that look like years or timestamps
    const hrCandidates = nums.map(n => parseInt(n[1], 10)).filter(n => n >= 50 && n <= 220);
    if (hrCandidates.length > 0) avgHR = hrCandidates[0];
  }

  // ── 3. Duration ───────────────────────────────────────────────────────────────
  // Samsung Health shows duration as "<min>.<sec>" e.g. "60.25" or "60 min 25 sec"
  // Also could be "60.25 sec" or just "60.25" near "Duration" label
  let durationSeconds = 0;

  // Pattern A: explicit "min" and "sec" (e.g. "60 min 25 sec")
  const minSecMatch = flat.match(/(\d{1,3})\s*min\s*(\d{1,2})\s*sec/i);
  if (minSecMatch) {
    durationSeconds = parseInt(minSecMatch[1], 10) * 60 + parseInt(minSecMatch[2], 10);
  }

  if (!durationSeconds) {
    // Pattern B: Samsung Health digit pattern "<mm>.<ss>" near "Duration" label
    // The display shows e.g. "60 25" or "60.25" where 60=min, 25=sec
    // Look for label "Duration" and grab numbers before it
    const durationLabelIdx = lines.findIndex(l => /^Duration$/i.test(l));
    if (durationLabelIdx > 0) {
      for (let i = durationLabelIdx - 1; i >= Math.max(0, durationLabelIdx - 4); i--) {
        // Could be "60.25", "60 25", "60,25"
        const dotMatch = lines[i].match(/(\d{1,3})[.\s,]+(\d{2})\b/);
        if (dotMatch) {
          durationSeconds = parseInt(dotMatch[1], 10) * 60 + parseInt(dotMatch[2], 10);
          break;
        }
        // Could be just the minutes on one line
        const minOnly = lines[i].match(/^(\d{1,3})$/);
        if (minOnly) {
          const mins = parseInt(minOnly[1], 10);
          // Look next line for seconds
          if (i + 1 < lines.length) {
            const secMatch = lines[i + 1].match(/^(\d{2})$/);
            if (secMatch) {
              durationSeconds = mins * 60 + parseInt(secMatch[1], 10);
              break;
            }
          }
          if (mins > 5 && mins <= 240) {
            durationSeconds = mins * 60;
            break;
          }
        }
      }
    }
  }

  if (!durationSeconds) {
    // Pattern C: "<number>.<number>" where first part is ≤240 min (generic fallback)
    // OCR sometimes reads the dots as different chars; try "60 25" pattern in flat
    const mmssMatch = flat.match(/\b(\d{2,3})[.\s]+(\d{2})\s*(?:sec|min)?/i);
    if (mmssMatch) {
      const mins = parseInt(mmssMatch[1], 10);
      const secs = parseInt(mmssMatch[2], 10);
      if (mins <= 240 && secs <= 59) {
        durationSeconds = mins * 60 + secs;
      }
    }
  }

  if (!durationSeconds) {
    // Last resort: hh:mm:ss or mm:ss
    const colonTime = flat.match(/\b(\d{1,2}):(\d{2})(?::(\d{2}))?\b/);
    if (colonTime) {
      if (colonTime[3]) {
        durationSeconds = parseInt(colonTime[1], 10) * 3600 + parseInt(colonTime[2], 10) * 60 + parseInt(colonTime[3], 10);
      } else {
        durationSeconds = parseInt(colonTime[1], 10) * 60 + parseInt(colonTime[2], 10);
      }
    }
  }

  // ── 4. METs ────────────────────────────────────────────────────────────────────
  // Pattern: single digit near "METs" label
  let mets = 6;
  const metsLineMatch = flat.match(/(\d+)\s*METs?/i);
  if (metsLineMatch) {
    mets = parseInt(metsLineMatch[1], 10);
  } else {
    const metsLabelIdx = lines.findIndex(l => /^METs?$/i.test(l));
    if (metsLabelIdx > 0) {
      for (let i = metsLabelIdx - 1; i >= Math.max(0, metsLabelIdx - 2); i--) {
        const m = lines[i].match(/^(\d{1,2})$/);
        if (m) { mets = parseInt(m[1], 10); break; }
      }
    }
  }

  // ── 5. Date ────────────────────────────────────────────────────────────────────
  // Patterns: "19th Jun", "20 Jun", "21st Jun 2025"
  let parsedDate = new Date().toISOString().split('T')[0];
  const dateMatch = flat.match(/(\d{1,2})(?:st|nd|rd|th)?\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i);
  if (dateMatch) {
    try {
      const day = parseInt(dateMatch[1], 10);
      const monthStr = dateMatch[2];
      const year = new Date().getFullYear();
      const d = new Date(`${day} ${monthStr} ${year}`);
      if (!isNaN(d.getTime())) {
        const offset = d.getTimezoneOffset();
        parsedDate = new Date(d.getTime() - offset * 60 * 1000).toISOString().split('T')[0];
      }
    } catch (e) {
      console.error('Date parsing failed', e);
    }
  }

  // ── 6. HR Zone Percentages ─────────────────────────────────────────────────────
  // The zone bar chart shows 6 percentage values in order: Normal Warmup FatBurn Aerobic Anaerobic Extreme
  // OCR extracts them as "29% 7% 16% 22% 26% 0%" or similar (with or without spaces)
  // Strategy: collect all "N%" patterns in document order (after "Heart Rate" section)
  const heartRateIdx = flat.search(/Heart\s*Rate/i);
  const zoneText = heartRateIdx >= 0 ? flat.slice(heartRateIdx) : flat;

  // Match all percentage values in the zone area
  const pctMatches = [...zoneText.matchAll(/(\d{1,3})\s*%/g)].map(m => parseInt(m[1], 10));

  // We expect exactly 6 zone values (Normal, Warmup, FatBurn, Aerobic, Anaerobic, Extreme)
  // Filter to max 6, pad with 0s if needed
  const rawPercentages = pctMatches.slice(0, 6);
  while (rawPercentages.length < 6) rawPercentages.push(0);

  // Build zone objects with minutes calculated from duration
  const totalMinutes = durationSeconds / 60;
  const hrZones = ZONE_ORDER.map((name, i) => {
    const pct = rawPercentages[i] || 0;
    return {
      name,
      color: ZONE_COLORS[i],
      percentage: pct,
      minutes: Math.round((pct / 100) * totalMinutes),
    };
  });

  return {
    calories,
    avgHR,
    durationSeconds,
    mets,
    date: parsedDate,
    hrZones,
  };
}

function VerificationModal({ file, parsedDataOverride, onClose, onSave }: {
  file: UploadFile;
  parsedDataOverride: any;
  onClose: () => void;
  onSave: (data: any) => void;
}) {
  const initialData = parsedDataOverride || file.parsedData || {};
  const [formData, setFormData] = useState({
    date: initialData.date || new Date().toISOString().split('T')[0],
    calories: initialData.calories || 0,
    avgHR: initialData.avgHR || 0,
    durationSeconds: initialData.durationSeconds || 0,
    mets: initialData.mets || 0,
    hrZones: initialData.hrZones || [],
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-fade-in-up">
      <div className="bg-[var(--color-surface)] shadow-lg rounded-2xl w-full max-w-md p-6 border border-[var(--color-outline-variant)] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-title-md text-[var(--color-on-surface)]">
            Verify Parsed Data
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-md text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] hover:bg-[var(--color-surface-dim)] transition-colors cursor-pointer border-none bg-transparent">
            <X size={18} />
          </button>
        </div>

        <p className="text-body-sm text-[var(--color-on-surface-variant)] mb-4">
          <FileImage size={14} className="inline mr-1.5" />
          {file.name}
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-label-caps text-[var(--color-on-surface-variant)] mb-1.5">
              Workout Date
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl bg-[var(--color-surface-dim)] text-[var(--color-on-surface)] text-body-sm font-medium border-none outline-none"
            />
          </div>
          {[
            { key: 'calories', label: 'Calories (kcal)', type: 'number' },
            { key: 'avgHR', label: 'Avg Heart Rate (bpm)', type: 'number' },
            { key: 'durationSeconds', label: 'Duration (seconds)', type: 'number' },
            { key: 'mets', label: 'METs (Muscle Energy Technique)', type: 'number' },
          ].map(({ key, label, type }) => (
            <div key={key}>
              <label className="block text-label-caps text-[var(--color-on-surface-variant)] mb-1.5">
                {label}
              </label>
              <input
                type={type}
                value={formData[key as keyof typeof formData] as number}
                onChange={(e) => setFormData((prev) => ({ ...prev, [key]: parseFloat(e.target.value) || 0 }))}
                className="w-full px-4 py-2.5 rounded-xl bg-[var(--color-surface-dim)] text-[var(--color-on-surface)] text-body-sm font-medium border-none outline-none"
              />
            </div>
          ))}

          {/* HR Zone Percentages */}
          {formData.hrZones && formData.hrZones.length > 0 && (
            <div>
              <label className="block text-label-caps text-[var(--color-on-surface-variant)] mb-2">
                HR Zone Percentages
              </label>
              <div className="grid grid-cols-2 gap-2">
                {formData.hrZones.map((zone: any, i: number) => (
                  <div key={zone.name} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--color-surface-dim)]">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: zone.color }} />
                    <span className="text-body-sm text-[var(--color-on-surface-variant)] flex-1 truncate">{zone.name}</span>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={zone.percentage}
                      onChange={(e) => {
                        const newZones = [...formData.hrZones];
                        newZones[i] = { ...newZones[i], percentage: parseInt(e.target.value) || 0 };
                        setFormData(prev => ({ ...prev, hrZones: newZones }));
                      }}
                      className="w-12 text-right text-body-sm font-medium text-[var(--color-on-surface)] bg-transparent border-none outline-none"
                    />
                    <span className="text-body-sm text-[var(--color-on-surface-variant)]">%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {formData.durationSeconds > 0 && (
          <p className="text-body-sm text-[var(--color-on-surface-variant)] mt-2">
            Duration preview: <span className="text-[var(--color-primary)] font-medium">{formatDuration(formData.durationSeconds)}</span>
          </p>
        )}

        <div className="flex gap-3 mt-6">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button variant="primary" icon={<Save size={16} />} onClick={() => onSave(formData)} className="flex-1">
            Confirm &amp; Save
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function UploadHistory() {
  const { uploads, loading, error, addUpload, commitWorkout, deleteUpload, clearAllData } = useWorkouts();
  const [verifyFile, setVerifyFile] = useState<UploadFile | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  // Local state to store parsed data and updated statuses since backend doesn't support partial updates before commit
  const [localParsedData, setLocalParsedData] = useState<Record<string, any>>({});
  const [localStatuses, setLocalStatuses] = useState<Record<string, UploadFile['status']>>({});

  const handleFilesAdded = async (files: File[]) => {
    for (const f of files) {
      // Create initial upload entry in processing state
      const newId = await addUpload({
        name: f.name,
        status: 'processing',
        uploadedAt: new Date().toISOString(),
      });

      if (!newId) continue;

      setLocalStatuses(prev => ({ ...prev, [newId]: 'processing' }));

      try {
        // Run Tesseract OCR on the file
        const imageUrl = URL.createObjectURL(f);
        const { data: { text } } = await Tesseract.recognize(
          imageUrl,
          'eng',
          { logger: m => console.log(m) }
        );
        URL.revokeObjectURL(imageUrl);

        console.log('[OCR Raw Text]', text);

        // Parse extracted text
        const parsedData = parseOcrText(text);
        console.log('[Parsed Data]', parsedData);

        // Update local state
        setLocalParsedData(prev => ({ ...prev, [newId]: parsedData }));
        setLocalStatuses(prev => ({ ...prev, [newId]: 'verified' }));

      } catch (err) {
        console.error('OCR failed for file', f.name, err);
        setLocalStatuses(prev => ({ ...prev, [newId]: 'error' }));
      }
    }
  };

  const handleSave = async (data: any) => {
    if (!verifyFile) return;
    await commitWorkout(verifyFile.id, data);
    setVerifyFile(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this upload? The associated workout data will also be removed from the dashboard.')) {
      await deleteUpload(id);
    }
  };

  const handleResetAll = async () => {
    if (confirm('⚠️ Reset ALL data? This will permanently delete all workouts and upload history. This cannot be undone.')) {
      setIsResetting(true);
      try {
        await clearAllData();
        setLocalParsedData({});
        setLocalStatuses({});
      } finally {
        setIsResetting(false);
      }
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-[var(--color-on-surface-variant)]">Loading uploads...</div>;
  }

  if (error) {
    return (
      <div className="p-8 text-center text-[#FF3B30] flex flex-col items-center gap-2">
        <AlertCircle size={32} />
        <p>Failed to load uploads: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-headline-lg-mobile text-[var(--color-primary)]">
            Upload History
          </h1>
          <p className="text-[var(--color-on-surface-variant)] text-body-sm mt-1">
            Upload workout screenshots for automatic OCR processing
          </p>
        </div>
        <button
          onClick={handleResetAll}
          disabled={isResetting}
          title="Reset all data"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[#FF3B30] bg-[#FF3B30]/10 hover:bg-[#FF3B30]/20 transition-all active:scale-95 disabled:opacity-50 cursor-pointer border-none text-body-sm font-semibold"
        >
          <RotateCcw size={15} className={isResetting ? 'animate-spin' : ''} />
          Reset All
        </button>
      </div>

      {/* Upload Zone */}
      <Card variant="stat">
        <h3 className="text-title-md text-[var(--color-on-surface)] mb-4">
          Upload Screenshots
        </h3>
        <Dropzone onFilesAdded={handleFilesAdded} />
      </Card>

      {/* Processing Queue */}
      <Card variant="stat">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-title-md text-[var(--color-on-surface)]">
            Upload Queue
          </h3>
          <span className="text-body-sm text-[var(--color-on-surface-variant)]">
            {uploads.length} files
          </span>
        </div>

        {uploads.length === 0 ? (
          <p className="text-center text-[var(--color-on-surface-variant)] py-4 text-body-sm">No uploads yet.</p>
        ) : (
          <div className="space-y-2.5">
            {uploads.map((upload) => {
              const currentStatus = localStatuses[upload.id] || upload.status;
              const status = statusConfig[currentStatus];
              const StatusIcon = status.icon;
              const currentParsedData = localParsedData[upload.id] || upload.parsedData;

              return (
                <div
                  key={upload.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-[var(--color-surface-dim)] border border-[var(--color-outline-variant)]/30 transition-all duration-200 hover:bg-[var(--color-surface)] gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 flex-shrink-0 rounded-lg bg-[var(--color-surface)] shadow-sm flex items-center justify-center">
                      <FileImage size={16} className="text-[var(--color-on-surface-variant)]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-body-md font-medium text-[var(--color-on-surface)] truncate max-w-[200px]">{upload.name}</p>
                      <p className="text-body-sm text-[var(--color-on-surface-variant)]">
                        {new Date(upload.uploadedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    {/* Parsed Data Preview */}
                    {currentParsedData && (
                      <div className="hidden lg:flex items-center gap-3 text-body-sm text-[var(--color-on-surface-variant)]">
                        {currentParsedData.date && <span>{currentParsedData.date}</span>}
                        <span>{currentParsedData.calories} kcal</span>
                        <span>{currentParsedData.avgHR} bpm</span>
                        <span>{currentParsedData.mets} METs</span>
                      </div>
                    )}

                    {/* Status Badge */}
                    <div
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap"
                      style={{ backgroundColor: `${status.color}18`, color: status.color }}
                    >
                      <StatusIcon size={13} className={currentStatus === 'processing' ? 'animate-spin' : ''} />
                      {status.label}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      {(currentStatus === 'verified' || currentStatus === 'processing') && (
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
                        className="text-[#FF3B30] hover:bg-[#FF3B30]/10"
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
        <VerificationModal
          file={verifyFile}
          parsedDataOverride={localParsedData[verifyFile.id]}
          onClose={() => setVerifyFile(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
