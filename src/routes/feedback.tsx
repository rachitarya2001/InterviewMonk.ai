import type { Interview, UserAnswer } from "@/types";
import { useAuth } from "@clerk/clerk-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "@/config/firebase.config";
import { toast } from "sonner";
import Loaderpage from "./Loader-page";
import CustomBreadCrumb from "@/components/custom-bread-crumb";
import Headings from "@/components/headings";
import InterviewPin from "@/components/pin";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { cn } from "@/lib/utils";
import { CircleCheck, Star } from "lucide-react";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

const FeedBack = () => {

    const [isloading, setIsLoading] = useState(false);
    const { interviewId } = useParams<{ interviewId: string }>();
    const { userId } = useAuth();
    const [interview, setInterview] = useState<Interview | null>(null);
    const navigate = useNavigate();
    const [feedbacks, setFeedbacks] = useState<UserAnswer[]>([]);
    const [activeFeed, setActiveFeed] = useState("")

    // Fixed: Move navigate to useEffect
    useEffect(() => {
        if (!interviewId) {
            navigate("/generate", { replace: true });
            return;
        }

        const fetchInterview = async () => {
            try {
                const interviewDoc = await getDoc(doc(db, "interviews", interviewId));
                if (interviewDoc.exists()) {
                    setInterview({ id: interviewDoc.id, ...interviewDoc.data() } as Interview)
                }
            } catch (error) {
                console.log(error)
            }
        };

        const fetchfeedback = async () => {
            setIsLoading(true);
            try {
                const querSanpRef = query(
                    collection(db, "userAnswers"),
                    where("userId", "==", userId),
                    where("mockIdRef", "==", interviewId)
                );
                const querySnap = await getDocs(querSanpRef);

                const interviewData: UserAnswer[] = querySnap.docs.map((doc) => {
                    return { id: doc.id, ...doc.data() } as UserAnswer
                })

                setFeedbacks(interviewData);
                console.log("Fetched feedbacks:", interviewData); // Debug log
            } catch (error) {
                console.log(error);
                toast.error("Error", {
                    description: "Something went wrong. Please try again later.."
                });
            } finally {
                setIsLoading(false);
            }
        }

        fetchInterview();
        fetchfeedback();

    }, [interviewId, navigate, userId]);

    //calculate the ratings
    const overAllRating = useMemo(() => {
        if (feedbacks.length === 0) return "0.0";

        const totalRatings = feedbacks.reduce(
            (acc, feedback) => acc + feedback.rating, 0
        );
        return (totalRatings / feedbacks.length).toFixed(1);
    }, [feedbacks]);

    if (isloading) {
        return <Loaderpage className="w-full h-[78vh]" />;
    }

    return (
        <div className="flex flex-col w-full gap-8 py-5 ">
            <div className=" flex items-center justify-between w-full gap-2">
                <CustomBreadCrumb
                    breadCrumbPage={"FeedBack"}
                    breadCrumbItems={
                        [
                            { label: "Mock Interviews", link: "/generate" },
                            {
                                label: `${interview?.position}`,
                                link: `/generate/interview/${interview?.id}`,
                            }
                        ]
                    }
                />
            </div>
            <Headings
                title="Congratulations !"
                description="Your personalized feedback is now available. Dive in to see your strength, areas for improvements, and tips to help you ace your next interview"
            />
            <p className="text-area text-muted-foreground">
                Your overall interview Ratings : {""}
                <span className="text-emerald-500 font-semibold text-xl">
                    {overAllRating} /10
                </span>
            </p>
            {interview && <InterviewPin interview={interview} onMockPage />}
            <Headings
                title="Interview Feedback"
                isSubHeading
            />

            {/* Added: Show message when no feedback available */}
            {feedbacks.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-gray-500">No feedback available yet. Complete some interview questions to see your feedback here.</p>
                </div>
            ) : (
                <Accordion type="single" collapsible className="space-y-6">
                    {feedbacks.map(feed => (
                        <AccordionItem
                            key={feed.id}
                            value={feed.id}
                            className="border rounded-lg shadow-md">
                            <AccordionTrigger
                                onClick={() => setActiveFeed(feed.id)}
                                className={cn(
                                    "px-5 py-3 flex items-center justify-between text-base  rounded-t-lg transition-colors hover:no-underline",
                                    activeFeed === feed.id ? "bg-gradient-to-r from-purple-50 to-blue-50" : "hover:bg-gray-50"
                                )}
                            >
                                <span>{feed.question}</span>
                            </AccordionTrigger>
                            <AccordionContent className="px-5 py-6 bg-white rounded-b-lg space-y-5 shadow-inner">
                                <div className="text-lg font-semibold text-gray-700">
                                    <Star className="inline mr-2 text-yellow-400" />
                                    Rating : {feed.rating}/10
                                </div>

                                <Card className="border-none space-y-3 p-4 bg-green-50 rounded-lg shadow-md">
                                    <CardTitle className="flex items-center text-lg">
                                        <CircleCheck className="mr-2 text-green-600" />
                                        Expected Answer
                                    </CardTitle>

                                    <CardDescription className="font-medium text-gray-700">
                                        {feed.correct_ans}
                                    </CardDescription>
                                </Card>

                                <Card className="border-none space-y-3 p-4 bg-yellow-50 rounded-lg shadow-md">
                                    <CardTitle className="flex items-center text-lg">
                                        <CircleCheck className="mr-2 text-yellow-600" />
                                        Your Answer
                                    </CardTitle>

                                    <CardDescription className="font-medium text-gray-700">
                                        {feed.user_ans || "No answer provided"}
                                    </CardDescription>
                                </Card>

                                <Card className="border-none space-y-3 p-4 bg-red-50 rounded-lg shadow-md">
                                    <CardTitle className="flex items-center text-lg">
                                        <CircleCheck className="mr-2 text-red-600" />
                                        Feedback
                                    </CardTitle>

                                    <CardDescription className="font-medium text-gray-700">
                                        {feed.feedback}
                                    </CardDescription>
                                </Card>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            )}
        </div>
    )
}

export default FeedBack