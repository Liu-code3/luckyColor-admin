<script setup lang="ts">

</script>

<template>
  <div class="home-page-box">
    <div class="home-page-top">
      <div class="home-page—show-box home-page—show" border="1px solid light_border dark:dark_border">
        <div>指标名称</div>
        <div>9,053,089</div>
        <div>自上周以来</div>
      </div>
      <div class="home-page—show-box" border="1px solid light_border dark:dark_border">
        <div>指标名称</div>
        <div>5,089</div>
        <div>自上周以来</div>
      </div>
      <div class="home-page—show-box" border="1px solid light_border dark:dark_border">
        <div>指标名称</div>
        <div>9,053,089</div>
        <div>自上周以来</div>
      </div>
      <div class="home-page—show-box" border="1px solid light_border dark:dark_border">
        <div>指标名称</div>
        <div>9,053,089</div>
        <div>自上周以来</div>
      </div>
    </div>
    <div class="home-page-middle">
      <div class="area-chart" border="1px solid light_border dark:dark_border">
        <div class="area-chart-title layout-center pl-20px" border-b="1px solid light_border dark:dark_border">
          指标名称-面积图
        </div>
      </div>
      <div class="pie-chart" border="1px solid light_border dark:dark_border">
        2
      </div>
    </div>
    <div class="home-page-area-chart" border="1px solid light_border dark:dark_border">
      <div class="area-chart-title layout-center pl-20px" border-b="1px solid light_border dark:dark_border">
        指标名称-面积图
      </div>
    </div>
    <div class="home-page-tail" border="1px solid light_border dark:dark_border">
      敏公主: 1998888777
    </div>
  </div>
</template>

<style lang="scss" scoped>
.home-page-top {
  width: 100%;
  display: flex;
  justify-content: space-between;

  .home-page—show-box {
    width: 387px;
    height: 163px;
    border-radius: 6px;
    margin-left: 10px;
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
    margin-left: 0;
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

.home-page-middle {
  display: flex;
  margin-top: 10px;
  .area-chart {
    width: 935px;
    height: 240px;
    border-radius: 6px;
    margin-right: 10px;
    .area-chart-title {
      width: 100%;
      height: 50px;
      box-sizing: border-box;
    }
  }
  .pie-chart {
    height: 240px;
    border-radius: 6px;
    flex: 1;
  }
}
.home-page-area-chart {
  width: 100%;
  height: 240px;
  border-radius: 6px;
  margin-top: 10px;
  .area-chart-title {
    width: 100%;
    height: 50px;
    box-sizing: border-box;
  }
}
.home-page-buttom {
  display: flex;
  margin-top: 10px;
  .area-chart {
    width: 935px;
    height: 240px;
    border-radius: 6px;
    margin-right: 10px;
    .area-chart-title {
      width: 100%;
      height: 50px;
      box-sizing: border-box;
    }
  }
  .area-chart:nth-child(2) {
    margin-right: 0;
  }
}
.home-page-tail {
  width: 100%;
  height: 50px;
  border-radius: 4px;
  box-sizing: border-box;
  margin-top: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
