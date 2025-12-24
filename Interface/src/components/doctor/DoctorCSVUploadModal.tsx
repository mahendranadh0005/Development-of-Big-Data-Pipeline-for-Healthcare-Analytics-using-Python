import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useData } from '@/context/DataContext';
import { toast } from '@/hooks/use-toast';
import { parseCSV, validatePrescriptionCSV } from '@/utils/csvParser';
import { Upload, FileText, AlertCircle, CheckCircle2, X } from 'lucide-react';

interface DoctorCSVUploadModalProps {
  open: boolean;
  onClose: () => void;
}

export default function DoctorCSVUploadModal({ open, onClose }: DoctorCSVUploadModalProps) {
  const { bulkAddPrescriptions } = useData();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [previewData, setPreviewData] = useState<any[]>([]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    setValidationErrors([]);
    const content = await selectedFile.text();
    const rows = parseCSV(content);
    const result = validatePrescriptionCSV(rows);
    if (!result.valid) setValidationErrors(result.errors);
    setPreviewData(result.data.slice(0, 5));
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const content = await file.text();
      const rows = parseCSV(content);
      const result = validatePrescriptionCSV(rows);
      if (result.data.length === 0) {
        toast({ title: 'Upload Failed', description: 'No valid records found.', variant: 'destructive' });
        setIsProcessing(false);
        return;
      }
      const uploadResult = bulkAddPrescriptions(result.data);
      if (uploadResult.success > 0) {
        toast({ title: 'Upload Successful', description: `${uploadResult.success} prescriptions added.` });
      }
      if (uploadResult.errors.length > 0) setValidationErrors(uploadResult.errors);
      else { onClose(); setFile(null); setPreviewData([]); }
    } catch { toast({ title: 'Error', description: 'Failed to process CSV.', variant: 'destructive' }); }
    setIsProcessing(false);
  };

  return (
    <Dialog open={open} onOpenChange={() => { setFile(null); setValidationErrors([]); setPreviewData([]); onClose(); }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>Upload Prescriptions CSV</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer ${file ? 'border-primary bg-primary/5' : 'border-border'}`} onClick={() => fileInputRef.current?.click()}>
            <input type="file" ref={fileInputRef} accept=".csv" onChange={handleFileChange} className="hidden" />
            {file ? <div className="flex items-center justify-center gap-3"><FileText className="w-8 h-8 text-primary" /><span>{file.name}</span><Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setFile(null); }}><X className="w-4 h-4" /></Button></div> : <><Upload className="w-12 h-12 text-muted-foreground mx-auto mb-3" /><p>Click to upload CSV</p></>}
          </div>
          {previewData.length > 0 && <div className="flex items-center gap-2 text-success"><CheckCircle2 className="w-4 h-4" /><span className="text-sm">{previewData.length} records ready</span></div>}
          {validationErrors.length > 0 && <div className="p-4 bg-destructive/10 rounded-lg"><div className="flex items-center gap-2 text-destructive"><AlertCircle className="w-4 h-4" /><span className="text-sm font-medium">Errors</span></div><ul className="text-xs text-destructive mt-2">{validationErrors.map((e, i) => <li key={i}>• {e}</li>)}</ul></div>}
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={handleUpload} disabled={!file || isProcessing}>{isProcessing ? 'Processing...' : 'Upload'}</Button></div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
