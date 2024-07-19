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
        <div>指标名称</div>
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
    <div class="home-page-middle">
      <div class="area-chart">
        <div class="area-chart-title layout-center pl-20px">
          指标名称-面积图
        </div>
      </div>
      <div class="pie-chart">
        2
      </div>
    </div>
    <div class="home-page-area-chart">
      <div class="area-chart-title layout-center pl-20px">
        指标名称-面积图
      </div>
    </div>
    <div class="home-page-bottom">
      <div class="area-chart">
        <div class="area-chart-title layout-center pl-20px">
          指标名称-面积图
        </div>
      </div>
      <div class="area-chart">
        <div class="area-chart-title layout-center pl-20px">
          指标名称-面积图
        </div>
      </div>
    </div>
    <div class="home-page-tail">
      敏公主: 1998888777
    </div>
  </div>
</template>

<style lang="less" scoped>
.home-page-top {
  width: 100%;
  display: flex;
  justify-content: space-between;

  .home-page—show-box {
    width: 387px;
    height: 163px;
    border: 1px solid var(--primary-color);
    border-radius: 6px;
    margin-left: 10px;
    padding: 15px 15px 20px 15px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background-color: var(--theme-background);
    color: var(--theme-color);
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
    border: 1px solid #dde0e7;
    background-color: var(--theme-background);
    .area-chart-title {
      width: 100%;
      height: 50px;
      border-bottom: #e4e7ed solid 1px;
      box-sizing: border-box;
      color: var(--theme-color);
    }
  }
  .pie-chart {
    flex: 1;
    height: 240px;
    border-radius: 6px;
    border: 1px solid #dde0e7;
    color: var(--theme-color);
    background-color: var(--theme-background);
  }
}
.home-page-area-chart {
  width: 100%;
  height: 240px;
  border-radius: 6px;
  margin-top: 10px;
  border: 1px solid #dde0e7;
  background-color: var(--theme-background);
  color: var(--theme-color);
  .area-chart-title {
    width: 100%;
    height: 50px;
    border-bottom: #e4e7ed solid 1px;
    box-sizing: border-box;
  }
}
.home-page-bottom {
  display: flex;
  margin-top: 10px;
  .area-chart {
    width: 935px;
    height: 240px;
    border-radius: 6px;
    margin-right: 10px;
    border: #dde0e7 solid 1px;
    color: var(--theme-color);
    background-color: var(--theme-background);
    .area-chart-title {
      width: 100%;
      height: 50px;
      border-bottom: #e4e7ed solid 1px;
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
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  border: 1px solid #dde0e7;
  box-sizing: border-box;
  margin-top: 10px;
  color: var(--theme-color);
  background-color: var(--theme-background);
}
</style>
