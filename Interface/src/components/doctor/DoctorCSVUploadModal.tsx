import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import api from "@/services/api";
import { Upload, FileText, AlertCircle, CheckCircle2, X } from "lucide-react";

interface DoctorCSVUploadModalProps {
  open: boolean;
  onClose: () => void;
}

export default function DoctorCSVUploadModal({
  open,
  onClose,
}: DoctorCSVUploadModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [previewCount, setPreviewCount] = useState<number>(0);

  const resetState = () => {
    setFile(null);
    setValidationErrors([]);
    setPreviewCount(0);
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setValidationErrors([]);
    setPreviewCount(0);

    // Optional lightweight preview (count only)
    const text = await selectedFile.text();
    const rows = text.split("\n").filter((r) => r.trim().length > 0);
    setPreviewCount(Math.max(0, rows.length - 1)); // minus header
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await api.post("/prescriptions/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast({
        title: "Upload Successful",
        description: `${res.data.inserted || "Prescription"} records uploaded successfully.`,
      });

      resetState();
      onClose();
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.join(", ") ||
        "Failed to upload prescriptions CSV.";

      setValidationErrors(
        Array.isArray(err?.response?.data?.errors)
          ? err.response.data.errors
          : [message]
      );

      toast({
        title: "Upload Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={() => {
        resetState();
        onClose();
      }}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload Prescriptions CSV</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Upload Area */}
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              file
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />

            {file ? (
              <div className="flex items-center justify-center gap-3">
                <FileText className="w-8 h-8 text-primary" />
                <span className="font-medium">{file.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    resetState();
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <>
                <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="font-medium">Click to upload CSV</p>
                <p className="text-sm text-muted-foreground">
                  Prescription CSV files only
                </p>
              </>
            )}
          </div>

          {/* Preview */}
          {previewCount > 0 && (
            <div className="flex items-center gap-2 text-success">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-sm">
                {previewCount} records ready to upload
              </span>
            </div>
          )}

          {/* Errors */}
          {validationErrors.length > 0 && (
            <div className="p-4 bg-destructive/10 rounded-lg">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Errors</span>
              </div>
              <ul className="text-xs text-destructive mt-2 space-y-1">
                {validationErrors.map((e, i) => (
                  <li key={i}>• {e}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!file || isProcessing}
            >
              {isProcessing ? "Processing..." : "Upload"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
