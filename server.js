const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { render } = require('./index');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.post('/api/render', (req, res) => {
  const { text, font, size, fill, stroke } = req.body;
  if (!text || !font || !size || !fill || !stroke) {
    return res.status(400).json({ message: 'Invalid input parameters.' });
  }

  render({
    text,
    font,
    size: parseInt(size),
    fill,
    stroke,
    callback: (error, svg) => {
      if (error) {
        return res.status(500).json({ message: 'Error generating SVG.' });
      }
      res.setHeader('Content-Type', 'image/svg+xml');
      res.send(svg);
    },
  });
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
