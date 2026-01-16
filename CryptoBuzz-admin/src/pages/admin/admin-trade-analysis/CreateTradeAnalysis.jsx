import React, { forwardRef, useEffect, useState } from "react";
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
import {
  useCreateTradeIdeasMutation,
  useUpdateTradeIdeaMutation,
} from "../../../store/api/admin/adminTradeIdeasApiSlice";
import RichTextEditor from "../../../components/ui/rich-editor";
import {
  useCreateTradeAnalysisMutation,
  useUpdateTradeAnalysisMutation,
} from "../../../store/api/admin/adminTradeAnalysisApiSlice";
import { useGetEducatorAcademyCategoryQuery } from "../../../store/api/admin/adminAcademyCategoryApiSlice";
import { useFetchPlansQuery } from "../../../store/api/admin/adminPlanApiSlice";

const CreateTradeAnalysis = forwardRef(
  (
    { setSelectedRow, isCreateOpen, handleCloseCreate, selectedRow, refetch },
    ref
  ) => {
    const { auth } = useAuthContext();
    const [createTradeAnalysis] = useCreateTradeAnalysisMutation();
    const [updateTradeAnalysis] = useUpdateTradeAnalysisMutation();
    const createdBy = auth?.user?._id ?? null;
    const { data } = useGetEducatorAcademyCategoryQuery();
    const { data: plans } = useFetchPlansQuery();

    const initialValues = {
      title: "",
      files: [],
      createdBy: "",
      description: "",
      category: "",
      url: "",
      accessType: "PUBLIC",
      plans: [],
    };

    const createSchema = Yup.object().shape({
      title: Yup.string().required("Title is required"),
      files: Yup.array().min(1, "At least one file is required"),
      createdBy: Yup.string().required("Educator ID is required"),
      description: Yup.string().required("Entry is required"),
      accessType: Yup.string().oneOf(["PUBLIC", "LOGGED_IN", "UID_ONLY", "PRO"]).required("Access Type is required"),
      plans: Yup.array().of(Yup.string()).when("accessType", {
        is: "PRO",
        then: (schema) => schema.min(1, "At least one plan is required for PRO tier"),
        otherwise: (schema) => schema,
      }),
      url: Yup.string()
        .url("Please enter a valid URL")
        .optional("URL is required"),
      category: Yup.string().required("Category is required"),
    });

    const formik = useFormik({
      initialValues,
      enableReinitialize: true,
      revalidateOnMount: true,
      validationSchema: createSchema,
      onSubmit: async (values, { setStatus, setSubmitting }) => {
        const formData = new FormData();
        formData.append("title", values.title);
        values.files.forEach((file) =>
          formData.append("files", file?.file?.file)
        );
        formData.append("createdBy", values.createdBy);
        formData.append("description", values.description);
        formData.append("category", values.category);
        formData.append("url", values.url);
        formData.append("accessType", values.accessType);
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
            let a = await updateTradeAnalysis({
              id: selectedRow?._id,
              formData,
            }).unwrap();

            refetch();
            toast.success("Trade Analysis updated successfully!");
          } else {
            await createTradeAnalysis(formData).unwrap();
            refetch();
            toast.success("Trade Analysis created successfully!");
          }
          formik.resetForm();
          handleCloseCreate();
        } catch (err) {
          // console.error("API Error:", err);
          const errorMessage =
            err?.data?.message || "An unexpected error occurred.";
          toast.error(errorMessage);
        }
      },
    });
    useEffect(() => {
      if (createdBy && formik.values) {
        formik.setFieldValue("createdBy", createdBy);
      }
    }, [createdBy, formik.values]);

    useEffect(() => {
      if (selectedRow?._id) {
        const existingImages =
          selectedRow.image?.map((img) => ({
            file: null,
            dataURL: img,
          })) || [];

        const initData = {
          title: selectedRow?.title,
          files: existingImages,
          description: selectedRow?.description,
          category: selectedRow?.category?._id,
          url: selectedRow?.url,
          accessType: selectedRow?.accessType || "PUBLIC",
          plans: selectedRow?.plans?.map(p => (p?._id || p)?.toString()) || [],
        };
        formik.setValues(initData);
      }
    }, [selectedRow?._id, isCreateOpen]);

    // Handle multiple image selection
    const handleImageChange = (selectedFiles) => {
      if (selectedFiles.length > 0) {
        // Convert FileList to an array and map to store dataURLs
        const newFiles = Array.from(selectedFiles).map((file) => ({
          file,
          dataURL: file.dataURL,
        }));

        // Append new files to Formik state
        formik.setFieldValue("files", newFiles);
      }
    };

    const handleRemoveImage = (index) => {
      const newFiles = [...formik.values.files];
      newFiles.splice(index, 1);
      formik.setFieldValue("files", newFiles);
    };

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
                {selectedRow?._id ? "Update Trade Analysis" : " Create Trade Analysis"}
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
                      onChange={(value) =>
                        formik.setFieldValue("description", value)
                      }
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
                  <div className="flex flex-col w-full gap-1">
                    <label className="form-label text-gray-900 gap-1">
                      Category <span className="text-danger">*</span>
                    </label>
                    <Select
                      value={formik.values.category}
                      onValueChange={(value) =>
                        formik.setFieldValue("category", value)
                      }
                      className={`form-control input input-md w-full ${formik.errors.category ? "border border-danger" : ""}`}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.isArray(data?.data) && data.data.length > 0 ? (
                          data.data.map((item) => (
                            <SelectItem key={item._id} value={item._id}>
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

                    {formik.touched.category && formik.errors.category && (
                      <span role="alert" className="text-danger text-xs mt-1">
                        {formik.errors.category}
                      </span>
                    )}
                  </div>
                </div>

                <div className="col-span-12">
                  <label className="form-label text-gray-900">
                    Access Type<span className="text-danger">*</span>
                  </label>

                  <div className="flex flex-wrap gap-4 mt-2">
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
                    <span className="text-danger text-xs mt-1 block">
                      {formik.errors.accessType}
                    </span>
                  )}
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
                          No plans found. Please create a plan first.
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
                  <div className="flex flex-wrap gap-5">
                    {/* Upload Box - always shown */}
                    <ImageInput
                      multiple={true}
                      value={formik.values.files}
                      onChange={handleImageChange}
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
                            <i className="ki-filled ki-picture"></i>
                          </div>
                        </div>
                      )}
                    </ImageInput>

                    {/* Show preview only if there are images */}
                    {formik.values.files
                      .filter((file) => !!file?.dataURL)
                      .map((file, index) => (
                        <div key={index} className="relative">
                          <img
                            src={file.dataURL}
                            alt="uploaded"
                            className="rounded-lg border-2 border-success size-24 object-cover"
                          />
                          <div className="absolute -right-4 -top-4">
                            <button
                              type="button"
                              className="btn btn-xs btn-icon rounded-full btn-danger"
                              onClick={() => handleRemoveImage(index)}
                            >
                              <i className="ki-outline ki-cross"></i>
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                  {formik.touched.files && formik.errors.files && (
                    <span role="alert" className="text-danger text-xs mt-1">
                      {formik.errors.files}
                    </span>
                  )}
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

export default CreateTradeAnalysis;





















