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
      toast.success(`Selamat datang, ${data.data.user.name}!`)
      navigate(data.data.user.role === 'admin' ? '/admin' : '/wali')
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
