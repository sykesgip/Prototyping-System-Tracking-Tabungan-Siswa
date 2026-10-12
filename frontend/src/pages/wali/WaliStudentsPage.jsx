import { useQuery } from '@tanstack/react-query'
import { studentApi } from '../../api/endpoints'
import { Card, CardBody } from '../../components/ui/Card'
import { PageLoader } from '../../components/ui/Spinner'
import { Link } from 'react-router-dom'
import { GraduationCap, ChevronRight } from 'lucide-react'

export default function WaliStudentsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['wali-students'],
    queryFn: () => studentApi.listMine(),
  })

  const students = data?.data?.data ?? []

  if (isLoading) return <PageLoader />

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Siswa Saya</h1>
        <p className="text-sm text-gray-500">Data anak yang terdaftar</p>
      </div>

      {students.length === 0 ? (
        <Card>
          <CardBody>
            <p className="text-center text-gray-400 py-8">Belum ada siswa yang terdaftar. Hubungi admin.</p>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {students.map((s) => (
            <Link key={s.id} to={`/wali/students/${s.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardBody className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <GraduationCap size={22} className="text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{s.name}</p>
                    <p className="text-xs text-gray-400">NIS: {s.nis} · Kelas {s.class}</p>
                  </div>
                  <ChevronRight size={18} className="text-gray-300 flex-shrink-0" />
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
