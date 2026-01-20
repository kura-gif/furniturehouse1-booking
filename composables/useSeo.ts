/**
 * SEO関連のcomposable
 * 構造化データ（JSON-LD）とメタタグの管理
 */

interface SeoOptions {
  title?: string
  description?: string
  image?: string
  url?: string
  type?: 'website' | 'article' | 'product'
}

interface LodgingBusinessData {
  name: string
  description: string
  image: string[]
  address: {
    streetAddress: string
    addressLocality: string
    addressRegion: string
    postalCode: string
    addressCountry: string
  }
  geo: {
    latitude: number
    longitude: number
  }
  priceRange: string
  telephone?: string
  url: string
  checkinTime?: string
  checkoutTime?: string
  amenityFeature?: string[]
}

export const useSeo = () => {
  const config = useRuntimeConfig()
  const siteUrl = config.public.siteUrl || 'https://booking.furniturehouse1.com'

  /**
   * 基本的なメタタグを設定
   */
  const setBasicMeta = (options: SeoOptions) => {
    const {
      title = '家具の家 No.1 | 坂茂の初期作品に宿泊する',
      description = '家具が家を支える「体験する建築」。風が通り、光が移ろい、音が吸い込まれる。静かな時間の中で、構造体としての家具に囲まれる不思議な感覚を味わう宿泊体験。',
      image = `${siteUrl}/images/ogp-image.jpg`,
      url = siteUrl,
      type = 'website'
    } = options

    useHead({
      title,
      meta: [
        { name: 'description', content: description },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:image', content: image },
        { property: 'og:url', content: url },
        { property: 'og:type', content: type },
        { property: 'og:site_name', content: '家具の家 No.1' },
        { property: 'og:locale', content: 'ja_JP' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: description },
        { name: 'twitter:image', content: image }
      ],
      link: [
        { rel: 'canonical', href: url }
      ]
    })
  }

  /**
   * 宿泊施設の構造化データを設定
   */
  const setLodgingBusinessSchema = (data?: Partial<LodgingBusinessData>) => {
    const defaultData: LodgingBusinessData = {
      name: '家具の家 No.1',
      description: '坂茂氏による1995年の建築作品「家具の家 No.1」。家具が家を支える「体験する建築」。1日1組限定の宿泊体験。',
      image: [
        `${siteUrl}/images/ogp-image.jpg`,
        `${siteUrl}/images/hero/01.webp`,
        `${siteUrl}/images/hero/02.webp`
      ],
      address: {
        streetAddress: '神奈川県中郡二宮町',
        addressLocality: '二宮町',
        addressRegion: '神奈川県',
        postalCode: '259-0123',
        addressCountry: 'JP'
      },
      geo: {
        latitude: 35.3045,
        longitude: 139.2558
      },
      priceRange: '¥30,000〜',
      url: siteUrl,
      checkinTime: '14:00',
      checkoutTime: '10:00',
      amenityFeature: [
        'Wi-Fi',
        'エアコン',
        'キッチン',
        'バスルーム',
        '駐車場'
      ]
    }

    const mergedData = { ...defaultData, ...data }

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'LodgingBusiness',
      'name': mergedData.name,
      'description': mergedData.description,
      'image': mergedData.image,
      'address': {
        '@type': 'PostalAddress',
        'streetAddress': mergedData.address.streetAddress,
        'addressLocality': mergedData.address.addressLocality,
        'addressRegion': mergedData.address.addressRegion,
        'postalCode': mergedData.address.postalCode,
        'addressCountry': mergedData.address.addressCountry
      },
      'geo': {
        '@type': 'GeoCoordinates',
        'latitude': mergedData.geo.latitude,
        'longitude': mergedData.geo.longitude
      },
      'priceRange': mergedData.priceRange,
      'url': mergedData.url,
      'checkinTime': mergedData.checkinTime,
      'checkoutTime': mergedData.checkoutTime,
      'amenityFeature': mergedData.amenityFeature?.map(feature => ({
        '@type': 'LocationFeatureSpecification',
        'name': feature,
        'value': true
      }))
    }

    useHead({
      script: [
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify(schema)
        }
      ]
    })
  }

  /**
   * パンくずリストの構造化データを設定
   */
  const setBreadcrumbSchema = (items: Array<{ name: string; url: string }>) => {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': items.map((item, index) => ({
        '@type': 'ListItem',
        'position': index + 1,
        'name': item.name,
        'item': item.url.startsWith('http') ? item.url : `${siteUrl}${item.url}`
      }))
    }

    useHead({
      script: [
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify(schema)
        }
      ]
    })
  }

  /**
   * FAQの構造化データを設定
   */
  const setFaqSchema = (faqs: Array<{ question: string; answer: string }>) => {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': faqs.map(faq => ({
        '@type': 'Question',
        'name': faq.question,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': faq.answer
        }
      }))
    }

    useHead({
      script: [
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify(schema)
        }
      ]
    })
  }

  /**
   * レビューの構造化データを設定
   */
  const setReviewSchema = (reviews: Array<{
    author: string
    rating: number
    reviewBody: string
    datePublished: string
  }>) => {
    if (reviews.length === 0) return

    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'LodgingBusiness',
      'name': '家具の家 No.1',
      'aggregateRating': {
        '@type': 'AggregateRating',
        'ratingValue': avgRating.toFixed(1),
        'reviewCount': reviews.length,
        'bestRating': 5,
        'worstRating': 1
      },
      'review': reviews.slice(0, 5).map(review => ({
        '@type': 'Review',
        'author': {
          '@type': 'Person',
          'name': review.author
        },
        'reviewRating': {
          '@type': 'Rating',
          'ratingValue': review.rating,
          'bestRating': 5,
          'worstRating': 1
        },
        'reviewBody': review.reviewBody,
        'datePublished': review.datePublished
      }))
    }

    useHead({
      script: [
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify(schema)
        }
      ]
    })
  }

  return {
    setBasicMeta,
    setLodgingBusinessSchema,
    setBreadcrumbSchema,
    setFaqSchema,
    setReviewSchema,
    siteUrl
  }
}
