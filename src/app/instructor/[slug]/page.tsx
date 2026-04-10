import { notFound } from 'next/navigation';
import Link from 'next/link';

export default async function InstructorProfile({ params }: { params: { slug: string } }) {
  const res = await fetch(`http://localhost:3001/api/instructor/${params.slug}`, {
    cache: 'no-store'
  });

  if (!res.ok) {
    if (res.status === 404) return notFound();
    return <div className="p-10 text-red-500">Error loading instructor profile</div>;
  }

  const profile = await res.json();

  return (
    <div className="min-h-screen bg-[#070d1a] text-white">
      <nav className="flex items-center justify-between px-8 md:px-16 h-16 bg-[#0a1f44] border-b border-blue-500/20 sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2 font-space-grotesk font-bold text-lg tracking-wider">
           <span className="bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">PLATTFORM</span>
        </Link>
        <Link href="/courses" className="text-sm font-semibold border border-blue-500/30 px-4 py-2 rounded text-cyan-400 hover:bg-blue-500/10 transition-colors">Ver catálogo</Link>
      </nav>

      <div className="bg-gradient-to-b from-[#0a1f44] to-[#070d1a] border-b border-blue-500/10">
        <div className="max-w-5xl mx-auto px-6 py-20 flex flex-col md:flex-row items-center gap-10">
          <div className="w-32 h-32 md:w-40 md:h-40 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-full flex items-center justify-center text-5xl font-bold uppercase shadow-[0_0_40px_rgba(6,182,212,0.4)] border-4 border-[#070d1a]">
            {profile.name.charAt(0)}{profile.name.split(' ')[1]?.charAt(0)}
          </div>
          <div className="text-center md:text-left flex-1">
            <h1 className="font-space-grotesk text-4xl md:text-5xl font-extrabold mb-2">{profile.name}</h1>
            <h2 className="text-xl text-cyan-400 font-medium mb-4">{profile.academyName} {profile.institution ? `· ${profile.institution}` : ''}</h2>
            <p className="text-gray-300 text-base leading-relaxed max-w-2xl font-light">
              {profile.description || 'Instructor en Plattform. Enseñando a la próxima generación de profesionales.'}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-16">
        <h3 className="font-space-grotesk text-3xl font-bold mb-8">Todos los <span className="text-cyan-400">cursos</span> ({profile.courses?.length || 0})</h3>
        
        {(!profile.courses || profile.courses.length === 0) ? (
          <div className="text-center py-20 bg-[#152035] rounded-xl border border-blue-500/10 text-gray-400">
            Este instructor no tiene cursos publicados actualmente.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {profile.courses.map((course: any) => (
              <Link href={`/courses/${course.slug}`} key={course.id} className="group bg-[#152035] border border-blue-500/20 rounded-2xl overflow-hidden hover:-translate-y-1 hover:border-cyan-500/40 hover:shadow-[0_8px_30px_rgba(6,182,212,0.15)] transition-all flex flex-col">
                <div className="h-44 bg-gradient-to-br from-[#0a1f44] to-blue-900 flex items-center justify-center text-6xl relative">
                  🎓
                  <span className="absolute top-2 left-2 bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase">{course.category}</span>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-semibold text-lg leading-snug mb-3 flex-1 group-hover:text-cyan-400 transition-colors">{course.title}</h3>
                  <div className="flex items-center gap-4 text-xs tracking-wide text-gray-400 mb-4 font-medium uppercase">
                    <span>👥 {course.studentCount} Alumnos</span>
                  </div>
                  <div className="flex items-center justify-between mt-auto border-t border-blue-500/10 pt-4">
                    <div className="flex gap-2">
                      <span className="text-yellow-500 text-sm">★★★★★</span>
                      <span className="text-xs text-gray-400 font-medium">{course.averageRating.toFixed(1)}</span>
                    </div>
                    <div className="font-bold text-xl text-cyan-400">${course.price}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* FOOTER */}
      <footer className="border-t border-blue-500/20 bg-[#0a1f44] py-12 px-10 text-center mt-20">
        <div className="font-space-grotesk text-xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent inline-block">PLATTFORM</div>
        <p className="text-gray-400 text-sm max-w-md mx-auto">La infraestructura SaaS para que profesores universitarios creen, vendan y escalen su conocimiento en línea.</p>
      </footer>
    </div>
  );
}
