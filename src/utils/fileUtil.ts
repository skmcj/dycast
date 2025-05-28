/** 文件保存的配置 */
export interface FileSaveOptions {
  name?: string; // 文件名称（不含扩展名）
  ext?: string; // 文件扩展名（如 '.json'）
  mimeType?: string; // 指定 MIME 类型，优先使用
  description?: string; // 保存对话框中文件类型描述
  forceFallback?: boolean; // 是否强制使用传统下载方式
  existStrategy?: 'prompt' | 'overwrite' | 'new'; // 文件存在时的处理方式
}

export interface FileSaveResult {
  success: boolean; // 是否保存成功
  fileHandle?: FileSystemFileHandle | null; // FSA 模式下的文件句柄
  error?: Error; // 错误对象
  message?: string; // 提示信息
}

// 常见扩展名与 MIME 类型的映射表
const mimeMap: Record<string, string> = {
  '.txt': 'text/plain',
  '.json': 'application/json',
  '.html': 'text/html',
  '.htm': 'text/html',
  '.csv': 'text/csv',
  '.xml': 'application/xml',
  '.js': 'application/javascript',
  '.ts': 'application/typescript',
  '.css': 'text/css',
  '.md': 'text/markdown',
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.zip': 'application/zip',
  '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4'
};

/**
 * FileSaver 文件保存工具
 *  - 支持现代浏览器的 File System Access API (只能在安全上下文使用https|localhost)
 *  - 支持传统下载方式
 *  - 支持自动根据扩展名识别 MIME 类型
 */
class FileSaver {
  static async save(content: string | Blob | ArrayBuffer, options: FileSaveOptions = {}): Promise<FileSaveResult> {
    const {
      // 默认文件名为 'untitled'
      name = 'untitled',
      // 默认扩展名为空
      ext = '',
      // 如果用户传入了 mimeType 就使用它
      mimeType,
      // 文件类型描述默认是 'File'
      description = 'File',
      // 是否强制使用 fallback (即原始的保存方式，创建标签)
      forceFallback = false,
      // 默认提示用户是否覆盖
      existStrategy = 'prompt'
    } = options;

    // 自动根据扩展名推断 MIME 类型(如果未提供)
    const inferredMime = mimeType || mimeMap[ext.toLowerCase()] || 'application/octet-stream';

    try {
      // 如果支持 File System Access API 且不强制使用 fallback，则优先使用现代方式
      if (!forceFallback && this.isFSAvailable()) {
        return await this.saveWithFSA(content, {
          name,
          ext,
          mimeType: inferredMime,
          description,
          existStrategy
        });
      }

      // 否则使用传统下载方式(a 标签方式)
      return this.saveWithFallback(content, {
        name: this.ensureExtension(name, ext),
        mimeType: inferredMime
      });
    } catch (error) {
      return {
        success: false,
        error: error as Error,
        message: '文件保存失败'
      };
    }
  }

  /**
   * 使用 File System Access API 保存文件
   * @param content
   * @param options
   * @returns
   */
  private static async saveWithFSA(
    content: string | Blob | ArrayBuffer,
    options: {
      name: string;
      ext: string;
      mimeType: string;
      description: string;
      existStrategy: 'prompt' | 'overwrite' | 'new';
    }
  ): Promise<FileSaveResult> {
    try {
      // 确保文件名有扩展名
      const fileName = this.ensureExtension(options.name, options.ext);
      let fileHandle: FileSystemFileHandle | null = null;

      // 如果不是强制创建新文件，可以选择已有文件
      if (options.existStrategy !== 'new') {
        try {
          [fileHandle] = await window.showOpenFilePicker({
            types: [
              {
                description: options.description,
                accept: { [options.mimeType]: [options.ext] }
              }
            ]
          });

          // 如果策略为提示且用户拒绝覆盖，则取消操作
          if (options.existStrategy === 'prompt' && !confirm(`文件 "${fileHandle.name}" 已存在，是否覆盖？`)) {
            return {
              success: false,
              fileHandle: null,
              message: '用户取消覆盖'
            };
          }
        } catch {
          // 未选择文件或用户取消，继续新建流程
        }
      }

      // 没有文件句柄时，新建文件
      if (!fileHandle) {
        fileHandle = await window.showSaveFilePicker({
          suggestedName: fileName,
          types: [
            {
              description: options.description,
              accept: { [options.mimeType]: [options.ext] }
            }
          ]
        });
      }
      // 获取可写流
      const writable = await fileHandle.createWritable();
      // 内容转换成 Blob
      const blob = this.normalizeContentToBlob(content, options.mimeType);
      // 写入内容
      await writable.write(blob);
      // 关闭流
      await writable.close();

      return {
        success: true,
        fileHandle,
        message: '文件保存成功'
      };
    } catch (error) {
      // 用户取消操作的处理
      if ((error as Error).name === 'AbortError') {
        return {
          success: false,
          fileHandle: null,
          message: '用户取消操作'
        };
      }
      throw error;
    }
  }

  /**
   * 传统方式保存文件
   * @param content
   * @param options
   * @returns
   */
  private static saveWithFallback(
    content: string | Blob | ArrayBuffer,
    options: { name: string; mimeType: string }
  ): FileSaveResult {
    try {
      // 内容转为 Blob
      const blob = this.normalizeContentToBlob(content, options.mimeType);
      // 创建临时 URL
      const url = URL.createObjectURL(blob);
      // 创建 <a> 标签
      const a = document.createElement('a');
      // 设置下载链接
      a.href = url;
      // 设置下载文件名
      a.download = options.name;
      // 隐藏标签
      a.style.display = 'none';
      // 添加到页面中
      document.body.appendChild(a);
      // 触发下载
      a.click();
      // 清理标签
      document.body.removeChild(a);
      // 释放 URL
      URL.revokeObjectURL(url);

      return {
        success: true,
        fileHandle: null,
        message: '文件下载开始'
      };
    } catch (error) {
      return {
        success: false,
        error: error as Error,
        message: '传统下载方式失败'
      };
    }
  }

  // 判断当前浏览器是否支持 File System Access API
  private static isFSAvailable(): boolean {
    return 'showSaveFilePicker' in window && 'showOpenFilePicker' in window && 'FileSystemFileHandle' in window;
  }

  // 确保文件名带有扩展名
  private static ensureExtension(filename: string, ext: string): string {
    return filename.endsWith(ext) ? filename : `${filename}${ext}`;
  }

  // 将内容转换为标准 Blob 对象，便于写入或下载
  private static normalizeContentToBlob(content: string | Blob | ArrayBuffer, mimeType: string): Blob {
    if (typeof content === 'string') {
      return new Blob([content], { type: mimeType }); // 文本转 Blob
    }
    if (content instanceof Blob) {
      return content; // 已是 Blob，直接返回
    }
    if (content instanceof ArrayBuffer) {
      return new Blob([new Uint8Array(content)], { type: mimeType }); // 二进制转 Blob
    }
    throw new Error('Unsupported content type'); // 不支持的类型
  }
}

export default FileSaver;
