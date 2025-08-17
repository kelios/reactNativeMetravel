// src/utils/pdfWeb.ts
type Html2Pdf = (input: Element | string) => any;

declare global {
    interface Window {
        html2pdf?: Html2Pdf & { (): any };
    }
}

const CDN_SRC =
    "https://cdn.jsdelivr.net/npm/html2pdf.js@0.10.1/dist/html2pdf.bundle.min.js";

let loadingPromise: Promise<void> | null = null;

async function ensureBundleLoaded() {
    if (typeof window === "undefined") return;
    if (window.html2pdf) return;

    if (!loadingPromise) {
        loadingPromise = new Promise<void>((resolve, reject) => {
            const s = document.createElement("script");
            s.src = CDN_SRC;
            s.defer = true;
            s.onload = () => resolve();
            s.onerror = () => reject(new Error("html2pdf bundle load failed"));
            document.head.appendChild(s);
        });
    }
    await loadingPromise;
}

function waitNextFrame() {
    return new Promise<void>((r) => requestAnimationFrame(() => r()));
}

async function waitForFonts() {
    try {
        // @ts-ignore
        if (document?.fonts?.ready) await (document as any).fonts.ready;
    } catch {}
}

function waitImg(img: HTMLImageElement, timeoutMs: number) {
    if (img.complete && img.naturalWidth > 0) return Promise.resolve();

    return new Promise<void>((resolve) => {
        let done = false;
        const finish = () => {
            if (done) return;
            done = true;
            img.removeEventListener("load", finish);
            img.removeEventListener("error", finish);
            resolve();
        };
        const timer = window.setTimeout(finish, timeoutMs);
        img.addEventListener("load", () => {
            window.clearTimeout(timer);
            finish();
        });
        img.addEventListener("error", () => {
            window.clearTimeout(timer);
            finish();
        });
    });
}

async function waitForImages(root: HTMLElement, perImageTimeout = 2500) {
    const imgs = Array.from(root.querySelectorAll<HTMLImageElement>("img"));
    if (!imgs.length) return;
    await Promise.all(imgs.map((img) => waitImg(img, perImageTimeout)));
}

function mountCloneForExport(node: HTMLElement) {
    const host = document.createElement("div");
    host.style.position = "absolute";
    host.style.left = "-99999px";
    host.style.top = "0";
    host.style.opacity = "0";
    host.style.pointerEvents = "none";
    host.style.zIndex = "2147483647";
    host.style.width = "794px"; // ~210mm @ 96dpi
    document.body.appendChild(host);

    const clone = node.cloneNode(true) as HTMLElement;

    clone.style.position = "static";
    clone.style.left = "auto";
    clone.style.top = "auto";
    clone.style.right = "auto";
    clone.style.bottom = "auto";
    clone.style.zIndex = "auto";
    clone.style.pointerEvents = "auto";
    clone.style.opacity = "1";
    clone.style.transform = "none";
    clone.style.width = "794px";
    clone.style.maxWidth = "none";
    clone.style.background = "#fff";

    host.appendChild(clone);

    const cleanup = () => {
        try {
            document.body.removeChild(host);
        } catch {}
    };

    return { host, clone, cleanup };
}

export type SaveOptions = {
    filename?: string;
    margin?: number | number[];
    image?: { type?: "jpeg" | "png" | "webp"; quality?: number };
    html2canvas?: Partial<{
        useCORS: boolean;
        scale: number;
        backgroundColor: string | null;
        allowTaint: boolean;
        foreignObjectRendering: boolean;
        imageTimeout: number;
        logging: boolean;
    }>;
    jsPDF?: Partial<{
        unit: "mm" | "pt" | "cm" | "in";
        format: string | any[];
        orientation: "p" | "portrait" | "l" | "landscape";
    }>;
};

function buildOptions(opts: SaveOptions = {}) {
    const options: any = {
        filename: opts.filename ?? "metravel-book.pdf",
        margin: opts.margin ?? [0, 0, 0, 0],
        image: { type: "jpeg", quality: 0.96, ...(opts.image || {}) },
        html2canvas: {
            useCORS: true,
            allowTaint: true,
            backgroundColor: "#ffffff",
            scale: Math.min(2, window.devicePixelRatio || 1.5),
            foreignObjectRendering: true,
            imageTimeout: 0,
            logging: false,
            ...(opts.html2canvas || {}),
        },
        jsPDF: {
            unit: "mm",
            format: "a4",
            orientation: "portrait",
            ...(opts.jsPDF || {}),
        },
        pagebreak: { mode: ["css", "legacy"] },
    };
    return options;
}

export async function renderPreviewToBlobURL(
    node: HTMLElement,
    opts: SaveOptions = {}
) {
    await ensureBundleLoaded();
    const html2pdf = window.html2pdf!;
    const options = buildOptions(opts);

    const { clone, cleanup } = mountCloneForExport(node);
    try {
        await waitNextFrame();
        await waitForFonts();
        await waitForImages(clone, 2500);
        await waitNextFrame();
        // @ts-ignore
        const blob: Blob = await html2pdf().set(options).from(clone).outputPdf("blob");
        return URL.createObjectURL(blob);
    } finally {
        cleanup();
    }
}

export async function saveContainerAsPDF(
    node: HTMLElement,
    filename = "metravel-book.pdf",
    opts: SaveOptions = {}
) {
    const url = await renderPreviewToBlobURL(node, { ...opts, filename });
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    requestAnimationFrame(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
}

export async function openPDFPreview(
    node: HTMLElement,
    opts: SaveOptions = {}
) {
    const url = await renderPreviewToBlobURL(node, opts);
    if (!url) return;
    const w = window.open();
    if (!w) return;
    w.document.write(`
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Превью PDF</title>
  <style>
    html,body{height:100%;margin:0;background:#111}
    iframe{border:0;width:100%;height:100%;display:block;background:#2b2b2b}
  </style>
</head>
<body>
  <iframe src="${url}"></iframe>
</body>
</html>`);
    w.document.close();
}
