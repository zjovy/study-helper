import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import { fetchData } from '../apiService';
import Classes from './Classes';
import LoadingSpinner from './LoadingSpinner';

const Student = (props) => {
    const [courses, setCourses] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [gradedAssignments, setGradedAssignments] = useState([]);

    const formatDate = (dateString) => {
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('en-US', options);
    };

    useEffect(() => {
        const fetchAssignments = async () => {
            setIsLoading(true);
            const assignmentsData = await fetchData("assignments");
            setAssignments(assignmentsData.records || []);
        };

        fetchAssignments();
    }, []);

    useEffect(() => {
        const fetchEnrollmentsAndCourses = async () => {
            setIsLoading(true)
            const enrollmentsData = await fetchData("enrollments");
            const studentEnrollments = (enrollmentsData.records || []).filter(enrollment => 
                enrollment.student_id.value === props.userID
            );

            const coursesData = await fetchData("courses");
            const allCourses = coursesData.records || [];

            const enrolledCourses = studentEnrollments.map(enrollment => {
                const courseID = enrollment.course.value;
                const course = allCourses.find(course => course.id.value === courseID);
                
                if (course) {
                    const courseAssignments = assignments.filter(assignment => 
                        assignment.course_id.value === courseID
                    ).map(assignment => ({
                        id: parseInt(assignment.assignment_id.value),
                        title: assignment.title.value,
                        description: assignment.description.value,
                        dueDate: formatDate(assignment.due.value),
                        problems: assignment.problems.value.map(file => ({
                            fileKey: file.fileKey,
                            name: file.name,
                            contentType: file.contentType,
                            size: file.size
                        })),
                        solutions: assignment.solutions.value.map(file => ({
                            fileKey: file.fileKey,
                            name: file.name,
                            contentType: file.contentType,
                            size: file.size
                        }))
                    }));

                    return {
                        id: parseInt(course.id.value),
                        name: course.title.value,
                        teacherId: parseInt(course.teacher_id.value),
                        assignments: courseAssignments,
                    };
                }
                return null;
            }).filter(course => course !== null);

            setIsLoading(false);
            setCourses(enrolledCourses);
        };

        // Ensure assignments are loaded before fetching enrollments and courses
        if (assignments.length > 0) {
            fetchEnrollmentsAndCourses();
        }
    }, [props.userID, assignments]);

    useEffect(() => {
    const fetchGradedAssignments = async () => {
        console.log("Attempting to fetch graded assignments");
        try {
        const response = await fetch('http://localhost:8000/assignments/graded/');
        if (!response.ok) {
            console.error(`HTTP error! status: ${response.status}`, await response.text());
            return;
        }
        const data = await response.json();
        console.log("Fetched graded assignments:", data);
        
        setGradedAssignments(data);
        } catch (error) {
        console.error("Failed to fetch graded assignments:", error);
        }
    };

    // Call the fetch function immediately and also set it up to poll every 5 seconds
    fetchGradedAssignments();
    const interval = setInterval(fetchGradedAssignments, 5000);
    
    // Clean up interval on component unmount
    return () => clearInterval(interval);
    }, []);

    return ( 
        <div>
            <h1 className="text-3xl font-bold text-[#E8E9F3] m-3">Hello, {props.userName}</h1>
            {isLoading && <LoadingSpinner />}
            {!isLoading && <Classes classes={courses} feedbackData={gradedAssignments} />}
        </div>
    );
}

Student.propTypes = {
  userID: PropTypes.string.isRequired,
  userName: PropTypes.string.isRequired,
};

export default Student;
