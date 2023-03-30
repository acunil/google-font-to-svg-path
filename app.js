const express = require('express');
const cors = require('cors');
const opentype = require('./opentype.js');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

function getHeightOfTallestAndControlCharacter (text, font, fontSize) {

  let noSpaces = text.match(/[a-zA-Z0-9]/g)
  if (!noSpaces) {
    throw new Error(`The input string does not contain any valid characters: "${text}"`);
  }

  let uniqueChars = new Set(noSpaces);

  let tallestCharacterHeight = 0;
  let tallestCharacter = '';

  uniqueChars.forEach(char => {
    let characterPath = font.getPath(char, 0, 0, fontSize);
    let characterBbox = characterPath.getBoundingBox();
    let characterHeight = (characterBbox.y2 - characterBbox.y1).toFixed(2);
    if (characterHeight > tallestCharacterHeight) {
      tallestCharacterHeight = characterHeight;
      tallestCharacter = char;
    }
  });

  let controlCharacter = 'c';
  let controlPath = font.getPath(controlCharacter, 0, 0, fontSize);
  let controlBbox = controlPath.getBoundingBox();
  let controlCharacterHeight = (controlBbox.y2 - controlBbox.y1).toFixed(2);

  return { tallestCharacterHeight, tallestCharacter , controlCharacterHeight };
}

function getFontDirectoryLocationFromNumber(fontNum) {
    var fontSelection = 'LTMuseum-Reg.ttf';
    switch (fontNum) {
      case 1:
        fontSelection = 'VeraMono.ttf'
        break;
      case 2:
        fontSelection = 'Elementary_Gothic_Bookhand.ttf'; // rare
        break;
      case 3:
        fontSelection = 'Elronmonospace.ttf';
        break;
      case 4:
        fontSelection = 'JuliaMono-Regular.ttf';
        break;
      case 5:
        fontSelection = 'LinLibertine_R.ttf';
        break;
      case 6:
        fontSelection = 'RobotoMono-Regular.ttf';
        break;
      case 7:
        fontSelection = 'UbuntuMono-Regular.ttf';
        break;
      case 8:
        fontSelection = 'VeraMono.ttf';
        break;
      case 9:
        fontSelection = 'Deutsch.ttf'; // rare
        break;
      case 10:
        fontSelection = 'Augusta.ttf'; // rare
        break;
      case 11:
        fontSelection = 'Augusta-Shadow.ttf'; // rare
        break;
      case 12:
        fontSelection = 'LT Funk.otf';
        break;
      case 13:
        fontSelection = 'F25_Executive.otf';
        break;
      case 14:
        fontSelection = 'Foglihten-068.otf';
        break;
      case 15:
        fontSelection = 'ahellya.ttf';
        break;
      case 16:
        fontSelection = 'LTRemark-May2021.otf';
        break;
      case 17:
        fontSelection = 'Neuton-Light.ttf';
        break;
      case 18:
        fontSelection = 'Cheboyga.ttf'; // uncommon
        break;
      case 19:
        fontSelection = 'Handwriting.ttf'; // uncommon
        break;
      case 20:
        fontSelection = 'KH-Blackline-Script-Medium.ttf'; // rare
        break;
      case 21:
        fontSelection = 'Frenchpress freefont.otf';
        break;
      case 22:
        fontSelection = 'Klepon-Ijo.ttf';
        break;
      case 23:
        fontSelection = 'LondrinaShadow-Regular.otf'; // rare
        break;
      case 24:
        fontSelection = 'LondrinaSolid-Regular.otf'; // uncommon
        break;
      case 25:
        fontSelection = 'Dimbo Regular.ttf';
        break;
      case 26:
        fontSelection = 'Aquifer.ttf'; // uncommon
        break;
      
    }
    const fontDirectoryLocation = path.join(__dirname, 'fonts', fontSelection);

    return fontDirectoryLocation;
}

app.post('/generateSVGPath', async (req, res) => {
    const { text, size, fill, fontNum } = req.body;
    const fontSize = size || 72;
    const fillColor = fill || 'black';
    const fontDirectoryLocation = getFontDirectoryLocationFromNumber(fontNum);
  
    try {
      const font = await opentype.load(fontDirectoryLocation);
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
      const { tallestCharacter, tallestCharacterHeight, controlCharacterHeight } = getHeightOfTallestAndControlCharacter(text, font, fontSize);
      
      // use for e2e
      // res.status(200).send({ tallestCharacter, tallestCharacterHeight, controlCharacterHeight, svg });

      // use for postman
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
