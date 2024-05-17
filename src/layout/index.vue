<template>
    <div class="h-100vh bg-red">
        <n-space vertical>
            <n-layout>
                <n-layout has-sider>
                    <n-layout-sider bordered show-trigger collapse-mode="width" :collapsed-width="82" :width="260"
                        :native-scrollbar="false" style="max-height: 100vh;">
                        <div style="display: flex;">
                            <div style="background-color: red; width: 80px; height: 100vh; flex: none">
                                
                                <div v-for="item in menuOptionss">
                                    {{ item.label }}
                                </div>
                            </div>
                            <div>
                                <n-menu v-model:value="activeKey" :root-indent="36" :indent="12" :options="menuOptions"
                                    @update:value="handleMenuSelect" />
                            </div>
                        </div>
                    </n-layout-sider>
                    <n-layout style="max-height: 100vh">
                        <n-layout-content>
                            <router-view />
                        </n-layout-content>
                    </n-layout>
                </n-layout>
            </n-layout>
        </n-space>
    </div>
</template>

<script lang="ts">
import { ref, defineComponent } from 'vue';
import { useRouter } from 'vue-router';

export default defineComponent({
    setup() {
        const router = useRouter();
        const activeKey = ref<string | null>(null);

        // 从路由器中获取路由配置，生成菜单选项
        const menuOptions = router.options.routes[1].children.map(item => ({
            label: item.name,
            key: item.path,
            children: item.children?.map(child => ({
                label: child.name, // 同上
                key: child.path
            }))
        }));

        const menuOptionss = router.options.routes.map(item => ({
            label: item.name,
            key: item.path,
        }));

        // handleMenuSelect 函数用于处理菜单项选择
        function handleMenuSelect(key: string) {
            router.push(key);
        }

        return { activeKey, menuOptions, handleMenuSelect ,menuOptionss};
    }
});
</script>
