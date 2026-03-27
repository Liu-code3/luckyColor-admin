<script setup lang="ts">
import { Icon } from '@iconify/vue';

interface Props {
  type?: 'empty' | 'error';
  title?: string;
  description: string;
  compact?: boolean;
  actionText?: string;
  actionType?: 'default' | 'primary' | 'warning' | 'error';
}

const props = withDefaults(defineProps<Props>(), {
  type: 'empty',
  title: '',
  compact: false,
  actionText: '',
  actionType: 'primary'
});

const emit = defineEmits<{
  action: [];
}>();

const iconName = computed(() =>
  props.type === 'error' ? 'solar:shield-warning-outline' : 'solar:inbox-line-outline'
);

const resolvedTitle = computed(() => {
  if (props.title) {
    return props.title;
  }

  return props.type === 'error' ? '当前内容暂时不可用' : '当前没有可展示的数据';
});

function handleAction() {
  emit('action');
}
</script>

<template>
  <section
    class="platform-state"
    :class="[
      `platform-state--${type}`,
      {
        'platform-state--compact': compact
      }
    ]"
  >
    <div class="platform-state__icon">
      <Icon :icon="iconName" />
    </div>

    <div class="platform-state__content">
      <strong>{{ resolvedTitle }}</strong>
      <p>{{ description }}</p>
    </div>

    <div v-if="$slots.default || actionText" class="platform-state__actions">
      <slot>
        <n-button :type="actionType" secondary size="small" @click="handleAction">
          {{ actionText }}
        </n-button>
      </slot>
    </div>
  </section>
</template>

<style scoped lang="less">
.platform-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 176px;
  padding: 24px 20px;
  border-radius: 18px;
  border: 1px dashed rgba(148, 163, 184, 0.28);
  background:
    radial-gradient(circle at top, rgba(255, 255, 255, 0.96), rgba(248, 250, 252, 0.92)),
    linear-gradient(180deg, rgba(255, 255, 255, 0.86), rgba(241, 245, 249, 0.84));
  text-align: center;
}

.platform-state--compact {
  min-height: 132px;
  padding: 18px 14px;
  border-radius: 14px;
}

.platform-state__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 18px;
  background: rgba(15, 23, 42, 0.05);
  color: #475569;
  font-size: 26px;
}

.platform-state--error .platform-state__icon {
  background: rgba(245, 158, 11, 0.12);
  color: #d97706;
}

.platform-state__content {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-width: 440px;
}

.platform-state__content strong {
  font-size: 16px;
  line-height: 1.3;
}

.platform-state__content p {
  margin: 0;
  color: var(--text-color-2);
  line-height: 1.7;
}

.platform-state__actions {
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
}

.platform-state--compact .platform-state__icon {
  width: 46px;
  height: 46px;
  border-radius: 14px;
  font-size: 22px;
}

.platform-state--compact .platform-state__content strong {
  font-size: 15px;
}

.platform-state--compact .platform-state__content p {
  font-size: 13px;
}
</style>
