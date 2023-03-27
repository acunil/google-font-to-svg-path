const express = require('express');
const cors = require('cors');
const opentype = require('./opentype.js');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/generateSVGPath', async (req, res) => {
    const { text, size, fill } = req.body;
    const fontSize = size || 72;
    const fillColor = fill || 'black';
    const fontPath = path.join(__dirname, 'fonts', 'LTMuseum-Reg.ttf');
  
    try {
      const font = await opentype.load(fontPath);

      const lines = text.split("\\n");
      const lineHeight = fontSize * 1.2;
      const pathsData = lines.map((line) => {
        const path = font.getPath(line, 0, 0, fontSize);
        const pathSVG = path.toSVG();
        return pathSVG.slice(10, -3); // Remove <path d= and />
      });

      const viewBoxWidth = Math.max(...pathsData.map((pathData) => getPathWidth(pathData)));
      const viewBoxHeight = lineHeight * lines.length;

      const centeredPathsData = pathsData.map((pathData, index) => {
        const offsetX = (viewBoxWidth - getPathWidth(pathData)) / 2;
        const offsetY = lineHeight * index + fontSize;
        return `<path transform="translate(${offsetX}, ${offsetY})" d="${pathData}" fill="${fillColor}" />`;
      });

      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewBoxWidth} ${viewBoxHeight}">${centeredPathsData.join(
        ""
      )}</svg>`;

      res.status(200).send(svg);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
});

function getPathWidth(pathData) {
  const coordinates = pathData.match(/-?[\d.]+(?:e-?\d+)?/g).map(Number);
  const xCoordinates = coordinates.filter((_, index) => index % 2 === 0);
  const pathWidth = Math.max(...xCoordinates) - Math.min(...xCoordinates)
  return pathWidth;
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
