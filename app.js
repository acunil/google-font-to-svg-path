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
    const { text, size, fill, stroke, font } = req.body;
    const fontSize = size || 72;
    const fillColor = fill || 'black';
    const strokeColor = stroke || 'none';
    var fontChoice = '';
    
    if (font == "elron") {
        // nice, bit spaced out
        fontChoice = "Elronmonospace.ttf";
    } else if (font == "julia") {
        // clean, kinda blocky
        fontChoice = "JuliaMono-Regular.ttf";
    } else if (font == "vera") {
        // good, square dots on ij, dot in 0
        fontChoice = "VeraMono.ttf";
    } else if (font == "noto") {
        // only good for lower case
        fontChoice = "NotoSansMono-Regular.ttf";
    } else if (font == "roboto") {
        // nice, slash in 0
        fontChoice = "RobotoMono-Regular.ttf";
    } else if (font == "ubuntu") {
        // nice, weird r, dot in 0
        fontChoice = "UbuntuMono-Regular.ttf";
    }

    const fontPath = path.join(__dirname, 'fonts', fontChoice);
  
    try {
      const font = await opentype.load(fontPath);
      const path = font.getPath(text, 0, 0, fontSize);
      const svgPath = path.toSVG();
      const bbox = path.getBoundingBox();
  
      const width = bbox.x2 - bbox.x1;
      const height = bbox.y2 - bbox.y1;
      const viewBox = `${bbox.x1} ${bbox.y1} ${width} ${height}`;
  
      const svg = `
        <svg width="${width}" height="${height}" viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg">
          <g id="svgGroup" stroke-linecap="round" fill-rule="evenodd" font-size="${fontSize}" stroke="${strokeColor}" stroke-width="0.0mm" fill="${fillColor}" style="stroke:${strokeColor};stroke-width:0.25mm;fill:${fillColor}">
            ${svgPath}
          </g>
        </svg>
      `;
  
      res.status(200).send(svg);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });
  

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
