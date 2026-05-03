import { ReactNode } from 'react';

interface InstructorPreviewLessonHeaderProps {
  lessonTitle: string;
  moduleTitle: string;
  lessonNumber?: number;
  subtitle?: string | null;
}

export default function InstructorPreviewLessonHeader({
  lessonTitle,
  moduleTitle,
  lessonNumber,
  subtitle
}: InstructorPreviewLessonHeaderProps) {
  return (
    <header className="mb-12 text-center">
       <span className="module-tag">
          {moduleTitle} {lessonNumber && ` • Lección ${lessonNumber}`}
       </span>
       <h1 className="text-4xl md:text-6xl font-space-grotesk font-black mb-6 text-cyan-400 uppercase tracking-tighter italic">
          {lessonTitle}
       </h1>
       {subtitle && (
         <p className="text-xl text-gray-400 font-light leading-relaxed mb-8 italic">
           "{subtitle}"
         </p>
       )}
       <div className="h-1 w-32 bg-cyan-500 mx-auto rounded-full shadow-[0_0_15px_rgba(6,182,212,0.5)]"></div>
    </header>
  );
}
