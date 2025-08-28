import { useCallback, useState } from "react";
import {
  clearAllTemplates,
  exportTemplatesToFile,
  getClientTemplates,
  getCompanyTemplates,
  importTemplatesFromFile,
} from "./storage";

export interface TemplateManagerState {
  isImporting: boolean;
  isExporting: boolean;
  isClearing: boolean;
  lastImportResult: {
    success: boolean;
    message: string;
    importedCompanyCount?: number;
    importedClientCount?: number;
  } | null;
  error: string | null;
}

export function useTemplateManager() {
  const [state, setState] = useState<TemplateManagerState>({
    isImporting: false,
    isExporting: false,
    isClearing: false,
    lastImportResult: null,
    error: null,
  });

  const exportTemplates = useCallback(async () => {
    setState((prev) => ({ ...prev, isExporting: true, error: null }));

    try {
      exportTemplatesToFile();
      setState((prev) => ({ ...prev, isExporting: false }));
    } catch (error) {
      console.error("Export error:", error);
      setState((prev) => ({
        ...prev,
        isExporting: false,
        error: "Greška pri eksportovanju šablona",
      }));
    }
  }, []);

  const importTemplates = useCallback(async (file: File) => {
    setState((prev) => ({
      ...prev,
      isImporting: true,
      error: null,
      lastImportResult: null,
    }));

    try {
      const result = await importTemplatesFromFile(file);
      setState((prev) => ({
        ...prev,
        isImporting: false,
        lastImportResult: result,
        error: result.success ? null : result.message,
      }));
      return result;
    } catch (error) {
      console.error("Import error:", error);
      const errorResult = {
        success: false,
        message: "Neočekivana greška pri importovanju",
      };
      setState((prev) => ({
        ...prev,
        isImporting: false,
        lastImportResult: errorResult,
        error: errorResult.message,
      }));
      return errorResult;
    }
  }, []);

  const clearTemplates = useCallback(async () => {
    setState((prev) => ({ ...prev, isClearing: true, error: null }));

    try {
      clearAllTemplates();
      setState((prev) => ({ ...prev, isClearing: false }));
    } catch (error) {
      console.error("Clear error:", error);
      setState((prev) => ({
        ...prev,
        isClearing: false,
        error: "Greška pri brisanju šablona",
      }));
    }
  }, []);

  const getTemplateStats = useCallback(() => {
    const companyCount = getCompanyTemplates().length;
    const clientCount = getClientTemplates().length;
    return { companyCount, clientCount, total: companyCount + clientCount };
  }, []);

  const clearLastImportResult = useCallback(() => {
    setState((prev) => ({ ...prev, lastImportResult: null, error: null }));
  }, []);

  return {
    ...state,
    exportTemplates,
    importTemplates,
    clearTemplates,
    getTemplateStats,
    clearLastImportResult,
  };
}
