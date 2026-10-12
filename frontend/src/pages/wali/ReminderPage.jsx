import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { reminderApi } from '../../api/endpoints'
import { Card, CardBody } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input, Textarea } from '../../components/ui/FormField'
import { PageLoader } from '../../components/ui/Spinner'
import { Bell, BellOff } from 'lucide-react'

export default function ReminderPage() {
  const qc = useQueryClient()
  const [form, setForm] = useState({ message: '', is_active: true })

  const { data, isLoading } = useQuery({
    queryKey: ['reminder'],
    queryFn: () => reminderApi.get(),
    retry: false,
  })

  useEffect(() => {
    const dr = data?.data?.data
    if (dr) setForm({ message: dr.message, is_active: dr.is_active })
  }, [data])

  const saveMutation = useMutation({
    mutationFn: () => reminderApi.upsert(form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['reminder'] }); toast.success('Pengingat disimpan') },
    onError: (e) => toast.error(e.response?.data?.error ?? 'Gagal'),
  })

  const handleSubmit = (e) => { e.preventDefault(); saveMutation.mutate() }

  if (isLoading) return <PageLoader />

  const reminder = data?.data?.data

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pengingat Harian</h1>
        <p className="text-sm text-gray-500 mt-1">Atur pesan pengingat menabung setiap hari pukul 07:00 WIB</p>
      </div>

      {/* Current status */}
      <Card>
        <CardBody className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            reminder?.is_active ? 'bg-green-100' : 'bg-gray-100'
          }`}>
            {reminder?.is_active ? (
              <Bell size={22} className="text-green-600" />
            ) : (
              <BellOff size={22} className="text-gray-400" />
            )}
          </div>
          <div>
            <p className="font-semibold text-gray-900">
              {reminder?.is_active ? 'Pengingat Aktif' : 'Pengingat Nonaktif'}
            </p>
            {reminder?.message && (
              <p className="text-sm text-gray-500 mt-0.5">"{reminder.message}"</p>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Form */}
      <Card>
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Atur Pengingat</h2>
        </div>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              label="Pesan Pengingat"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Contoh: Jangan lupa setor tabungan hari ini ya!"
              required
            />

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_active"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                Aktifkan pengingat harian
              </label>
            </div>

            <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-700">
              <strong>Info:</strong> Pengingat akan dikirim setiap hari pukul 07:00 WIB secara otomatis.
            </div>

            <Button type="submit" disabled={saveMutation.isPending} className="w-full">
              {saveMutation.isPending ? 'Menyimpan...' : 'Simpan Pengingat'}
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}
