import { forwardRef, useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert } from "../../../../components/alert/Alert";
import { toast } from "sonner";
import {
  useCreateBannerMutation,
  useUpdateBannerMutation,
} from "../../../../store/api/admin/adminBannersApiSlice";
import { KeenIcon } from "@/components";

const CreateBanner = forwardRef(
  (
    { isCreateOpen, handleCloseCreate, selectedRow, refetch, setSelectedRow },
    ref
  ) => {
    const [createBanner] = useCreateBannerMutation();
    const [updateBanner] = useUpdateBannerMutation();

    const [desktopImagePreview, setDesktopImagePreview] = useState(null);
    const [mobileImagePreview, setMobileImagePreview] = useState(null);
    const [desktopImageFile, setDesktopImageFile] = useState(null);
    const [mobileImageFile, setMobileImageFile] = useState(null);

    const initialValues = {
      title: "",
      link: "",
      openInNewTab: false,
      position: "left",
    };

    const createSchema = Yup.object().shape({
      title: Yup.string()
        .required("Title is required")
        .min(2, "Title must be at least 2 characters"),
      link: Yup.string().url("Must be a valid URL"),
      position: Yup.string()
        .required("Position is required")
        .oneOf(["left", "right"], "Position must be left or right"),
    });

    const formik = useFormik({
      initialValues,
      enableReinitialize: true,
      revalidateOnMount: true,
      validationSchema: createSchema,
      onSubmit: async (values) => {
        // Validate images for new banner
        if (!selectedRow?._id) {
          if (!desktopImageFile) {
            toast.error("Desktop image is required");
            return;
          }
          if (!mobileImageFile) {
            toast.error("Mobile image is required");
            return;
          }
        }

        const formData = new FormData();
        formData.append("title", values.title);
        formData.append("link", values.link || "");
        formData.append("openInNewTab", values.openInNewTab);
        formData.append("position", values.position);

        // Add images if selected
        if (desktopImageFile) {
          formData.append("desktopImage", desktopImageFile);
        }
        if (mobileImageFile) {
          formData.append("mobileImage", mobileImageFile);
        }

        try {
          if (selectedRow?._id) {
            // Update existing banner
            await updateBanner({
              id: selectedRow._id,
              formData,
            }).unwrap();
            setSelectedRow({});
            refetch();
            toast.success("Banner updated successfully!");
          } else {
            // Create new banner (inactive by default to avoid auto-deactivating existing active banner)
            formData.append("status", "false");
            await createBanner(formData).unwrap();
            refetch();
            toast.success("Banner created successfully! Activate it from the list.");
          }
          handleClose();
        } catch (err) {
          const errorMessage =
            err?.data?.message || "An unexpected error occurred.";
          toast.error(errorMessage);
        }
      },
    });

    const handleClose = () => {
      formik.resetForm();
      setDesktopImagePreview(null);
      setMobileImagePreview(null);
      setDesktopImageFile(null);
      setMobileImageFile(null);
      setSelectedRow({});
      handleCloseCreate();
    };

    const handleDesktopImageChange = (e) => {
      const file = e.target.files[0];
      if (file) {
        if (file.type.startsWith("image/")) {
          setDesktopImageFile(file);
          const reader = new FileReader();
          reader.onloadend = () => {
            setDesktopImagePreview(reader.result);
          };
          reader.readAsDataURL(file);
        } else {
          toast.error("Please select a valid image file");
        }
      }
    };

    const handleMobileImageChange = (e) => {
      const file = e.target.files[0];
      if (file) {
        if (file.type.startsWith("image/")) {
          setMobileImageFile(file);
          const reader = new FileReader();
          reader.onloadend = () => {
            setMobileImagePreview(reader.result);
          };
          reader.readAsDataURL(file);
        } else {
          toast.error("Please select a valid image file");
        }
      }
    };

    const removeDesktopImage = () => {
      setDesktopImageFile(null);
      setDesktopImagePreview(null);
    };

    const removeMobileImage = () => {
      setMobileImageFile(null);
      setMobileImagePreview(null);
    };

    useEffect(() => {
      if (selectedRow?._id) {
        const initData = {
          title: selectedRow?.title || "",
          link: selectedRow?.link || "",
          openInNewTab: selectedRow?.openInNewTab || false,
          position: selectedRow?.position || "left",
        };
        formik.setValues(initData);
        
        // Set existing image previews
        if (selectedRow?.desktopImage) {
          setDesktopImagePreview(selectedRow.desktopImage);
        }
        if (selectedRow?.mobileImage) {
          setMobileImagePreview(selectedRow.mobileImage);
        }
      } else {
        // Reset for new banner, but keep position from selectedRow if provided
        const initData = {
          title: "",
          link: "",
          openInNewTab: false,
          position: selectedRow?.position || "left",
        };
        formik.setValues(initData);
        setDesktopImagePreview(null);
        setMobileImagePreview(null);
        setDesktopImageFile(null);
        setMobileImageFile(null);
      }
    }, [selectedRow, isCreateOpen]);

    return (
      <Dialog open={isCreateOpen} onOpenChange={handleClose}>
        {formik.status && <Alert variant="danger">{formik.status}</Alert>}
        <DialogContent className="p-5 max-w-[800px] max-h-[90vh] overflow-y-auto" ref={ref}>
          <DialogHeader className="pb-5 pt-0 px-0">
            <DialogTitle>
              {selectedRow?._id ? "Update Banner" : "Create Banner"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-5 px-0">
            {/* Position Selection */}
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12">
                <div className="flex flex-col gap-1">
                  <label className="form-label text-gray-900 gap-1">
                    Position<span className="text-danger">*</span>
                  </label>
                  <select
                    className={`form-control select select-md w-full ${
                      formik.errors.position && formik.touched.position
                        ? "border border-danger"
                        : ""
                    }`}
                    {...formik.getFieldProps("position")}
                    disabled={selectedRow?._id} // Disable when editing existing banner
                  >
                    <option value="left">Left</option>
                    <option value="right">Right</option>
                  </select>
                  {formik.touched.position && formik.errors.position && (
                    <span role="alert" className="text-danger text-xs mt-1">
                      {formik.errors.position}
                    </span>
                  )}
                  {selectedRow?._id && (
                    <span className="text-xs text-gray-500 mt-1">
                      Position cannot be changed for existing banners
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Title */}
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12">
                <div className="flex flex-col gap-1">
                  <label className="form-label text-gray-900 gap-1">
                    Title<span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter banner title"
                    autoComplete="off"
                    className={`form-control input input-md w-full ${
                      formik.errors.title && formik.touched.title
                        ? "border border-danger"
                        : ""
                    }`}
                    {...formik.getFieldProps("title")}
                  />
                  {formik.touched.title && formik.errors.title && (
                    <span role="alert" className="text-danger text-xs mt-1">
                      {formik.errors.title}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Link */}
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12">
                <div className="flex flex-col gap-1">
                  <label className="form-label text-gray-900 gap-1">
                    Link URL
                  </label>
                  <input
                    type="text"
                    placeholder="https://example.com"
                    autoComplete="off"
                    className={`form-control input input-md w-full ${
                      formik.errors.link && formik.touched.link
                        ? "border border-danger"
                        : ""
                    }`}
                    {...formik.getFieldProps("link")}
                  />
                  {formik.touched.link && formik.errors.link && (
                    <span role="alert" className="text-danger text-xs mt-1">
                      {formik.errors.link}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Open in New Tab */}
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="openInNewTab"
                    className="checkbox checkbox-sm"
                    {...formik.getFieldProps("openInNewTab")}
                    checked={formik.values.openInNewTab}
                  />
                  <label htmlFor="openInNewTab" className="form-label text-gray-900 cursor-pointer">
                    Open link in new tab
                  </label>
                </div>
              </div>
            </div>

            {/* Desktop Image */}
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12">
                <div className="flex flex-col gap-2">
                  <label className="form-label text-gray-900 gap-1">
                    Desktop Image<span className="text-danger">*</span>
                  </label>
                  
                  {desktopImagePreview ? (
                    <div className="relative inline-block">
                      <img
                        src={desktopImagePreview}
                        alt="Desktop Preview"
                        className="max-w-full h-32 object-contain border rounded"
                      />
                      <button
                        type="button"
                        onClick={removeDesktopImage}
                        className="absolute -top-2 -right-2 btn btn-sm btn-icon btn-danger"
                      >
                        <KeenIcon icon="trash" />
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <input
                        type="file"
                        id="desktopImage"
                        accept="image/*"
                        onChange={handleDesktopImageChange}
                        className="hidden"
                      />
                      <label
                        htmlFor="desktopImage"
                        className="cursor-pointer flex flex-col items-center gap-2"
                      >
                        <KeenIcon icon="file-up" className="text-3xl text-gray-400" />
                        <span className="text-sm text-gray-600">
                          Click to upload desktop image
                        </span>
                        <span className="text-xs text-primary font-normal">
                          Recommended: 300 x 700 px
                        </span>
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile Image */}
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12">
                <div className="flex flex-col gap-2">
                  <label className="form-label text-gray-900 gap-1">
                    Mobile Image<span className="text-danger">*</span>
                  </label>
                  
                  {mobileImagePreview ? (
                    <div className="relative inline-block">
                      <img
                        src={mobileImagePreview}
                        alt="Mobile Preview"
                        className="max-w-full h-32 object-contain border rounded"
                      />
                      <button
                        type="button"
                        onClick={removeMobileImage}
                        className="absolute -top-2 -right-2 btn btn-sm btn-icon btn-danger"
                      >
                        <KeenIcon icon="trash" />
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <input
                        type="file"
                        id="mobileImage"
                        accept="image/*"
                        onChange={handleMobileImageChange}
                        className="hidden"
                      />
                      <label
                        htmlFor="mobileImage"
                        className="cursor-pointer flex flex-col items-center gap-2"
                      >
                        <KeenIcon icon="file-up" className="text-3xl text-gray-400" />
                        <span className="text-sm text-gray-600">
                          Click to upload mobile image
                        </span>
                        <span className="text-xs text-primary font-normal">
                          Recommended: 300 x 120 px
                        </span>
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex border-gray-200 border-t justify-end pt-5 rounded-b dark:border-gray-200 gap-3">
            <button
              className="btn btn-light"
              onClick={handleClose}
            >
              Cancel
            </button>
            <button
              disabled={formik.isSubmitting}
              type="submit"
              onClick={formik.handleSubmit}
              className="btn btn-primary"
            >
              {formik.isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
);

export default CreateBanner;
