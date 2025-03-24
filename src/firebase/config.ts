// Firebase配置文件
// 使用模拟对象替代实际的Firebase服务

// 模拟服务实例
export const db = {
  collection: () => ({
    doc: () => ({
      get: async () => Promise.resolve({ exists: false, data: () => null }),
      set: async () => Promise.resolve(),
      update: async () => Promise.resolve()
    }),
    add: async () => Promise.resolve({ id: 'mock-id' }),
    where: () => ({ get: async () => Promise.resolve({ docs: [] }) }),
    orderBy: () => ({ limit: () => ({ get: async () => Promise.resolve({ docs: [] }) }) })
  })
};

export const auth = {
  currentUser: null,
  onAuthStateChanged: (callback: (user: any) => void) => {
    callback(null);
    return () => {};
  }
};

export const storage = {
  ref: () => ({
    put: async () => Promise.resolve({ ref: { getDownloadURL: async () => Promise.resolve('https://mock-url.com/image.jpg') } })
  })
};

// 提供模拟数据功能（用于本地测试）
export const useMockData = true; 