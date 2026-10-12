import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { authApi } from '../../api/endpoints'
import { useAuthStore } from '../../store/authStore'
import { Input } from '../../components/ui/FormField'
import { Button } from '../../components/ui/Button'
import { Spinner } from '../../components/ui/Spinner'
import { PiggyBank } from 'lucide-react'

export default function LoginPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [form, setForm] = useState({ email: '', password: '' })

  const mutation = useMutation({
    mutationFn: () => authApi.login(form),
    onSuccess: ({ data }) => {
      setAuth(data.data.token, data.data.user)

      // Splash alert sebelum masuk dashboard
      toast.custom(
        (t) => (
          <div
            className={`bg-white border border-blue-100 shadow-lg rounded-xl px-5 py-4 flex flex-col items-center gap-1 transition-all ${
              t.visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
            style={{ minWidth: 280 }}
          >
            <span className="text-2xl">🐷</span>
            <p className="text-sm font-semibold text-gray-800 text-center">
              Made by <span className="text-blue-600">Syaghaf Mahardika</span>
            </p>
            <p className="text-xs text-gray-400 text-center">
              Prototyping System Tracking Tabungan Siswa
            </p>
          </div>
        ),
        { duration: 2500, position: 'top-center' }
      )

      setTimeout(
        () => navigate(data.data.user.role === 'admin' ? '/admin' : '/wali'),
        800
      )
    },
    onError: () => toast.error('Email atau password salah'),
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    mutation.mutate()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mb-3">
              <PiggyBank size={28} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">TabunganSiswa</h1>
            <p className="text-sm text-gray-500 mt-1">Manajemen Keuangan Tabungan Siswa</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="nama@sekolah.id"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />

            <Button
              type="submit"
              className="w-full mt-2"
              size="lg"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? <><Spinner /> Masuk...</> : 'Masuk'}
            </Button>
          </form>
        </div>
        <p className="text-center text-xs text-gray-400 mt-4">
          Yayasan Sekolah Dasar © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}
