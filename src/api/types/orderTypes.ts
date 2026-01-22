export interface MedicineOrder {
  id: string
  orderNo: string
  userId: string
  medicineId: string
  medicineName: string
  price: number
  quantity: number
  totalAmount: number
  status: number
  pharmacyLocationId: string
  paymentMethod: string
  paymentTime: string
  createdAt: string
}

export interface CreateOrderDTO {
  userId: string | number
  medicineId: string | number
  quantity: number
  pharmacyLocationId: string | number
}

export interface PayOrderDTO {
  orderId: string
  paymentMethod: string
}
