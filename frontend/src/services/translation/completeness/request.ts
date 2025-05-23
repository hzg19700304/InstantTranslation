
/**
 * 简单的 POST 请求封装，增加详细日志
 */
export const request = {
  post: async (url: string, data: any) => {
    console.log(`[API请求开始] ${url}`, {
      请求URL: url,
      数据长度: JSON.stringify(data).length,
      请求时间: new Date().toISOString(),
      请求数据: data
    });
    
    try {
      const startTime = performance.now();
      
      console.log(`[API请求详情] ${url}`, {
        请求方法: 'POST',
        请求头: { 'Content-Type': 'application/json' },
        请求体大小: JSON.stringify(data).length
      });
      
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      const endTime = performance.now();
      
      console.log(`[API响应详情] ${url}`, {
        状态码: res.status,
        是否成功: res.ok,
        响应时间: `${(endTime - startTime).toFixed(2)}ms`,
        响应头: Object.fromEntries([...res.headers.entries()])
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error(`[API错误详情] ${url}`, {
          状态码: res.status,
          错误: errorText,
          请求数据: data
        });
        throw new Error(`API请求失败(${res.status}): ${errorText}`);
      }
      
      const jsonData = await res.json();
      
      console.log(`[API数据详情] ${url}`, {
        数据大小: JSON.stringify(jsonData).length,
        总耗时: `${(endTime - startTime).toFixed(2)}ms`,
        响应数据: jsonData
      });
      
      return jsonData;
    } catch (error) {
      console.error(`[API异常详情] ${url}`, {
        异常类型: error instanceof Error ? error.name : '未知错误',
        异常信息: error instanceof Error ? error.message : String(error),
        请求数据: data,
        堆栈: error instanceof Error ? error.stack : '无堆栈信息' 
      });
      throw error;
    }
  }
}; 
