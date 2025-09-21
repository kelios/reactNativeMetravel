// src/components/seo/InstantSEO.tsx
import React from 'react';
import Head from 'expo-router/head';

type Props = {
    headKey?: string | null;   // стабильный ключ для страницы (например, 'map', 'travel-list', и т.п.)
    title: string;
    description?: string;
    canonical?: string;
    image?: string;
    ogType?: 'website' | 'article';
};

function upsertMeta(sel: { name?: string; property?: string }, content?: string) {
    if (!content || typeof document === 'undefined') return;
    const head = document.head;
    const selector = sel.name
        ? `meta[name="${sel.name}"]`
        : `meta[property="${sel.property}"]`;

    let el = head.querySelector<HTMLMetaElement>(selector);
    if (!el) {
        el = document.createElement('meta');
        if (sel.name) el.setAttribute('name', sel.name);
        if (sel.property) el.setAttribute('property', sel.property);
        head.appendChild(el);
    }
    el.setAttribute('content', content);
}

function upsertCanonical(href?: string) {
    if (!href || typeof document === 'undefined') return;
    const head = document.head;
    let link = head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        head.appendChild(link);
    }
    link.setAttribute('href', href);
}

// «самый ранний» эффект: useInsertionEffect -> useLayoutEffect -> useEffect
const useEarlyEffect: typeof React.useLayoutEffect =
    // @ts-ignore
    (React as any).useInsertionEffect || React.useLayoutEffect || React.useEffect;

const InstantSEO: React.FC<Props> = ({
                                         headKey,
                                         title,
                                         description,
                                         canonical,
                                         image,
                                         ogType = 'website',
                                     }) => {
    // 1) Синхронно применяем тайтл/меты сразу при маунте/обновлении
    useEarlyEffect(() => {
        if (typeof document === 'undefined') return;

        try {
            document.title = title;

            upsertCanonical(canonical);

            if (description) {
                upsertMeta({ name: 'description' }, description);
                upsertMeta({ name: 'twitter:description' }, description);
                upsertMeta({ property: 'og:description' }, description);
            }

            upsertMeta({ property: 'og:type' }, ogType);
            upsertMeta({ property: 'og:title' }, title);
            upsertMeta({ name: 'twitter:title' }, title);

            if (image) {
                upsertMeta({ property: 'og:image' }, image);
                upsertMeta({ name: 'twitter:image' }, image);
            }

            if (canonical) {
                upsertMeta({ property: 'og:url' }, canonical);
            }

            upsertMeta({ name: 'twitter:card' }, 'summary_large_image');

            // маяк для восстановления после BFCache
            upsertMeta({ name: 'x-current-title' }, title);
        } catch {}
    }, [title, description, canonical, image, ogType]);

    // 2) При возвращении «назад» из bfcache браузера — ещё раз фиксируем тайтл
    React.useEffect(() => {
        if (typeof window === 'undefined') return;
        const onPageShow = (e: PageTransitionEvent) => {
            // isTrusted + persisted гарантирует BFCache; но нам ок и просто дожать тайтл
            try {
                const meta = document.head.querySelector<HTMLMetaElement>('meta[name="x-current-title"]');
                const expected = meta?.getAttribute('content') || title;
                if (document.title !== expected) {
                    document.title = expected;
                }
            } catch {}
        };
        window.addEventListener('pageshow', onPageShow);
        return () => window.removeEventListener('pageshow', onPageShow);
    }, [title]);

    // 3) SSR/пререндер — дублируем в <Head>
    return (
        <Head key={headKey ?? 'instant-seo'}>
            <title key="title">{title}</title>
            {description && <meta key="description" name="description" content={description} />}
            {canonical && <link key="canonical" rel="canonical" href={canonical} />}

            {/* Open Graph */}
            <meta key="og:type" property="og:type" content={ogType} />
            <meta key="og:title" property="og:title" content={title} />
            {description && <meta key="og:description" property="og:description" content={description} />}
            {canonical && <meta key="og:url" property="og:url" content={canonical} />}
            {image && <meta key="og:image" property="og:image" content={image} />}

            {/* Twitter */}
            <meta key="twitter:card" name="twitter:card" content="summary_large_image" />
            <meta key="twitter:title" name="twitter:title" content={title} />
            {description && (
                <meta key="twitter:description" name="twitter:description" content={description} />
            )}
            {image && <meta key="twitter:image" name="twitter:image" content={image} />}
        </Head>
    );
};

export default InstantSEO;
