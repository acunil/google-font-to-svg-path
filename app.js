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
  const { text, size, fill, stroke } = req.body;
  const fontPath = path.join(__dirname, 'fonts', 'RobotoMono-Regular.ttf');

  try {
    const font = await opentype.load(fontPath);
    const path = font.getPath(text, 0, 0, size || 72);
    const svgPath = path.toSVG();

    res.status(200).json({
      svgPath,
      fill: fill || 'black',
      stroke: stroke || 'none',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
