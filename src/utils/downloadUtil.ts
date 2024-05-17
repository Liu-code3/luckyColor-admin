import { message } from '@/utils/message';

interface ResponseData {
  data: ArrayBuffer; // Adjust the type according to your actual data type
  headers: {
    'content-disposition': string;
    'content-type': string;
    // Add other headers if needed
  };
}

export default {
  // 对下载的流进行处理，直接从浏览器下载下来
  resultDownload(res: ResponseData) {
    const { data, headers } = res;

    if (headers['content-type'] === 'application/json') {
      // 错误以及无权限
      const reader = new FileReader();
      reader.readAsText(new Blob([data]));
      reader.onload = function () {
        const result = JSON.parse(reader.result as string);
        message.error(result.msg);
      };
    }
    else {
      const blob = new Blob([res.data], { type: 'application/octet-stream;charset=UTF-8' });
      const contentDisposition = res.headers['content-disposition'];
      const patt = /filename=([^;]+\\.[^.;]+);*/;
      const match = patt.exec(contentDisposition);
      if (match) {
        const filename = decodeURIComponent(match[1]);
        const aEl = document.createElement('a');
        aEl.href = URL.createObjectURL(blob);
        aEl.download = filename;
        aEl.click();
        document.body.appendChild(aEl);
        document.body.removeChild(aEl); // 下载完成移除元素
        window.URL.revokeObjectURL(aEl.href);// 释放掉blob对象
      }
      else {
        throw new Error('ReferenceError: match is not defined; filename: downloadUtil.ts');
      }
    }
  }
};
