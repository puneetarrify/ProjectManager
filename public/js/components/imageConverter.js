const imageConverter = {
    quality: 0.9,
    targetFormat: 'image/webp', // 'image/webp', 'image/jpeg', 'image/png'
    convertedImages: [],
    isListeningToPaste: false,

    render() {
        document.getElementById('page-title').textContent = 'Image Converter';
        const content = document.getElementById('app-content');

        const html = `
            <div class="image-converter-container">
                <!-- Top Control & Header Panel -->
                <div class="glass-panel" style="padding: 24px; margin-bottom: 24px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
                        <div>
                            <h2 style="margin: 0 0 6px 0; font-size: 1.4rem; color: var(--text-main);">
                                <i class='bx bx-image-alt' style="color: var(--primary-color); vertical-align: middle; margin-right: 8px;"></i>
                                Image Converter (WebP / JPEG / PNG)
                            </h2>
                            <p style="color: var(--text-muted); margin: 0; font-size: 0.9rem;">
                                Convert GIF (animated & static), JPEG, JPG, PNG, BMP, TIFF, SVG, and HEIC images into WebP, JPEG, or PNG format instantly.
                            </p>
                        </div>
                        <div style="display: flex; align-items: center; gap: 16px; flex-wrap: wrap;">
                            <!-- Format Selection -->
                            <div class="format-control" style="display: flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.25); padding: 8px 14px; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                                <label for="target-format-select" style="font-size: 0.85rem; color: var(--text-muted); font-weight: 500; white-space: nowrap;">
                                    Convert To:
                                </label>
                                <select id="target-format-select" onchange="imageConverter.onFormatChange(this.value)"
                                        style="background: rgba(255,255,255,0.08); color: var(--text-main); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 4px 8px; font-size: 0.85rem; outline: none; cursor: pointer;">
                                    <option value="image/webp" ${this.targetFormat === 'image/webp' ? 'selected' : ''}>WebP (.webp)</option>
                                    <option value="image/jpeg" ${this.targetFormat === 'image/jpeg' ? 'selected' : ''}>JPEG (.jpg)</option>
                                    <option value="image/png" ${this.targetFormat === 'image/png' ? 'selected' : ''}>PNG (.png)</option>
                                </select>
                            </div>

                            <!-- Quality Slider -->
                            <div class="quality-control" id="quality-container" style="display: flex; align-items: center; gap: 12px; background: rgba(0,0,0,0.25); padding: 8px 16px; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                                <label for="webp-quality" style="font-size: 0.85rem; color: var(--text-muted); font-weight: 500;">
                                    Quality: <span id="quality-val" style="color: var(--primary-color); font-weight: 700;">${Math.round(this.quality * 100)}%</span>
                                </label>
                                <input type="range" id="webp-quality" min="10" max="100" value="${Math.round(this.quality * 100)}" step="5" 
                                    style="accent-color: var(--primary-color); cursor: pointer; width: 110px;"
                                    oninput="imageConverter.onQualityChange(this.value)">
                            </div>

                            <button class="btn btn-danger" onclick="imageConverter.clearAll()" id="btn-clear-all" style="display: none;">
                                <i class='bx bx-trash'></i> Clear All
                            </button>
                            <button class="btn btn-primary" onclick="imageConverter.downloadAll()" id="btn-download-all" style="display: none; background: #00b894;">
                                <i class='bx bx-download'></i> Download All
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Drag and Drop Upload Zone -->
                <div class="glass-panel drop-zone" id="drop-zone" style="padding: 40px 20px; text-align: center; border: 2px dashed var(--border-color); cursor: pointer; transition: var(--transition); margin-bottom: 24px; position: relative; border-radius: var(--radius-lg);">
                    <input type="file" id="image-file-input" accept="image/*,image/gif,image/jpeg,image/png,image/webp,.jpeg,.jpg,.png,.gif,.webp,.bmp,.tiff,.svg" multiple style="display: none;" onchange="imageConverter.handleFiles(this.files)">
                    <div style="pointer-events: none;">
                        <i class='bx bx-cloud-upload' style="font-size: 3.5rem; color: var(--primary-color); margin-bottom: 12px;"></i>
                        <h3 style="margin: 0 0 8px 0; font-weight: 600; font-size: 1.2rem;">Drag & Drop GIF, JPEG, PNG, or any images here</h3>
                        <p style="color: var(--text-muted); font-size: 0.9rem; margin: 0 0 12px 0;">or click to browse from your device</p>
                        <div style="display: flex; justify-content: center; gap: 8px; flex-wrap: wrap;">
                            <span style="display: inline-block; background: rgba(108, 92, 231, 0.15); color: var(--primary-color); border: 1px dashed rgba(108, 92, 231, 0.4); padding: 4px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 500;">
                                <i class='bx bx-paste'></i> Tip: You can also paste images directly using Ctrl+V / Cmd+V
                            </span>
                            <span style="display: inline-block; background: rgba(0, 184, 148, 0.15); color: #00b894; border: 1px dashed rgba(0, 184, 148, 0.4); padding: 4px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 500;">
                                <i class='bx bxs-file-gif'></i> GIF to WebP (Animated & Static) Supported
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Results Grid -->
                <div id="converted-grid" class="projects-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px;">
                    <!-- Converted Image Cards Injected Here -->
                </div>

                <div id="empty-state" style="text-align: center; padding: 40px; color: var(--text-muted);">
                    <i class='bx bx-images' style="font-size: 3rem; opacity: 0.3; margin-bottom: 12px;"></i>
                    <p style="margin: 0; font-size: 0.95rem;">No images uploaded yet. Drop or paste images above to convert!</p>
                </div>
            </div>
        `;

        content.innerHTML = html;
        this.bindDropZone();
        this.bindPasteEvent();
        this.renderConvertedCards();
    },

    bindDropZone() {
        const dropZone = document.getElementById('drop-zone');
        if (!dropZone) return;

        dropZone.addEventListener('click', () => {
            document.getElementById('image-file-input').click();
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropZone.style.borderColor = 'var(--primary-color)';
                dropZone.style.background = 'rgba(108, 92, 231, 0.1)';
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropZone.style.borderColor = 'var(--border-color)';
                dropZone.style.background = 'var(--surface-color)';
            }, false);
        });

        dropZone.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            const files = dt.files;
            if (files && files.length > 0) {
                this.handleFiles(files);
            }
        });
    },

    bindPasteEvent() {
        if (this.isListeningToPaste) return;
        this.isListeningToPaste = true;

        window.addEventListener('paste', (e) => {
            const navTab = document.getElementById('nav-image-converter');
            if (!navTab || !navTab.classList.contains('active')) return;

            const items = (e.clipboardData || e.originalEvent.clipboardData).items;
            const imageFiles = [];
            for (let index = 0; index < items.length; index++) {
                const item = items[index];
                if (item.type.indexOf('image') !== -1) {
                    const blob = item.getAsFile();
                    if (blob) {
                        const ext = blob.type.split('/')[1] || 'jpeg';
                        const file = new File([blob], `pasted_image_${Date.now()}.${ext}`, { type: blob.type });
                        imageFiles.push(file);
                    }
                }
            }
            if (imageFiles.length > 0) {
                window.app?.showToast(`Pasted ${imageFiles.length} image(s) from clipboard`, 'success');
                this.handleFiles(imageFiles);
            }
        });
    },

    onFormatChange(value) {
        this.targetFormat = value;
        const qualityContainer = document.getElementById('quality-container');
        if (qualityContainer) {
            // PNG is lossless; hide quality slider for PNG
            qualityContainer.style.display = value === 'image/png' ? 'none' : 'flex';
        }

        if (this.convertedImages.length > 0) {
            this.reconvertAll();
        }
    },

    onQualityChange(value) {
        this.quality = parseFloat(value) / 100;
        document.getElementById('quality-val').textContent = `${value}%`;
        
        if (this.convertedImages.length > 0) {
            this.reconvertAll();
        }
    },

    async handleFiles(files) {
        const fileList = Array.from(files).filter(file => file.type.startsWith('image/') || /\.(png|jpe?g|jpg|gif|webp|bmp|tiff|svg|heic)$/i.test(file.name));
        if (fileList.length === 0) {
            window.app?.showToast('Please select valid image files (GIF, JPEG, PNG, WebP, etc.).', 'error');
            return;
        }

        for (const file of fileList) {
            await this.processImageFile(file);
        }
    },

    processImageFile(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const dataUrl = e.target.result;
                const isGif = file.type === 'image/gif' || file.name.toLowerCase().endsWith('.gif');

                // If file is GIF, use the backend conversion for full animated & static WebP support
                if (isGif) {
                    try {
                        const converted = await this.convertGifViaBackend(dataUrl, file);
                        if (converted) {
                            resolve();
                            return;
                        }
                    } catch (err) {
                        console.warn('Backend conversion fallback to client canvas:', err);
                    }
                }

                // Standard client-side canvas conversion (for images or fallback)
                const img = new Image();
                img.onload = () => {
                    this.convertImageClient(img, file, dataUrl);
                    resolve();
                };
                img.onerror = () => {
                    window.app?.showToast(`Failed to load image: ${file.name}`, 'error');
                    resolve();
                };
                img.src = dataUrl;
            };
            reader.readAsDataURL(file);
        });
    },

    async convertGifViaBackend(dataUrl, originalFile) {
        try {
            const res = await fetch('/api/image-converter/convert', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    image: dataUrl,
                    targetFormat: this.targetFormat,
                    quality: this.quality,
                    filename: originalFile.name
                })
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || 'Server conversion failed');
            }

            const data = await res.json();
            if (!data.success || !data.convertedBase64) {
                throw new Error('Invalid conversion response');
            }

            // Convert base64 data URL to Blob
            const base64Content = data.convertedBase64.split(',')[1];
            const byteCharacters = atob(base64Content);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const convertedBlob = new Blob([byteArray], { type: data.targetMime || this.targetFormat });
            const convertedUrl = URL.createObjectURL(convertedBlob);

            const formatExt = this.targetFormat === 'image/webp' ? 'webp' : (this.targetFormat === 'image/jpeg' ? 'jpg' : 'png');
            const formatLabel = this.targetFormat === 'image/webp' ? 'WebP' : (this.targetFormat === 'image/jpeg' ? 'JPEG' : 'PNG');

            const originalSize = originalFile.size;
            const convertedSize = convertedBlob.size;
            const savings = Math.round(((originalSize - convertedSize) / originalSize) * 100);

            const originalExtIndex = originalFile.name.lastIndexOf('.');
            const baseName = originalExtIndex !== -1 ? originalFile.name.substring(0, originalExtIndex) : originalFile.name;
            const convertedFileName = `${baseName}.${formatExt}`;

            // Determine dimensions using data from server or image element
            let width = data.width || 0;
            let height = data.height || 0;
            if (!width || !height) {
                const dims = await new Promise((resolve) => {
                    const tempImg = new Image();
                    tempImg.onload = () => resolve({ width: tempImg.naturalWidth, height: tempImg.naturalHeight });
                    tempImg.onerror = () => resolve({ width: 0, height: 0 });
                    tempImg.src = convertedUrl;
                });
                width = dims.width;
                height = dims.height;
            }

            const item = {
                id: 'img_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
                originalName: originalFile.name,
                convertedFileName: convertedFileName,
                originalFormat: 'GIF',
                targetFormatLabel: formatLabel,
                targetMime: data.targetMime || this.targetFormat,
                originalSize: originalSize,
                convertedSize: convertedSize,
                savings: savings,
                width: width,
                height: height,
                pages: data.pages || 1,
                isAnimated: data.isAnimated || false,
                convertedBlob: convertedBlob,
                convertedUrl: convertedUrl,
                originalSrc: dataUrl,
                originalDataUrl: dataUrl,
                originalFile: originalFile,
                isGif: true
            };

            this.convertedImages.unshift(item);
            this.renderConvertedCards();
            return true;
        } catch (error) {
            console.warn('Error in convertGifViaBackend:', error);
            return false;
        }
    },

    convertImageClient(img, originalFile, originalDataUrl) {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        
        // Fill white background ONLY for JPEG (JPEG does not support transparency)
        if (this.targetFormat === 'image/jpeg') {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.drawImage(img, 0, 0);

        const formatExt = this.targetFormat === 'image/webp' ? 'webp' : (this.targetFormat === 'image/jpeg' ? 'jpg' : 'png');
        const formatLabel = this.targetFormat === 'image/webp' ? 'WebP' : (this.targetFormat === 'image/jpeg' ? 'JPEG' : 'PNG');

        canvas.toBlob((convertedBlob) => {
            if (!convertedBlob) {
                window.app?.showToast(`Error converting ${originalFile.name}`, 'error');
                return;
            }

            const convertedUrl = URL.createObjectURL(convertedBlob);
            const originalSize = originalFile.size;
            const convertedSize = convertedBlob.size;
            const savings = Math.round(((originalSize - convertedSize) / originalSize) * 100);

            const originalExtIndex = originalFile.name.lastIndexOf('.');
            const baseName = originalExtIndex !== -1 ? originalFile.name.substring(0, originalExtIndex) : originalFile.name;
            const convertedFileName = `${baseName}.${formatExt}`;

            // Clean format name for display
            let origFormatClean = originalFile.type.split('/')[1]?.toUpperCase() || 'IMG';
            if (origFormatClean === 'JPEG') origFormatClean = 'JPG';

            const item = {
                id: 'img_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
                originalName: originalFile.name,
                convertedFileName: convertedFileName,
                originalFormat: origFormatClean,
                targetFormatLabel: formatLabel,
                targetMime: this.targetFormat,
                originalSize: originalSize,
                convertedSize: convertedSize,
                savings: savings,
                width: img.width,
                height: img.height,
                convertedBlob: convertedBlob,
                convertedUrl: convertedUrl,
                originalSrc: img.src,
                originalDataUrl: originalDataUrl || img.src,
                imgObj: img,
                originalFile: originalFile,
                isGif: origFormatClean === 'GIF'
            };

            this.convertedImages.unshift(item);
            this.renderConvertedCards();
        }, this.targetFormat, this.targetFormat === 'image/png' ? undefined : this.quality);
    },

    async reconvertAll() {
        const currentImages = [...this.convertedImages];
        this.convertedImages = [];
        for (const item of currentImages) {
            if (item.convertedUrl) URL.revokeObjectURL(item.convertedUrl);
            const isGif = item.isGif || item.originalFormat === 'GIF' || item.originalFile?.type === 'image/gif' || item.originalFile?.name?.toLowerCase().endsWith('.gif');
            if (isGif && item.originalDataUrl) {
                const converted = await this.convertGifViaBackend(item.originalDataUrl, item.originalFile);
                if (converted) continue;
            }
            if (item.imgObj) {
                this.convertImageClient(item.imgObj, item.originalFile, item.originalDataUrl);
            } else if (item.originalDataUrl) {
                const img = new Image();
                img.onload = () => this.convertImageClient(img, item.originalFile, item.originalDataUrl);
                img.src = item.originalDataUrl;
            }
        }
    },

    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    renderConvertedCards() {
        const grid = document.getElementById('converted-grid');
        const emptyState = document.getElementById('empty-state');
        const btnClear = document.getElementById('btn-clear-all');
        const btnDownloadAll = document.getElementById('btn-download-all');

        if (!grid) return;

        if (this.convertedImages.length === 0) {
            grid.innerHTML = '';
            if (emptyState) emptyState.style.display = 'block';
            if (btnClear) btnClear.style.display = 'none';
            if (btnDownloadAll) btnDownloadAll.style.display = 'none';
            return;
        }

        if (emptyState) emptyState.style.display = 'none';
        if (btnClear) btnClear.style.display = 'inline-flex';
        if (btnDownloadAll) btnDownloadAll.style.display = 'inline-flex';

        let html = '';
        this.convertedImages.forEach(item => {
            const savingsBadgeClass = item.savings >= 0 ? 'color: var(--success-color); background: rgba(0, 206, 201, 0.15);' : 'color: var(--warning-color); background: rgba(253, 203, 110, 0.15);';
            const savingsText = item.savings >= 0 ? `-${item.savings}% saved` : `+${Math.abs(item.savings)}% size`;

            html += `
                <div class="glass-panel image-card" style="padding: 16px; border-radius: var(--radius-md); display: flex; flex-direction: column; justify-content: space-between; transition: var(--transition);">
                    <div>
                        <!-- Image Preview Container -->
                        <div style="position: relative; width: 100%; height: 180px; background: rgba(0,0,0,0.4); border-radius: var(--radius-sm); overflow: hidden; display: flex; align-items: center; justify-content: center; margin-bottom: 14px; cursor: pointer;"
                             onclick="imageConverter.showPreviewModal('${item.id}')" title="Click to expand preview">
                            <img src="${item.convertedUrl}" alt="${item.convertedFileName}" style="max-width: 100%; max-height: 100%; object-fit: contain;">
                            ${item.isGif ? `
                                <span style="position: absolute; top: 8px; left: 8px; font-size: 0.72rem; font-weight: 700; padding: 3px 8px; border-radius: 10px; background: linear-gradient(135deg, #a29bfe, #6c5ce7); color: #fff; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">
                                    <i class='bx bxs-file-gif'></i> ${item.pages > 1 ? `Animated (${item.pages}f)` : 'GIF'}
                                </span>
                            ` : ''}
                            <span style="position: absolute; top: 8px; right: 8px; font-size: 0.75rem; font-weight: 700; padding: 4px 8px; border-radius: 12px; ${savingsBadgeClass}">
                                ${savingsText}
                            </span>
                            <span style="position: absolute; bottom: 8px; left: 8px; background: rgba(0,0,0,0.7); color: #fff; font-size: 0.75rem; padding: 2px 6px; border-radius: 4px;">
                                ${item.width} x ${item.height}
                            </span>
                        </div>

                        <!-- Image File Info -->
                        <div style="margin-bottom: 14px;">
                            <h4 style="margin: 0 0 6px 0; font-size: 0.95rem; font-weight: 600; color: var(--text-main); word-break: break-all; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${item.convertedFileName}">
                                ${item.convertedFileName}
                            </h4>
                            <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--text-muted);">
                                <span>Original (${item.originalFormat}): ${this.formatBytes(item.originalSize)}</span>
                                <span style="color: var(--success-color); font-weight: 600;">${item.targetFormatLabel}: ${this.formatBytes(item.convertedSize)}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Action Buttons: Copy & Download -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr 36px; gap: 8px; margin-top: 8px;">
                        <button class="btn btn-primary" onclick="imageConverter.copyImage('${item.id}')" style="padding: 8px 10px; font-size: 0.85rem; justify-content: center;">
                            <i class='bx bx-copy'></i> Copy
                        </button>
                        <button class="btn btn-primary" onclick="imageConverter.downloadImage('${item.id}')" style="padding: 8px 10px; font-size: 0.85rem; justify-content: center; background: #00b894;">
                            <i class='bx bx-download'></i> Download
                        </button>
                        <button class="btn-icon" onclick="imageConverter.removeImage('${item.id}')" style="color: var(--danger-color); padding: 8px;" title="Remove image">
                            <i class='bx bx-trash' style="font-size: 1.1rem;"></i>
                        </button>
                    </div>
                </div>
            `;
        });

        grid.innerHTML = html;
    },

    async copyImage(id) {
        const item = this.convertedImages.find(i => i.id === id);
        if (!item) return;

        try {
            if (navigator.clipboard && window.ClipboardItem) {
                try {
                    await navigator.clipboard.write([
                        new ClipboardItem({
                            [item.convertedBlob.type]: item.convertedBlob
                        })
                    ]);
                    window.app?.showToast(`Copied ${item.convertedFileName} (${item.targetFormatLabel}) to clipboard!`, 'success');
                    return;
                } catch (err) {
                    console.warn('Direct clipboard write failed, trying dataURL copy fallback:', err);
                }
            }

            if (navigator.clipboard && navigator.clipboard.writeText) {
                const reader = new FileReader();
                reader.onload = async () => {
                    await navigator.clipboard.writeText(reader.result);
                    window.app?.showToast(`Copied ${item.targetFormatLabel} Data URL to clipboard!`, 'success');
                };
                reader.readAsDataURL(item.convertedBlob);
            } else {
                throw new Error('Clipboard API not supported by browser.');
            }
        } catch (error) {
            console.error('Clipboard copy error:', error);
            window.app?.showToast('Unable to copy image to clipboard automatically.', 'error');
        }
    },

    downloadImage(id) {
        const item = this.convertedImages.find(i => i.id === id);
        if (!item) return;

        const a = document.createElement('a');
        a.href = item.convertedUrl;
        a.download = item.convertedFileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.app?.showToast(`Downloaded ${item.convertedFileName}`, 'success');
    },

    downloadAll() {
        if (this.convertedImages.length === 0) return;
        this.convertedImages.forEach(item => {
            this.downloadImage(item.id);
        });
    },

    removeImage(id) {
        const index = this.convertedImages.findIndex(i => i.id === id);
        if (index !== -1) {
            const item = this.convertedImages[index];
            if (item.convertedUrl) URL.revokeObjectURL(item.convertedUrl);
            this.convertedImages.splice(index, 1);
            this.renderConvertedCards();
            window.app?.showToast('Image removed', 'success');
        }
    },

    clearAll() {
        this.convertedImages.forEach(item => {
            if (item.convertedUrl) URL.revokeObjectURL(item.convertedUrl);
        });
        this.convertedImages = [];
        this.renderConvertedCards();
        window.app?.showToast('Cleared all converted images', 'success');
    },

    showPreviewModal(id) {
        const item = this.convertedImages.find(i => i.id === id);
        if (!item) return;

        const html = `
            <div style="position: relative;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                    <h3 style="margin: 0; color: var(--text-main); font-size: 1.25rem;">
                        <i class='bx bx-image' style="color: var(--primary-color); vertical-align: middle;"></i>
                        ${item.convertedFileName}
                    </h3>
                    <button type="button" class="btn-icon btn-cancel" style="font-size: 1.2rem;"><i class='bx bx-x'></i></button>
                </div>

                <div style="width: 100%; max-height: 450px; background: rgba(0,0,0,0.5); border-radius: var(--radius-md); overflow: hidden; display: flex; align-items: center; justify-content: center; padding: 12px; margin-bottom: 20px; border: 1px solid var(--border-color);">
                    <img src="${item.convertedUrl}" alt="${item.convertedFileName}" style="max-width: 100%; max-height: 420px; object-fit: contain; border-radius: var(--radius-sm);">
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; background: rgba(255,255,255,0.04); padding: 12px 16px; border-radius: var(--radius-md); font-size: 0.9rem;">
                    <div>
                        <span style="color: var(--text-muted);">Dimensions:</span> <strong style="color: var(--text-main);">${item.width} x ${item.height} px${item.pages > 1 ? ` (${item.pages} frames)` : ''}</strong>
                    </div>
                    <div>
                        <span style="color: var(--text-muted);">Original (${item.originalFormat}):</span> <strong style="color: var(--text-main);">${this.formatBytes(item.originalSize)}</strong>
                    </div>
                    <div>
                        <span style="color: var(--text-muted);">${item.targetFormatLabel} Size:</span> <strong style="color: var(--success-color);">${this.formatBytes(item.convertedSize)} (${item.savings >= 0 ? '-' + item.savings + '%' : '+' + Math.abs(item.savings) + '%'})</strong>
                    </div>
                </div>

                <!-- 2 Primary Action Options: Copy & Download Image -->
                <div style="display: flex; gap: 16px; justify-content: flex-end;">
                    <button type="button" class="btn btn-primary" onclick="imageConverter.copyImage('${item.id}')" style="padding: 10px 20px; font-size: 0.95rem;">
                        <i class='bx bx-copy' style="font-size: 1.1rem;"></i> Copy Image
                    </button>
                    <button type="button" class="btn btn-primary" onclick="imageConverter.downloadImage('${item.id}')" style="padding: 10px 20px; font-size: 0.95rem; background: #00b894;">
                        <i class='bx bx-download' style="font-size: 1.1rem;"></i> Download Image
                    </button>
                </div>
            </div>
        `;

        if (window.modals) {
            window.modals.open(html);
        }
    }
};
