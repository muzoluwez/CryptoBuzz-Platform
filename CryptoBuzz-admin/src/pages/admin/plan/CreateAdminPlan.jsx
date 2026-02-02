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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuthContext } from "../../../auth/useAuthContext";
import { Alert } from "../../../components/alert/Alert";
import { toast } from "sonner";
import { KeenIcon } from "../../../components";
import { ImageInput } from "@/components/image-input";
import {
  useCreatePlanMutation,
  useUpdatePlanMutation,
  useGetHotmartProductsQuery,
} from "../../../store/api/admin/adminPlanApiSlice";

const CreateAdminPlan = forwardRef(
  (
    { isCreateOpen, handleCloseCreate, selectedRow, refetch, setSelectedRow },
    ref
  ) => {
    const { auth } = useAuthContext();
    const [createPlan] = useCreatePlanMutation();
    const [updatePlan] = useUpdatePlanMutation();
    const { data: hotmartProducts, isLoading: isLoadingProducts } = useGetHotmartProductsQuery();
    const [selectedProduct, setSelectedProduct] = useState(null);

    const initialValues = {
      name: "",
      description: "",
      price: 0,
      currency: "USD",
      image: [],
      hotmartProductId: "",
      hotmartCheckoutUrl: "",
      status: "active",
    };

    const createSchema = Yup.object().shape({
      name: Yup.string()
        .required("Plan name is required")
        .max(100, "Name can't be longer than 100 characters"),
      description: Yup.string()
        .max(500, "Description can't be longer than 500 characters"),
      price: Yup.number()
        .required("Price is required")
        .min(0, "Price must be 0 or greater"),
      currency: Yup.string()
        .required("Currency is required"),
      hotmartCheckoutUrl: Yup.string()
        .required("Hotmart checkout URL is required")
        .url("Must be a valid URL")
        .matches(
          /^https?:\/\/pay\.hotmart\.com\/[A-Z0-9]+$/i,
          "Must be a valid Hotmart checkout URL (e.g., https://pay.hotmart.com/J103673988Y)"
        ),
      status: Yup.string()
        .oneOf(["active", "inactive"], "Status must be active or inactive"),
    });

    const formik = useFormik({
      initialValues,
      enableReinitialize: true,
      revalidateOnMount: true,
      validationSchema: createSchema,
      onSubmit: async (values, { setStatus, setSubmitting }) => {
        const formData = new FormData();
        formData.append("name", values.name);
        formData.append("description", values.description || "");
        formData.append("price", parseFloat(values.price));
        formData.append("currency", values.currency || "USD");
        formData.append("hotmartCheckoutUrl", values.hotmartCheckoutUrl);
        formData.append("hotmartProductId", values.hotmartProductId || null);
        formData.append("status", values.status || "active");

        console.log(values.image, "values.image.");
        
        // Add image if present
        if (values.image && values.image.length > 0) {
          values.image.forEach((img) => {
            if (img?.file) {
              formData.append("image", img.file);
            }
          });
        }

        try {
          if (selectedRow?._id) {
            await updatePlan({
              data: formData,
              id: selectedRow?._id,
            }).unwrap();
            refetch();
            toast.success("Payment plan updated successfully!");
          } else {
            await createPlan(formData).unwrap();
            refetch();
            toast.success("Payment plan created successfully!");
          }
          formik.resetForm();
          setSelectedProduct(null);
          handleCloseCreate();
        } catch (err) {
          console.error("API Error:", err);
          const errorMessage =
            err?.data?.message || err?.data?.details || "An unexpected error occurred.";
          toast.error(errorMessage);
          setStatus(errorMessage);
        } finally {
          setSubmitting(false);
        }
      },
    });

    useEffect(() => {
      if (selectedRow?._id) {
        const existingImage = selectedRow.image
          ? [{ file: null, dataURL: selectedRow.image }]
          : [];

        const initData = {
          name: selectedRow?.name || "",
          description: selectedRow?.description || "",
          price: selectedRow?.price || 0,
          currency: selectedRow?.currency || "USD",
          image: existingImage, // Pre-populate existing image for editing
          hotmartCheckoutUrl: selectedRow?.hotmartCheckoutUrl || "",
          hotmartProductId: selectedRow?.hotmartProductId || "",
          status: selectedRow?.status || "active",
        };
        formik.setValues(initData);

        // If there's a hotmartProductId, try to find the product
        if (initData.hotmartProductId && hotmartProducts?.data?.items) {
          const product = hotmartProducts.data.items.find(
            p => String(p.id) === String(initData.hotmartProductId)
          );
          if (product) {
            setSelectedProduct(product);
          }
        }
      } else {
        formik.resetForm();
        setSelectedProduct(null);
      }
    }, [selectedRow?._id, isCreateOpen, hotmartProducts]);

    const handleProductSelect = (productId) => {
      const product = hotmartProducts?.data?.items?.find(
        p => String(p.id) === String(productId)
      );
      setSelectedProduct(product);
      if (product) {
        formik.setFieldValue("hotmartProductId", product.id);
        // Note: The checkout URL must still be entered manually as it's not available via API
      }
    };

    return (
      <Dialog
        open={isCreateOpen}
        onOpenChange={() => {
          formik.resetForm();
          setSelectedProduct(null);
          handleCloseCreate();
          setSelectedRow({});
        }}
      >
        {formik.status && <Alert variant="danger">{formik.status}</Alert>}
        <DialogContent className="p-5 max-w-[700px]" ref={ref}>
          <DialogHeader className="pb-5 pt-0 px-0">
            <DialogTitle>
              {selectedRow?._id
                ? "Update Payment Plan"
                : "Create Payment Plan"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-5 px-0 pb-5">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12">
                <div className="flex flex-col gap-1">
                  <label className="form-label text-gray-900 gap-1">
                    Plan Name<span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter plan name (e.g., Basic Plan, Premium Plan)"
                    autoComplete="off"
                    className={`form-control input input-md w-full ${formik.errors.name && formik.touched.name
                        ? "border border-danger"
                        : ""
                      }`}
                    {...formik.getFieldProps("name")}
                  />
                  {formik.touched.name && formik.errors.name && (
                    <span role="alert" className="text-danger text-xs mt-1">
                      {formik.errors.name}
                    </span>
                  )}
                </div>
              </div>

              <div className="col-span-12">
                <div className="flex flex-col gap-1">
                  <label className="form-label text-gray-900 gap-1">
                    Description
                  </label>
                  <textarea
                    placeholder="Enter plan description (optional)"
                    rows={3}
                    className={`form-control input input-md w-full px-3 py-2 rounded-md shadow-sm min-h-[100px] 
                      ${formik.errors.description && formik.touched.description
                        ? "border border-danger"
                        : "border border-gray-300"
                      }`}
                    {...formik.getFieldProps("description")}
                  />
                  {formik.touched.description && formik.errors.description && (
                    <span role="alert" className="text-danger text-xs mt-1">
                      {formik.errors.description}
                    </span>
                  )}
                </div>
              </div>

              <div className="col-span-6">
                <div className="flex flex-col gap-1">
                  <label className="form-label text-gray-900 gap-1">
                    Price<span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className={`form-control input input-md w-full ${formik.errors.price && formik.touched.price
                        ? "border border-danger"
                        : ""
                      }`}
                    {...formik.getFieldProps("price")}
                  />
                  {formik.touched.price && formik.errors.price && (
                    <span role="alert" className="text-danger text-xs mt-1">
                      {formik.errors.price}
                    </span>
                  )}
                </div>
              </div>

              <div className="col-span-6">
                <div className="flex flex-col gap-1">
                  <label className="form-label text-gray-900 gap-1">
                    Currency<span className="text-danger">*</span>
                  </label>
                  <Select
                    value={formik.values.currency}
                    onValueChange={(value) =>
                      formik.setFieldValue("currency", value)
                    }
                  >
                    <SelectTrigger
                      className={`form-control input input-md w-full ${formik.errors.currency && formik.touched.currency
                          ? "border border-danger"
                          : ""
                        }`}
                    >
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="BRL">BRL</SelectItem>
                    </SelectContent>
                  </Select>
                  {formik.touched.currency && formik.errors.currency && (
                    <span role="alert" className="text-danger text-xs mt-1">
                      {formik.errors.currency}
                    </span>
                  )}
                </div>
              </div>

              <div className="col-span-12">
                <div className="flex flex-col gap-1">
                  <label className="form-label text-gray-900 gap-1">
                    Plan Image
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    Upload an image for the payment plan (optional). Recommended size: 800x600 pixels.
                  </p>
                  <ImageInput
                    value={formik.values.image}
                    onChange={(images) => formik.setFieldValue("image", images)}
                  >
                    {({ onImageUpload }) => (
                      <div className="image-input size-24" onClick={onImageUpload}>
                        <div
                          className="btn btn-icon btn-icon-xs btn-light shadow-default absolute z-1 size-5 -top-0.5 -end-0.5 rounded-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            formik.setFieldValue("image", []);
                          }}
                        >
                          <KeenIcon icon="cross" />
                        </div>
                        <span className="tooltip" id="image_input_tooltip">
                          Click to upload or remove image
                        </span>
                        <div
                          className="image-input-placeholder cursor-pointer rounded-md border-2 border-success image-input-empty:border-gray-300 flex items-center justify-center"
                          style={{
                            backgroundImage: formik.values.image.length > 0 ? `url(${formik.values.image[0].dataURL})` : 'none',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }}
                        >
                          {formik.values.image.length === 0 && (
                            <div className="text-center">
                              <KeenIcon icon="picture" className="text-gray-400 text-2xl mb-1" />
                              <p className="text-xs text-gray-500">Click to upload image</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </ImageInput>
                </div>
              </div>

              <div className="col-span-12">
                <div className="flex flex-col gap-1">
                  <label className="form-label text-gray-900 gap-1">
                    Hotmart Product (Optional)
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    Select a Hotmart product to link with this plan (optional). The checkout URL must be entered manually below.
                  </p>
                  <Select
                    value={selectedProduct ? String(selectedProduct.id) : ""}
                    onValueChange={handleProductSelect}
                    disabled={isLoadingProducts}
                  >
                    <SelectTrigger className="form-control input input-md w-full">
                      <SelectValue placeholder={isLoadingProducts ? "Loading products..." : "Select Hotmart product (optional)"} />
                    </SelectTrigger>
                    <SelectContent>
                      {hotmartProducts?.data?.items?.length > 0 ? (
                        hotmartProducts.data.items.map((product) => (
                          <SelectItem key={product.id} value={String(product.id)}>
                            {product.name} (ID: {product.id})
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem disabled value="no-products">
                          No products found
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="col-span-12">
                <div className="flex flex-col gap-1">
                  <label className="form-label text-gray-900 gap-1">
                    Hotmart Checkout URL<span className="text-danger">*</span>
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    Enter the full checkout URL from Hotmart (e.g., https://pay.hotmart.com/J103673988Y).
                    This URL is easily available in your Hotmart dashboard under the product's checkout/payment settings.
                  </p>
                  <input
                    type="url"
                    placeholder="https://pay.hotmart.com/J103673988Y"
                    autoComplete="off"
                    className={`form-control input input-md w-full font-mono text-sm ${formik.errors.hotmartCheckoutUrl && formik.touched.hotmartCheckoutUrl
                        ? "border border-danger"
                        : ""
                      }`}
                    {...formik.getFieldProps("hotmartCheckoutUrl")}
                  />
                  {formik.touched.hotmartCheckoutUrl && formik.errors.hotmartCheckoutUrl && (
                    <span role="alert" className="text-danger text-xs mt-1">
                      {formik.errors.hotmartCheckoutUrl}
                    </span>
                  )}
                </div>
              </div>

              <div className="col-span-12">
                <div className="flex flex-col gap-1">
                  <label className="form-label text-gray-900 gap-1">
                    Status<span className="text-danger">*</span>
                  </label>
                  <Select
                    value={formik.values.status}
                    onValueChange={(value) =>
                      formik.setFieldValue("status", value)
                    }
                  >
                    <SelectTrigger className="form-control input input-md w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  {formik.touched.status && formik.errors.status && (
                    <span role="alert" className="text-danger text-xs mt-1">
                      {formik.errors.status}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="flex border-gray-200 border-t justify-end py-5 pb-0 rounded-b dark:border-gray-200 gap-3">
            <button
              className="btn btn-light"
              onClick={() => {
                formik.resetForm();
                setSelectedProduct(null);
                handleCloseCreate();
                setSelectedRow({});
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
              {formik.isSubmitting ? "Saving..." : "Submit"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
);

export default CreateAdminPlan;
