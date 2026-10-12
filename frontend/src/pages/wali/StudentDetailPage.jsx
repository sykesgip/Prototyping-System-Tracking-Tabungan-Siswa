import { useQuery } from '@tanstack/react-query'
import { useParams, Link } from 'react-router-dom'
import { savingApi } from '../../api/endpoints'
import { Card, CardBody } from '../../components/ui/Card'
import { PageLoader } from '../../components/ui/Spinner'
import { Badge } from '../../components/ui/Badge'
import { formatRupiah, formatDate, formatMonth } from '../../utils/format'
import { TrendingUp, TrendingDown, ArrowLeft } from 'lucide-react'

export default function StudentDetailPage() {
  const { id } = useParams()

  const balanceQuery = useQuery({
    queryKey: ['balance', id],
    queryFn: () => savingApi.balance(id),
  })

  if (balanceQuery.isLoading) return <PageLoader />

  const detail = balanceQuery.data?.data?.data ?? {}
  const { balance = 0, entries = [], monthly_summary = [] } = detail

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link to="/wali/students" className="text-gray-500 hover:text-gray-700">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Detail Tabungan</h1>
          <p className="text-sm text-gray-500">Riwayat lengkap tabungan siswa</p>
        </div>
      </div>

      {/* Balance card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardBody className="text-center py-6">
            <p className="text-sm text-gray-500 mb-1">Saldo Aktif</p>
            <p className="text-3xl font-bold text-blue-700">{formatRupiah(balance)}</p>
            <p className={`text-sm mt-2 font-medium ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {balance >= 0 ? '✓ Saldo Cukup' : '✗ Saldo Minus'}
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center py-6">
            <p className="text-sm text-gray-500 mb-1">Total Transaksi</p>
            <p className="text-3xl font-bold text-gray-800">{entries.length}</p>
            <p className="text-sm mt-2 text-gray-400">Setoran & Penarikan</p>
          </CardBody>
        </Card>
      </div>

      {/* Monthly summary */}
      {monthly_summary.length > 0 && (
        <Card>
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Ringkasan Per Bulan</h2>
          </div>
          <div className="px-6 py-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="pb-2 text-left text-xs font-semibold text-gray-500">Bulan</th>
                  <th className="pb-2 text-right text-xs font-semibold text-gray-500">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {monthly_summary.map((m) => (
                  <tr key={`${m.year}-${m.month}`}>
                    <td className="py-2 text-gray-700">{formatMonth(m.year, m.month)}</td>
                    <td className={`py-2 text-right font-semibold ${m.total >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                      {formatRupiah(m.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Transaction history */}
      <Card>
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Riwayat Transaksi</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Tanggal', 'Jenis', 'Jumlah', 'Catatan'].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {entries.length === 0 && (
                <tr><td colSpan={4} className="px-6 py-10 text-center text-gray-400">Belum ada transaksi</td></tr>
              )}
              {entries.map((e) => (
                <tr key={e.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-gray-600">{formatDate(e.recorded_at)}</td>
                  <td className="px-6 py-3">
                    <Badge variant={e.type === 'deposit' ? 'green' : 'red'}>
                      <span className="flex items-center gap-1">
                        {e.type === 'deposit' ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                        {e.type === 'deposit' ? 'Setoran' : 'Penarikan'}
                      </span>
                    </Badge>
                  </td>
                  <td className="px-6 py-3 font-medium">{formatRupiah(e.amount)}</td>
                  <td className="px-6 py-3 text-gray-500">{e.note || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
