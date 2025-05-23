
// @AI-Generated
/**
 * 简单的 POST 请求封装
 */
export const request = {
  post: async (url: string, data: any) => {
    console.log(`[API请求] ${url}`, {
      数据长度: JSON.stringify(data).length,
      时间戳: new Date().toISOString()
    });
    
    try {
      const startTime = performance.now();
      
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      const endTime = performance.now();
      
      console.log(`[API响应] ${url}`, {
        状态码: res.status,
        是否成功: res.ok,
        响应时间: `${(endTime - startTime).toFixed(2)}ms`
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error(`[API错误] ${url}`, {
          状态码: res.status,
          错误: errorText
        });
        throw new Error(errorText);
      }
      
      const jsonData = await res.json();
      
      console.log(`[API数据] ${url}`, {
        数据大小: JSON.stringify(jsonData).length,
        总耗时: `${(endTime - startTime).toFixed(2)}ms`
      });
      
      return jsonData;
    } catch (error) {
      console.error(`[API异常] ${url}`, error);
      throw error;
    }
  }
}; 
