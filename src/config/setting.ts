const colorList = [
  {
    key: '薄暮',
    color: '#F5222D'
  },
  {
    key: '火山',
    color: '#FA541C'
  },
  {
    key: '胭脂粉',
    color: '#EB2F96'
  },
  {
    key: '日暮',
    color: '#FAAD14'
  },
  {
    key: '明青',
    color: '#13C2C2'
  },
  {
    key: '极光绿',
    color: '#52C41A'
  },
  {
    key: '深绿',
    color: '#009688'
  },
  {
    key: '拂晓蓝',
    color: '#4890F7'
  },
  {
    key: '极客蓝',
    color: '#2F54EB'
  },
  {
    key: '酱紫',
    color: '#722ED1'
  },
  {
    key: '主题黑',
    color: '#001529'
  }
];

type FnType = <T>(colorWeak: T) => void;
const updateColorWeak: FnType = (colorWeak) => {
  const app = document.body.querySelector('#app') as HTMLDivElement;
  colorWeak ? app.classList.add('colorWeak') : app.classList.remove('colorWeak');
};

export { colorList, updateColorWeak };
