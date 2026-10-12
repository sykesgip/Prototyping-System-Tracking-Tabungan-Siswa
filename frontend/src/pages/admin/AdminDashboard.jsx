import { useQuery } from '@tanstack/react-query'
import { studentApi, savingApi, withdrawalApi } from '../../api/endpoints'
import { Card, CardBody } from '../../components/ui/Card'
import { PageLoader } from '../../components/ui/Spinner'
import { formatRupiah } from '../../utils/format'
import { GraduationCap, PiggyBank, ArrowDownToLine, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'

function StatCard({ label, value, icon: Icon, color, to }) {
  return (
    <Link to={to} className="block">
      <Card className="hover:shadow-md transition-shadow">
        <CardBody className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
            <Icon size={22} className="text-white" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        </CardBody>
      </Card>
    </Link>
  )
}

export default function AdminDashboard() {
  const students = useQuery({ queryKey: ['students'], queryFn: () => studentApi.listAll() })
  const withdrawals = useQuery({ queryKey: ['withdrawals'], queryFn: () => withdrawalApi.listAll() })

  if (students.isLoading || withdrawals.isLoading) return <PageLoader />

  const studentList = students.data?.data?.data ?? []
  const withdrawalList = withdrawals.data?.data?.data ?? []
  const pending = withdrawalList.filter((w) => w.status === 'pending').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
        <p className="text-sm text-gray-500 mt-1">Kelola tabungan siswa yayasan</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Siswa" value={studentList.length} icon={GraduationCap} color="bg-blue-500" to="/admin/students" />
        <StatCard label="Pengajuan Pending" value={pending} icon={ArrowDownToLine} color="bg-amber-500" to="/admin/withdrawals" />
        <StatCard label="Total Pengajuan" value={withdrawalList.length} icon={PiggyBank} color="bg-emerald-500" to="/admin/withdrawals" />
        <StatCard label="Kelola Tabungan" value="→" icon={TrendingUp} color="bg-violet-500" to="/admin/savings" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Pengajuan Terbaru</h2>
          </div>
          <CardBody className="p-0">
            {withdrawalList.length === 0 ? (
              <p className="px-6 py-8 text-sm text-gray-400 text-center">Belum ada pengajuan</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {withdrawalList.slice(0, 5).map((w) => (
                  <li key={w.id} className="px-6 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{w.student?.name ?? '—'}</p>
                      <p className="text-xs text-gray-400">{formatRupiah(w.amount)}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      w.status === 'approved' ? 'bg-green-100 text-green-700'
                      : w.status === 'rejected' ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                    }`}>{w.status}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        <Card>
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Daftar Siswa</h2>
          </div>
          <CardBody className="p-0">
            {studentList.length === 0 ? (
              <p className="px-6 py-8 text-sm text-gray-400 text-center">Belum ada data siswa</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {studentList.slice(0, 5).map((s) => (
                  <li key={s.id} className="px-6 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{s.name}</p>
                      <p className="text-xs text-gray-400">NIS: {s.nis} · Kelas {s.class}</p>
                    </div>
                    <Link to={`/admin/savings?student=${s.id}`} className="text-xs text-blue-600 hover:underline">
                      Lihat Tabungan
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
