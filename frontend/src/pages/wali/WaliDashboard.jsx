import { useQuery } from '@tanstack/react-query'
import { studentApi, withdrawalApi } from '../../api/endpoints'
import { useAuthStore } from '../../store/authStore'
import { Card, CardBody } from '../../components/ui/Card'
import { PageLoader } from '../../components/ui/Spinner'
import { Badge } from '../../components/ui/Badge'
import { formatRupiah, formatDate, statusLabel } from '../../utils/format'
import { GraduationCap, ArrowDownToLine, Bell } from 'lucide-react'
import { Link } from 'react-router-dom'

function statusVariant(s) {
  if (s === 'approved') return 'green'
  if (s === 'rejected') return 'red'
  return 'yellow'
}

export default function WaliDashboard() {
  const user = useAuthStore((s) => s.user)

  const studentsQuery = useQuery({ queryKey: ['wali-students'], queryFn: () => studentApi.listMine() })
  const withdrawalsQuery = useQuery({ queryKey: ['wali-withdrawals'], queryFn: () => withdrawalApi.listMine() })

  if (studentsQuery.isLoading || withdrawalsQuery.isLoading) return <PageLoader />

  const students = studentsQuery.data?.data?.data ?? []
  const withdrawals = withdrawalsQuery.data?.data?.data ?? []
  const pending = withdrawals.filter((w) => w.status === 'pending').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Selamat Datang, {user?.name}!</h1>
        <p className="text-sm text-gray-500 mt-1">Monitor tabungan anak Anda</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link to="/wali/students">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardBody className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                <GraduationCap size={22} className="text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Anak Terdaftar</p>
                <p className="text-2xl font-bold text-gray-900">{students.length}</p>
              </div>
            </CardBody>
          </Card>
        </Link>

        <Link to="/wali/withdrawals">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardBody className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center">
                <ArrowDownToLine size={22} className="text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Pengajuan Pending</p>
                <p className="text-2xl font-bold text-gray-900">{pending}</p>
              </div>
            </CardBody>
          </Card>
        </Link>

        <Link to="/wali/reminder">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardBody className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
                <Bell size={22} className="text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Pengingat Harian</p>
                <p className="text-sm font-semibold text-gray-700">Aktif 07:00 WIB</p>
              </div>
            </CardBody>
          </Card>
        </Link>
      </div>

      {/* Students list */}
      <Card>
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Data Anak</h2>
          <Link to="/wali/students" className="text-sm text-blue-600 hover:underline">Lihat Semua</Link>
        </div>
        <CardBody className="p-0">
          {students.length === 0 ? (
            <p className="px-6 py-8 text-center text-sm text-gray-400">Belum ada siswa yang terdaftar</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {students.map((s) => (
                <li key={s.id} className="px-6 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{s.name}</p>
                    <p className="text-xs text-gray-400">NIS: {s.nis} · Kelas {s.class}</p>
                  </div>
                  <Link to={`/wali/students/${s.id}`} className="text-xs text-blue-600 hover:underline font-medium">
                    Detail Tabungan
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>

      {/* Recent withdrawals */}
      <Card>
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Pengajuan Terbaru</h2>
          <Link to="/wali/withdrawals" className="text-sm text-blue-600 hover:underline">Lihat Semua</Link>
        </div>
        <CardBody className="p-0">
          {withdrawals.length === 0 ? (
            <p className="px-6 py-8 text-center text-sm text-gray-400">Belum ada pengajuan</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {withdrawals.slice(0, 5).map((w) => (
                <li key={w.id} className="px-6 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{formatRupiah(w.amount)}</p>
                    <p className="text-xs text-gray-400">{formatDate(w.created_at)}</p>
                  </div>
                  <Badge variant={statusVariant(w.status)}>{statusLabel(w.status)}</Badge>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
