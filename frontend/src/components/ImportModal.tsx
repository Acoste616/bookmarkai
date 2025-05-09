import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { bookmarkUtils } from "@/lib/bookmarkUtils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ImportModalShell } from "./import/ImportModalShell";
import { ImportForm } from "./import/ImportForm";
import { ImportPreview } from "./import/ImportPreview";
import { ImportActions } from "./import/ImportActions";

type ImportModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function ImportModal({ isOpen, onClose }: ImportModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState("xApi");
  const [text, setText] = useState("");
  const [preview, setPreview] = useState<any[] | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  // Mutacje importu
  const { mutate: mutateFile, isPending: isFilePending } = useMutation({
    mutationFn: (formData: FormData) => bookmarkUtils.importFromX(formData),
    onSuccess: () => {
      toast({ title: "Success", description: "Bookmarks imported successfully" });
      setFile(null); onClose();
      queryClient.invalidateQueries({ queryKey: ["/api/bookmarks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/network"] });
      queryClient.invalidateQueries({ queryKey: ["/api/categories/stats"] });
    },
    onError: (error) => {
      toast({ title: "Error", description: `Failed to import bookmarks: ${error.message}`, variant: "destructive" });
    },
  });
  const { mutate: mutateText, isPending: isTextPending } = useMutation({
    mutationFn: (data: { text: string; auto_categorize: boolean }) => bookmarkUtils.importFromText(data.text, data.auto_categorize),
    onSuccess: (data) => {
      toast({ title: "Success", description: `Successfully imported ${data.count} bookmarks` });
      setText(""); setPreview(null); onClose();
      queryClient.invalidateQueries({ queryKey: ["/api/bookmarks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/network"] });
      queryClient.invalidateQueries({ queryKey: ["/api/categories/stats"] });
    },
    onError: (error) => {
      toast({ title: "Error", description: `Failed to import bookmarks: ${error.message}`, variant: "destructive" });
    },
  });

  // Handlery pliku
  const handleFileChange = (file: File) => setFile(file);
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) setFile(droppedFile);
  };

  // Handlery tekstu
  const handleTextChange = (val: string) => setText(val);

  // Import z pliku
  const handleFileImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast({ title: "Error", description: "Please select a file to import", variant: "destructive" });
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    mutateFile(formData);
  };

  // Import z tekstu
  const handleTextImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      toast({ title: "Error", description: "Please enter at least one URL", variant: "destructive" });
      return;
    }
    mutateText({ text, auto_categorize: true });
  };

  // Undo/reset
  const handleUndo = () => {
    setFile(null); setText(""); setPreview(null); setErrors([]);
  };

  // Podgląd (przykładowa logika, można rozbudować)
  const handlePreview = () => {
    if (activeTab === "file" && file) {
      // Przykład: odczytaj plik i pokaż podgląd (tylko JSON)
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          setPreview(Array.isArray(data) ? data : [data]);
          setErrors([]);
        } catch (err) {
          setPreview(null);
          setErrors(["Invalid JSON file"]);
        }
      };
      reader.readAsText(file);
    } else if (activeTab === "text" && text) {
      const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
      setPreview(lines.map(url => ({ url })));
      setErrors([]);
    }
  };

  // Akcje do przekazania do ImportActions
  const actionsProps = {
    loading: isFilePending || isTextPending,
    onStart: activeTab === "file" ? handleFileImport : handleTextImport,
    onUndo: handleUndo,
    onCancel: onClose,
  };

  return (
    <ImportModalShell isOpen={isOpen} onClose={onClose} activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === "file" && (
        <>
          <ImportForm
            mode="file"
            file={file}
            isDragging={isDragging}
            onFileChange={handleFileChange}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onSubmit={handleFileImport}
          >
            <ImportActions {...actionsProps} />
          </ImportForm>
          <ImportPreview bookmarks={preview || []} errors={errors}>
            <button type="button" className="text-xs underline mt-2" onClick={handlePreview}>Preview file</button>
          </ImportPreview>
        </>
      )}
      {activeTab === "text" && (
        <>
          <ImportForm
            mode="text"
            text={text}
            onTextChange={handleTextChange}
            onSubmit={handleTextImport}
          >
            <ImportActions {...actionsProps} />
          </ImportForm>
          <ImportPreview bookmarks={preview || []} errors={errors}>
            <button type="button" className="text-xs underline mt-2" onClick={handlePreview}>Preview URLs</button>
          </ImportPreview>
        </>
      )}
      {activeTab === "xApi" && (
        <div className="text-sm text-muted-foreground mb-4">X API import is not implemented in this demo.</div>
      )}
    </ImportModalShell>
  );
}

export default ImportModal; 