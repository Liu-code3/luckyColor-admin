import { request } from '@/utils/http';

interface FileInfo {
  name: string;
  url: string;
}

class FileAPI {
  /**
   * 上传文件
   * @param file
   */
  static upload(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return request<any, FileInfo>({
      url: '/api/file/upload',
      method: 'post',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }

  /**
   * 删除文件
   * @param filePath 文件完整路径
   */
  static deleteByPath(filePath: string) {
    return request({
      url: '/api/file/delete',
      method: 'get',
      params: { filePath }
    });
  }
}

export default FileAPI;
