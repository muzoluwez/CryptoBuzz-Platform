import React, { useState, useEffect } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
    Plus,
    Book,
    Video,
    Star,
    Lock,
    Globe,
    Edit2,
    GripVertical,
    Trash2,
} from "lucide-react";
import { toast } from "sonner";

// Draggable Course Card Component
const DraggableCourseCard = ({
    course,
    index,
    moveCourse,
    onSelect,
    onEdit,
    onDelete
}) => {
    const [{ isDragging }, drag] = useDrag({
        type: "COURSE",
        item: { index },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    const [, drop] = useDrop({
        accept: "COURSE",
        hover: (draggedItem) => {
            if (draggedItem.index === index) {
                return;
            }
            moveCourse(draggedItem.index, index);
            draggedItem.index = index;
        },
    });

    return (
        <div
            ref={(node) => drag(drop(node))}
            className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 relative group ${isDragging ? "opacity-50 scale-105 shadow-xl" : ""
                }`}
        >
            <div onClick={() => onSelect(course)} className="cursor-pointer">
                {/* Thumbnail Section */}
                <div className="relative aspect-video rounded-t-lg overflow-hidden">
                    {course.image || course.thumbnail ? (
                        <img
                            src={course.image || course.thumbnail}
                            alt={course.title}
                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                            <Book className="w-12 h-12 text-gray-400" />
                        </div>
                    )}

                    {/* Overlay with drag handle and badges */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200">
                        <div className="absolute top-2 left-2 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200">
                            <GripVertical className="w-5 h-5 text-gray-600" />
                        </div>
                    </div>

                    {/* Status Badges */}
                    <div className="absolute top-2 right-2 flex flex-col gap-2">
                        {course.isFeatured && (
                            <div className="bg-yellow-400 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 shadow-md">
                                <Star className="w-3 h-3" />
                                Featured
                            </div>
                        )}
                        {course.isPro && (
                            <div className="bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 shadow-md">
                                <Lock className="w-3 h-3" />
                                Pro
                            </div>
                        )}
                        {course.isPublic ? (
                            <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 shadow-md">
                                <Globe className="w-3 h-3" />
                                Public
                            </div>
                        ) : (
                            <div className="bg-gray-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 shadow-md">
                                <Lock className="w-3 h-3" />
                                Private
                            </div>
                        )}
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                        {course.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {course.description}
                    </p>
                    <div className="flex items-center text-sm text-gray-500">
                        <Video className="w-4 h-4 mr-1" />
                        <span>{course.sections?.length || 0} sections</span>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="absolute top-2 left-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onEdit(course);
                    }}
                    className="p-2.5 bg-blue-500 rounded-full shadow-lg hover:bg-blue-600 hover:shadow-xl hover:scale-110 hover:rotate-12 transition-all duration-200"
                    title="Edit Course"
                >
                    <Edit2 className="w-5 h-5 text-white" />
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(course);
                    }}
                    className="p-2.5 bg-red-500 rounded-full shadow-lg hover:bg-red-600 hover:shadow-xl hover:scale-110 transition-all duration-200"
                    title="Delete Course"
                >
                    <Trash2 className="w-5 h-5 text-white" />
                </button>
            </div>
        </div>
    );
};

const CourseList = ({ courses = [], onCreateCourse, onCourseSelect, onUpdateCourse, onDeleteCourse }) => {
    const [localCourses, setLocalCourses] = useState(courses);

    useEffect(() => {
        setLocalCourses(courses);
    }, [courses]);

    const moveCourse = (dragIndex, hoverIndex) => {
        const draggedCourse = localCourses[dragIndex];
        const updatedCourses = [...localCourses];
        updatedCourses.splice(dragIndex, 1);
        updatedCourses.splice(hoverIndex, 0, draggedCourse);
        setLocalCourses(updatedCourses);
        // TODO: Call API to update order if needed
    };

    // We reuse the Modal logic from the parent or just trigger callback
    const handleEdit = (course) => {
        onUpdateCourse(course);
    }

    const handleDelete = (course) => {
        onDeleteCourse(course);
    }

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="p-4 lg:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Course Cards */}
                    {localCourses.map((course, index) => (
                        <DraggableCourseCard
                            key={course._id || course.id}
                            course={course}
                            index={index}
                            moveCourse={moveCourse}
                            onSelect={onCourseSelect}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    ))}

                    {/* Create New Course Card */}
                    <div
                        onClick={() => onCreateCourse()}
                        className="bg-white rounded-lg shadow-sm p-6 border-2 border-dashed border-gray-300 hover:border-blue-500 cursor-pointer transition-colors duration-200 flex items-center justify-center min-h-[300px]"
                    >
                        <div className="flex flex-col items-center justify-center h-full">
                            <Plus className="w-12 h-12 text-gray-400 mb-4" />
                            <h3 className="text-lg font-semibold text-gray-700">
                                Create New Course
                            </h3>
                            <p className="text-sm text-gray-500 mt-2">
                                Start building your new course
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </DndProvider>
    );
};

export default CourseList;
