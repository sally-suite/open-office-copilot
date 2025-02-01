/* eslint-disable no-undef */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore

const importAll = (requireContext) =>
  requireContext.keys().forEach(requireContext);
try {
  const svgRequire = require.context('../../assets/icon', true, /\.svg$/);
  importAll(svgRequire);
} catch (error) {
  console.log(error);
}
