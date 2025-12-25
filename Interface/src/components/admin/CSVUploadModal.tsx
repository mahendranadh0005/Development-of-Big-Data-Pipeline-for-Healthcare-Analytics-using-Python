import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useData } from "@/context/DataContext";
import { toast } from "@/hooks/use-toast";
import {
  parseCSV,
  validatePatientCSV,
  validateVisitCSV,
} from "@/utils/csvParser";
import {
  Upload,
  FileText,
  AlertCircle,
  CheckCircle2,
  X,
} from "lucide-react";

interface CSVUploadModalProps {
  open: boolean;
  onClose: () => void;
  type: "patients" | "visits";
}

export default function CSVUploadModal({
  open,
  onClose,
  type,
}: CSVUploadModalProps) {
  const {
    uploadPatientsCSV,
    uploadVisitsCSV,
  } = useData();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [previewData, setPreviewData] = useState<any[]>([]);

  /* =======================
     FILE SELECT
  ======================= */

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setValidationErrors([]);
    setPreviewData([]);

    const content = await selectedFile.text();
    const rows = parseCSV(content);

    const result =
      type === "patients"
        ? validatePatientCSV(rows)
        : validateVisitCSV(rows);

    if (!result.valid) {
      setValidationErrors(result.errors);
    }

    setPreviewData(result.data.slice(0, 5));
  };

  /* =======================
     UPLOAD TO BACKEND
  ======================= */

  const handleUpload = async () => {
    if (!file) return;

    setIsProcessing(true);

    try {
      if (type === "patients") {
        await uploadPatientsCSV(file);
      } else {
        await uploadVisitsCSV(file);
      }

      toast({
        title: "Upload Successful",
        description: `${
          type === "patients" ? "Patients" : "Visits"
        } CSV uploaded successfully.`,
      });

      handleClose();
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description:
          error?.response?.data?.message ||
          "Failed to upload CSV file.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  /* =======================
     CLOSE
  ======================= */

  const handleClose = () => {
    setFile(null);
    setValidationErrors([]);
    setPreviewData([]);
    onClose();
  };

  /* =======================
     UI (UNCHANGED)
  ======================= */

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Upload {type === "patients" ? "Patients" : "Visits"} CSV
          </DialogTitle>
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
                <div className="text-left">
                  <p className="font-medium text-foreground">
                    {file.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                    setPreviewData([]);
                    setValidationErrors([]);
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <>
                <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-foreground font-medium">
                  Click to upload or drag and drop
                </p>
                <p className="text-sm text-muted-foreground">
                  CSV files only
                </p>
              </>
            )}
          </div>

          {/* Required Columns */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm font-medium mb-2">
              Required Columns:
            </p>
            <p className="text-xs text-muted-foreground">
              {type === "patients"
                ? "patient_id, full_name, age, gender, blood_group, phone_number, email, emergency_contact, hospital_location, bmi, smoker_status, alcohol_use, chronic_conditions, registration_date, insurance_type"
                : "visit_id, patient_id, visit_date, severity_score, visit_type, length_of_stay, lab_result_glucose, lab_result_bp, previous_visit_gap_days, readmitted_within_30_days, visit_cost, doctor_name, doctor_speciality"}
            </p>
          </div>

          {/* Preview */}
          {previewData.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-success">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {previewData.length} records ready to import
                </span>
              </div>
            </div>
          )}

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="p-4 bg-destructive/10 rounded-lg space-y-2">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Validation Errors
                </span>
              </div>
              <ul className="text-xs text-destructive space-y-1 max-h-32 overflow-y-auto">
                {validationErrors.map((err, i) => (
                  <li key={i}>• {err}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={
                !file || isProcessing || validationErrors.length > 0
              }
            >
              {isProcessing
                ? "Processing..."
                : `Upload ${
                    type === "patients" ? "Patients" : "Visits"
                  }`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
