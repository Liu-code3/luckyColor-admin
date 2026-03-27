import type { CodegenTableSchema } from './model';
import { cloneCodegenTable } from './model';

const codegenPreviewDraft = ref<CodegenTableSchema | null>(null);

export function useCodegenPreviewDraft() {
  return codegenPreviewDraft;
}

export function setCodegenPreviewDraft(draft: CodegenTableSchema) {
  codegenPreviewDraft.value = cloneCodegenTable(draft);
}
