import {
    Dialog,
    DialogBody,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useDeleteEducatorCourseMutation } from "../../../store/api/educator/educatorCoursesApiSlice";

const DeleteCourse = ({
    isDeleteOpen,
    handleDeleteClose,
    selectedRow,
    refetch,
    setSelectedRow
}) => {
    const [deleteCourse, { isLoading }] = useDeleteEducatorCourseMutation();

    const onDelete = async () => {
        try {
            if (!selectedRow?._id) return;

            await deleteCourse(selectedRow._id).unwrap();
            toast.success("Course deleted successfully");
            refetch();
            handleDeleteClose();
        } catch (error) {
            toast.error(error?.data?.message || "Failed to delete course");
        }
    };

    return (
        <Dialog open={isDeleteOpen} onOpenChange={handleDeleteClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete Course</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete <strong>{selectedRow?.title}</strong>? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <button className="btn btn-light" onClick={handleDeleteClose} disabled={isLoading}>
                        Cancel
                    </button>
                    <button className="btn btn-danger" onClick={onDelete} disabled={isLoading}>
                        {isLoading ? "Deleting..." : "Delete"}
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default DeleteCourse;
