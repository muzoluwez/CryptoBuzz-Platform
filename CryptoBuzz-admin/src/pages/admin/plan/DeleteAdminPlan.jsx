import React, { forwardRef } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { toast } from 'sonner';
import { useDeletePlanMutation } from '../../../store/api/admin/adminPlanApiSlice';

const DeleteAdminPlan = forwardRef(({ isDeleteOpen, handleDeleteClose, selectedRow, refetch }, ref) => {
    const [deletePlan, { isLoading }] = useDeletePlanMutation();

    const handleDelete = async () => {
        try {
            await deletePlan(selectedRow?._id).unwrap();
            refetch();
            toast.success("Payment plan deleted successfully!");
            handleDeleteClose();
        } catch (error) {
            toast.error(error?.data?.message || "An error occurred while deleting the plan");
        }
    };

    return (
        <Dialog open={isDeleteOpen} onOpenChange={() => {
            handleDeleteClose();
        }}>
            <DialogContent className="p-5 max-w-[500px]" ref={ref}>
                <VisuallyHidden>
                    <DialogTitle>Delete Payment Plan</DialogTitle>
                </VisuallyHidden>
                <div className='text-center'>
                    <i className="ki-filled text-3xl ki-trash text-gray-500 dark:text-gray-700 mb-3.5 mx-auto"></i>
                </div>
                {/* Modal Text */}
                <p className="mb-4 text-gray-700 dark:text-gray-700 text-center">
                    Are you sure you want to delete the plan <strong>"{selectedRow?.name}"</strong>?
                </p>
                <p className="mb-4 text-sm text-gray-500 dark:text-gray-500 text-center">
                    This action cannot be undone. Courses using this plan will need to be assigned a new plan.
                </p>
                {/* Action Buttons */}
                <div className="flex justify-center items-center space-x-4">
                    <button className='btn btn-light' onClick={() => {
                        handleDeleteClose();
                    }}>Cancel</button>
                    <button
                        type="submit"
                        className="btn btn-danger"
                        onClick={() => {
                            handleDelete();
                        }}
                        disabled={isLoading}
                    >
                        {isLoading ? "Deleting..." : "Yes, I'm sure"}
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    )
})

export default DeleteAdminPlan;
