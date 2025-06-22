import { db } from "@/config/firebase.config";
import type { Interview } from "@/types";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react"
import { useParams, useNavigate, Link } from 'react-router-dom';
import Loaderpage from "./Loader-page";
import CustomBreadCrumb from "@/components/custom-bread-crumb";
import { Lightbulb, Sparkles, WebcamIcon } from "lucide-react";
import { Button } from "@/components/ui/button"
import InterviewPin from "@/components/pin";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Webcam from "react-webcam";
const MockLoadPage = () => {
    const { interviewId } = useParams<{ interviewId: string }>();
    const [interview, setInterview] = useState<Interview | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [isloading, setIsLoading] = useState(false)
    const [isWebCamEnable, setIsWebCamEnable] = useState(false);


    const navigate = useNavigate();

    if (!interviewId) {
        navigate("/generate", { replace: true });
    }

    useEffect(() => {
        const fetchInterview = async () => {
            if (interviewId) {
                try {
                    const interviewDoc = await getDoc(doc(db, "interviews", interviewId));
                    if (interviewDoc.exists()) {
                        setInterview({ id: interviewDoc.id, ...interviewDoc.data() } as Interview)
                    }
                } catch (error) {
                    console.log(error)
                }
            }
        };

        fetchInterview()
    }, [interviewId])

    if (isloading) {
        return < Loaderpage className="w-full h-[70vh]" />
    }

    if (!interviewId) {
        navigate("/general", { replace: true });
    }

    if (!interview) {
        navigate("/general", { replace: true });
    }

    return (
        <div className="flex flex-col w-full gap-8 py-5">
            <div className="flex item-center justify-between w-full gap-2">
                <CustomBreadCrumb
                    breadCrumbPage={interview?.position || ""}
                    breadCrumbItems={[{ label: "Mock Interview", link: "/generate" }]}
                />
                <Link to={`/generate/interview/${interviewId}/start`}>
                    <Button size={"sm"}>
                        start<Sparkles />
                    </Button>
                </Link>

            </div>

            {interview && <InterviewPin interview={interview} onMockPage />}

            <Alert className="bg-yellow-100/50 border-yellow-200 p-4 rounded-lg">
                <Lightbulb className="h-5 w-5 text-yellow-600" />
                <div>
                    <AlertTitle className="text-yellow-800 font-semibold">
                        Important Information
                    </AlertTitle>
                    <AlertDescription>
                        Please enable your webcame and microphone to start the AI-generated mock interview. The interview consist of five questions. You'll receive a personalized report based on your response at the end.

                        <br />
                        <br />
                        <span className="front-medium">Note:</span> Your video is {" "}
                        <strong>never recorded</strong>. You can disable your webcame at any time.
                    </AlertDescription>
                </div>
            </Alert>
            <div className="flex items-center justify-center w-full h-full">
                <div className="w-full h-[400px] md:w-96 flex flex-col items-center justify-center border p-4 bg-gray-50 rounded-md">
                    {isWebCamEnable ? (
                        <Webcam
                            onUserMedia={() => setIsWebCamEnable(true)}
                            onUserMediaError={() => setIsWebCamEnable(false)}
                            className="min-w-24 min-h-24 text-muted-foreground"

                        />

                    ) : (
                        <WebcamIcon className="min-w-24 min-h-24 text-muted-foreground" />
                    )}

                </div>
            </div>

            <div className="flex items-center justify-center">
                <Button onClick={() => setIsWebCamEnable(!isWebCamEnable)}>
                    {isWebCamEnable ? "Disable Webcam" : "Enable Webcam"}

                </Button>

            </div>
        </div>
    )
}

export default MockLoadPage