export type Operation = 'Venta' | 'Renta'
export type PropertyStatus = 'Disponible' | 'Reservada' | 'Vendida' | 'Alquilada'

export interface Property {
  id: string
  title: string
  description: string
  price: number
  currency: 'USD' | 'GTQ'
  operation: Operation
  type: string
  city: string
  zone: string
  address: string
  bedrooms: number
  bathrooms: number
  parking: number
  area_m2: number
  status: PropertyStatus
  featured: boolean
  published: boolean
  images: string[]
  created_at?: string
}
