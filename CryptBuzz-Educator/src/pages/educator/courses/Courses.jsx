import { useState } from "react";
import {
    Toolbar,
    ToolbarActions,
    ToolbarDescription,
    ToolbarHeading,
    ToolbarPageTitle,
} from "@/partials/toolbar";
import CreateCourse from "./CreateCourse";
import DeleteCourse from "./DeleteCourse";
import CourseList from "./CourseList";
import { useGetEducatorCoursesQuery } from "../../../store/api/educator/educatorCoursesApiSlice";

const Courses = () => {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);

    // API Query
    const { data: coursesData, isLoading, refetch } = useGetEducatorCoursesQuery({
        page: 1,
        limit: 100
    });


    const handleCreateCourse = () => {
        setSelectedRow(null);
        setIsCreateOpen(true);
    };

    const handleUpdateCourse = (course) => {
        setSelectedRow(course);
        setIsCreateOpen(true);
    };

    const handleCourseSelect = (course) => {
        // Navigate or show details
        // For now, let's open edit
        handleUpdateCourse(course);
    };

    const handleDeleteCourse = (course) => {
        setSelectedRow(course);
        setIsDeleteOpen(true);
    };

    return (
        <div className="container-fluid">
            <Toolbar>
                <ToolbarHeading>
                    <ToolbarPageTitle text="My Courses" />
                    <ToolbarDescription>Manage your educational courses and content.</ToolbarDescription>
                </ToolbarHeading>
                <ToolbarActions>
                    <button className="btn btn-primary" onClick={handleCreateCourse}>
                        Create Course
                    </button>
                </ToolbarActions>
            </Toolbar>

            {isLoading ? (
                <div className="flex items-center justify-center p-10">Loading courses...</div>
            ) : (
                <CourseList
                    courses={coursesData?.data || []}
                    onCreateCourse={handleCreateCourse}
                    onUpdateCourse={handleUpdateCourse}
                    onDeleteCourse={handleDeleteCourse}
                    onCourseSelect={handleCourseSelect}
                />
            )}

            <CreateCourse
                isCreateOpen={isCreateOpen}
                handleCloseCreate={() => setIsCreateOpen(false)}
                setIsCreateOpen={setIsCreateOpen}
                selectedRow={selectedRow}
                refetch={refetch}
            />

            <DeleteCourse
                isDeleteOpen={isDeleteOpen}
                handleDeleteClose={() => setIsDeleteOpen(false)}
                selectedRow={selectedRow}
                refetch={refetch}
                setSelectedRow={setSelectedRow}
            />
        </div>
    );
};

export default Courses;
