import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { savingApi, studentApi } from '../../api/endpoints'
import { Card, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input, Select } from '../../components/ui/FormField'
import { Modal } from '../../components/ui/Modal'
import { PageLoader } from '../../components/ui/Spinner'
import { Badge } from '../../components/ui/Badge'
import { formatRupiah, formatDate } from '../../utils/format'
import { Plus, Pencil, Trash2, TrendingUp, TrendingDown } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'

const emptyForm = { student_id: '', type: 'deposit', amount: '', note: '', recorded_at: '' }

export default function SavingsPage() {
  const qc = useQueryClient()
  const [searchParams] = useSearchParams()
  const [modal, setModal] = useState(null)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState({ ...emptyForm, student_id: searchParams.get('student') ?? '' })
  const [activeStudent, setActiveStudent] = useState(searchParams.get('student') ?? '')

  const studentsQuery = useQuery({ queryKey: ['students'], queryFn: () => studentApi.listAll() })
  const students = studentsQuery.data?.data?.data ?? []

  const entriesQuery = useQuery({
    queryKey: ['savings', activeStudent],
    queryFn: () => savingApi.listByStudent(activeStudent),
    enabled: !!activeStudent,
  })

  const balanceQuery = useQuery({
    queryKey: ['balance', activeStudent],
    queryFn: () => savingApi.balance(activeStudent),
    enabled: !!activeStudent,
  })

  const entries = entriesQuery.data?.data?.data ?? []
  const balance = balanceQuery.data?.data?.data?.balance ?? 0
  const monthly = balanceQuery.data?.data?.data?.monthly_summary ?? []

  const createMutation = useMutation({
    mutationFn: () => savingApi.create({ ...form, amount: Number(form.amount) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['savings'] }); qc.invalidateQueries({ queryKey: ['balance'] }); setModal(null); toast.success('Entry ditambahkan') },
    onError: (e) => toast.error(e.response?.data?.error ?? 'Gagal'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => savingApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['savings'] }); qc.invalidateQueries({ queryKey: ['balance'] }); toast.success('Entry dihapus') },
    onError: (e) => toast.error(e.response?.data?.error ?? 'Gagal'),
  })

  const handleSubmit = (e) => { e.preventDefault(); createMutation.mutate() }

  if (studentsQuery.isLoading) return <PageLoader />

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tabungan Siswa</h1>
          <p className="text-sm text-gray-500">Kelola setoran dan penarikan</p>
        </div>
        <Button onClick={() => { setForm({ ...emptyForm, student_id: activeStudent }); setModal('create') }}>
          <Plus size={16} />Tambah Entry
        </Button>
      </div>

      {/* Student selector */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-4">
            <Select
              label="Pilih Siswa"
              value={activeStudent}
              onChange={(e) => setActiveStudent(e.target.value)}
              className="max-w-xs"
            >
              <option value="">-- Pilih siswa --</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({s.nis})</option>
              ))}
            </Select>

            {activeStudent && (
              <div className="flex gap-4 items-end">
                <div className="bg-blue-50 rounded-xl px-6 py-3 text-center">
                  <p className="text-xs text-gray-500">Saldo Aktif</p>
                  <p className="text-xl font-bold text-blue-700">{formatRupiah(balance)}</p>
                </div>
                <div className={`rounded-xl px-4 py-3 text-center ${balance >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                  <p className="text-xs text-gray-500">Status</p>
                  <p className={`text-sm font-semibold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {balance >= 0 ? '✓ Balance' : '✗ Deficit'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Monthly summary */}
      {monthly.length > 0 && (
        <Card>
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Ringkasan Bulanan</h2>
          </div>
          <div className="px-6 py-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {monthly.slice(0, 8).map((m) => (
              <div key={`${m.year}-${m.month}`} className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">{m.month}/{m.year}</p>
                <p className={`text-sm font-bold ${m.total >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {formatRupiah(m.total)}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Entries table */}
      {activeStudent && (
        <Card>
          <div className="overflow-x-auto">
            {entriesQuery.isLoading ? <PageLoader /> : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {['Tanggal', 'Jenis', 'Jumlah', 'Catatan', 'Aksi'].map((h) => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {entries.length === 0 && (
                    <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-400">Belum ada data</td></tr>
                  )}
                  {entries.map((e) => (
                    <tr key={e.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-gray-600">{formatDate(e.recorded_at)}</td>
                      <td className="px-6 py-3">
                        <Badge variant={e.type === 'deposit' ? 'green' : 'red'}>
                          {e.type === 'deposit' ? <TrendingUp size={12} className="mr-1" /> : <TrendingDown size={12} className="mr-1" />}
                          {e.type === 'deposit' ? 'Setoran' : 'Penarikan'}
                        </Badge>
                      </td>
                      <td className="px-6 py-3 font-medium">{formatRupiah(e.amount)}</td>
                      <td className="px-6 py-3 text-gray-500">{e.note || '—'}</td>
                      <td className="px-6 py-3">
                        <Button variant="danger" size="sm" onClick={() => {
                          if (window.confirm('Hapus entry ini?')) deleteMutation.mutate(e.id)
                        }}><Trash2 size={14} /></Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      )}

      <Modal open={modal !== null} onClose={() => setModal(null)} title="Tambah Entry Tabungan">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select label="Siswa" value={form.student_id} onChange={(e) => setForm({ ...form, student_id: e.target.value })} required>
            <option value="">-- Pilih siswa --</option>
            {students.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.nis})</option>)}
          </Select>
          <Select label="Jenis" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            <option value="deposit">Setoran</option>
            <option value="withdrawal">Penarikan</option>
          </Select>
          <Input label="Jumlah (Rp)" type="number" min="1" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
          <Input label="Catatan" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
          <Input label="Tanggal" type="date" value={form.recorded_at} onChange={(e) => setForm({ ...form, recorded_at: e.target.value })} />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModal(null)}>Batal</Button>
            <Button type="submit" disabled={createMutation.isPending}>Simpan</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
