import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { FormProvider, useForm } from "react-hook-form"
import type { Interview } from "@/types"
import CustomBreadCrumb from './custom-bread-crumb';
import { useEffect, useState } from "react"
import { useAuth } from "@clerk/clerk-react"
import { toast } from "sonner";
import Headings from "./headings";
import { Button } from "./ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { ai, safetySettings } from "@/scripts";
import { Separator } from '@/components/ui/separator';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { db } from "@/config/firebase.config";
import { addDoc, collection, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

interface FormMockInterviewProps {
    initialData: Interview | null
}

// Type for interview questions
interface InterviewQuestion {
    question: string;
    answer: string;
}

const formSchema = z.object({
    position: z
        .string()
        .min(1, "position is required")
        .max(100, "position must be 100 character or less"),
    description: z.string().min(10, "Description is required"),
    experience: z.coerce
        .number()
        .min(0, "Experience cannot be empty or negative"),
    techStack: z.string().min(1, "Tech stack must be at least a character")
});

type FormData = z.infer<typeof formSchema>

const cleanAiResponse = (response: string | undefined): InterviewQuestion[] => {
    if (!response) {
        return [];
    }

    try {
        const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        const parsed = JSON.parse(cleaned);

        // Ensure it's an array
        if (Array.isArray(parsed)) {
            return parsed;
        } else {
            console.error("AI response is not an array:", parsed);
            return [];
        }
    } catch (error) {
        console.error("Error cleaning AI response:", error);
        return [];
    }
};

const FormMockInterview = ({ initialData }: FormMockInterviewProps) => {
    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData || {}
    })

    const { isValid, isSubmitting } = form.formState
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate();
    const { userId } = useAuth();

    const title = initialData?.position ? initialData?.position : "Create a new Mock interview";
    const breadcrumbPage = initialData?.position ? initialData?.position : "Create";
    const actions = initialData ? "Save Changes" : "Create";
    const toastMessage = initialData
        ? { title: "Updated..", description: "Changes saved Successfully..." }
        : { title: "Created..!", description: "New Mock Interview created.." };

    const generateAiResponse = async (data: FormData, retries = 3): Promise<InterviewQuestion[]> => {
        const prompt = `
    As an experienced prompt engineer, generate a JSON array containing 5 technical interview questions along with detailed answers based on the following job information. Each object in the array should have the fields "question" and "answer", formatted as follows:

    [
      { "question": "<Question text>", "answer": "<Answer text>" },
      ...
    ]

    Job Information:
    - Job Position: ${data?.position}
    - Job Description: ${data?.description}
    - Years of Experience Required: ${data?.experience}
    - Tech Stacks: ${data?.techStack}

    The questions should assess skills in ${data?.techStack} development and best practices, problem-solving, and experience handling complex requirements. Please format the output strictly as an array of JSON objects without any additional labels, code blocks, or explanations. Return only the JSON array with questions and answers.
    `;

        for (let i = 0; i < retries; i++) {
            try {
                // Add delay to prevent rate limiting
                if (i > 0) {
                    const delay = Math.pow(2, i) * 1000; // 1s, 2s, 4s
                    await new Promise(resolve => setTimeout(resolve, delay));
                }

                // Use ai.models.generateContent instead of chatSession
                const aiResult = await ai.models.generateContent({
                    model: 'gemini-2.0-flash-001',
                    contents: [
                        {
                            role: 'user',
                            parts: [{ text: prompt }]
                        }
                    ],
                    config: {
                        safetySettings
                    }
                });

                console.log(aiResult.text);

                // Clean and return the response
                const cleanedResponse = cleanAiResponse(aiResult.text);
                return cleanedResponse;

            } catch (error: unknown) {
                console.error(`Attempt ${i + 1} failed:`, error);

                if (typeof error === "object" && error !== null && "status" in error && (error as { status?: number }).status === 429) {
                    if (i === retries - 1) {
                        throw new Error("Rate limit exceeded. Please wait a moment and try again.");
                    }
                    continue;
                } else {
                    throw error;
                }
            }
        }

        throw new Error("Failed to generate AI response after all retries");
    };

    const onSubmit = async (data: FormData) => {
        try {
            setLoading(true);
            if (initialData) {
                // Update logic here
                if (isValid) {
                    const aiResult = await generateAiResponse(data);

                    await updateDoc(doc(db, "interviews", initialData?.id), {
                        questions: aiResult,
                        ...data,
                        createdAt: serverTimestamp(),

                    })
                    toast(toastMessage.title, { description: toastMessage.description });
                }
            } else {
                // Create new mock interview
                if (isValid) {
                    const aiResult = await generateAiResponse(data);
                    await addDoc(collection(db, "interviews"), {
                        ...data,
                        userId,
                        questions: aiResult,

                    });

                    toast(toastMessage.title, { description: toastMessage.description });
                }
            }

            navigate("/generate", { replace: true });
        } catch (error) {
            console.error("Error in onSubmit:", error);
            toast.error("Error..", {
                description: "Something went wrong. Please try again later",
            });
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (initialData) {
            form.reset({
                position: initialData?.position,
                description: initialData?.description,
                experience: initialData?.experience,
                techStack: initialData?.techStack
            })
        }
    }, [initialData, form])

    return (
        <div className="w-full flex-col space-y-4">
            <CustomBreadCrumb
                breadCrumbPage={breadcrumbPage}
                breadCrumbItems={[{ label: "Mock Interview", link: "/generate" }]}
            />

            <div className="mt-4 flex items-center justify-between w-full">
                <Headings title={title} isSubHeading />

                {!initialData && (
                    <Button size={"icon"} variant={"ghost"}>
                        <Trash2 className="min-w-4 min-h-4 text-red-500" />
                    </Button>
                )}
            </div>
            <Separator className="my-4" />

            <div className="my-6"></div>

            <FormProvider {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="w-full p-8 rounded-lg flex flex-col item-start justify-start gap-6 shadow-md">
                    <FormField
                        control={form.control}
                        name="position"
                        render={({ field }) => (
                            <FormItem className="w-full space-y-4">
                                <div className="w-full flex items-center justify-between">
                                    <FormLabel>Job Role / Job Position</FormLabel>
                                    <FormMessage className="text-sm " />
                                </div>
                                <FormControl>
                                    <Input disabled={loading}
                                        className="h-12"
                                        placeholder="eg:- Full Stack Developer"
                                        {...field}
                                        value={field.value || ""}
                                    />
                                </FormControl>

                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem className="w-full space-y-4">
                                <div className="w-full flex items-center justify-between">
                                    <FormLabel>Job Description</FormLabel>
                                    <FormMessage className="text-sm " />
                                </div>
                                <FormControl>
                                    <Textarea
                                        {...field}
                                        disabled={loading}
                                        className="h-12"
                                        placeholder="eg:- Describe your job role or position"
                                        value={field.value || ""}
                                    />
                                </FormControl>

                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="experience"
                        render={({ field }) => (
                            <FormItem className="w-full space-y-4">
                                <div className="w-full flex items-center justify-between">
                                    <FormLabel>Years of experience</FormLabel>
                                    <FormMessage className="text-sm " />
                                </div>
                                <FormControl>
                                    <Input
                                        {...field}
                                        type="number"
                                        disabled={loading}
                                        className="h-12"
                                        placeholder="eg:- 5"
                                        value={field.value || ""}
                                    />
                                </FormControl>

                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="techStack"
                        render={({ field }) => (
                            <FormItem className="w-full space-y-4">
                                <div className="w-full flex items-center justify-between">
                                    <FormLabel>Tech Stack</FormLabel>
                                    <FormMessage className="text-sm " />
                                </div>
                                <FormControl>
                                    <Textarea
                                        {...field}
                                        disabled={loading}
                                        className="h-12"
                                        placeholder="eg:- React, TypeScript... (seperate the values using comma)"
                                        value={field.value || ""}
                                    />
                                </FormControl>

                            </FormItem>
                        )}
                    />

                    <div className="w-full flex items-center justify-end gap-4">
                        <Button type="reset" size={"sm"} variant={"outline"} disabled={isSubmitting || loading}>
                            Reset
                        </Button>

                        <Button type="submit" size={"sm"} disabled={isSubmitting || loading || !isValid}>
                            {loading ? (<Loader2 className="text-gray-50 animate-spin" />
                            ) : (
                                actions
                            )}
                        </Button>
                    </div>
                </form>
            </FormProvider>
        </div >
    )
}

export default FormMockInterview