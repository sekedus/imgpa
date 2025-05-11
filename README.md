# IMGPA

[![GitHub repo size](https://img.shields.io/github/repo-size/sekedus/imgpa?label=Size)](https://github.com/sekedus/imgpa) [![GitHub Clones](https://img.shields.io/badge/dynamic/json?color=success&label=Clone&query=count&url=https://gist.githubusercontent.com/sekedus/632700068f917889cd3d45a2b354a7e5/raw/clone.json&logo=github)](https://github.com/MShawon/github-clone-count-badge) [![GitHub License](https://img.shields.io/github/license/sekedus/imgpa?label=License)](https://github.com/sekedus/imgpa/blob/main/LICENSE)

IMGPA (Image Processing API) provides an API for image manipulation using [sharp](https://github.com/lovell/sharp). The API allows you to resize images, change formats, and adjust quality.

ㅤ
## Table of Contents

- [Requirements](#requirements)
- [Installation](#installation)
- [Usage](#usage)
  - [Query Parameters](#query-parameters)
  - [Supported Image Formats](#supported-image-formats)
  - [Example Request](#example-request)
- [Deployment](#deployment)
  - [One-Click Deploy](#one-click-deploy)
  - [Manual Deployment](#manual-deployment)
- [Credits](#credits)
- [License](#license)

ㅤ
## Requirements

- [Node.js](https://nodejs.org/en/download)

ㅤ
## Installation

1. Open your terminal and clone this repository:

    ```bash
    git clone https://github.com/sekedus/imgpa.git
    ```

2. Change to the cloned directory:

    ```bash
    cd imgpa
    ```

3. Install the required dependencies:

    ```bash
    npm install
    ```

4. Start the server:

    ```bash
    npm start
    ```

5. The server will start on port `3000` by default. You can access the API at `http://localhost:3000/imgpa`.

ㅤ
## Usage

Endpoint: `/imgpa`

### Query Parameters

| Name      | Parameter   | Description                                        | Info           |
|-----------|-------------|----------------------------------------------------|----------------|
| URL       | `url`       | The URL of the image to manipulate (required).     |                |
| Width     | `w`         | Sets the width of the output image, in pixels.     |                |
| Height    | `h`         | Sets the height of the output image, in pixels.    |                |
| Fit       | `fit`       | Sets how to fit the image to its given dimensions. | [info][fit]    |
| Quality   | `q`         | Defines the quality of the output image (1-100).   |                |
| Format    | `format`    | Encodes the output image to a specific format.     | [info][format] |
| Filename  | `filename`  | The name to save the output image as.              |                |
| Hide Error| `hide_error`| Allows processing even if image has issues.        |                |

[fit]: https://sharp.pixelplumbing.com/api-resize#resize
[format]: #supported-image-formats

### Example Request

```
http://localhost:3000/imgpa?url=https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/2160px-Google_2015_logo.svg.png&w=340&h=226&fit=contain&quality=80&format=webp&filename=new-image
```

### Supported Image Formats

- jpeg
- png
- webp
- gif
- tiff
- avif

ㅤ
## Deployment

### One-Click Deploy

Click the button below to deploy this project to Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?s=https%3A%2F%2Fgithub.com%2Fsekedus%2Fimgpa&repository-name=image-processing-api)

ㅤ
### Manual Deployment

1. Install Vercel CLI globally:

    ```bash
    npm install -g vercel
    ```

2. Log in to your Vercel account:

    ```bash
    vercel login
    ```

3. Deploy your application to Vercel:

    ```bash
    vercel --prod
    ```

4. Follow the prompts to complete the deployment process.

ㅤ
## Credits

- [sharp](https://github.com/lovell/sharp)
- [Vercel](https://github.com/vercel)

ㅤ
## License

This project is licensed under the GNU General Public License v3.0. See the [LICENSE](https://github.com/sekedus/imgpa/blob/main/LICENSE) file for more details.
