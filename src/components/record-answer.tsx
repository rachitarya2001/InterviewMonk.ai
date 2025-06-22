import { useAuth } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import useSpeechToText from 'react-hook-speech-to-text';
import Webcam from "react-webcam";
import { VideoOff, WebcamIcon, Video, CircleStop, Mic, RefreshCw, Loader, Save } from "lucide-react";
import TooltipButton from "./tooltip-button";
import { toast } from "sonner";
import { ai, safetySettings } from "@/scripts";
import SaveModal from "./save-modal";
import { addDoc, collection, getDocs, query, serverTimestamp, where } from "firebase/firestore";
import { db } from "@/config/firebase.config";

interface RecordAnswerProps {
    question: { question: string, answer: string };
    isWebCam: boolean;
    setIsWebCam: (value: boolean) => void;
}

interface AIResponse {
    rating: number;
    feedback: string;
}

const RecordAnswer = ({ question, isWebCam, setIsWebCam }: RecordAnswerProps) => {

    const {
        interimResult,
        isRecording,
        results,
        startSpeechToText,
        stopSpeechToText,
    } = useSpeechToText({
        continuous: true,
        useLegacyResults: false
    });

    const [userAnswer, setUserAnswer] = useState("");
    const [isAiGenerating, setIsAiGenerating] = useState(false);
    const [aiResult, setAiResult] = useState<AIResponse | null>(null);
    const [open, setOpen] = useState(false);
    const { userId } = useAuth();
    const { interviewId } = useParams();
    const [isWebCamEnable, setIsWebCamEnable] = useState(false);
    const [loading, setLoading] = useState(false);

    const recordUserAnswer = async () => {
        if (isRecording) {
            stopSpeechToText();

            if (userAnswer?.length < 30) {
                toast.error("Error", {
                    description: "Your answer should be more than 30 character"
                });

                return
            }
            //ai result

            const aiResult = await generateResult(
                question.question,
                question.answer,
                userAnswer
            );
            console.log(aiResult)
            setAiResult(aiResult)


        } else {
            startSpeechToText();

        }
    };
    const cleanJsonResponse = (response: string | undefined): AIResponse | null => {
        if (!response) {
            return null;
        }

        try {
            const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '');
            const parsed = JSON.parse(cleaned);
            return parsed as AIResponse;
        } catch (error) {
            console.error("Error cleaning AI response:", error);
            return null;
        }
    };



    const generateResult = async (qst: string, qstAns: string, userAns: string): Promise<AIResponse> => {
        setIsAiGenerating(true);

        const prompt = `
Question: "${qst}"
User Answer: "${userAns}"
Correct Answer: "${qstAns}"

Please compare the user's answer to the correct answer, and provide a rating (from 1 to 10) based on answer quality, and offer feedback for improvement.
Return the result in JSON format with the fields "rating" (number) and "feedback" (string).
`;

        try {
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

            const responseText = aiResult.text || "";
            const parsedResult = cleanJsonResponse(responseText);

            return parsedResult || { rating: 0, feedback: "Unable to parse feedback" };
        } catch (error) {
            console.log(error);
            toast("Error", {
                description: "An Error occurred while generating feedback"
            });
            return { rating: 0, feedback: "Unable to generate feedback" };
        } finally {
            setIsAiGenerating(false);
        }
    };

    const recordNewAnswer = () => {
        setUserAnswer("");
        stopSpeechToText();
        startSpeechToText();
    };

    const saveUserAnswer = async () => {
        setLoading(true);
        if (!aiResult) {
            return;
        }

        const currentQuestion = question.question;

        try {
            const userAnswerQuery = query(
                collection(db, "userAnswers"),
                where("userId", "==", userId),
                where("question", "==", currentQuestion)
            );
            const querySnap = await getDocs(userAnswerQuery);

            if (!querySnap.empty) {
                console.log("Query Snap Size", querySnap.size);
                toast.info("Already Answered", {
                    description: "You have already answered that question",
                });
                return;
            } else {
                const questionAnswerRef = await addDoc(collection(db, "userAnswers"), {
                    mockIdRef: interviewId,
                    question: question.question,
                    correct_ans: question.answer,
                    user_ans: userAnswer,
                    feedback: aiResult.feedback,
                    rating: aiResult.rating,
                    userId,
                    createdAt: serverTimestamp(),
                });
                toast("Saved", { description: "Your answer has been saved.." })
            }
            setUserAnswer("");
            stopSpeechToText();



        } catch (error) {
            toast("Error", {
                description: "An error occured while generating feedback",
            })
            console.log(false)
        } finally {
            setLoading(false);
            setOpen(!open);
        }
    }


    useEffect(() => {
        const combineTranscripts = results
            .filter((result) => typeof result !== "string")
            .map((result) => result.transcript)
            .join("");

        setUserAnswer(combineTranscripts);
    }, [results]) //ResultType to tring


    return (

        <div className="w-full flex flex-col items-center gap-8 mt-4">

            {/* save modal */}
            <SaveModal
                isOpen={open}
                onClose={() => setOpen(false)}
                onConfirm={saveUserAnswer}
                loading={loading} />

            <div className="w-full h-[400px] md:w-96 flex flex-col items-center justify-center border p-4 bg-gray-50 rounded-md">
                {isWebCam ? (
                    <Webcam
                        onUserMedia={() => setIsWebCamEnable(true)}
                        onUserMediaError={() => setIsWebCamEnable(false)}
                        className="min-w-24 min-h-24 text-muted-foreground"
                    />

                ) : (
                    <WebcamIcon className="min-w-24 min-h-24 text-muted-foreground" />
                )}

            </div>
            <div className="flex item justify-center gap-3">
                <TooltipButton
                    content={isWebCam ? "Turn off" : "Turn On"}
                    icon={
                        isWebCam ? (
                            <VideoOff className="min-w-5 min-h-5" />
                        ) : (
                            <Video className="min-w-5 min-h-5" />
                        )
                    }
                    onClick={() => setIsWebCam(!isWebCam)}
                />

                <TooltipButton
                    content={isRecording ? "Stop Recording" : "Start Recording"}
                    icon={
                        isRecording ? (
                            <CircleStop className="min-w-5 min-h-5" />
                        ) : (
                            <Mic className="min-w-5 min-h-5" />
                        )
                    }
                    onClick={recordUserAnswer}
                />

                <TooltipButton
                    content="Record Again"
                    icon={<RefreshCw className="min-w-5 min-h-5" />}
                    onClick={recordNewAnswer} />


                <TooltipButton
                    content="Save Result"
                    icon={
                        isAiGenerating ? (
                            <Loader className="min-w-5 min-h-5 animate-spin" />
                        ) : (
                            <Save className="min-w-5 min-h-5" />
                        )
                    }
                    onClick={() => setOpen(!open)}
                    disbaled={!aiResult}
                />


            </div>

            <div className="w-full mt-4 p-4 border rounded-md bg-gray-50">
                <h2 className="text-lg font-semibold"> Your Answer</h2>

                <p className="text-sm mt-2 text-gray-700 whitespace-normal">
                    {userAnswer || "Start recording to see your answer here"}
                </p>

                {interimResult && (
                    <p className="text-sm text-gray-500 mt-2">
                        <strong>Current Speech</strong>
                        {interimResult}
                    </p>
                )}
            </div>
        </div>
    )
}

export default RecordAnswer