<script setup lang="ts">
import { ref } from 'vue';
import { loginApi } from '@/api/index';
import { FormInst } from 'naive-ui'

const ruleForm = ref({
    adminName: 'admin',
    pwd: '123456'
});

const submitForm: () => Promise<void> = async () => {
  
};

const formRef = ref<FormInst | null>(null)
// const message = useMessage()
const formValue = ref({
    userName: '',
    password: ''
})

const rules = {
    userName: {
        required: true,
        message: '请输入账号',
        trigger: 'blur'
    },
    password: {
        required: true,
        message: '请输入密码',
        trigger: ['input', 'blur']
    }
}

const handleValidateClick = (e: MouseEvent) => {
    e.preventDefault()
    formRef.value?.validate(async(errors) => {
        if (!errors) {
            const res = await loginApi(ruleForm.value);
    console.log(res, '222222222222222222');
            // message.success('Valid')
        } else {
            console.log(errors)
            // message.error('Invalid')
        }
    })
}
</script>

<template>
    <div class="login_background">
        <div class="login_main">
            <div class="login_config"></div>
            <div class="login-form">
                <div class="login-header">欢迎来到luckyColor-admin</div>
                <n-form ref="formRef" inline :label-width="80" :model="formValue" :rules="rules">
                    <n-form-item path="userName">
                        <n-input v-model:value="formValue.userName" placeholder="请输入账号" clearable />
                    </n-form-item>
                    <n-form-item path="password">
                        <n-input v-model:value="formValue.password" placeholder="请输入密码" type="password"
                            show-password-on="mousedown" clearable />
                    </n-form-item>
                    <n-form-item>
                        <n-button attr-type="button" @click="handleValidateClick">
                            登录
                        </n-button>
                    </n-form-item>
                </n-form>
            </div>
        </div>
    </div>
</template>

<style lang="less" scoped>
.login_background {
    width: 100%;
    height: 100vh;
    background: linear-gradient(to bottom, #7fa8f4, #77a2f4, #6c9df4, #5e92f3, #558df4, #4f89f3, #4e88f2);
}

.login_main {
    width: 1000px;
    height: 560px;
    background-color: #ffffff;
    border-radius: 13px;
    position: fixed;
    top: 50%;
    left: 50%;
    margin-top: -280px;
    margin-left: -500px;
    display: flex;

    .login_config {
        width: 500px;
    }

    .login-form {
        width: 500px;

        .login-header {
            font-size: 28px;
            color: #515a6e;
        }

        .n-form {
            display: block;

            .n-form-item {
                margin: 0;
                display: block;
                margin-bottom: 21px;

                :deep(.n-input-wrapper) {
                    height: 47px !important;
                }

                :deep(.n-form-item-feedback-wrapper) {
                    display: none !important;
                }

            }

        }

    }

}
</style>
