const fs = require("fs");
const opentype = require("opentype.js");
const { convert } = require("convert-svg-to-png");

const args = process.argv.slice(2);
const text = args[0];
const fontSize = args[1] || 72;
const fontURL = args[2] || "https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxM.woff";

(async () => {
  const fontBuffer = await (await fetch(fontURL)).arrayBuffer();
  const font = opentype.parse(fontBuffer);

  const lines = text.split("\\n");
  const lineHeight = fontSize * 1.2;
  const pathsData = lines.map((line) => {
    const path = font.getPath(line, 0, 0, fontSize);
    return path.toSVG();
  });

  const viewBoxWidth = Math.max(...pathsData.map((pathData) => getPathWidth(pathData)));
  const viewBoxHeight = lineHeight * lines.length;

  const centeredPathsData = pathsData.map((pathData, index) => {
    const offsetX = (viewBoxWidth - getPathWidth(pathData)) / 2;
    const offsetY = lineHeight * index + fontSize;
    return `<path transform="translate(${offsetX}, ${offsetY})" d="${pathData}" fill="black" />`;
  });

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewBoxWidth} ${viewBoxHeight}">${centeredPathsData.join(
    ""
  )}</svg>`;

  fs.writeFileSync("output.svg", svg);
  const png = await convert(svg);
  fs.writeFileSync("output.png", png);
})();

function getPathWidth(pathData) {
  const commands = pathData.match(/[\d.-]+/g).map(Number);
  return Math.max(...commands.filter((_, index) => index % 2 === 0)) - Math.min(...commands.filter((_, index) => index % 2 === 0));
}

async function fetch(url) {
  const response = await require("node-fetch")(url);
  if (!response.ok) throw new Error(`Failed to fetch ${url}`);
  return response;
}
