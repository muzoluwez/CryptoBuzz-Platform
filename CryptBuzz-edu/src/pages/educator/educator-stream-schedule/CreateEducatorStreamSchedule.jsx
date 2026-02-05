import React, { forwardRef, useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useAuthContext } from "../../../auth/useAuthContext";
import { useNavigate } from "react-router";
import TagInput from "../../../components/ui/tagInput";
import RichTextEditor from "../../../components/ui/rich-editor";
import DateTimePicker from "./DateTimePicker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useCreateEducatorStreamScheduleMutation, useUpdateEducatorStreamScheduleMutation } from "../../../store/api/educator/educatorStreamScheduleApiSlice";
import { useFetchCategoriesQuery } from "../../../store/api/educator/educatorAcademyCategoryApiSlice";
import { useGetLanguagesQuery } from "../../../store/api/educator/educatorLanguageApiSlice";
import { useFetchPlansQuery } from "../../../store/api/educator/educatorPlanApiSlice";
const CreateEducatorStreamSchedule = forwardRef(
  (
    { isCreateOpen, handleCloseCreate, selectedRow, setSelectedRow, refetch },
    ref
  ) => {
    const { auth } = useAuthContext();
    const [createEducatorStreamSchedule] =
      useCreateEducatorStreamScheduleMutation();
    const [updateEducatorStreamSchedule] =
      useUpdateEducatorStreamScheduleMutation();
    const educatorId = auth?.user?._id ?? null;
    const navigate = useNavigate();
    const { data: categoryList, isLoading } = useFetchCategoriesQuery();
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const { data: languagesList } = useGetLanguagesQuery();
    const { data: plans } = useFetchPlansQuery();

    const initialValues = {
      title: "",
      description: "",
      datetime: "",
      tags: [],
      category: "",
      // files: null,
      userId: "",
      streamType: "obs",
      language: "",
      tier: "PUBLIC", // Using 'tier' to match Schedule model (instead of accessType)
      plans: [],
      // files: ""
    };

    const createSchema = Yup.object().shape({
      title: Yup.string().required("Title is required"),
      datetime: Yup.date()
        .required("Date & time is required")
        .typeError("Invalid date & time format")
        .min(new Date(), "Start date & time can't be in the past"),
      description: Yup.string().required("Description is required"),
      category: Yup.string().required("Category is required"),
      streamType: Yup.string()
        .oneOf(["obs", "webrtc"], "Invalid stream type")
        .required("Stream Type is required"),
      tags: Yup.array()
        .min(1, "At least one tag is required")
        .of(Yup.string().required("Tag cannot be empty")),
      // files: Yup.array()
      //   .required("Thumbnail is required")
      //   .min(1, "Thumbnail is required")
      //   .test("fileOrUrl", "Thumbnail is required", (value) => {
      //     if (!value || value.length === 0) return false;
      //     const file = value[0]?.file;
      //     const dataURL = value[0]?.dataURL;
      //     return !!file || !!dataURL; // allow either new file or existing URL
      //   })
      //   .test("fileType", "Unsupported file type", (value) => {
      //     const file = value?.[0]?.file;
      //     if (!file) return true; // skip type check if no new file
      //     const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
      //     return allowedTypes.includes(file.type);
      //   })
      //   .test("fileSize", "File size too large (max 2MB)", (value) => {
      //     const file = value?.[0]?.file;
      //     if (!file) return true; // skip size check if no new file
      //     const maxSize = 2 * 1024 * 1024;
      //     return file.size <= maxSize;
      //   }),
      language: Yup.string().required("Language is required"),
      tier: Yup.string().oneOf(["PUBLIC", "LOGGED_IN", "UID_ONLY", "PRO"]).default("PUBLIC").required("Access Tier is required"),
      plans: Yup.array().of(Yup.string()).when("tier", {
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
      onSubmit: async (values) => {
        // const callId = uuidv4();
        // const files = values.files?.[0]?.file; // Get the actual File object

        const formData = new FormData();
        // formData.append('callId', callId);
        formData.append("title", values.title);
        formData.append("streamType", values.streamType);
        formData.append("category", values.category);
        formData.append("description", values.description);
        formData.append("datetime", values.datetime);
        formData.append("language", values.language);
        formData.append("tier", values.tier || "PUBLIC");
        // Add plans if PRO tier
        if (values.tier === "PRO" && values.plans && values.plans.length > 0) {
          values.plans.forEach((planId) => {
            formData.append("plans[]", planId);
          });
        }
        values.tags.forEach((tag) => {
          formData.append(`tags[]`, tag);
        });

        // formData.append('userId', values?.userId);
        formData.append("educator", values?.userId);

        // if (files) {
        //   formData.append("files", files); // key must match your backend field
        // }

        if (selectedRow?._id) {
          formData.append("id", selectedRow._id); // key must match your backend field
        }

        // try {
        //     const res = await createEducatorStreamSchedule(formData).unwrap();
        //     handleCloseCreate();
        //     refetch();
        //     // navigate(`/live-session/${callId}`, { state: res })
        // } catch (err) {
        //     toast.error(err.data.message);
        // };
        try {
          if (selectedRow?._id) {
            await updateEducatorStreamSchedule({
              data: formData,
              id: selectedRow._id,
            }).unwrap();
            setSelectedRow({});
            refetch();
            toast.success("Live schedule updated successfully!");
          } else {
            await createEducatorStreamSchedule(formData).unwrap();
            refetch();
            toast.success("Live schedule created successfully!");
            setSelectedRow({});
          }
          formik.resetForm();
          handleCloseCreate();
        } catch (err) {
          console.error("API Error:", err);
          const errorMessage =
            err?.data?.message || "An unexpected error occurred.";
          toast.error(errorMessage);
        }
      },
    });

    useEffect(() => {
      if (educatorId && formik.values) {
        formik.setFieldValue("userId", educatorId);
      }
    }, [educatorId, formik.values]);

    useEffect(() => {
      if (selectedRow?._id) {
        const initData = {
          title: selectedRow?.title,
          //   streamType:selectedRow?.streamType,
          description: selectedRow?.description,
          datetime: selectedRow?.datetime
            ? new Date(selectedRow?.datetime)
            : null,
          tags: selectedRow?.tags,
          category: selectedRow?.category?._id,
          // files: [{ file: null, dataURL: selectedRow?.image }],
          userId: selectedRow?.userId,
          language: selectedRow?.language,
          tier: selectedRow?.tier || selectedRow?.accessType || "PUBLIC", // Support both tier and accessType for compatibility
          streamType: selectedRow?.streamType || "obs",
          plans: selectedRow?.plans?.map(p => (p?._id || p)?.toString()) || [],
          // files: selectedRow?.image
        };
        formik.setValues(initData);
      }
    }, [selectedRow?._id, isCreateOpen]);

    const handleImageChange = (updatedImages) => {
      formik.setFieldValue("files", updatedImages);
    };

    return (
      <Dialog
        open={isCreateOpen}
        onOpenChange={() => {
          formik.resetForm();
          setSelectedRow({});
          handleCloseCreate();
        }}
      >
        {formik.status && <Alert variant="danger">{formik.status}</Alert>}
        <DialogContent className="p-5 max-w-[475px]" ref={ref}>
          <DialogHeader className="pb-5 pt-0 px-0">
            <DialogTitle>
              {selectedRow?._id
                ? "Update Live Schedule"
                : "Create Live Schedule"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-5 px-0 py-5">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12">
                <div className="flex flex-col gap-1">
                  <label className="form-label text-gray-900 gap-1">
                    Title<span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter title"
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
                    onChange={(value) =>
                      formik.setFieldValue("description", value)
                    }
                    onBlur={() => formik.setFieldTouched("description", false)}
                    theme="snow"
                    touched={formik.touched.description}
                    error={formik.errors.description}
                  />
                  {formik.touched.description && formik.errors.description && (
                    <span role="alert" className="text-danger text-xs mt-1">
                      {formik.errors.description}
                    </span>
                  )}
                </div>
              </div>
              {/* <div className="col-span-12">
                <div className="flex items-center justify-between">
                <p className="text-xs font-medium tracking-wide">
                EASTERN TIME (EST)
              </p>
              <p className="text-xs font-medium tracking-wide">
                {time.date}
              </p>
              <p className="text-xs font-medium tracking-wide">
                {time.clock}
              </p>
              </div>
              </div> */}
              <div className="col-span-12">
                <div className="flex flex-col gap-1">
                  <label className="form-label text-gray-900 gap-1">
                    Date Onwards<span className="text-danger">*</span>
                  </label>
                  <div className="custom_datepicket">
                    <DateTimePicker
                      isPickerOpen={isPickerOpen}
                      setIsPickerOpen={setIsPickerOpen}
                      value={formik.values.datetime}
                      onChange={(date) =>
                        formik.setFieldValue("datetime", date)
                      }
                      className={
                        formik.errors.datetime && formik.touched.datetime
                          ? "border border-danger"
                          : ""
                      }
                    />
                  </div>
                  {formik.touched.datetime && formik.errors.datetime && (
                    <span className="text-danger text-xs">
                      {formik.errors.datetime}
                    </span>
                  )}
                </div>
              </div>
              <div className="col-span-12">
                <div className="flex flex-col w-full gap-1">
                  <label className="form-label text-gray-900 gap-1">
                    Language <span className="text-danger">*</span>
                  </label>
                  <Select
                    value={formik.values.language}
                    onValueChange={(value) =>
                      formik.setFieldValue("language", value)
                    }
                    className={`form-control input input-md w-full ${formik.errors.language ? "border border-danger" : ""}`}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray(languagesList?.data) &&
                        languagesList.data.length > 0 ? (
                        languagesList.data.map((item) => (
                          <SelectItem key={item._id} value={item.name}>
                            {item.name}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="px-4 py-2 text-sm text-gray-500">
                          No options available
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                  {formik.touched.language && formik.errors.language && (
                    <span role="alert" className="text-danger text-xs mt-1">
                      {formik.errors.language}
                    </span>
                  )}
                </div>
              </div>
              <div className="col-span-12">
                <div className="col-span-6">
                  <div className="flex flex-col gap-1">
                    <label className="form-label text-gray-900 gap-1">
                      Category<span className="text-danger">*</span>
                    </label>
                    <Select
                      defaultValue={formik.values.category}
                      onValueChange={(value) =>
                        formik.setFieldValue("category", value)
                      }
                      className={`form-control input input-md w-full ${formik.errors.category && formik.touched.category
                        ? "border border-danger"
                        : ""
                        }`}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {categoryList?.data?.map((item) => (
                          <SelectItem key={item._id} value={item._id}>
                            {item.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formik.touched.category && formik.errors.category && (
                      <span role="alert" className="text-danger text-xs mt-1">
                        {formik.errors.category}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="col-span-12">
                <div className="flex flex-col gap-1 tag-input">
                  <label className="form-label text-gray-900 gap-1">
                    Tags<span className="text-danger">*</span>
                  </label>
                  <TagInput
                    value={formik.values.tags}
                    onChange={(newTags) =>
                      formik.setFieldValue("tags", newTags)
                    }
                    touched={formik.touched.tags}
                    error={formik.errors.tags}
                  />
                  {formik.touched.tags && formik.errors.tags && (
                    <span role="alert" className="text-danger text-xs mt-1">
                      {formik.errors.tags}
                    </span>
                  )}
                </div>
              </div>
              {/* <div className="col-span-12">
                <div className="flex flex-col gap-1">
                  <label className="form-label text-gray-900 gap-1">
                    Thumbnail<span className="text-danger">*</span>
                  </label>
                  <div className="flex-wrap gap-5">
                    {/* Image Input */}
              {/* <ImageInput
                      value={formik.values.files}
                      onChange={handleImageChange}
                      acceptType={["jpg", "jpeg", "png"]}
                      multiple={false}
                    >
                      {({
                        fileList,
                        onImageUpload,
                        onImageRemove,
                        onImageUpdate,
                        dragProps,
                        isDragging,
                      }) => (
                        <div
                          {...dragProps}
                          className={`
        border border-dashed rounded-lg text-center transition-colors 
        p-5 ${isDragging ? "bg-gray-100" : ""} border-gray-300 ${formik.touched.files && formik.errors.files
                              ? "validation-error-border"
                              : ""
                            }`}
                        >
                          {fileList.length === 0 ? (
                            <>
                              <p
                                onClick={onImageUpload}
                                className="text-sm font-medium text-muted-foreground cursor-pointer"
                              >
                                Drag & drop an image here, or
                              </p>
                              <button
                                onClick={onImageUpload}
                                className="mt-2 text-sm font-medium text-muted-foreground underline"
                                type="button"
                              >
                                Upload Image
                              </button>
                            </>
                          ) : (
                            <div className="relative inline-block">
                              <img
                                src={fileList[0].dataURL}
                                alt="Uploaded Preview"
                                className="w-48 h-48 object-cover rounded-md"
                              />
                              <div className="mt-3 flex justify-center gap-3">
                                <button
                                  type="button"
                                  onClick={() => onImageUpdate(0)}
                                  className="btn btn-icon btn-light btn-outline"
                                >
                                  <i className="ki-filled ki-update-file" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onImageRemove(0)}
                                  className="btn btn-icon btn-danger btn-outline"
                                >
                                  <i className="ki-filled ki-trash" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </ImageInput>
                  </div>
                  {formik.touched.files && formik.errors.files && (
                    <span role="alert" className="text-danger text-xs mt-1">
                      {formik.errors.files}
                    </span>
                  )}
                </div> */}
              {/* </div> */}
              <div className="col-span-12">
                <label className="form-label text-gray-900">
                  Access Tier<span className="text-danger">*</span>
                </label>

                <div className="flex flex-wrap gap-4 mt-2">
                  {["PUBLIC", "LOGGED_IN", "UID_ONLY", "PRO"].map((type) => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="tier"
                        value={type}
                        checked={formik.values.tier === type}
                        onChange={() => {
                          formik.setFieldValue("tier", type);
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

                {formik.touched.tier && formik.errors.tier && (
                  <span className="text-danger text-xs mt-1 block">
                    {formik.errors.tier}
                  </span>
                )}
              </div>
              <div className="col-span-12">
                <div className="flex flex-col gap-1">
                  <label className="form-label text-gray-900 gap-1">
                    Stream Type <span className="text-danger">*</span>
                  </label>
                  <div className="flex gap-6">
                    <div className="grid grid-cols-12 gap-4 w-full">
                      <div className="col-span-12 sm:col-span-6">
                        <div className="card h-full">
                          <div className="card-body px-3">
                            <label className="flex flex-col gap-1 cursor-pointer">
                              <div className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name="streamType"
                                  value="obs"
                                  checked={formik.values.streamType === "obs"}
                                  onChange={(e) =>
                                    formik.setFieldValue("streamType", e.target.value)
                                  }
                                  // className="form-radio"
                                  className="radio radio-primary"
                                />
                                <span className="text-sm">OBS / RTMP</span>
                              </div>
                              <p className="text-xs mt-2">
                                Use OBS or streaming software to push RTMP stream.
                              </p>
                            </label>
                          </div>
                        </div>
                      </div>
                      <div className="col-span-12 sm:col-span-6">
                        <div className="card h-full">
                          <div className="card-body px-3">
                            <label className="flex flex-col gap-1 cursor-pointer">
                              <div className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name="streamType"
                                  value="webrtc"
                                  checked={formik.values.streamType === "webrtc"}
                                  onChange={(e) =>
                                    formik.setFieldValue("streamType", e.target.value)
                                  }
                                  // className="form-radio"
                                  className="radio radio-primary"
                                />
                                <span className="text-sm">WebRTC (Browser)</span>
                              </div>
                              <p className="text-xs mt-2">
                                Stream directly from your browser using WebRTC.
                              </p>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {formik.touched.streamType && formik.errors.streamType && (
                    <span role="alert" className="text-danger text-xs mt-1 block">
                      {formik.errors.streamType}
                    </span>
                  )}
                </div>
              </div>
              {formik.values.tier === "PRO" && (
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
                    Select one or more payment plans. Users who purchase any of these plans will get access to this live stream.
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="flex border-gray-200 border-t justify-end pt-5 rounded-b dark:border-gray-200 gap-3">
            <button
              className="btn btn-light"
              onClick={() => {
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
    );
  }
);

export default CreateEducatorStreamSchedule;
