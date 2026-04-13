'use client';
import { useState, useEffect } from 'react';
import RatingModal from '../RatingModal';

interface CourseWithStatus {
  id: string;
  title: string;
  instructorName: string;
  progress: number;
  hasRated: boolean;
}

export default function StudentCourseRatingOrchestrator({ courses }: { courses: CourseWithStatus[] }) {
  const [modalState, setModalState] = useState<{ isOpen: boolean; course: CourseWithStatus | null }>({
    isOpen: false,
    course: null
  });

  useEffect(() => {
    // El auto-disparo en dashboards ha sido desactivado para mejorar la UX. 
    // Solo permitimos el disparo manual via eventos.
  }, []);

  // Exponer una forma de abrir el modal manualmente (podríamos usar un custom event o bus de eventos simple)
  useEffect(() => {
    const handleManualRating = (e: any) => {
      const course = courses.find(c => c.id === e.detail.courseId);
      if (course) {
        setModalState({ isOpen: true, course });
      }
    };

    window.addEventListener('open-rating-modal', handleManualRating);
    return () => window.removeEventListener('open-rating-modal', handleManualRating);
  }, [courses]);

  if (!modalState.course) return null;

  return (
    <RatingModal
      isOpen={modalState.isOpen}
      onClose={() => setModalState(prev => ({ ...prev, isOpen: false }))}
      courseId={modalState.course.id}
      courseTitle={modalState.course.title}
      instructorName={modalState.course.instructorName}
    />
  );
}
