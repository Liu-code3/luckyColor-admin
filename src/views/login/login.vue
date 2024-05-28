<script setup lang="ts">
import type { FormInst } from 'naive-ui';
import { useRouter } from 'vue-router';
import { loginApi, menuListApi } from '@/api/index';
import tool from '@/utils/tool';
import { handlMenuList } from '@/utils/handlerMenu';
// import { addRoutesWithMenu } from '@/router';

const router = useRouter();
const formRef = ref<FormInst | null>(null);
const formValue = ref({
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
    trigger: ['input', 'blur']
  }
};

type FnClick = (e: MouseEvent) => void;
const handleValidateClick: FnClick = (e: MouseEvent) => {
  e.preventDefault();
  formRef.value?.validate(async (errors) => {
    if (!errors) {
      const res = await loginApi(formValue.value);
      const { code, data } = res.data;
      if (code === 200) {
        tool.data.set('TOKEN', data);
        // 获取用户的菜单
        const res = await menuListApi({ token: data });
        tool.data.set('MENU', handlMenuList(res.data.data));
        router.push('/');
        // addRoutesWithMenu();
      }
    }
    else {
      // console.log(errors);
    }
  });
};
</script>

<template>
  <div class="login_background">
    <div class="login_function">
      <n-color-picker />
    </div>

    <div class="login_main">
      <div class="login_config">
        <img src="../../assets/imgage/Snipaste_2024-05-15_14-07-09.png" style="width: 100%;">
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
        margin: 0;
        display: block;
        margin-bottom: 21px;

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
</style>
