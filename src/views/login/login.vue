<script setup lang="ts">
import type { FormInst } from 'naive-ui';
import { useRouter } from 'vue-router';
import { loginApi, menuListApi } from '@/api';
import { AUTH_STORAGE_KEYS } from '@/constants/auth';
import tool from '@/utils/tool';
import { setAccessToken, setCurrentUserInfo } from '@/utils/auth';
import { handlMenuList } from '@/utils/handlerMenu';
// import { addRoutesWithMenu } from '@/router';
import { Encrypt } from '@/utils/crypto-md5';
import { useMenuStore } from '@/store/modules/menu.ts';
import RotateVerify from '@/components/verify/rotate/index.vue';
import { message } from '@/utils/message.ts';

const router = useRouter();
const menuStore = useMenuStore();
const formRef = ref<FormInst | null>(null);
const formValue = reactive({
  adminName: 'admin',
  password: '123456'
});

const rules = {
  adminName: {
    required: true,
    message: '请输入账号',
    trigger: 'blur'
  },
  password: {
    required: true,
    message: '请输入密码',
    trigger: [ 'input', 'blur' ]
  }
};
const rotateVerifyRef = ref<InstanceType<typeof RotateVerify>>();
const setVerify = () => {
  // 使用暴露的show方法
  rotateVerifyRef.value?.show();
};
const slideImages = ref([
  'http://codegen.caihongy.cn/20231007/1bd4fe88e21a4641a3208a7d783cbf6d.jpg',
  'http://codegen.caihongy.cn/20231007/605d68174b8a49959b82f364194a9ba0.jpg',
  'http://codegen.caihongy.cn/20231007/6e13a48b74c940118f00f2d28de337c3.jpg'
]);
// 验证成功回调
const handleVerifySuccess = (state: boolean) => {
  if (!state) {
    message.error('验证失败');
    return;
  }

  formRef.value?.validate(async (errors) => {
    if (!errors) {
      const res = await loginApi(formValue);
      // TODO 理解VO 于 TO 的区别 返回值类型做一下
      const { code, data } = res;
      if (code === 200) {
        setAccessToken(data);
        setCurrentUserInfo({
          username: formValue.adminName,
          displayName: formValue.adminName,
          buttonCodeList: []
        });
        // 获取用户的菜单
        const res = await menuListApi({ token: data });
        const menuTree = handlMenuList(res.data);
        const md5Password = Encrypt(formValue.password);
        tool.data.set(AUTH_STORAGE_KEYS.lockScreenPassword, md5Password);
        menuStore.initializeRoutesWithMenu(menuTree);
        await router.push('/');
      }
    }
    else {
      // console.log(errors);
    }
  });
  // 延迟关闭验证框
  setTimeout(() => {
    rotateVerifyRef.value?.hide();
  }, 2500);
};
const handleValidateClick = () => {
  setVerify();
};
</script>

<template>
  <div class="login_background">
    <div class="login_function">
      <n-color-picker />
    </div>

    <div class="login_main">
      <div class="login_config">
        <img src="@/assets/images/Snipaste.png" style="width: 100%;" alt="">
      </div>
      <div class="login-form">
        <div class="login-header">
          <div>hello !</div>
          <div>欢迎来到luckyColor-admin</div>
        </div>
        <n-form ref="formRef" inline :label-width="80" :model="formValue" :rules="rules">
          <n-form-item path="adminName">
            <n-input v-model:value="formValue.adminName" placeholder="请输入账号" clearable />
          </n-form-item>
          <n-form-item path="password">
            <n-input
              v-model:value="formValue.password" placeholder="请输入密码" type="password"
              show-password-on="mousedown" clearable
            />
          </n-form-item>
          <n-form-item>
            <div class="login_button">
              <n-button attr-type="button" @click="handleValidateClick">
                登 录
              </n-button>
              <n-button attr-type="button" @click="handleValidateClick">
                注 册
              </n-button>
            </div>
          </n-form-item>
        </n-form>
      </div>
    </div>

    <RotateVerify
      ref="rotateVerifyRef"
      :slide-image="slideImages"
      @success="handleVerifySuccess"
    />
  </div>
</template>

<style lang="less" scoped>
.login_background {
  width: 100%;
  height: 100vh;
  background: linear-gradient(
    to bottom,
    #7fa8f4,
    #77a2f4,
    #6c9df4,
    #5e92f3,
    #558df4,
    #4f89f3,
    #4e88f2
  );
}

.login_function {
  width: 70px;
  height: 35px;
  background-color: #fff;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 5px;
  box-sizing: border-box;
  position: fixed;
  top: 20px;
  right: 20px;

  :deep(.n-color-picker) {
    width: 28px;
    height: 28px;
  }

  :deep(.n-color-picker-trigger) {
    border: none !important;
  }

  :deep(.n-color-picker-trigger__value) {
    display: none;
  }
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
    width: 550px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .login-form {
    width: 450px;
    padding: 0 40px 0 60px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    .login-header {
      width: 100%;
      text-align: left;

      div:nth-child(1) {
        font-size: 48px;
        color: #515a6e;
      }

      div:nth-child(2) {
        font-size: 28px;
        color: #515a6e;
        margin-bottom: 30px;
      }
    }

    .n-form {
      display: block;

      .n-form-item {
        display: block;
        margin: 0 0 21px;

        :deep(.n-input-wrapper) {
          height: 47px !important;
          border-radius: 5px;

          .n-input__input-el {
            height: 47px !important;
          }
        }

        .login_button {
          width: 100%;
        }

        .n-button {
          width: 100%;
          height: 47px !important;
          background-color: #4e88f3;
          color: #ffffff;
          border-radius: 5px;
          margin-bottom: 10px;
        }

        .n-button:nth-child(2) {
          width: 60px;
          height: 36px !important;
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        :deep(.n-form-item-feedback-wrapper) {
          display: none !important;
        }
      }
    }
  }
}

.verify_fixed {
  position: absolute;
  top: 100px;
  left: 100px;
  bottom: 100px;
  right: 100px;
  background-color: #4e88f2;
  z-index: 999;
}
</style>
