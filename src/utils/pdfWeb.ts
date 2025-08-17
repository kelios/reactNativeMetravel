type Html2Pdf = (element: HTMLElement | string, options?: any) => {
    set: (options: any) => Html2Pdf;
    from: (element: HTMLElement | string) => Html2Pdf;
    to: (target: any) => Html2Pdf;
    save: () => Promise<void>;
    outputPdf: (type: 'blob' | 'datauristring') => Promise<Blob | string>;
};

declare global {
    interface Window {
        html2pdf?: Html2Pdf & { (): Html2Pdf };
    }
}

const CDN_SRC = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";

let loadingPromise: Promise<void> | null = null;

async function ensureBundleLoaded() {
    if (typeof window === "undefined") return;
    if (window.html2pdf) return;

    loadingPromise = new Promise<void>((resolve, reject) => {
        const script = document.createElement("script");
        script.src = CDN_SRC;
        script.onload = () => {
            if (window.html2pdf) {
                resolve();
            } else {
                reject(new Error("html2pdf not found after loading"));
            }
        };
        script.onerror = () => reject(new Error("Failed to load html2pdf"));
        document.head.appendChild(script);
    });

    await loadingPromise;
}

export type SaveOptions = {
    filename?: string;
    margin?: number | number[];
    image?: { type?: "jpeg" | "png"; quality?: number };
    pagebreak?: {
        mode?: string[];
        before?: string;
        after?: string;
        avoid?: string;
    };
};

async function prepareForExport(node: HTMLElement): Promise<HTMLElement> {
    const container = document.createElement("div");
    container.style.cssText = `
        position: fixed;
        left: 0;
        top: 0;
        width: 794px;
        height: auto;
        visibility: visible;
        opacity: 1;
        z-index: 2147483647;
        background: #ffffff;
        padding: 0;
        margin: 0;
        overflow: visible;
    `;

    const clone = node.cloneNode(true) as HTMLElement;
    clone.style.cssText = `
        width: 100%;
        height: auto;
        position: static;
        visibility: visible;
        opacity: 1;
        background: #ffffff;
        box-sizing: border-box;
    `;

    const style = document.createElement("style");
    style.textContent = `
        @page { size: A4; margin: 0; }
        * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
        }
    `;
    clone.prepend(style);

    container.appendChild(clone);
    document.body.appendChild(container);

    return container;
}

async function cleanupExport(container: HTMLElement) {
    if (container?.parentNode) {
        document.body.removeChild(container);
    }
}

async function waitForResources(element: HTMLElement) {
    try {
        await document.fonts.ready;
    } catch (e) {
        console.warn("Font loading warning:", e);
    }

    const images = Array.from(element.querySelectorAll("img"));
    await Promise.all(images.map(img => {
        if (img.complete && img.naturalWidth > 0) {
            return Promise.resolve();
        }
        return new Promise<void>(resolve => {
            img.onload = img.onerror = () => resolve();
        });
    }));

    await new Promise(resolve => requestAnimationFrame(resolve));
    await new Promise(resolve => setTimeout(resolve, 100));
}

export async function renderPreviewToBlobURL(
    node: HTMLElement,
    opts: SaveOptions = {}
): Promise<string> {
    await ensureBundleLoaded();
    if (!window.html2pdf) {
        throw new Error("html2pdf not available");
    }

    const container = await prepareForExport(node);
    const clone = container.firstChild as HTMLElement;

    try {
        await waitForResources(clone);

        const options = {
            filename: opts.filename || "document.pdf",
            margin: opts.margin || 10,
            image: {
                type: opts.image?.type || "jpeg",
                quality: opts.image?.quality || 0.95
            },
            html2canvas: {
                scale: 2,
                useCORS: true,
                allowTaint: false,
                backgroundColor: '#FFFFFF',
                logging: false,
                width: clone.scrollWidth,
                height: clone.scrollHeight,
            },
            jsPDF: {
                unit: "mm",
                format: "a4",
                orientation: "portrait"
            }
        };

        const blob = await window.html2pdf()
            .set(options)
            .from(clone)
            .outputPdf("blob");

        return URL.createObjectURL(blob);
    } catch (error) {
        console.error("PDF generation failed:", error);
        throw error;
    } finally {
        await cleanupExport(container);
    }
}

export async function saveContainerAsPDF(
    node: HTMLElement,
    filename: string,
    opts: SaveOptions = {}
) {
    try {
        const loadingEl = document.createElement("div");
        loadingEl.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            padding: 20px;
            background: #4a7c59;
            color: white;
            text-align: center;
            z-index: 9999;
        `;
        loadingEl.textContent = "Создание PDF...";
        document.body.appendChild(loadingEl);

        const url = await renderPreviewToBlobURL(node, {
            ...opts,
            filename
        });

        if (!url) {
            throw new Error("Failed to generate PDF");
        }

        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();

        setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }, 100);

    } catch (error) {
        console.error("Error saving PDF:", error);

        const errorMsg = document.createElement("div");
        errorMsg.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            padding: 20px;
            background: #d32f2f;
            color: white;
            text-align: center;
            z-index: 9999;
        `;
        errorMsg.textContent = "Ошибка при создании PDF";
        document.body.appendChild(errorMsg);

        setTimeout(() => {
            if (errorMsg.parentNode) {
                document.body.removeChild(errorMsg);
            }
        }, 3000);

        throw error;
    } finally {
        const loader = document.querySelector('div[style*="background: #4a7c59"]');
        if (loader?.parentNode) {
            document.body.removeChild(loader);
        }
    }
}