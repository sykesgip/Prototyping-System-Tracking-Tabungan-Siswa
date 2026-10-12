import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { withdrawalApi } from '../../api/endpoints'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Select, Input } from '../../components/ui/FormField'
import { Modal } from '../../components/ui/Modal'
import { PageLoader } from '../../components/ui/Spinner'
import { Badge } from '../../components/ui/Badge'
import { formatRupiah, formatDate, statusColor, statusLabel } from '../../utils/format'
import { CheckCircle, XCircle, Filter } from 'lucide-react'

function statusVariant(s) {
  if (s === 'approved') return 'green'
  if (s === 'rejected') return 'red'
  return 'yellow'
}

export default function WithdrawalsPage() {
  const qc = useQueryClient()
  const [reviewModal, setReviewModal] = useState(null)
  const [reviewForm, setReviewForm] = useState({ status: 'approved', review_note: '' })
  const [filterStatus, setFilterStatus] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['withdrawals'],
    queryFn: () => withdrawalApi.listAll(),
  })

  const all = data?.data?.data ?? []
  const withdrawals = filterStatus ? all.filter((w) => w.status === filterStatus) : all

  const reviewMutation = useMutation({
    mutationFn: () => withdrawalApi.review(reviewModal.id, reviewForm),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['withdrawals'] })
      setReviewModal(null)
      toast.success('Pengajuan diperbarui')
    },
    onError: (e) => toast.error(e.response?.data?.error ?? 'Gagal'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => withdrawalApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['withdrawals'] }); toast.success('Dihapus') },
    onError: (e) => toast.error(e.response?.data?.error ?? 'Gagal'),
  })

  if (isLoading) return <PageLoader />

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pengajuan Penarikan</h1>
          <p className="text-sm text-gray-500">Review dan kelola pengajuan dana</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Semua Status</option>
            <option value="pending">Menunggu</option>
            <option value="approved">Disetujui</option>
            <option value="rejected">Ditolak</option>
          </select>
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Tanggal', 'Siswa', 'Wali', 'Jumlah', 'Alasan', 'Status', 'Aksi'].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {withdrawals.length === 0 && (
                <tr><td colSpan={7} className="px-6 py-10 text-center text-gray-400">Tidak ada data</td></tr>
              )}
              {withdrawals.map((w) => (
                <tr key={w.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-gray-500 whitespace-nowrap">{formatDate(w.created_at)}</td>
                  <td className="px-6 py-3 font-medium text-gray-900">{w.student?.name ?? '—'}</td>
                  <td className="px-6 py-3 text-gray-600">{w.requester?.name ?? '—'}</td>
                  <td className="px-6 py-3 font-semibold text-red-700">{formatRupiah(w.amount)}</td>
                  <td className="px-6 py-3 text-gray-500 max-w-xs truncate">{w.reason || '—'}</td>
                  <td className="px-6 py-3">
                    <Badge variant={statusVariant(w.status)}>{statusLabel(w.status)}</Badge>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      {w.status === 'pending' && (
                        <Button size="sm" onClick={() => { setReviewModal(w); setReviewForm({ status: 'approved', review_note: '' }) }}>
                          <CheckCircle size={14} /> Review
                        </Button>
                      )}
                      {w.status === 'pending' && (
                        <Button variant="danger" size="sm" onClick={() => {
                          if (window.confirm('Hapus pengajuan ini?')) deleteMutation.mutate(w.id)
                        }}>
                          <XCircle size={14} />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={reviewModal !== null} onClose={() => setReviewModal(null)} title="Review Pengajuan">
        {reviewModal && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-1">
              <p><span className="text-gray-500">Siswa:</span> <strong>{reviewModal.student?.name}</strong></p>
              <p><span className="text-gray-500">Jumlah:</span> <strong className="text-red-700">{formatRupiah(reviewModal.amount)}</strong></p>
              <p><span className="text-gray-500">Alasan:</span> {reviewModal.reason || '—'}</p>
            </div>
            <Select label="Keputusan" value={reviewForm.status} onChange={(e) => setReviewForm({ ...reviewForm, status: e.target.value })}>
              <option value="approved">Setujui</option>
              <option value="rejected">Tolak</option>
            </Select>
            <Input
              label="Catatan Review"
              value={reviewForm.review_note}
              onChange={(e) => setReviewForm({ ...reviewForm, review_note: e.target.value })}
              placeholder="Opsional..."
            />
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="secondary" onClick={() => setReviewModal(null)}>Batal</Button>
              <Button onClick={() => reviewMutation.mutate()} disabled={reviewMutation.isPending}>
                Konfirmasi
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
