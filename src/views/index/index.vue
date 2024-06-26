<script setup lang="ts">

</script>

<template>
  <div class="home-page-box">
    <div class="home-page-top">
      <div>
        <div>
          <!-- <div>指标名称</div>
          <div>9,053,089</div>
          <div>自上周以来</div> -->
        </div>
      </div>
      <div />
      <div />
      <div />
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
  div {
    width: 387px;
    height: 163px;
    background-color: #fff;
    border: #dde0e7 solid 1px;
    border-radius: 6px;
    margin-right: 20px;
  }
  div:nth-child(1) {
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
  div:nth-child(4) {
    margin-right: 0;
  }
}
</style>
