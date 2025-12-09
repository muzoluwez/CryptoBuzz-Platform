import {
    Dialog,
    DialogBody,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "sonner";
import { useCreateEducatorCourseMutation, useUpdateEducatorCourseMutation } from "../../../store/api/educator/educatorCoursesApiSlice";
import { useEffect } from "react";
import { AvatarUpload } from "@/shared/components";

const CreateCourse = ({
    isCreateOpen,
    setIsCreateOpen,
    handleCloseCreate,
    selectedRow,
    refetch,
}) => {
    const [createCourse] = useCreateEducatorCourseMutation();
    const [updateCourse] = useUpdateEducatorCourseMutation();

    const formik = useFormik({
        initialValues: {
            title: "",
            description: "",
            files: null,
        },
        validationSchema: Yup.object({
            title: Yup.string().required("Title is required"),
            description: Yup.string().required("Description is required"),
        }),
        onSubmit: async (values) => {
            try {
                const formData = new FormData();
                formData.append("title", values.title);
                formData.append("description", values.description);
                if (values.files) {
                    formData.append("files", values.files);
                }

                if (selectedRow) {
                    formData.append("id", selectedRow._id);
                    await updateCourse(formData).unwrap();
                    toast.success("Course updated successfully");
                } else {
                    await createCourse(formData).unwrap();
                    toast.success("Course created successfully");
                }
                refetch();
                handleCloseCreate();
            } catch (error) {
                toast.error(error?.data?.message || "Something went wrong");
            }
        },
    });

    useEffect(() => {
        if (selectedRow) {
            formik.setValues({
                title: selectedRow.title || "",
                description: selectedRow.description || "",
                files: selectedRow.image || null,
            });
        } else {
            formik.resetForm();
        }
    }, [selectedRow]);

    return (
        <Dialog open={isCreateOpen} onOpenChange={handleCloseCreate}>
            <DialogContent className="max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>{selectedRow ? "Edit Course" : "Create New Course"}</DialogTitle>
                    <DialogDescription>
                        {selectedRow ? "Update course details" : "Add a new course to your list"}
                    </DialogDescription>
                </DialogHeader>
                <DialogBody>
                    <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="form-label text-gray-900 gap-1">
                                Thumbnail
                            </label>
                            <AvatarUpload
                                value={
                                    formik.values.files
                                        ? typeof formik.values.files === "string"
                                            ? [{ dataURL: formik.values.files }]
                                            : [
                                                {
                                                    dataURL: URL.createObjectURL(
                                                        formik.values.files
                                                    ),
                                                },
                                            ]
                                        : []
                                }
                                accept="image/*"
                                onChange={(file) => {
                                    formik.setFieldValue("files", file[0]?.file);
                                }}
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="form-label">Title <span className="text-danger">*</span></label>
                            <input
                                type="text"
                                name="title"
                                className="form-control"
                                placeholder="Course Title"
                                value={formik.values.title}
                                onChange={formik.handleChange}
                            />
                            {formik.touched.title && formik.errors.title && (
                                <span className="text-danger text-xs">{formik.errors.title}</span>
                            )}
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="form-label">Description <span className="text-danger">*</span></label>
                            <textarea
                                name="description"
                                className="form-control"
                                placeholder="Course Description"
                                rows={4}
                                value={formik.values.description}
                                onChange={formik.handleChange}
                            />
                            {formik.touched.description && formik.errors.description && (
                                <span className="text-danger text-xs">{formik.errors.description}</span>
                            )}
                        </div>
                    </form>
                </DialogBody>
                <DialogFooter>
                    <button className="btn btn-light" onClick={handleCloseCreate}>
                        Cancel
                    </button>
                    <button className="btn btn-primary" onClick={formik.handleSubmit}>
                        {selectedRow ? "Update" : "Create"}
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default CreateCourse;
