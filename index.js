const express = require('express');
const sharp = require('sharp');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const supportedFits = ['cover', 'contain', 'fill', 'inside', 'outside'];
const supportedFormats = ['jpeg', 'png', 'webp', 'gif', 'avif', 'tiff', 'svg']
    .filter(fmt => Object.keys(sharp.format).includes(fmt)); // https://sharp.pixelplumbing.com/#formats

function checkProxyBase(base) {
    if (!base) {
        return null;
    }
    if (!/^https?:\/\//i.test(base)) {
        base = base.replace(/^https?:\/([^/])/, (m, p1) => {
            return m.startsWith('https') ? `https://${p1}` : `http://${p1}`;
        });
    }
    try {
        new URL(base); // validate
    } catch (e) {
        console.log(`Invalid proxy base URL: ${base}`);
        return null;
    }
    if (!base.endsWith('/')) {
        base += '/';
    }
    return base;
}

function getImageFormat({ format, url, response }) {
    if (format && typeof format === 'string') {
        return format.toLowerCase();
    }

    try {
        // Extension normalization map
        const extMap = {
            jpg: 'jpeg',
            tif: 'tiff'
        };
        const urlObj = new URL(url);
        let ext = path.extname(urlObj.pathname).replace('.', '').toLowerCase();
        if (ext) {
            return extMap[ext] || ext;
        }
    } catch (e) {
        // Ignore URL parse errors
    }

    const contentType = response?.headers?.['content-type'];
    if (contentType) {
        const type = contentType.split(';')[0].trim().split('/')[1];
        if (type) return type.toLowerCase();
    }

    return null;
}

function showError(message, url) {
    const errorMessage1 = `<b>!! ERROR:</b> ${message}`;
    const errorMessage2 = `<b>URL:</b> ${url}`;
    return errorMessage1 + '<br/>' + errorMessage2;
}

app.get('/imgpa', async (req, res) => {
    let { url, w, h, fit, q, format, filename, ref, proxy } = req.query;

    if (!url) {
        return res.status(400).send(showError('Missing required parameter: <u>{url}</u>', url));
    }

    if (/^https?:\/[^/]/i.test(url)) {
        // return res.status(400).send(showError(`Invalid URL, two slashes are needed after http(s):, e.g. "<b>https://example.com</b>".`, url));
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

        let response;
        try {
            response = await axios(axiosConfig);
        } catch (err) {
            // if 403 and a proxy param was provided, attempt fetch through the proxy
            const proxyBase = checkProxyBase(proxy);
            if (err.response?.status === 403 && proxyBase) {
                axiosConfig.url = proxyBase + url;

                try {
                    response = await axios(axiosConfig);
                } catch (err2) {
                    console.log(`Proxy fetch failed: ${err2.message}`);

                    // if proxy attempt fails, throw original error to fall into outer catch
                    throw err;
                }
            } else {
                throw err;
            }
        }

        const imageFormat = getImageFormat({ format, url, response });
        if (!imageFormat || !supportedFormats.includes(imageFormat)) {
            return res.status(400).send(showError(`Unsupported image format: <u>${imageFormat}</u>. The formats supported by this server are: <u>${supportedFormats.join(', ')}</u>`, url));
        }

        const sharpOptions = {};
        if ('hide_error' in req.query || 'he' in req.query) {
            sharpOptions.failOn = 'none';
        }

        let image = sharp(response.data, sharpOptions);

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
        // console.log(error);
        res.status(500).send(showError(error.message, url));
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
