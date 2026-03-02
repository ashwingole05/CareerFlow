import z from "zod";

export const onboardingSchema = z.object({
    industry: z.string({
        required_error:"Please select an industry",
    }),
    subIndustry: z.string({
        required_error: " Please select a specialization",
    }),
    bio:z.string().max(500).optional(),
    experience: z
    .string()
    .transform((val) => parseInt(val, 10)) 
    .pipe(
        z
         .number()
         .min(0, "Experience must be at least 0 years")
         .max(50,"Experience cannot exceed 50 years")
    ),
    skills: z.string().transform((val)=>
        val
    ? val
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean)
    : undefined
    ),


});






/* ---------------- CONTACT SCHEMA ---------------- */

export const contactSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),

  mobile: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number")
    .optional()
    .or(z.literal("")),

  linkedin: z
    .string()
    .url("Enter a valid LinkedIn URL")
    .refine(
      (val) =>
        val.includes("linkedin.com") || val === "",
      { message: "Must be a valid LinkedIn profile link" }
    )
    .optional()
    .or(z.literal("")),

  twitter: z
    .string()
    .url("Enter a valid Twitter/X URL")
    .optional()
    .or(z.literal("")),
});

/* ---------------- ENTRY SCHEMA ---------------- */

export const entrySchema = z
  .object({
    title: z
      .string()
      .min(2, "Title must be at least 2 characters"),

    organization: z
      .string()
      .min(2, "Organization name must be at least 2 characters"),

    startDate: z
      .string()
      .min(1, "Start date is required"),

    endDate: z.string().optional().or(z.literal("")),

    description: z
      .string()
      .min(5, "Description must be at least 5 characters"),

    current: z.boolean().default(false),
  })
  .refine(
    (data) => {
      if (!data.current && !data.endDate) return false;
      return true;
    },
    {
      message: "End date is required unless this is your current position",
      path: ["endDate"],
    }
  )
  .refine(
    (data) => {
      if (data.endDate && data.startDate) {
        return new Date(data.endDate) >= new Date(data.startDate);
      }
      return true;
    },
    {
      message: "End date cannot be before start date",
      path: ["endDate"],
    }
  );

/* ---------------- RESUME SCHEMA ---------------- */

export const resumeSchema = z.object({
  contactInfo: contactSchema,

  summary: z
    .string()
    .min(5, "Professional summary must be at least 5 characters"),

  skills: z
    .string()
    .min(3, "Please enter at least one skill"),

  experience: z.array(entrySchema),


  education: z
    .array(entrySchema)
    .min(1, "At least one education entry is required"),

  projects: z.array(entrySchema),
});

/* ---------------- COVER LETTER SCHEMA ---------------- */

export const coverLetterSchema = z.object({
  companyName: z
    .string()
    .min(2, "Company name is required"),

  jobTitle: z
    .string()
    .min(2, "Job title is required"),

  jobDescription: z
    .string()
    .min(5, "Job description must be at least 5 characters"),
});




export async function saveResume(content) {
  const { userId } = auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  if (!content) {
    throw new Error("Resume content is empty");
  }

  return await prisma.resume.create({
    data: {
      userId,
      content,
    },
  });
}