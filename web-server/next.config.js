const path = require("path");

/**
 * @type {import('next-react-svg').NextReactSvgConfig}
 */
const nextReactSvgConfig = {
  include: path.resolve(__dirname, "public/icons"),
};

const withReactSvg = require("next-react-svg")(nextReactSvgConfig);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // include: ["docs/**/*.md"],
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {},
  async rewrites() {
    return [
      {
        source: "/chat",
        destination: "/sally-chat/sally-chat/index.html",
      },
      {
        source: "/admin",
        destination: "/admin/models",
      },
    ];
  },
};

module.exports = withReactSvg(nextConfig);
