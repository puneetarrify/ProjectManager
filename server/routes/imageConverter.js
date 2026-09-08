const express = require('express');
const router = express.Router();
const sharp = require('sharp');
const { spawn } = require('child_process');

// Primary converter using sharp (libvips) with full animated GIF and multi-frame support
async function convertWithSharp(inputBuffer, targetFormat, quality) {
    const qualityPercent = Math.max(1, Math.min(100, Math.round((quality || 0.9) * 100)));

    // Load with animation support and without pixel limits for long animations
    const image = sharp(inputBuffer, { animated: true, limitInputPixels: false });
    const metadata = await image.metadata();

    let outBuffer;
    let outMime = 'image/webp';

    if (targetFormat === 'image/jpeg' || targetFormat === 'image/jpg' || targetFormat === 'jpeg' || targetFormat === 'jpg') {
        outMime = 'image/jpeg';
        // Flatten alpha to white for JPEG
        outBuffer = await sharp(inputBuffer, { limitInputPixels: false })
            .flatten({ background: '#FFFFFF' })
            .jpeg({ quality: qualityPercent })
            .toBuffer();
    } else if (targetFormat === 'image/png' || targetFormat === 'png') {
        outMime = 'image/png';
        outBuffer = await sharp(inputBuffer, { animated: true, limitInputPixels: false })
            .png()
            .toBuffer();
    } else {
        outMime = 'image/webp';
        // WebP conversion preserving all frames, delay, and infinite loop
        outBuffer = await image
            .webp({
                quality: qualityPercent,
                effort: 4,
                loop: metadata.loop !== undefined ? metadata.loop : 0,
                delay: metadata.delay
            })
            .toBuffer();
    }

    return {
        buffer: outBuffer,
        mime: outMime,
        width: metadata.width || 0,
        height: metadata.pageHeight || metadata.height || 0,
        pages: metadata.pages || 1,
        isAnimated: Boolean(metadata.pages && metadata.pages > 1)
    };
}

// Fallback converter using ImageMagick with -coalesce and -loop 0
function convertWithImageMagick(inputBuffer, targetFormat, quality) {
    return new Promise((resolve, reject) => {
        let magickFormat = 'webp';
        let outMime = 'image/webp';

        if (targetFormat === 'image/jpeg' || targetFormat === 'image/jpg' || targetFormat === 'jpeg' || targetFormat === 'jpg') {
            magickFormat = 'jpg';
            outMime = 'image/jpeg';
        } else if (targetFormat === 'image/png' || targetFormat === 'png') {
            magickFormat = 'png';
            outMime = 'image/png';
        }

        const qualityPercent = Math.max(1, Math.min(100, Math.round((quality || 0.9) * 100)));
        // -coalesce reconstructs every frame of the animated GIF based on disposal methods and full canvas.
        // -loop 0 ensures the animation loops continuously.
        const args = ['-', '-coalesce', '-loop', '0', '-quality', `${qualityPercent}`, `${magickFormat}:-`];

        const proc = spawn('convert', args);
        const stdoutChunks = [];
        const stderrChunks = [];

        proc.stdout.on('data', (chunk) => stdoutChunks.push(chunk));
        proc.stderr.on('data', (chunk) => stderrChunks.push(chunk));

        proc.on('error', (err) => reject(err));
        proc.on('close', (code) => {
            if (code !== 0) {
                const errMsg = Buffer.concat(stderrChunks).toString('utf8');
                return reject(new Error(errMsg || `ImageMagick convert exited with code ${code}`));
            }
            resolve({
                buffer: Buffer.concat(stdoutChunks),
                mime: outMime,
                width: 0,
                height: 0,
                pages: 1,
                isAnimated: false
            });
        });

        proc.stdin.write(inputBuffer);
        proc.stdin.end();
    });
}

// POST /api/image-converter/convert
router.post('/convert', async (req, res) => {
    try {
        const { image, targetFormat = 'image/webp', quality = 0.9, filename } = req.body;

        if (!image) {
            return res.status(400).json({ error: 'Image data is required' });
        }

        // image can be a data URL: "data:image/gif;base64,..." or raw base64 string
        let base64Data = image;
        const matches = image.match(/^data:([A-Za-z0-9-+\/]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
            base64Data = matches[2];
        }

        const inputBuffer = Buffer.from(base64Data, 'base64');
        if (inputBuffer.length === 0) {
            return res.status(400).json({ error: 'Invalid or empty image buffer' });
        }

        let result;
        try {
            // Try sharp first (highest quality, preserves full animation & frames)
            result = await convertWithSharp(inputBuffer, targetFormat, quality);
        } catch (sharpErr) {
            console.warn('Sharp conversion failed, trying ImageMagick fallback:', sharpErr.message);
            result = await convertWithImageMagick(inputBuffer, targetFormat, quality);
        }

        const convertedBase64 = `data:${result.mime};base64,${result.buffer.toString('base64')}`;

        res.json({
            success: true,
            convertedBase64,
            convertedSize: result.buffer.length,
            targetMime: result.mime,
            filename: filename || 'converted',
            width: result.width,
            height: result.height,
            pages: result.pages,
            isAnimated: result.isAnimated
        });
    } catch (error) {
        console.error('Error during image conversion:', error);
        res.status(500).json({ error: error.message || 'Image conversion failed' });
    }
});

module.exports = router;
