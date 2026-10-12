export const formatRupiah = (amount) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)

export const formatDate = (dateStr) =>
  new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(dateStr))

export const formatMonth = (year, month) =>
  new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(new Date(year, month - 1))

export const statusColor = (status) => {
  switch (status) {
    case 'approved': return 'bg-green-100 text-green-800'
    case 'rejected': return 'bg-red-100 text-red-800'
    default:         return 'bg-yellow-100 text-yellow-800'
  }
}

export const statusLabel = (status) => {
  switch (status) {
    case 'approved': return 'Disetujui'
    case 'rejected': return 'Ditolak'
    default:         return 'Menunggu'
  }
}
