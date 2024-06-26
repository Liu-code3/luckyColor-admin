<script setup lang="ts">

</script>

<template>
  <div class="home-page-box">
    <div class="home-page-top">
      <div class="home-page—show-box home-page—show">
        <div>指标名称</div>
        <div>9,053,089</div>
        <div>自上周以来</div>
      </div>
      <div class="home-page—show-box">
        <div>活跃用户</div>
        <div>5,089</div>
        <div>自上周以来</div>
      </div>
      <div class="home-page—show-box">
        <div>指标名称</div>
        <div>9,053,089</div>
        <div>自上周以来</div>
      </div>
      <div class="home-page—show-box">
        <div>指标名称</div>
        <div>9,053,089</div>
        <div>自上周以来</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-page-box {
  padding: 20px;
}
.home-page-top {
  width: 100%;
  display: flex;
  justify-content: space-between;

  .home-page—show-box {
    width: 387px;
    height: 163px;
    background-color: #fff;
    border: #dde0e7 solid 1px;
    border-radius: 6px;
    margin-right: 20px;
    padding: 15px 15px 20px 15px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    div:nth-child(1) {
      font-size: 14px;
    }
    div:nth-child(2) {
      font-size: 24px;
    }
  }

  .home-page—show {
    color: #fff;
    background: linear-gradient(
      to right,
      #90b4f6,
      #7ba6f5,
      #6798f4,
      #5e92f3,
      #558df4,
      #4f89f3,
      #4e88f2
    );
  }
}
</style>
