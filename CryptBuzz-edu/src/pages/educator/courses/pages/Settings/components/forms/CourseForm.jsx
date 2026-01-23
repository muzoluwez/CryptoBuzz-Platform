import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Upload } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useGetLanguagesQuery } from "../../../../../../../store/api/educator/educatorLanguageApiSlice";
import { useFetchCategoriesQuery, useGetEducatorCoursesTypesQuery } from "../../../../../../../store/api/educator/educatorAcademyCategoryApiSlice";
import { useFetchPlansQuery } from "../../../../../../../store/api/educator/educatorPlanApiSlice";
import CustomSelect from "@/components/CustomSelect";
;

// Schema for course validation
const createCourseSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  imageFile: z
    .instanceof(File, { message: "Course thumbnail is required" })
    .refine((file) => file && file.size > 0, {
      message: "Please select a valid course thumbnail image",
    }),
  category: z.string().min(1, "Please select a category"),
  published: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  tier: z.enum(["PUBLIC", "LOGGED_IN", "UID_ONLY", "PRO"], {
    required_error: "Please select a tier",
  }),
  plans: z.array(z.string()).nullable().optional(),
  section: z.string().min(1, "Please select a course type"),
  language: z.string().min(1, "Please select a course language"),
  recommendedCourses: z.array(z.string()).max(4, "Maximum 4 recommended courses allowed").nullable().optional(),
}).refine((data) => {
  if (data.tier === "PRO" && (!data.plans || data.plans.length === 0)) {
    return false;
  }
  return true;
}, {
  message: "At least one payment plan is required for Pro (Paid) courses",
  path: ["plans"],
});

const editCourseSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  imageFile: z
    .instanceof(File, { message: "Course thumbnail is required" })
    .optional()
    .refine(
      (file) => {
        // If no file is provided, it's valid (for edit mode with existing image)
        if (!file) return true;
        // If file is provided, it must have content
        return file.size > 0;
      },
      {
        message: "Please select a valid course thumbnail image",
      }
    ),
  category: z.string().min(1, "Please select a category"),
  published: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  tier: z.enum(["PUBLIC", "LOGGED_IN", "UID_ONLY", "PRO"], {
    required_error: "Please select a tier",
  }),
  plans: z.array(z.string()).nullable().optional(),
  section: z.string().min(1, "Please select a course type"),
  language: z.string().min(1, "Please select a course language"),
  recommendedCourses: z.array(z.string()).max(4, "Maximum 4 recommended courses allowed").nullable().optional(),
}).refine((data) => {
  if (data.tier === "PRO" && (!data.plans || data.plans.length === 0)) {
    return false;
  }
  return true;
}, {
  message: "At least one payment plan is required for Pro (Paid) courses",
  path: ["plans"],
});

const CourseForm = ({ onSubmit, initialData, isLoading }) => {
  const [thumbnailPreview, setThumbnailPreview] = useState(
    initialData?.imageUrl || null
  );
  const [currentImageFile, setCurrentImageFile] = useState(null);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const { data } = useFetchCategoriesQuery();
  const { data: languagesList } = useGetLanguagesQuery();
  const { data: courseTypesList } = useGetEducatorCoursesTypesQuery();
  const { data: plans } = useFetchPlansQuery();

  // Choose schema based on whether we're editing or creating
  const courseSchema = initialData ? editCourseSchema : createCourseSchema;

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(courseSchema),
    defaultValues: initialData || {
      title: "",
      description: "",
      imageFile: undefined,
      category: "",
      published: false,
      isFeatured: false,
      section: "",
      language: "",
      tier: "PUBLIC",
      plans: [],
      recommendedCourses: [],
    },
  });

  useEffect(() => {
    if (initialData) {
      if (initialData.imageUrl) {
        setThumbnailPreview(initialData.imageUrl);
        // setValue("imageFile", initialData.imageUrl);
      }
      if (initialData.category?._id) {
        setValue("category", initialData.category._id);
      }
      // Handle plans array (new) or single plan (legacy)
      if (initialData.plans && Array.isArray(initialData.plans)) {
        const planIds = initialData.plans.map(p => p._id || p).filter(Boolean);
        setValue("plans", planIds);
      } else if (initialData.plan?._id) {
        setValue("plans", [initialData.plan._id]);
      } else if (initialData.plan) {
        setValue("plans", [initialData.plan]);
      } else {
        setValue("plans", []);
      }
      // Handle recommendedCourses
      if (initialData.recommendedCourses && Array.isArray(initialData.recommendedCourses)) {
        const recommendedCourseIds = initialData.recommendedCourses.map(rc => 
          rc._id || rc
        ).filter(Boolean);
        setValue("recommendedCourses", recommendedCourseIds);
      } else {
        setValue("recommendedCourses", []);
      }
    }
  }, [initialData, setValue]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCurrentImageFile(file);
      setValue("imageFile", file, { shouldValidate: true });
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const selectedTier = watch("tier");
  const selectedSection = watch("section");
  const selectedLanguage = watch("language");
  const selectedRecommendedCourses = watch("recommendedCourses") || [];

  // Fetch available courses for recommended courses selector
  useEffect(() => {
    const fetchCourses = async () => {
      setLoadingCourses(true);
      try {
        const token = localStorage.getItem("token");
        const apiBaseUrl = import.meta.env.VITE_APP_API_URL || "http://localhost:8000";
        const response = await fetch(`${apiBaseUrl}/api/v1/common/course?published=true&isDeleted=false`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (response.ok) {
          const result = await response.json();
          // Filter out the current course if editing
          const courses = result.data || [];
          const filteredCourses = initialData?._id 
            ? courses.filter(c => c._id !== initialData._id)
            : courses;
          setAvailableCourses(filteredCourses);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoadingCourses(false);
      }
    };
    fetchCourses();
  }, [initialData?._id]);

  // Clear plans field when tier changes to non-PRO tiers
  useEffect(() => {
    if (selectedTier !== "PRO") {
      setValue("plans", [], { shouldValidate: false });
    }
  }, [selectedTier, setValue]);
  const submitHandler = async (data) => {
    const formData = new FormData();

    // Append all regular fields
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("category", data.category);
    formData.append("published", data.published);
    formData.append("isFeatured", data.isFeatured);
    formData.append("tier", data.tier);
    formData.append("section", data.section);
    formData.append("language", data.language);

    // For PRO (paid) courses, append selected plans
    if (data.tier === "PRO" && data.plans && Array.isArray(data.plans) && data.plans.length > 0) {
      // Append each plan ID
      data.plans.forEach((planId) => {
        formData.append("plans[]", planId);
      });
      // Also append first plan for backward compatibility (legacy single plan field)
      formData.append("plan", data.plans[0]);
      
      // Get price from first selected plan (or use 0)
      const firstSelectedPlan = plans?.data?.find(p => p._id === data.plans[0]);
      if (firstSelectedPlan?.price) {
        formData.append("price", firstSelectedPlan.price);
      } else {
        formData.append("price", 0);
      }
    } else {
      // Non-PRO courses have price 0 and no plans
      formData.append("price", 0);
      // Explicitly do not append plans for non-PRO courses
    }

    // Append recommended courses (max 4)
    if (data.recommendedCourses && Array.isArray(data.recommendedCourses) && data.recommendedCourses.length > 0) {
      data.recommendedCourses.slice(0, 4).forEach((courseId) => {
        formData.append("recommendedCourses[]", courseId);
      });
    }

    // Handle image file - required for new courses, optional for edits with existing image
    if (data.imageFile instanceof File && data.imageFile.size > 0) {
      formData.append("imageUrl", data.imageFile);
    } else if (!initialData?.imageUrl) {
      // Only require image for new courses
      console.error("No valid image file provided for new course");
      return;
    }
    // If editing and no new image selected, keep existing image

    // For debugging
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }
    if (onSubmit) {
      onSubmit(formData);
    } else {
      console.log("No onSubmit function provided");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(submitHandler, (errors) => {
        console.log("Validation Errors:", errors);
      })}
      className="space-y-6"
      encType="multipart/form-data"
    >
      <div className="space-y-2">
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700"
        >
          Course Title <span className="text-red-500 font-bold">*</span>
        </label>
        <input
          id="title"
          type="text"
          className="form-control input input-md w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
          placeholder="Enter course title"
          {...register("title")}
        />
        {errors.title && (
          <p className="text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700"
        >
          Description <span className="text-red-500 font-bold">*</span>
        </label>
        <textarea
          id="description"
          className="form-control input input-md w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm min-h-[100px]"
          placeholder="Enter course description"
          {...register("description")}
        />
        {errors.description && (
          <p className="text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          Course Thumbnail <span className="text-red-500 font-bold">*</span>
        </label>

        <div className="flex flex-col space-y-2">
          <div className="relative w-full">
            <input
              type="file"
              id="thumbnail-upload"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <label
              htmlFor="thumbnail-upload"
              className="flex cursor-pointer items-center justify-center w-full h-[40px] px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 bg-primary-light text-primary border border-gray-300"
            >
              <Upload className="h-4 w-4 mr-2" />
              {thumbnailPreview ? "Change Image" : "Upload Image"}
            </label>
          </div>
          <p className="text-sm text-gray-500">
            {currentImageFile
              ? `Selected file: ${currentImageFile.name}`
              : "No file selected"}
          </p>
        </div>

        {thumbnailPreview && (
          <div className="mt-2">
            <img
              src={thumbnailPreview}
              alt="Thumbnail preview"
              className="h-32 w-auto rounded-md object-cover"
            />
          </div>
        )}

        {/* Error message for thumbnail */}
        {errors.imageFile && (
          <p className="text-sm text-red-600 mt-2">
            {errors.imageFile.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label
            htmlFor="section"
            className="block text-sm font-medium text-gray-700"
          >
            Type of Course <span className="text-red-500 font-bold">*</span>
          </label>
          <Controller
            name="section"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                className={`form-control input input-md w-full ${errors.section ? "border border-danger" : ""}`}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {courseTypesList?.data?.length > 0 ? (
                    courseTypesList.data.map((type) => (
                      <SelectItem key={type._id} value={type.name}>
                        {type.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem disabled value="null">
                      No types found
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            )}
          />
          {errors.section && (
            <p className="text-sm text-red-600">{errors.section.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="language"
            className="block text-sm font-medium text-gray-700"
          >
            Course Language <span className="text-red-500 font-bold">*</span>
          </label>
          <Controller
            name="language"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                className={`form-control input input-md w-full ${errors.language ? "border border-danger" : ""}`}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {languagesList?.data?.length > 0 ? (
                    languagesList.data.map((lang) => (
                      <SelectItem key={lang._id} value={lang.name}>
                        {lang.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem disabled value="null">
                      No languages found
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            )}
          />
          {errors.language && (
            <p className="text-sm text-red-600">{errors.language.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label
            htmlFor="category"
            className="block text-sm font-medium text-gray-700"
          >
            Category <span className="text-red-500 font-bold">*</span>
          </label>
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                className={`form-control input input-md w-full ${errors.category ? "border border-danger" : ""}`}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {data?.data?.map((item) => (
                    <SelectItem key={item._id} value={item._id}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.category && (
            <p className="text-sm text-red-600">{errors.category.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="tier"
            className="block text-sm font-medium text-gray-700"
          >
            Course Tier <span className="text-red-500 font-bold">*</span>
          </label>
          <Select
            value={selectedTier}
            onValueChange={(value) => setValue("tier", value)}
            className={`form-control input input-md w-full ${errors.tier && "border border-danger"}`}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PUBLIC">Public</SelectItem>
              <SelectItem value="LOGGED_IN">Logged-in User</SelectItem>
              <SelectItem value="UID_ONLY">UID-based Access</SelectItem>
              <SelectItem value="PRO">Pro (Paid)</SelectItem>
            </SelectContent>
          </Select>
          {errors.tier && (
            <p className="text-sm text-red-600">{errors.tier.message}</p>
          )}
        </div>
      </div>

      {selectedTier === "PRO" && (
        <div className="space-y-2">
          <label
            htmlFor="plans"
            className="block text-sm font-medium text-gray-700"
          >
            Payment Plans <span className="text-red-500 font-bold">*</span>
          </label>
          <Controller
            name="plans"
            control={control}
            render={({ field }) => {
              const selectedPlans = field.value || [];
              
              return (
                <div className={`space-y-3 p-4 border rounded-md ${errors.plans ? "border-red-500" : "border-gray-300"}`}>
                  {plans?.data?.length > 0 ? (
                    plans.data.map((plan) => {
                      const isSelected = selectedPlans.includes(plan._id);
                      return (
                        <div
                          key={plan._id}
                          className="flex items-start space-x-3 p-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-200 border border-transparent hover:border-gray-200 transition-colors"
                        >
                          <Checkbox
                            id={`plan-${plan._id}`}
                            checked={isSelected}
                            onCheckedChange={(checked) => {
                              const newPlans = checked
                                ? [...selectedPlans, plan._id]
                                : selectedPlans.filter(id => id !== plan._id);
                              field.onChange(newPlans);
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
                  {selectedPlans.length > 0 && (
                    <div className="mt-3 pt-3 border-t text-sm text-gray-600">
                      {selectedPlans.length} plan{selectedPlans.length !== 1 ? 's' : ''} selected
                    </div>
                  )}
                </div>
              );
            }}
          />
          {errors.plans && (
            <p className="text-sm text-red-600">{errors.plans.message}</p>
          )}
          <p className="text-xs text-gray-500">
            Select one or more payment plans for this premium course. Users can choose any of these plans to purchase the course.
          </p>
        </div>
      )}

      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div>
          <label
            htmlFor="published"
            className="text-sm font-medium text-gray-700"
          >
            Publish Course
          </label>
          <p className="text-sm text-gray-500">
            Make this course available to students
          </p>
        </div>
        <Controller
          name="published"
          control={control}
          render={({ field }) => (
            <Checkbox
              id="published"
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
      </div>

      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div>
          <label
            htmlFor="isFeatured"
            className="text-sm font-medium text-gray-700"
          >
            Feature Course
          </label>
          <p className="text-sm text-gray-500">
            Highlight this course on the homepage
          </p>
        </div>
        <Controller
          name="isFeatured"
          control={control}
          render={({ field }) => (
            <Checkbox
              id="isFeatured"
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
      </div>

      {/* Recommended Courses Selector */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Recommended Courses <span className="text-gray-500 text-xs">(Max 4)</span>
        </label>
        <Controller
          name="recommendedCourses"
          control={control}
          render={({ field }) => {
            const selectedCourses = field.value || [];
            
            // Prepare options for dropdown
            const courseOptions = availableCourses.map(course => ({
              label: course.title,
              value: course._id,
            }));

            // Handle change with max 4 limit
            const handleChange = (values) => {
              if (Array.isArray(values)) {
                // Limit to max 4 courses
                const limitedValues = values.slice(0, 4);
                if (limitedValues.length !== values.length && values.length > 4) {
                  // Show warning if user tries to select more than 4
                  console.warn("Maximum 4 recommended courses allowed");
                }
                field.onChange(limitedValues);
              } else {
                field.onChange([]);
              }
            };

            return (
              <div className={`${errors.recommendedCourses ? "border-red-500" : ""}`}>
                {loadingCourses ? (
                  <div className="text-sm text-gray-500 py-2">Loading courses...</div>
                ) : (
                  <CustomSelect
                    mode="multiple"
                    options={courseOptions}
                    value={selectedCourses}
                    onChange={handleChange}
                    placeholder="Select recommended courses (max 4)"
                    maxTagCount={4}
                    disabled={loadingCourses}
                    style={{ width: "100%" }}
                  />
                )}
                {selectedCourses.length > 0 && (
                  <div className="mt-2 text-sm text-gray-600">
                    {selectedCourses.length} course{selectedCourses.length !== 1 ? 's' : ''} selected
                    {selectedCourses.length >= 4 && (
                      <span className="text-orange-600 ml-2">(Maximum reached)</span>
                    )}
                  </div>
                )}
              </div>
            );
          }}
        />
        {errors.recommendedCourses && (
          <p className="text-sm text-red-600">{errors.recommendedCourses.message}</p>
        )}
        <p className="text-xs text-gray-500">
          Select up to 4 courses to recommend to users when they view this course. These will only be displayed when the main course is accessible.
        </p>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => reset()}
          disabled={isLoading}
          className="flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 bg-light text-gray-700 hover:bg-gray-50 dark:hover:bg-dark"
        >
          Reset
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center px-3 h-[40px] py-2 rounded-md text-sm font-medium transition-colors duration-200 bg-primary-light text-primary hover:bg-primary hover:text-white"
        >
          {isLoading && (
            <Loader2 className="inline-block mr-2 h-4 w-4 animate-spin" />
          )}
          {initialData ? "Update Course" : "Create Course"}
        </button>
      </div>
    </form>
  );
};

export default CourseForm;
