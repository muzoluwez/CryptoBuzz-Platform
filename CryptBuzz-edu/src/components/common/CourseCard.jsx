import React from 'react';

/**
 * CourseCard Component
 * 
 * Simple course card component for displaying course information.
 */
const CourseCard = ({ course }) => {
    return (
        <div className="card">
            <div className="card-body">
                <h5 className="card-title">{course?.title || 'Course Title'}</h5>
                <p className="card-text">{course?.description || 'Course description'}</p>
            </div>
        </div>
    );
};

export default CourseCard;

