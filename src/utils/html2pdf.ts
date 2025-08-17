// WEB-ONLY util: безопасная загрузка html2pdf.bundle + экспорт "сохранить в PDF"

type Html2Pdf = (input: Element | string) => any;

declare global {
    interface Window {
        html2pdf?: Html2Pdf & { (): any };
    }
}

const CDN_SRC =
    'https://cdn.jsdelivr.net/npm/html2pdf.js@0.10.1/dist/html2pdf.bundle.min.js';

let loadingPromise: Promise<void> | null = null;

async function ensureBundleLoaded() {
    if (typeof window === 'undefined') return; // на всякий
    if (window.html2pdf) return;

    if (!loadingPromise) {
        loadingPromise = new Promise<void>((resolve, reject) => {
            const s = document.createElement('script');
            s.src = CDN_SRC;
            s.defer = true;
            s.onload = () => resolve();
            s.onerror = (e) => reject(new Error('html2pdf bundle load failed'));
            document.head.appendChild(s);
        });
    }
    await loadingPromise;
}

export type SaveOptions = {
    filename?: string;
    margin?: number | number[];
    image?: { type?: 'jpeg' | 'png' | 'webp'; quality?: number };
    html2canvas?: Partial<{
        useCORS: boolean;
        scale: number;
        backgroundColor: string | null;
        allowTaint: boolean;
    }>;
    jsPDF?: Partial<{ unit: 'mm' | 'pt' | 'cm' | 'in'; format: string | any[]; orientation: 'p' | 'portrait' | 'l' | 'landscape' }>;
};

export async function saveHtmlAsPdf(
    node: HTMLElement,
    opts: SaveOptions = {}
) {
    await ensureBundleLoaded();
    const html2pdf = window.html2pdf!;
    const options: any = {
        filename: opts.filename ?? 'metravel-book.pdf',
        margin: opts.margin ?? [10, 10, 14, 10],
        image: { type: 'jpeg', quality: 0.92, ...(opts.image || {}) },
        html2canvas: {
            useCORS: true,
            backgroundColor: '#ffffff',
            scale: window.devicePixelRatio > 2 ? 2 : 1.5,
            ...(opts.html2canvas || {}),
        },
        jsPDF: {
            unit: 'mm',
            format: 'a4',
            orientation: 'portrait',
            ...(opts.jsPDF || {}),
        },
        pagebreak: { mode: ['css', 'legacy'] }, // уважаем .page-break и т.п.
    };

    await html2pdf().set(options).from(node).save();
}

export async function getPdfBlob(
    node: HTMLElement,
    opts: SaveOptions = {}
): Promise<Blob> {
    await ensureBundleLoaded();
    const html2pdf = window.html2pdf!;
    const options: any = {
        filename: 'metravel-book.pdf',
        margin: [10, 10, 14, 10],
        image: { type: 'jpeg', quality: 0.92 },
        html2canvas: { useCORS: true, backgroundColor: '#ffffff', scale: 1.5 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['css', 'legacy'] },
        ...(opts as any),
    };

    const worker = html2pdf().set(options).from(node);
    // @ts-ignore – у html2pdf есть метод outputPdf, но типов нет
    const blob: Blob = await worker.outputPdf('blob');
    return blob;
}
