import { forwardRef } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { toast } from "sonner";
import { useDeleteBannerMutation } from "../../../../store/api/admin/adminBannersApiSlice";

const DeleteBanner = forwardRef(
  (
    { isDeleteOpen, handleDeleteClose, selectedRow, refetch, setSelectedRow },
    ref
  ) => {
    const [deleteBanner, { isLoading }] = useDeleteBannerMutation();

    const handleDelete = async () => {
      try {
        await deleteBanner(selectedRow?._id).unwrap();
        refetch();
        toast.success("Banner deleted successfully!");
        handleDeleteClose();
        setSelectedRow({});
      } catch (error) {
        toast.error(error?.data?.message || "An error occurred");
      }
    };

    return (
      <Dialog
        open={isDeleteOpen}
        onOpenChange={() => {
          handleDeleteClose();
          setSelectedRow({});
        }}
      >
        <DialogContent className="p-5 max-w-[500px]" ref={ref}>
          <VisuallyHidden>
            <DialogTitle>Hidden Title</DialogTitle>
          </VisuallyHidden>
          <div className="text-center">
            <i className="ki-filled text-3xl ki-trash text-gray-500 dark:text-gray-700 mb-3.5 mx-auto"></i>
          </div>
          {/* Modal Text */}
          <p className="mb-4 text-gray-700 dark:text-gray-700 text-center">
            Are you sure you want to delete <strong>{selectedRow?.title}</strong>?
          </p>
          {/* Action Buttons */}
          <div className="flex justify-center items-center space-x-4">
            <button
              className="btn btn-light"
              onClick={() => {
                handleDeleteClose();
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-danger"
              onClick={() => {
                handleDelete();
              }}
              disabled={isLoading}
            >
              Yes, I'm sure
            </button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
);

export default DeleteBanner;
