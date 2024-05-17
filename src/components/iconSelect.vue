<script setup lang="ts">
import { Icon } from '@iconify/vue';
import iconData from '@/config/iconSelect';
import { message } from '@/utils/message';

const modelValue = ref('');
const iconItemDefault = ref('default');
// 选择图标后
function selectIcon(value: string) {
  message.success(`<${value} />`);
}
</script>

<template>
  <n-card title="图标选择" class="p-3">
    <n-tabs type="line" animated>
      <template v-for="item of iconData.icons" :key="item.key">
        <n-tab-pane :name="item.name" :tab="item.name">
          <template v-for="iconItemIns of item.iconItem" :key="iconItemIns.key">
            <div v-if="iconItemIns.key === iconItemDefault" class="xn-icon-select-list">
              <ul>
                <template v-if="item.name === '扩展'">
                  <li
                    v-for="icon of iconItemIns.item"
                    :key="icon"
                    :class="icon === modelValue ? 'active' : ''"
                    @click="selectIcon(icon)"
                  >
                    <component :is="icon" class="xn-icons" />
                  </li>
                </template>
                <template v-else>
                  <li
                    v-for="icon of iconItemIns.item"
                    :key="icon"
                    :class="icon === modelValue ? 'active' : ''"
                    @click="selectIcon(icon)"
                  >
                    <Icon :icon="icon" class="xn-icons" />
                  </li>
                </template>
              </ul>
            </div>
          </template>
        </n-tab-pane>
      </template>
    </n-tabs>
  </n-card>
</template>

<style scoped>
.xn-icon-select-radio {
  padding-left: 5px;
  padding-bottom: 10px;
}

.xn-icons {
  font-size: 26px;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.xn-icon-select-list {
  height: 360px;
  overflow: auto;
}

.xn-icon-select-list ul li {
  display: inline-block;
  width: 60px;
  height: 60px;
  padding: 18px;
  margin: 5px;
  border-radius: 2px;
  vertical-align: top;
  box-shadow: 0 0 0 1px #d9d9d9;
  transition: all 0.1s;
  position: relative;
}

.xn-icon-select-list ul li:hover,
.xn-icon-select-list ul li.active {
  cursor: pointer;
  color: #ffffff;
  background-color: pink;
}
</style>
