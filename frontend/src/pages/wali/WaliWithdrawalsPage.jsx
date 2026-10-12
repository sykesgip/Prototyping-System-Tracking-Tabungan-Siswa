import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { withdrawalApi, studentApi } from '../../api/endpoints'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input, Select, Textarea } from '../../components/ui/FormField'
import { Modal } from '../../components/ui/Modal'
import { PageLoader } from '../../components/ui/Spinner'
import { Badge } from '../../components/ui/Badge'
import { formatRupiah, formatDate, statusLabel } from '../../utils/format'
import { Plus } from 'lucide-react'

function statusVariant(s) {
  if (s === 'approved') return 'green'
  if (s === 'rejected') return 'red'
  return 'yellow'
}

export default function WaliWithdrawalsPage() {
  const qc = useQueryClient()
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ student_id: '', amount: '', reason: '' })

  const { data, isLoading } = useQuery({
    queryKey: ['wali-withdrawals'],
    queryFn: () => withdrawalApi.listMine(),
  })

  const studentsQuery = useQuery({ queryKey: ['wali-students'], queryFn: () => studentApi.listMine() })
  const students = studentsQuery.data?.data?.data ?? []
  const withdrawals = data?.data?.data ?? []

  const createMutation = useMutation({
    mutationFn: () => withdrawalApi.create({ ...form, amount: Number(form.amount) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wali-withdrawals'] })
      setModal(false)
      toast.success('Pengajuan terkirim')
    },
    onError: (e) => toast.error(e.response?.data?.error ?? 'Gagal'),
  })

  const handleSubmit = (e) => { e.preventDefault(); createMutation.mutate() }

  if (isLoading) return <PageLoader />

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pengajuan Penarikan</h1>
          <p className="text-sm text-gray-500">Ajukan penarikan dana tabungan</p>
        </div>
        <Button onClick={() => setModal(true)}><Plus size={16} />Ajukan Penarikan</Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Tanggal', 'Jumlah', 'Alasan', 'Status', 'Catatan Admin'].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {withdrawals.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-400">Belum ada pengajuan</td></tr>
              )}
              {withdrawals.map((w) => (
                <tr key={w.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-gray-500 whitespace-nowrap">{formatDate(w.created_at)}</td>
                  <td className="px-6 py-3 font-semibold text-red-700">{formatRupiah(w.amount)}</td>
                  <td className="px-6 py-3 text-gray-500">{w.reason || '—'}</td>
                  <td className="px-6 py-3">
                    <Badge variant={statusVariant(w.status)}>{statusLabel(w.status)}</Badge>
                  </td>
                  <td className="px-6 py-3 text-gray-500">{w.review_note || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={modal} onClose={() => setModal(false)} title="Ajukan Penarikan Dana">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select label="Siswa" value={form.student_id} onChange={(e) => setForm({ ...form, student_id: e.target.value })} required>
            <option value="">-- Pilih siswa --</option>
            {students.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.nis})</option>)}
          </Select>
          <Input
            label="Jumlah Penarikan (Rp)"
            type="number"
            min="1"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            required
          />
          <Textarea
            label="Alasan"
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
            placeholder="Jelaskan alasan penarikan..."
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModal(false)}>Batal</Button>
            <Button type="submit" disabled={createMutation.isPending}>Kirim Pengajuan</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
