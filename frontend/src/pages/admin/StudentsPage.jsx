import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { studentApi } from '../../api/endpoints'
import { Card, CardHeader, CardBody } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input, Select } from '../../components/ui/FormField'
import { Modal } from '../../components/ui/Modal'
import { PageLoader } from '../../components/ui/Spinner'
import { Plus, Pencil, Trash2 } from 'lucide-react'

const emptyForm = { nis: '', name: '', class: '', wali_id: '' }

export default function StudentsPage() {
  const qc = useQueryClient()
  const [modal, setModal] = useState(null) // null | 'create' | 'edit'
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['students'],
    queryFn: () => studentApi.listAll(),
  })

  const students = (data?.data?.data ?? []).filter(
    (s) => s.name.toLowerCase().includes(search.toLowerCase()) ||
           s.nis.includes(search)
  )

  const createMutation = useMutation({
    mutationFn: () => studentApi.create(form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['students'] }); setModal(null); toast.success('Siswa ditambahkan') },
    onError: (e) => toast.error(e.response?.data?.error ?? 'Gagal'),
  })

  const updateMutation = useMutation({
    mutationFn: () => studentApi.update(selected.id, form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['students'] }); setModal(null); toast.success('Data diperbarui') },
    onError: (e) => toast.error(e.response?.data?.error ?? 'Gagal'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => studentApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['students'] }); toast.success('Siswa dihapus') },
    onError: (e) => toast.error(e.response?.data?.error ?? 'Gagal'),
  })

  const openCreate = () => { setForm(emptyForm); setSelected(null); setModal('create') }
  const openEdit = (s) => { setForm({ nis: s.nis, name: s.name, class: s.class, wali_id: s.wali_id }); setSelected(s); setModal('edit') }
  const handleSubmit = (e) => { e.preventDefault(); modal === 'create' ? createMutation.mutate() : updateMutation.mutate() }

  if (isLoading) return <PageLoader />

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Siswa</h1>
          <p className="text-sm text-gray-500">Kelola data siswa yayasan</p>
        </div>
        <Button onClick={openCreate}><Plus size={16} />Tambah Siswa</Button>
      </div>

      <Card>
        <CardHeader>
          <Input
            placeholder="Cari nama atau NIS..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['NIS', 'Nama', 'Kelas', 'Wali', 'Aksi'].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-400 text-sm">Tidak ada data</td></tr>
              )}
              {students.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-gray-700 font-mono">{s.nis}</td>
                  <td className="px-6 py-3 font-medium text-gray-900">{s.name}</td>
                  <td className="px-6 py-3 text-gray-600">{s.class}</td>
                  <td className="px-6 py-3 text-gray-600">{s.wali?.name ?? '—'}</td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(s)}><Pencil size={14} /></Button>
                      <Button variant="danger" size="sm" onClick={() => {
                        if (window.confirm('Hapus siswa ini?')) deleteMutation.mutate(s.id)
                      }}><Trash2 size={14} /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        open={modal !== null}
        onClose={() => setModal(null)}
        title={modal === 'create' ? 'Tambah Siswa' : 'Edit Siswa'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="NIS" value={form.nis} onChange={(e) => setForm({ ...form, nis: e.target.value })} required />
          <Input label="Nama Lengkap" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Kelas" value={form.class} onChange={(e) => setForm({ ...form, class: e.target.value })} required />
          <Input label="ID Wali (UUID)" value={form.wali_id} onChange={(e) => setForm({ ...form, wali_id: e.target.value })} required />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModal(null)}>Batal</Button>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>Simpan</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
