const { JWT, JWK, JWTSignParams, JWTVerifyParams } = require("jose");

async function createToken() {
  // 随机生成一个对称密钥
  const secretKey = JWK.generateSync("oct", 256, { use: "sig" });

  // 创建 JWT 的负载
  const payload = {
    sub: "1234567890",
    name: "John Doe",
    iat: Math.floor(Date.now() / 1000), // 发行时间（当前时间的秒数）
    exp: Math.floor(Date.now() / 1000) + 3600, // 过期时间（当前时间的秒数 + 1小时）
  };

  // JWT 签名参数，使用对称密钥进行签名
  const jwtSignParams = {
    key: secretKey,
    algorithm: "HS256", // 使用 HS256 对称算法进行签名
  };

  // 创建 JWT 令牌
  const token = JWT.sign(payload, jwtSignParams);

  console.log("生成的JWT令牌：", token);

  // 验证 JWT 令牌
  const jwtVerifyParams = {
    key: secretKey,
    algorithms: ["HS256"], // 指定验证算法
  };

  try {
    const verifiedPayload = JWT.verify(token, jwtVerifyParams);
    console.log("验证通过，JWT负载：", verifiedPayload);
  } catch (error) {
    console.error("验证失败：", error.message);
  }
}

createToken();
