const express = require('express');
const sharp = require('sharp');
const axios = require('axios');
const path = require('path');
const referrerPolicy = require('referrer-policy');

const app = express();
const PORT = process.env.PORT || 3000;

const supportedFits = ['cover', 'contain', 'fill', 'inside', 'outside'];
const supportedFormats = ['jpeg', 'png', 'webp', 'gif', 'tiff', 'avif'];

app.use(referrerPolicy({ policy: 'no-referrer' }));

app.get('/imgpa', async (req, res) => {
    let { url, w, h, fit, q, format, filename } = req.query;

    if (!url) {
        return res.status(400).send('Missing required parameter: {url}');
    }

    if (/^https?:\/[^/]/i.test(url)) {
        return res.status(400).send('Invalid URL: Two slashes are needed after http(s):, e.g. "http://example.com".');
    }

    // Ensure the URL starts with http:// or https://
    if (!/^https?:\/\//i.test(url)) {
      url = `https://${url}`;
    }

    try {
        const response = await axios({
            url,
            responseType: 'arraybuffer',
        });

        let image = sharp(response.data);
        const metadata = await image.metadata();

        const imageFormat = format || metadata.format;
        if (!supportedFormats.includes(imageFormat)) {
            return res.status(400).send(`Unsupported image format: ${imageFormat}`);
        }

        const resizeOptions = {
            width: w ? parseInt(w) : null,
            height: h ? parseInt(h) : null,
            fit: supportedFits.includes(fit) ? fit : 'cover',
        };

        if (resizeOptions.width || resizeOptions.height) {
            image = image.resize(resizeOptions);
        }

        if (q && imageFormat != 'gif') {
            const qualityNum = imageFormat == 'png' ? Math.round(9 - .09 * parseInt(q)) : parseInt(q);
            image = image.toFormat(imageFormat, { quality: qualityNum });
        } else {
            image = image.toFormat(imageFormat);
        }

        const newImage = await image.toBuffer();

        const urlObj = new URL(url);
        const originalFilename = path.basename(urlObj.pathname);
        const baseFilename = path.parse(originalFilename).name;
        const outputFilename = filename || baseFilename;

        res.set('Content-Type', `image/${imageFormat}`);
        res.set('Content-Disposition', `inline; filename="${outputFilename}.${imageFormat}"`);
        res.send(newImage);
    } catch (error) {
        res.status(500).send(`!! Error processing image: ${error.message}`);
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
