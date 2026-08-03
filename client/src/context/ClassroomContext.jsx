import React, { createContext, useContext, useState, useCallback } from 'react';

const ClassroomContext = createContext(null);

export const ClassroomProvider = ({ children }) => {
  const [isClassroomMode, setIsClassroomMode] = useState(false);
  const [classroomActivityTitle, setClassroomActivityTitle] = useState('');
  const [remainingPool, setRemainingPool] = useState([]);
  const [completedPool, setCompletedPool] = useState([]);
  const [activeClassroomStudent, setActiveClassroomStudent] = useState(null);

  // Initialize a fresh participation pool every time Classroom Mode is launched
  const startClassroomSession = useCallback((roster, activityTitle) => {
    setIsClassroomMode(true);
    setClassroomActivityTitle(activityTitle || 'Classroom Reading Activity');
    setRemainingPool([...roster]);
    setCompletedPool([]);
    setActiveClassroomStudent(null);
  }, []);

  // Pick a random student from the remaining pool and remove them from that pool
  const pickNextRandomStudent = useCallback(() => {
    if (remainingPool.length === 0) {
      setActiveClassroomStudent(null);
      return null;
    }
    const randIdx = Math.floor(Math.random() * remainingPool.length);
    const nextStudent = remainingPool[randIdx];

    setRemainingPool((prev) => prev.filter((s) => String(s.id) !== String(nextStudent.id)));
    setCompletedPool((prev) => [...prev, nextStudent]);
    setActiveClassroomStudent(nextStudent);
    return nextStudent;
  }, [remainingPool]);

  // End Classroom Mode and clear in-memory state (no localStorage persistence)
  const endClassroomSession = useCallback(() => {
    setIsClassroomMode(false);
    setClassroomActivityTitle('');
    setRemainingPool([]);
    setCompletedPool([]);
    setActiveClassroomStudent(null);
  }, []);

  // Manually select a student or assign active student
  const selectActiveStudent = useCallback((student) => {
    setActiveClassroomStudent(student);
  }, []);

  // Mark student turn completed and move them to completedPool
  const markStudentCompleted = useCallback((student) => {
    if (!student) return;
    setRemainingPool((prev) => prev.filter((s) => String(s.id) !== String(student.id)));
    setCompletedPool((prev) => {
      const exists = prev.some((s) => String(s.id) === String(student.id));
      return exists ? prev : [...prev, student];
    });
  }, []);

  // Skip a student for today (e.g. absent child)
  const skipStudentTurn = useCallback((student) => {
    if (!student) return;
    setRemainingPool((prev) => prev.filter((s) => String(s.id) !== String(student.id)));
  }, []);

  // Reset round pool when all students completed
  const resetRoundPool = useCallback((fullRoster) => {
    setRemainingPool([...fullRoster]);
    setCompletedPool([]);
    setActiveClassroomStudent(null);
  }, []);

  return (
    <ClassroomContext.Provider
      value={{
        isClassroomMode,
        classroomActivityTitle,
        remainingPool,
        completedPool,
        activeClassroomStudent,
        startClassroomSession,
        pickNextRandomStudent,
        selectActiveStudent,
        markStudentCompleted,
        skipStudentTurn,
        resetRoundPool,
        endClassroomSession,
      }}
    >
      {children}
    </ClassroomContext.Provider>
  );
};

export const useClassroom = () => {
  const context = useContext(ClassroomContext);
  if (!context) {
    throw new Error('useClassroom must be used within a ClassroomProvider');
  }
  return context;
};
