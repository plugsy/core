const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.NODE_ENV === "production",
});
const withPlugins = require("next-compose-plugins");
const withFonts = require("next-fonts");
const withImages = require("next-images");
const withTM = require('next-transpile-modules')(['@plugsy/dynamic-icons']);

const withGraphQL = () => ({
  webpack: (config, options) => {
    config.module.rules.push({
      test: /\.graphql$/,
      exclude: /node_modules/,
      use: [options.defaultLoaders.babel, { loader: "raw-loader" }],
    });
    return config;
  },
});

module.exports = withPlugins([
  [withFonts, { projectRoot: __dirname }],
  [withImages, { projectRoot: __dirname }],
  // withPWA({
  //   pwa: {
  //     dest: "public",
  //   },
  // }), // TODO
  withGraphQL,
  withBundleAnalyzer,
  withTM,
  {
    webpack5: true,
  },
]);
