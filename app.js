const express = require('express');
const cors = require('cors');
const opentype = require('./opentype.js');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

function getTallestCharacter (text) {
    let tallestCharacter = '';
    if (text.includes('f')) {
      tallestCharacter = 'f';
    } else if (text.includes('b') || text.includes('d') || text.includes('h') || text.includes('k') || text.includes('l')) {
      tallestCharacter = 'b';
    } else if (text.includes('i') || text.includes('j')) {
      tallestCharacter = 'i';
    } else if (text.includes('t')) {
      tallestCharacter = 't';
    } else if (text.includes('o') || text.includes('p') || text.includes('q') || text.includes('r') || text.includes('s')) {
      tallestCharacter = 't';
    } else {
      tallestCharacter = 'a';
    }
    return tallestCharacter;
}

app.post('/generateSVGPath', async (req, res) => {
    const { text, size, fill } = req.body;
    const fontSize = size || 72;
    const fillColor = fill || 'black';
    const fontPath = path.join(__dirname, 'fonts', 'LTMuseum-Reg.ttf');
  
    try {
      const font = await opentype.load(fontPath);

      const tallestCharacter = getTallestCharacter(text);
      const tallestCharacterPath = font.getPath(tallestCharacter, 0, 0, fontSize);
      const tallestCharacterBbox = tallestCharacterPath.getBoundingBox();
      const tallestCharacterHeight = (tallestCharacterBbox.y2 - tallestCharacterBbox.y1).toFixed(2);

      const path = font.getPath(text, 0, 0, fontSize);
      const svgPath = path.toSVG();
      const bbox = path.getBoundingBox();
  
      const width = (bbox.x2 - bbox.x1).toFixed(2);
      const height = (bbox.y2 - bbox.y1).toFixed(2);
      const viewBox = `${bbox.x1.toFixed(2)} ${bbox.y1.toFixed(2)} ${width} ${height}`;
  
      const svg = `
        <svg width="${width}" height="${height}" viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg">
          <g id="svgGroup" stroke-linecap="round" fill-rule="evenodd" font-size="${fontSize}" stroke="none" fill="${fillColor}">
            ${svgPath}
          </g>
        </svg>
      `;
  
      res.status(200).send({ tallestCharacter, tallestCharacterHeight, svg });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });
  

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
