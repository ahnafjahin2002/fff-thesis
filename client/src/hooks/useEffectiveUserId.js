import { useClassroom } from '../context/ClassroomContext';

export const useEffectiveUserId = () => {
  const { activeClassroomStudent } = useClassroom();
  return activeClassroomStudent ? activeClassroomStudent.id : localStorage.getItem('activeUserId');
};
