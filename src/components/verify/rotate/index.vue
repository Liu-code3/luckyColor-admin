// src/components/RotateVerify.vue
<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';

// Props 类型定义
interface VerifyProps {
  slideImage: string[];
}

// Props 定义
const props = defineProps<VerifyProps>();

// Emits 定义
const emit = defineEmits([ 'success' ]);

// 状态管理
const state = reactive({
  isVisible: false, // 控制整体显示隐藏
  isDragging: false, // 是否正在拖动
  verifyState: false, // 验证状态
  randRot: 0, // 随机旋转角度
  currentRot: 0, // 当前旋转角度
  startX: 0, // 开始拖动的X坐标
  tipText: '向右滑动旋转图片' // 提示文本
});

// DOM引用
const canvasRef = ref<HTMLCanvasElement | null>(null);
const dragBtnRef = ref<HTMLElement | null>(null);
const controlBorRef = ref<HTMLElement | null>(null);

// Canvas相关变量
let ctx: CanvasRenderingContext2D | null = null;
const canvasSize = 200;
const img = new Image();

// 初始化Canvas
const initCanvas = () => {
  if (!canvasRef.value) return;

  ctx = canvasRef.value.getContext('2d');
  if (!ctx) return;

  // 设置随机旋转角度
  state.randRot = Math.floor(Math.random() * 240) + 30; // 30-270度之间

  // 加载图片
  img.onload = () => drawRotatedImage(state.randRot);
  img.src = props.slideImage[Math.floor(Math.random() * props.slideImage.length)];
};

// 绘制旋转后的图片
const drawRotatedImage = (degrees: number) => {
  if (!ctx || !canvasRef.value) return;

  ctx.clearRect(0, 0, canvasSize, canvasSize);

  // 保存当前状态
  ctx.save();

  // 移动到画布中心
  ctx.translate(canvasSize / 2, canvasSize / 2);

  // 旋转
  ctx.rotate(degrees * Math.PI / 180);

  // 绘制圆形裁剪区域
  ctx.beginPath();
  ctx.arc(0, 0, canvasSize / 2, 0, Math.PI * 2);
  ctx.clip();

  // 绘制图片
  ctx.drawImage(img, -canvasSize / 2, -canvasSize / 2, canvasSize, canvasSize);

  // 恢复状态
  ctx.restore();
};

// 处理鼠标按下事件
const handleMouseDown = (e: MouseEvent) => {
  if (state.verifyState) return;

  state.isDragging = true;
  state.startX = e.clientX - (dragBtnRef.value?.offsetLeft || 0);

  dragBtnRef.value?.classList.add('active');
  controlBorRef.value?.classList.add('active');

  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);
};

// 处理鼠标移动事件
const handleMouseMove = (e: MouseEvent) => {
  if (!state.isDragging) return;

  const track = dragBtnRef.value?.parentElement;
  if (!track || !dragBtnRef.value) return;

  const maxX = track.clientWidth - dragBtnRef.value.clientWidth;
  let newX = e.clientX - state.startX;
  newX = Math.max(0, Math.min(newX, maxX));

  // 更新滑块位置
  dragBtnRef.value.style.left = `${newX}px`;
  if (controlBorRef.value) {
    controlBorRef.value.style.width = `${newX + dragBtnRef.value.clientWidth}px`;
  }

  // 计算并更新旋转角度
  const progress = newX / maxX;
  const newRotation = state.randRot + (360 * progress);
  drawRotatedImage(newRotation);
  state.currentRot = newRotation;
};

// 处理鼠标松开事件
const handleMouseUp = () => {
  if (!state.isDragging) return;

  state.isDragging = false;
  dragBtnRef.value?.classList.remove('active');
  controlBorRef.value?.classList.remove('active');

  document.removeEventListener('mousemove', handleMouseMove);
  document.removeEventListener('mouseup', handleMouseUp);

  // 验证
  checkVerification();
};

// 验证结果
const checkVerification = () => {
  const targetRot = 360;
  const currentRot = state.currentRot % 360;
  const diff = Math.abs(currentRot - targetRot);

  if (diff <= 10) { // 允许10度的误差
    handleSuccess();
  }
  else {
    handleFail();
  }
};

// 处理验证成功
const handleSuccess = () => {
  state.verifyState = true;
  state.tipText = '验证成功';
  dragBtnRef.value?.classList.add('success');
  controlBorRef.value?.classList.add('success');
  emit('success', true);
};

// 处理验证失败
const handleFail = () => {
  state.verifyState = false;
  dragBtnRef.value?.classList.add('error');
  controlBorRef.value?.classList.add('error');

  setTimeout(() => {
    resetVerify();
  }, 1000);
};

// 重置验证
const resetVerify = () => {
  state.verifyState = false;
  state.currentRot = 0;
  state.tipText = '向右滑动旋转图片';

  if (dragBtnRef.value) {
    dragBtnRef.value.style.left = '0px';
    dragBtnRef.value.className = 'slider-button';
  }

  if (controlBorRef.value) {
    controlBorRef.value.style.width = '40px';
    controlBorRef.value.className = 'slider-bar';
  }

  initCanvas();
};

// 显示验证码
const show = () => {
  state.isVisible = true;
  // 使用setTimeout让resetVerify在下一个事件循环执行
  // 这样确保DOM已更新且有足够时间加载图片
  setTimeout(() => {
    resetVerify();
  }, 1000)
};

// 隐藏验证码
const hide = () => {
  state.isVisible = false;
};

// 生命周期钩子
onMounted(() => {
  initCanvas();
});

// 暴露方法
defineExpose({
  show,
  hide,
  resetVerify
});
</script>

<template>
  <div v-if="state.isVisible" class="verify-mask" @click="hide" />
  <div v-if="state.isVisible" class="verify-content" @click.stop>
    <div class="verify-header">
      <span>请完成验证</span>
      <span class="close-icon" @click="hide">×</span>
    </div>

    <div class="verify-body">
      <canvas
        ref="canvasRef"
        class="rotate-canvas"
        :width="200"
        :height="200"
      />

      <div class="verify-slider">
        <div class="slider-track">
          <div
            ref="dragBtnRef"
            class="slider-button"
            @mousedown="handleMouseDown"
          >
            <i class="slider-icon" />
          </div>
          <div ref="controlBorRef" class="slider-bar" />
          <span class="slider-text">{{ state.tipText }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.verify-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

.verify-content {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  width: 320px;
  z-index: 1000;

  .verify-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .close-icon {
      cursor: pointer;
      font-size: 20px;
      color: #999;

      &:hover {
        color: #666;
      }
    }
  }

  .verify-body {
    .rotate-canvas {
      width: 200px;
      height: 200px;
      margin: 0 auto 20px;
      display: block;
      border-radius: 50%;
    }

    .verify-slider {
      margin-top: 20px;

      .slider-track {
        position: relative;
        height: 40px;
        background: #f5f5f5;
        border-radius: 20px;

        .slider-button {
          position: absolute;
          left: 0;
          top: 0;
          width: 40px;
          height: 40px;
          background: #fff;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          z-index: 2;

          &.active {
            background: #1890ff;
          }

          &.success {
            background: #52c41a;
          }

          &.error {
            background: #ff4d4f;
          }

          .slider-icon {
            display: block;
            width: 20px;
            height: 20px;
            margin: 10px auto;
            background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="%23666" d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>');
            background-size: contain;
          }
        }

        .slider-bar {
          position: absolute;
          left: 0;
          top: 0;
          height: 100%;
          width: 40px;
          background: #e6f7ff;
          border-radius: 20px;

          &.active {
            background: #bae7ff;
          }

          &.success {
            background: #f6ffed;
          }

          &.error {
            background: #fff1f0;
          }
        }

        .slider-text {
          position: absolute;
          left: 0;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          text-align: center;
          color: #999;
          font-size: 14px;
          user-select: none;
          z-index: 1;
        }
      }
    }
  }
}

@media screen and (max-width: 768px) {
  .verify-content {
    width: 90%;
    max-width: 320px;
  }
}
</style>
