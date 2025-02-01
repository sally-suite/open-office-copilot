export function isTokenExpired(token: string) {
    if (!token) {
        // Token 不存在，视为过期
        return true;
    }

    // 解析 Token
    const decodedToken = parseJwt(token);

    // 获取当前时间
    const currentTime = Math.floor(Date.now() / 1000); // 转换为秒

    // 比较过期时间
    return decodedToken.exp < currentTime;
}

function parseJwt(token: string) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));

    return JSON.parse(jsonPayload);
}

// // 示例用法
// const storedToken = localStorage.getItem('token'); // 假设 Token 存储在 localStorage 中
// if (isTokenExpired(storedToken)) {
//     // Token 过期，需要更新 Token
//     console.log('Token 已过期，需要更新 Token');
// } else {
//     // Token 仍然有效
//     console.log('Token 仍然有效');
// }
