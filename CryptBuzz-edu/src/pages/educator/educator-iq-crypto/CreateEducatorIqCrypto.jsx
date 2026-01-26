import React, { forwardRef, useEffect, useState, useCallback } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuthContext } from "../../../auth/useAuthContext";
import { ImageInput } from "@/components/image-input";
import { Alert } from "../../../components/alert/Alert";
import { toast } from "sonner";
import RichTextEditor from "../../../components/ui/rich-editor";
import {
  useCreateEducatorIqCryptoMutation,
  useUpdateEducatorIqCryptoMutation,
} from "../../../store/api/educator/educatorIqCryptoApiSlice";
import { useFetchPlansQuery } from "../../../store/api/educator/educatorPlanApiSlice";
const CreateEducatorIqCrypto = forwardRef(
  (
    { setSelectedRow, isCreateOpen, handleCloseCreate, selectedRow, refetch },
    ref
  ) => {
    const { auth } = useAuthContext();
    const [createEducatorIqCrypto] = useCreateEducatorIqCryptoMutation();
    const [updateEducatorIqCrypto] = useUpdateEducatorIqCryptoMutation();
    const createdBy = auth?.user?._id ?? null;
    const { data: plans } = useFetchPlansQuery();

    const initialValues = {
      title: "",
      files: [],
      mediaType: "image", // "image" or "video"
      videoUrl: "", // For YouTube, Vimeo, Loom URLs
      createdBy: createdBy || "", // Set from auth context
      description: "",
      url: "",
      accessType: "PUBLIC",
      plans: [],
    };

    // Helper function to validate video URLs
    const isValidVideoUrl = (url) => {
      if (!url || typeof url !== 'string') return false;
      const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
      const vimeoRegex = /^(https?:\/\/)?(www\.)?vimeo\.com\/.+/;
      const loomRegex = /^(https?:\/\/)?(www\.)?(loom\.com|loom\.share)\/.+/;
      return youtubeRegex.test(url) || vimeoRegex.test(url) || loomRegex.test(url);
    };

    const createSchema = Yup.object().shape({
      title: Yup.string().required("Title is required"),
      files: Yup.array().when(["mediaType", "videoUrl"], {
        is: (mediaType, videoUrl) => mediaType === "video" && videoUrl && videoUrl.trim() !== "",
        then: (schema) => schema, // File not required if video URL is provided
        otherwise: (schema) => schema.min(1, "Media file (image or video) is required"),
      }),
      mediaType: Yup.string().oneOf(["image", "video"]).required("Media type is required"),
      videoUrl: Yup.string().when("mediaType", {
        is: "video",
        then: (schema) => schema.test(
          "is-valid-video-url",
          "Please enter a valid YouTube, Vimeo, or Loom URL",
          function(value) {
            const { files } = this.parent;
            // Video URL is optional if a file is uploaded
            if (files && files.length > 0) return true;
            // If no file, video URL is required and must be valid
            if (!value || value.trim() === "") {
              return this.createError({ message: "Either upload a video file or provide a YouTube, Vimeo, or Loom URL" });
            }
            const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
            const vimeoRegex = /^(https?:\/\/)?(www\.)?vimeo\.com\/.+/;
            const loomRegex = /^(https?:\/\/)?(www\.)?(loom\.com|loom\.share)\/.+/;
            return youtubeRegex.test(value) || vimeoRegex.test(value) || loomRegex.test(value);
          }
        ),
        otherwise: (schema) => schema,
      }),
      createdBy: Yup.string().required("Educator ID is required"),
      description: Yup.string().required("Entry is required"),
      url: Yup.string()
        .url("Please enter a valid URL")
        .optional("URL is required"),
      accessType: Yup.string().oneOf(["PUBLIC", "LOGGED_IN", "UID_ONLY", "PRO"]).required("Access type is required"),
      plans: Yup.array().of(Yup.string()).when("accessType", {
        is: "PRO",
        then: (schema) => schema.min(1, "At least one plan is required for PRO tier"),
        otherwise: (schema) => schema,
      }),
    });

    const formik = useFormik({
      initialValues,
      enableReinitialize: true,
      revalidateOnMount: true,
      validationSchema: createSchema,
      onSubmit: async (values, { setStatus, setSubmitting }) => {
        const formData = new FormData();
        formData.append("title", values.title);
        // Append single file (image or video) - only if provided
        if (values.files && values.files.length > 0 && values.files[0]?.file?.file) {
          formData.append("files", values.files[0]?.file?.file);
        }
        formData.append("mediaType", values.mediaType || "image");
        // Append video URL if provided (for YouTube, Vimeo, Loom)
        if (values.mediaType === "video" && values.videoUrl && values.videoUrl.trim() !== "") {
          formData.append("videoUrl", values.videoUrl.trim());
        }
        formData.append("createdBy", values.createdBy);
        formData.append("description", values.description);
        formData.append("url", values.url);
        formData.append("accessType", values.accessType ?? "PUBLIC");
        // Add plans if PRO tier
        if (values.accessType === "PRO" && values.plans && values.plans.length > 0) {
          values.plans.forEach((planId) => {
            formData.append("plans[]", planId);
          });
        }
        if (selectedRow?._id) {
          formData.append("id", selectedRow?._id);
        }

        try {
          if (selectedRow?._id) {
            let a = await updateEducatorIqCrypto({ id: selectedRow?._id, formData }).unwrap();

            refetch();
            toast.success("Cripto Project updated successfully!");
          } else {
            await createEducatorIqCrypto(formData).unwrap();
            refetch();
            toast.success("Cripto Project created successfully!");
          }
          formik.resetForm();
          setSelectedRow({});
          handleCloseCreate();
        } catch (err) {
          // console.error("API Error:", err);
          const errorMessage =
            err?.data?.message || "An unexpected error occurred.";
          toast.error(errorMessage);
        }
      },
    });

    // Memoize onChange handler to prevent continuous re-renders
    const handleDescriptionChange = useCallback((value) => {
      formik.setFieldValue("description", value);
    }, []); // formik.setFieldValue is stable, no need to include in deps

    // Set createdBy when it becomes available or when dialog opens
    useEffect(() => {
      if (createdBy && isCreateOpen) {
        formik.setFieldValue("createdBy", createdBy);
      }
    }, [createdBy, isCreateOpen]);

    useEffect(() => {
      if (selectedRow?._id) {
        const mediaType = selectedRow.mediaType || (selectedRow.videoUrl ? "video" : "image");
        let existingFiles = [];
        let videoUrlValue = "";
        
        if (mediaType === "video" && selectedRow.videoUrl) {
          // Check if it's an external URL (YouTube, Vimeo, Loom) or uploaded file
          const isExternalUrl = isValidVideoUrl(selectedRow.videoUrl);
          if (isExternalUrl) {
            // External URL - store in videoUrl field
            videoUrlValue = selectedRow.videoUrl;
          } else {
            // Uploaded file - show in files preview
            existingFiles = [{
              file: null,
              dataURL: selectedRow.videoUrl,
              isVideo: true,
            }];
          }
        } else if (selectedRow.image) {
          const images = Array.isArray(selectedRow.image) ? selectedRow.image : [selectedRow.image];
          existingFiles = images.map((img) => ({
            file: null,
            dataURL: img,
            isVideo: false,
          }));
        }

        formik.setValues({
          title: selectedRow.title ?? "",
          files: existingFiles,
          mediaType: mediaType,
          videoUrl: videoUrlValue,
          description: selectedRow.description ?? "",
          url: selectedRow.url ?? "",
          createdBy: selectedRow.createdBy?._id ?? "",
          accessType: selectedRow.accessType ?? "PUBLIC",
          plans: selectedRow?.plans?.map(p => (p?._id || p)?.toString()) || [],
        });
      } else {
        // reset when switching back to create mode
        formik.resetForm();
        // Set createdBy after reset
        if (createdBy) {
          formik.setFieldValue("createdBy", createdBy);
        }
      }
    }, [selectedRow, createdBy]);

    // Handle single file selection (image or video)
    const handleFileChange = (selectedFiles) => {
      if (selectedFiles.length > 0) {
        const file = selectedFiles[0];
        const isVideo = file.type?.startsWith('video/') || formik.values.mediaType === 'video';
        
        // Auto-detect media type from file
        if (file.type?.startsWith('video/')) {
          formik.setFieldValue("mediaType", "video");
        } else if (file.type?.startsWith('image/')) {
          formik.setFieldValue("mediaType", "image");
        }

        // Store single file
        const newFile = {
          file,
          dataURL: file.dataURL,
          isVideo: isVideo,
        };

        formik.setFieldValue("files", [newFile]);
      }
    };

    const handleRemoveFile = () => {
      formik.setFieldValue("files", []);
    };

    const handleMediaTypeChange = (type) => {
      formik.setFieldValue("mediaType", type);
      // Clear files and video URL when switching media type
      formik.setFieldValue("files", []);
      formik.setFieldValue("videoUrl", "");
    };

    console.log(formik, "formik");

    return (
      <>
        <Dialog
          open={isCreateOpen}
          onOpenChange={() => {
            setSelectedRow({});
            formik.resetForm();
            handleCloseCreate();
          }}
        >
          {formik.status && <Alert variant="danger">{formik.status}</Alert>}
          <DialogContent className="p-5 max-w-[600px]" ref={ref}>
            <DialogHeader className="pb-5 pt-0 px-0">
              <DialogTitle>
                {selectedRow?._id ? "Update Cripto Project" : " Create Cripto Project"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-5 px-0 pb-5">
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12">
                  <div className="flex flex-col gap-1">
                    <label className="form-label text-gray-900 gap-1">
                      Title<span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter Title"
                      autoComplete="off"
                      className={`form-control input input-md w-full ${formik.errors.title && formik.touched.title
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
                <div className="col-span-12">
                  <div className="flex flex-col gap-1">
                    <label className="form-label text-gray-900 gap-1">
                      Description<span className="text-danger">*</span>
                    </label>
                    <RichTextEditor
                      content={formik.values.description}
                      onChange={handleDescriptionChange}
                      onBlur={() =>
                        formik.setFieldTouched("description", false)
                      }
                      theme="snow"
                      touched={formik.touched.description}
                      error={formik.errors.description}
                    />
                    {formik.touched.description &&
                      formik.errors.description && (
                        <span role="alert" className="text-danger text-xs mt-1">
                          {formik.errors.description}
                        </span>
                      )}
                  </div>
                </div>

                <div className="col-span-12">
                  <div className="flex flex-col gap-1">
                    <label className="form-label text-gray-900 gap-1">
                      Url
                    </label>
                    <input
                      type="text"
                      placeholder="Enter url"
                      autoComplete="off"
                      className={`form-control input input-md w-full ${formik.errors.url && formik.touched.url
                        ? "border border-danger"
                        : ""
                        }`}
                      {...formik.getFieldProps("url")}
                    />
                    {formik.touched.url && formik.errors.url && (
                      <span role="alert" className="text-danger text-xs mt-1">
                        {formik.errors.url}
                      </span>
                    )}
                  </div>
                </div>
                <div className="col-span-12">
                  <div className="flex flex-col gap-2">
                    <label className="form-label text-gray-900">
                      Access Type<span className="text-danger">*</span>
                    </label>

                    <div className="flex flex-wrap gap-6">
                      {["PUBLIC", "LOGGED_IN", "UID_ONLY", "PRO"].map((type) => (
                        <label key={type} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="accessType"
                            value={type}
                            checked={formik.values.accessType === type}
                            onChange={() => {
                              formik.setFieldValue("accessType", type);
                              // Clear plans if switching away from PRO
                              if (type !== "PRO") {
                                formik.setFieldValue("plans", []);
                              }
                            }}
                            className="radio radio-primary"
                          />
                          <span className="text-sm">{type.replace("_", " ")}</span>
                        </label>
                      ))}
                    </div>

                    {formik.touched.accessType && formik.errors.accessType && (
                      <span role="alert" className="text-danger text-xs">
                        {formik.errors.accessType}
                      </span>
                    )}
                  </div>
                </div>

                {formik.values.accessType === "PRO" && (
                  <div className="col-span-12">
                    <label className="form-label text-gray-900">
                      Payment Plans<span className="text-danger">*</span>
                    </label>
                    <div className={`space-y-3 p-4 border rounded-md mt-2 ${formik.errors.plans ? "border-danger" : "border-gray-300"}`}>
                      {plans?.data?.length > 0 ? (
                        plans.data.map((plan) => {
                          const isSelected = formik.values.plans?.includes(plan._id);
                          return (
                            <div
                              key={plan._id}
                              className="flex items-start space-x-3 p-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-200  border border-transparent hover:border-gray-200 transition-colors"
                            >
                              <Checkbox
                                id={`plan-${plan._id}`}
                                checked={isSelected}
                                onCheckedChange={(checked) => {
                                  const currentPlans = formik.values.plans || [];
                                  const newPlans = checked
                                    ? [...currentPlans, plan._id]
                                    : currentPlans.filter(id => id !== plan._id);
                                  formik.setFieldValue("plans", newPlans);
                                }}
                                className="mt-1"
                              />
                              <label
                                htmlFor={`plan-${plan._id}`}
                                className="flex-1 cursor-pointer"
                              >
                                <div className="font-medium text-gray-900">
                                  {plan.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  ${plan.price?.toFixed(2) || "0.00"} • {plan.hotmartCheckoutCode || "N/A"}
                                </div>
                                {plan.description && (
                                  <div className="text-xs text-gray-400 dark:text-gray-600 mt-1">
                                    {plan.description}
                                  </div>
                                )}
                              </label>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-sm text-gray-500 py-2">
                          No plans found. Please contact admin to create plans.
                        </div>
                      )}
                      {formik.values.plans?.length > 0 && (
                        <div className="mt-3 pt-3 border-t text-sm text-gray-600">
                          {formik.values.plans.length} plan{formik.values.plans.length !== 1 ? 's' : ''} selected
                        </div>
                      )}
                    </div>
                    {formik.touched.plans && formik.errors.plans && (
                      <span className="text-danger text-xs mt-1 block">
                        {formik.errors.plans}
                      </span>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Select one or more payment plans. Users who purchase any of these plans will get access to this content.
                    </p>
                  </div>
                )}



                <div className="col-span-12">
                  <div className="flex flex-col gap-3">
                    {/* Media Type Selection */}
                    <div className="flex flex-col gap-2">
                      <label className="form-label text-gray-900">
                        Media Type<span className="text-danger">*</span>
                      </label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="mediaType"
                            value="image"
                            checked={formik.values.mediaType === "image"}
                            onChange={() => handleMediaTypeChange("image")}
                            className="radio radio-primary"
                          />
                          <span className="text-sm">Image</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="mediaType"
                            value="video"
                            checked={formik.values.mediaType === "video"}
                            onChange={() => handleMediaTypeChange("video")}
                            className="radio radio-primary"
                          />
                          <span className="text-sm">Video</span>
                        </label>
                      </div>
                    </div>

                    {/* Video URL Input (for YouTube, Vimeo, Loom) */}
                    {formik.values.mediaType === "video" && (
                      <div className="flex flex-col gap-1">
                        <label className="form-label text-gray-900 gap-1">
                          Video URL (YouTube, Vimeo, or Loom)
                          <span className="text-xs text-gray-500 font-normal">(Optional - if not uploading a file)</span>
                        </label>
                        <input
                          type="text"
                          placeholder="https://www.youtube.com/watch?v=... or https://vimeo.com/... or https://www.loom.com/share/..."
                          autoComplete="off"
                          className={`form-control input input-md w-full ${formik.errors.videoUrl && formik.touched.videoUrl
                            ? "border border-danger"
                            : ""
                            }`}
                          {...formik.getFieldProps("videoUrl")}
                        />
                        {formik.touched.videoUrl && formik.errors.videoUrl && (
                          <span role="alert" className="text-danger text-xs mt-1">
                            {formik.errors.videoUrl}
                          </span>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          Enter a YouTube, Vimeo, or Loom video URL, or upload a video file below
                        </p>
                      </div>
                    )}

                    {/* File Upload */}
                    <div className="flex flex-col gap-2">
                      <label className="form-label text-gray-900">
                        {formik.values.mediaType === "video" ? "Or Upload Video File" : "Upload Image File"}
                        {formik.values.mediaType === "video" && formik.values.videoUrl && formik.values.videoUrl.trim() !== "" 
                          ? <span className="text-xs text-gray-500 font-normal">(Optional - if using video URL above)</span>
                          : <span className="text-danger">*</span>}
                      </label>
                      <div className="flex flex-wrap gap-5">
                        <ImageInput
                          multiple={false}
                          acceptType={formik.values.mediaType === "video" ? ["mp4", "webm", "ogg"] : ["jpg", "jpeg", "png", "gif"]}
                          value={formik.values.files}
                          onChange={handleFileChange}
                        >
                          {({ onImageUpload }) => (
                            <div
                              className="cursor-pointer image-input size-24"
                              onClick={onImageUpload}
                            >
                              <div
                                className={`flex border justify-center rounded-lg image-input-placeholder items-center 
                                ${formik.touched.files && formik.errors.files
                                    ? "border-danger"
                                    : "border-gray-200"
                                  }`}
                              >
                                <i className={formik.values.mediaType === "video" ? "ki-filled ki-video" : "ki-filled ki-picture"}></i>
                              </div>
                            </div>
                          )}
                        </ImageInput>

                        {/* Show preview */}
                        {formik.values.files.length > 0 && formik.values.files[0]?.dataURL && (
                          <div className="relative">
                            {formik.values.mediaType === "video" || formik.values.files[0]?.isVideo ? (
                              <div className="relative">
                                <video
                                  src={formik.values.files[0].dataURL}
                                  className="rounded-lg border-2 border-success size-24 object-cover"
                                  controls={false}
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
                                  <i className="ki-filled ki-play text-white text-2xl"></i>
                                </div>
                              </div>
                            ) : (
                              <img
                                src={formik.values.files[0].dataURL}
                                alt="uploaded"
                                className="rounded-lg border-2 border-success size-24 object-cover"
                              />
                            )}
                            <div className="absolute -right-4 -top-4">
                              <button
                                type="button"
                                className="btn btn-xs btn-icon rounded-full btn-danger"
                                onClick={handleRemoveFile}
                              >
                                <i className="ki-outline ki-cross"></i>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                      {formik.touched.files && formik.errors.files && (
                        <span role="alert" className="text-danger text-xs mt-1">
                          {formik.errors.files}
                        </span>
                      )}
                      <p className="text-xs text-gray-500">
                        {formik.values.mediaType === "video" 
                          ? "Upload a video file (MP4, WebM, OGG - max 500MB) or use a video URL above"
                          : "Upload an image file (JPG, PNG, GIF - max 50MB)"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex border-gray-200 border-t justify-end py-5 pb-0 rounded-b dark:border-gray-200 gap-3">
              <button
                className="btn btn-light"
                onClick={() => {
                  setSelectedRow({});
                  formik.resetForm();
                  handleCloseCreate();
                }}
              >
                Cancel
              </button>
              <button
                disabled={formik.isSubmitting}
                type="submit"
                onClick={formik.handleSubmit}
                className="btn btn-primary"
              >
                Submit
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }
);

export default CreateEducatorIqCrypto;





















