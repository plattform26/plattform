'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

interface CourseProgressContextType {
  completedLessonIds: string[];
  toggleLesson: (lessonId: string, completed: boolean) => void;
  isLessonCompleted: (lessonId: string) => boolean;
}

const CourseProgressContext = createContext<CourseProgressContextType | undefined>(undefined);

export function CourseProgressProvider({ 
  children, 
  initialCompletedLessonIds 
}: { 
  children: React.ReactNode;
  initialCompletedLessonIds: string[];
}) {
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>(initialCompletedLessonIds);

  // Sincronizar con props si cambian (por ejemplo, después de un router.refresh exitoso)
  useEffect(() => {
    setCompletedLessonIds(initialCompletedLessonIds);
  }, [initialCompletedLessonIds]);

  const toggleLesson = useCallback((lessonId: string, completed: boolean) => {
    setCompletedLessonIds(prev => {
      if (completed) {
        if (prev.includes(lessonId)) return prev;
        return [...prev, lessonId];
      } else {
        return prev.filter(id => id !== lessonId);
      }
    });
  }, []);

  const isLessonCompleted = useCallback((lessonId: string) => {
    return completedLessonIds.includes(lessonId);
  }, [completedLessonIds]);

  return (
    <CourseProgressContext.Provider value={{ completedLessonIds, toggleLesson, isLessonCompleted }}>
      {children}
    </CourseProgressContext.Provider>
  );
}

export function useCourseProgress() {
  const context = useContext(CourseProgressContext);
  if (context === undefined) {
    throw new Error('useCourseProgress must be used within a CourseProgressProvider');
  }
  return context;
}
