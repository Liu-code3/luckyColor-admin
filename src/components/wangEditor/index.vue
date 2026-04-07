<script setup lang="ts">
import type { IDomEditor } from '@wangeditor/editor';
import { Editor, Toolbar } from '@wangeditor/editor-for-vue';
import FileAPI from '@/api/file.ts';
import {
  collectProtectedFileUrls,
  createProtectedFileObjectUrl,
  revokeProtectedFileObjectUrls
} from '@/utils/protectedFile';

type InsertFn = (url: string, alt?: string, href?: string) => void;

const props = defineProps({
  modelValue: {
    type: [String],
    default: ''
  }
});

const emits = defineEmits(['update:modelValue']);

const editorRef = shallowRef(); // 编辑器实例。必须使用 shallowRef
const mode = ref('default'); // 编辑器模式
const toolbarConfig = ref({}); // 工具条配置
const editorHtml = ref('');
const lastSyncedHtml = ref('');
const hydrationVersion = ref(0);
const objectUrlToPersistedUrl = new Map<string, string>();

function resetProtectedObjectUrls() {
  revokeProtectedFileObjectUrls(objectUrlToPersistedUrl.keys());
  objectUrlToPersistedUrl.clear();
}

function restoreProtectedFileUrls(html: string) {
  let restoredHtml = html;
  for (const [ objectUrl, persistedUrl ] of objectUrlToPersistedUrl.entries()) {
    restoredHtml = restoredHtml.replaceAll(objectUrl, persistedUrl);
  }
  return restoredHtml;
}

async function hydrateEditorHtml(rawHtml: string) {
  const currentHydration = ++hydrationVersion.value;
  resetProtectedObjectUrls();

  let nextHtml = rawHtml;
  for (const fileUrl of collectProtectedFileUrls(rawHtml)) {
    try {
      const resolvedFile = await createProtectedFileObjectUrl(fileUrl);
      if (!resolvedFile || currentHydration !== hydrationVersion.value) {
        continue;
      }
      objectUrlToPersistedUrl.set(resolvedFile.objectUrl, resolvedFile.persistedUrl);
      nextHtml = nextHtml.replaceAll(fileUrl, resolvedFile.objectUrl);
    }
    catch {
      continue;
    }
  }

  if (currentHydration === hydrationVersion.value) {
    editorHtml.value = nextHtml;
  }
}

watch(
  () => props.modelValue,
  (value) => {
    const nextHtml = value || '';
    if (nextHtml === lastSyncedHtml.value) {
      return;
    }
    lastSyncedHtml.value = nextHtml;
    void hydrateEditorHtml(nextHtml);
  },
  { immediate: true }
);

// 编辑器配置
const editorConfig = ref({
  placeholder: '请输入内容...',
  MENU_CONF: {
    uploadImage: {
      // 自定义图片上传
      async customUpload(file: File, insertFn: InsertFn) {
        const uploaded = await FileAPI.upload(file);
        const resolvedFile = await createProtectedFileObjectUrl(uploaded.relativePath || uploaded.url);

        if (resolvedFile) {
          objectUrlToPersistedUrl.set(resolvedFile.objectUrl, resolvedFile.persistedUrl);
          insertFn(resolvedFile.objectUrl, resolvedFile.persistedUrl, resolvedFile.persistedUrl);
          return;
        }

        insertFn(uploaded.url, uploaded.url, uploaded.url);
      }
    }
  }
});

function handleCreated(editor: IDomEditor) {
  editorRef.value = editor; // 记录 editor 实例，重要！
}
function handleChange(editor: IDomEditor) {
  const restoredHtml = restoreProtectedFileUrls(editor.getHtml());
  lastSyncedHtml.value = restoredHtml;
  emits('update:modelValue', restoredHtml);
}
// 组件销毁时，也及时销毁编辑器
onBeforeUnmount(() => {
  hydrationVersion.value++;
  resetProtectedObjectUrls();
  const editor = editorRef.value;
  if (editor == null) return;
  editor.destroy();
});
</script>

<template>
  <div class="editor-wrapper">
    <!-- 工具栏 -->
    <Toolbar
      id="toolbar-container"
      :editor="editorRef"
      :default-config="toolbarConfig"
      :mode="mode"
    />
    <!-- 编辑器 -->
    <Editor
      id="editor-container"
      v-model="editorHtml"
      :default-config="editorConfig"
      :mode="mode"
      @on-change="handleChange"
      @on-created="handleCreated"
    />
  </div>
</template>

<style src="@wangeditor/editor/dist/css/style.css"></style>
