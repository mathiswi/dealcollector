/* eslint-disable @typescript-eslint/no-unused-vars */

interface ScrapeResponse {
  data: any
}

interface AnchorElement {
  href: string
}

interface Deal {
  dealId?: string
  name: string | null
  description?: string | null
  dealPrice: number | null
  regularPrice?: number | null
  discount?: string | null
  imageUrl: string
  validFrom?: number
  unit?: string
  basePrice?: string
  category?: string
  shop: string
  expirationTime?: number
  detailPage?: string
}

interface Collection {
  name: string
}
