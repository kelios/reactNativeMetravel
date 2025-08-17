// WEB HTML generator for "book" layout
// NOTE: изображения берём как есть; html2canvas сам прогрузит их при конверте.

import QRCode from 'qrcode'

type Travel = {
    id: number | string
    name: string
    slug?: string
    url?: string
    countryName?: string
    description?: string // HTML
    recommendation?: string // HTML
    plus?: string // HTML
    minus?: string // HTML
    gallery?: { url: string; id?: string | number; updated_at?: string }[]
    travel_image_thumb_url?: string
    youtube_link?: string
}

function escapeHtml(s: string) {
    return (s ?? '')
        .replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function sanitizeHTML(html?: string) {
    if (!html) return ''
    // простая очистка: убираем скрипты/iframes/style
    return html
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
        .replace(/<style[\s\S]*?<\/style>/gi, '')
}

async function makeQR(url: string) {
    try {
        return await QRCode.toDataURL(url, { margin: 0, scale: 4 })
    } catch {
        return ''
    }
}

function coverImage(travel: Travel) {
    const first =
        travel?.gallery?.[0]?.url ||
        travel?.travel_image_thumb_url ||
        ''

    if (!first) return ''
    return `<img class="cover-photo" src="${first}" crossOrigin="anonymous" />`
}

function restGallery(travel: Travel) {
    const imgs = (travel.gallery ?? []).slice(1)
    if (!imgs.length) return ''
    return `
    <div class="gallery-title">Фото</div>
    <div class="gallery-grid">
      ${imgs.map(g => `<img src="${g.url}" crossOrigin="anonymous" />`).join('')}
    </div>
  `
}

function twoCol(htmlA: string, htmlB?: string) {
    return `
  <div class="two-col">
    <div class="col">${htmlA}</div>
    ${htmlB ? `<div class="col">${htmlB}</div>` : ''}
  </div>`
}

function smallMeta(travel: Travel, qr?: string) {
    const url = travel.slug ? `https://metravel.by/travels/${travel.slug}` : (travel.url || '')
    return `
  <div class="meta-strip">
    <div class="meta-box">
      <div class="meta-line"><b>Страна:</b> ${escapeHtml(travel.countryName || '-')}</div>
      <div class="meta-line"><b>Сложность:</b> —</div>
      <div class="meta-line"><b>Дней:</b> —</div>
      <div class="meta-line"><b>Транспорт:</b> —</div>
    </div>
    <div class="meta-chart">
      <svg width="220" height="60" viewBox="0 0 220 60" xmlns="http://www.w3.org/2000/svg">
        <polyline fill="none" stroke="#4a7c59" stroke-width="3"
          points="0,40 40,20 80,30 120,15 160,35 200,25 220,40" />
      </svg>
      <div class="meta-icons">🏕️ 🚶 🚗 📷</div>
    </div>
    <div class="meta-qr">
      ${qr ? `<img src="${qr}" />` : ''}
      ${url ? `<div class="qr-caption">${escapeHtml(url)}</div>` : ''}
    </div>
  </div>`
}

export async function buildBookHTML(selected: Travel[], opts?: { title?: string, subtitle?: string }) {
    const title = opts?.title || 'Коллекция путешествий'
    const subtitle = opts?.subtitle || `Подборка: ${selected.length}`

    // QR заранее (параллельно)
    const qrs = await Promise.all(
        selected.map(t => makeQR(t.slug ? `https://metravel.by/travels/${t.slug}` : (t.url || '')))
    )

    const toc = selected
        .map((t, i) => `<div class="toc-item"><span>${escapeHtml(t.name)}</span><span>${(i + 1) * 4}</span></div>`)
        .join('')

    const sections = await Promise.all(
        selected.map(async (t, idx) => {
            const qr = qrs[idx]
            const left = `
        <h2 class="section-title">${escapeHtml(t.name)}</h2>
        ${coverImage(t)}
        ${smallMeta(t, qr)}
      `

            const right = `
        ${t.description ? `<h3>Описание</h3>${sanitizeHTML(t.description)}` : ''}
        ${t.recommendation ? `<h3>Рекомендации</h3>${sanitizeHTML(t.recommendation)}` : ''}
        ${t.plus ? `<h3>Плюсы</h3>${sanitizeHTML(t.plus)}` : ''}
        ${t.minus ? `<h3>Минусы</h3>${sanitizeHTML(t.minus)}` : ''}
      `

            return `
        <section class="page">
          ${twoCol(left, right)}
          ${restGallery(t)}
        </section>
      `
        })
    )

    return `
<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${escapeHtml(title)}</title>
<style>
  /* базовые */
  * { box-sizing: border-box; }
  body { margin:0; font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial; color:#222; }
  h1,h2,h3 { margin:0 0 8px; }
  h1 { font-size: 28px; }
  h2 { font-size: 22px; }
  h3 { font-size: 16px; text-transform: uppercase; letter-spacing:.02em; color:#4a7c59; }
  p { margin: 0 0 10px; line-height: 1.45; }
  ul { margin: 0 0 10px 18px; }
  img { max-width: 100%; display: block; }

  /* размер страницы для html2pdf (A4) */
  .page { width: 794px; min-height: 1123px; padding: 24px 28px; margin: 0 auto 16px; background:#fff; position: relative; }
  .title-page { display:flex; flex-direction:column; justify-content:flex-end; height: 1123px; background:#f7f7f2; padding: 64px 56px; }
  .title-main { font-size: 40px; font-weight: 800; margin-bottom: 8px; }
  .title-sub { font-size: 18px; color:#666; }

  .toc { padding: 24px 28px; }
  .toc h2 { margin-bottom: 12px; }
  .toc-item { display:flex; justify-content:space-between; padding: 6px 0; border-bottom: 1px dashed #ddd; font-size: 14px; }

  .two-col { display:flex; gap: 20px; }
  .two-col .col { flex:1; }
  .cover-photo { width: 100%; height: 280px; object-fit: cover; border-radius: 8px; margin: 8px 0 12px; }

  .meta-strip { display:flex; gap: 16px; align-items: center; margin: 10px 0 14px; }
  .meta-box { background:#f1f4ef; border-radius: 8px; padding: 10px 12px; flex: 1; }
  .meta-line { font-size: 13px; margin-bottom: 4px; }
  .meta-chart { width: 240px; text-align:center; }
  .meta-icons { font-size: 14px; color:#666; margin-top: 4px; }
  .meta-qr { width: 170px; text-align:center; }
  .meta-qr img { width: 120px; height: 120px; margin: 0 auto 6px; }

  .section-title { margin-bottom: 8px; border-left: 5px solid #4a7c59; padding-left: 10px; }

  .gallery-title { margin-top: 12px; font-weight: 700; text-transform: uppercase; color:#555; letter-spacing: .04em; }
  .gallery-grid { display:grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 8px; }
  .gallery-grid img { height: 140px; object-fit: cover; border-radius: 6px; }

  /* печать */
  @media print {
    body { background:#fff; }
    .page { page-break-after: always; box-shadow: none; margin: 0 auto; }
  }
</style>
</head>
<body>
  <!-- титульная -->
  <section class="page title-page">
    <div>
      <div class="title-main">${escapeHtml(title)}</div>
      <div class="title-sub">${escapeHtml(subtitle)}</div>
    </div>
  </section>

  <!-- оглавление -->
  <section class="page toc">
    <h2>Содержание</h2>
    ${toc}
  </section>

  ${sections.join('')}
</body>
</html>
`
}
