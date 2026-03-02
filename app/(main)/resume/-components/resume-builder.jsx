"use client";
import { auth } from "@clerk/nextjs/server";
import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Download, Loader2, Save, Edit, Monitor } from "lucide-react";
import { toast } from "sonner";
import MDEditor from "@uiw/react-md-editor";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { saveResume } from "@/actions/resume";
import EntryForm from "./entry-form";
import useFetch from "@/hooks/use-fetch";
import { useUser } from "@clerk/nextjs";
import { resumeSchema } from "@/app/lib/schema";

const ResumeBuilder = ({ initialContent }) => {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState("edit");
  const [previewContent, setPreviewContent] = useState(initialContent || "");
  const [resumeMode, setResumeMode] = useState("preview");
  const [isGenerating, setIsGenerating] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resumeSchema),
    defaultValues: {
      contactInfo: {},
      summary: "",
      skills: "",
      experience: [],
      education: [],
      projects: [],
    },
  });

  const {
    loading: isSaving,
    fn: saveResumeFn,
    data: saveResult,
    error: saveError,
  } = useFetch(saveResume);

  const formValues = watch();

  /* ---------------------------
     INITIAL LOAD
  ----------------------------*/
  useEffect(() => {
    if (initialContent) {
      setActiveTab("preview");
      setPreviewContent(initialContent);
    }
  }, [initialContent]);

  /* ---------------------------
     FORM → MARKDOWN SYNC
  ----------------------------*/
  useEffect(() => {
    if (activeTab === "edit") {
      const generated = generateMarkdown();
      setPreviewContent(generated);
    }
  }, [formValues, activeTab]);

  /* ---------------------------
     SAVE FEEDBACK
  ----------------------------*/
  useEffect(() => {
    if (saveResult && !isSaving) {
      toast.success("Resume saved successfully");
    }
    if (saveError) {
      toast.error(saveError.message || "Failed to save resume");
    }
  }, [saveResult, saveError, isSaving]);

  /* ---------------------------
     MARKDOWN GENERATION
  ----------------------------*/
  const generateMarkdown = () => {
    const { contactInfo, summary, skills, experience, education, projects } =
      formValues;

    const contactParts = [];

    if (contactInfo?.email) contactParts.push(contactInfo.email);
    if (contactInfo?.mobile) contactParts.push(contactInfo.mobile);
    if (contactInfo?.linkedin)
      contactParts.push(`[LinkedIn](${contactInfo.linkedin})`);
    if (contactInfo?.twitter)
      contactParts.push(`[Twitter](${contactInfo.twitter})`);

    return `
# ${user?.fullName || ""}

${contactParts.join(" | ")}

---

${
  summary
    ? `## Professional Summary

${summary}

`
    : ""
}

${
  skills
    ? `## Skills

${skills}

`
    : ""
}

${
  experience?.length
    ? `## Work Experience

${experience
  .map(
    (exp) => `
**${exp.title || ""}**  
${exp.organization || ""} | ${exp.duration || ""}

${exp.description || ""}
`
  )
  .join("\n")}
`
    : ""
}

${
  education?.length
    ? `## Education

${education
  .map(
    (edu) => `
**${edu.degree || ""}**  
${edu.institution || ""}  
${edu.grade ? `Score: ${edu.grade}` : ""}  
${edu.year || ""}
`
  )
  .join("\n")}
`
    : ""
}

${
  projects?.length
    ? `## Projects

${projects
  .map(
    (proj) => `
**${proj.title || ""}**

${proj.description || ""}
`
  )
  .join("\n")}
`
    : ""
}
`;
  };

  /* ---------------------------
     SAVE FUNCTION
  ----------------------------*/
  const onSubmit = async () => {
    try {
      let finalContent = previewContent;

      if (activeTab === "edit") {
        finalContent = generateMarkdown();
        setPreviewContent(finalContent);
      }

      await saveResumeFn(finalContent);
    } catch (error) {
      toast.error("Failed to save resume");
    }
  };

  /* ---------------------------
     PDF GENERATION
  ----------------------------*/
  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      const element = document.getElementById("resume-pdf");
      if (!element) return;

      const htmlContent = `
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                padding: 40px;
                color: #000;
                background: #fff;
                line-height: 1.6;
              }
            </style>
          </head>
          <body>${element.innerHTML}</body>
        </html>
      `;

      const res = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html: htmlContent }),
      });

      if (!res.ok) throw new Error("PDF generation failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Resume.pdf";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error("Failed to generate PDF");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div data-color-mode="light" className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">Resume Builder</h1>

        <div className="space-x-2">
          <Button onClick={handleSubmit(onSubmit)} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="animate-spin mr-2 h-4 w-4" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save
              </>
            )}
          </Button>

          <Button onClick={generatePDF} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="animate-spin mr-2 h-4 w-4" />
                Generating...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="edit">Form</TabsTrigger>
          <TabsTrigger value="preview">Markdown</TabsTrigger>
        </TabsList>

        {/* FORM TAB */}
        <TabsContent value="edit">
          <form className="space-y-6">
            <h3 className="text-lg font-semibold">Contact Information</h3>
            <Input
              {...register("contactInfo.email")}
              placeholder="Email address"
            />
            <Input
              {...register("contactInfo.mobile")}
              placeholder="Mobile number"
            />
            <Input
              {...register("contactInfo.linkedin")}
              placeholder="LinkedIn profile URL"
            />

            <h3 className="text-lg font-semibold">
              Professional Summary
            </h3>
            <Textarea
              {...register("summary")}
              placeholder="Brief professional summary..."
            />

            <h3 className="text-lg font-semibold">Skills</h3>
            <Textarea
              {...register("skills")}
              placeholder="Technical & professional skills..."
            />

            <h3 className="text-lg font-semibold">Education</h3>
            <Controller
              name="education"
              control={control}
              render={({ field }) => (
                <EntryForm
                  type="Education"
                  entries={field.value}
                  onChange={field.onChange}
                  placeholders={{
                    degree: "Degree / Standard (e.g. B.Tech, 12th Std)",
                    institution: "University / Board",
                    grade: "Percentage / CGPA / SGPA",
                    year: "Year of completion",
                  }}
                />
              )}
            />
          </form>
        </TabsContent>

        {/* MARKDOWN TAB */}
        <TabsContent value="preview">
          <Button
            variant="link"
            onClick={() =>
              setResumeMode(
                resumeMode === "edit" ? "preview" : "edit"
              )
            }
          >
            {resumeMode === "preview" ? (
              <>
                <Edit className="mr-2 h-4 w-4" />
                Edit Markdown
              </>
            ) : (
              <>
                <Monitor className="mr-2 h-4 w-4" />
                Show Preview
              </>
            )}
          </Button>

          <MDEditor
            value={previewContent}
            onChange={(val) => setPreviewContent(val || "")}
            height={800}
            preview={resumeMode}
          />

          <div className="hidden">
            <div id="resume-pdf">
              <MDEditor.Markdown source={previewContent} />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ResumeBuilder;