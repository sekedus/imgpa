const express = require('express');
const sharp = require('sharp');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const supportedFits = ['cover', 'contain', 'fill', 'inside', 'outside'];
const supportedFormats = ['jpeg', 'png', 'webp', 'gif', 'tiff', 'avif'];

app.get('/imgpa', async (req, res) => {
    let { url, w, h, fit, q, format, filename, ref } = req.query;

    if (!url) {
        return res.status(400).send('Missing required parameter: {url}');
    }

    if (/^https?:\/[^/]/i.test(url)) {
        // return res.status(400).send(`Invalid URL: "<b>${url}</b>". Two slashes are needed after http(s):, e.g. "<b>https://example.com</b>".`);
        url = url.replace(/^https?:\/([^/])/, (m, p1) => {
            return m.startsWith('https') ? `https://${p1}` : `http://${p1}`;
        });
    }

    // Ensure the URL starts with http:// or https://
    if (!/^https?:\/\//i.test(url)) {
      url = `https://${url}`;
    }

    try {
        const axiosConfig = {
            url,
            responseType: 'arraybuffer',
        };
        if (ref) {
            axiosConfig.headers = {
                Referer: ref,
            };
        }
        const response = await axios(axiosConfig);

        const sharpOptions = {};
        if ('hide_error' in req.query) {
            sharpOptions.failOn = 'none';
        }

        let image = sharp(response.data, sharpOptions);
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
        const errorMessage1 = `<b>!! ERROR:</b> ${error.message}`;
        const errorMessage2 = `<b>URL:</b> ${url}`;
        res.status(500).send(errorMessage1 + '<br/>' + errorMessage2);
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
