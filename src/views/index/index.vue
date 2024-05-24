<script setup lang="ts">
import SignaturePad from 'signature_pad';
import { message } from '@/utils/message';

const canvasRef = ref<HTMLCanvasElement>();
const canvasWrapperRef = ref<HTMLDivElement>();
const signaturePad = ref<SignaturePad>();
onMounted(() => {
  signaturePad.value = new SignaturePad(canvasRef.value!, {
    minWidth: 0.1,
    penColor: 'rgb(66, 133, 244)'
  });
});

const openInWindow: () => void = () => {
  if (!canvasRef.value) return;

  const externalWin = window.open('', '', `width=${canvasRef.value.width / window.devicePixelRatio},height=${canvasRef.value.height / window.devicePixelRatio}`);
  canvasRef.value.style.width = '100%';
  canvasRef.value.style.height = '100%';
  externalWin!.onresize = resizeCanvas;
  externalWin!.document.body.style.margin = '0';
  externalWin!.document.body.appendChild(canvasRef.value);
  canvasWrapperRef.value?.classList.add('empty');
  externalWin!.onbeforeunload = () => {
    canvasRef.value!.style.width = '';
    canvasRef.value!.style.height = '';
    canvasWrapperRef.value!.appendChild(canvasRef.value!);
    canvasWrapperRef.value?.classList.remove('empty');
    resizeCanvas();
  };
};

function resizeCanvas() {
  if (!canvasRef.value) return;

  const ratio = Math.max(window.devicePixelRatio || 1, 1);
  canvasRef.value.width = (canvasRef.value.offsetWidth) * ratio;
  canvasRef.value.height = (canvasRef.value.offsetHeight) * ratio;
  canvasRef.value.getContext('2d')!.scale(ratio, ratio);
  if (!signaturePad.value) return;
  signaturePad.value.fromData(signaturePad.value.toData());
}

function saveAsImg(type = 'jpg') {
  if (signaturePad.value?.isEmpty()) {
    message.error('请先签名');
  }
  else {
    const dataURL = signaturePad.value!.toDataURL('image/jpeg');
    download(dataURL, `signature.${type}`);
  }
}

function saveAsSvg() {
  if (signaturePad.value?.isEmpty()) {
    message.error('请先签名');
  }
  else {
    const dataURL = signaturePad.value!.toDataURL('image/svg+xml');
    download(dataURL, `signature.svg`);
  }
}

function saveSVGWithBackground() {
  if (signaturePad.value?.isEmpty()) {
    message.error('请先签名');
  }
  else {
    const dataURL = signaturePad.value!.toDataURL('image/svg+xml', { includeBackgroundColor: true });
    download(dataURL, 'signature.svg');
  }
}

function dataURLToBlob(dataURL: string) {
  // Code taken from https://github.com/ebidel/filer.js
  const parts = dataURL.split(';base64,');
  const contentType = parts[0].split(':')[1];
  const raw = window.atob(parts[1]);
  const rawLength = raw.length;
  const uInt8Array = new Uint8Array(rawLength);

  for (let i = 0; i < rawLength; ++i)
    uInt8Array[i] = raw.charCodeAt(i);

  return new Blob([uInt8Array], { type: contentType });
}

function download(dataURL: string, filename: string) {
  const blob = dataURLToBlob(dataURL);
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename;

  document.body.appendChild(a);
  a.click();

  window.URL.revokeObjectURL(url);
}
</script>

<template>
  <div>
    <div ref="canvasWrapperRef" class="canvas-wrapper">
      <canvas ref="canvasRef" class="border_xy" />
    </div>
    <button @click="openInWindow">
      open new Window
    </button>
    <button @click="signaturePad?.clear()">
      clear
    </button>
    <button @click="saveAsImg('png')">
      save as png
    </button>
    <button @click="saveAsImg('jpg')">
      save as jpg
    </button>
    <button @click="saveAsSvg">
      save as svg
    </button>
    <button @click="saveSVGWithBackground">
      save as svg with background
    </button>
  </div>
</template>

<style scoped>
.canvas-wrapper {
  max-width: 300px;
  border: 1px solid #f4f4f4;
  border-radius: 4px;
  padding: 10px;
  box-shadow:
    0 1px 4px rgba(0, 0, 0, 0.27),
    0 0 40px rgba(0, 0, 0, 0.08) inset;
}
.border_xy {
  border: 1px solid #000;
}

.canvas-wrapper.empty {
  background-color: #000;
}
</style>
