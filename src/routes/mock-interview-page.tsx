import { db } from '@/config/firebase.config';
import type { Interview } from '@/types';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import Loaderpage from './Loader-page';
import CustomBreadCrumb from '@/components/custom-bread-crumb';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Lightbulb } from 'lucide-react';
import QuestionSection from '@/components/question-section';


const MockInterviewPage = () => {

    const { interviewId } = useParams<{ interviewId: string }>();
    const [interview, setInterview] = useState<Interview | null>(null);
    const [isloading, setIsLoading] = useState(false);
    const navigate = useNavigate();

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
        <div className='flex flex-col w-full gap-8 py-5'>
            <CustomBreadCrumb
                breadCrumbPage="Start"
                breadCrumbItems={[
                    {
                        label: "Mock Interview", link: "/generate"
                    },
                    {
                        label: interview?.position || "",
                        link: `/generate/interview/${interview?.id}`
                    },
                ]}

            />

            <div className='w-full'>
                <Alert className="bg-sky-100 border-sky-200 p-4 rounded-lg">
                    <Lightbulb className="h-5 w-5 text-sky-600" />
                    <div>
                        <AlertTitle className="text-sky-800 font-semibold">
                            Important Note
                        </AlertTitle>
                        <AlertDescription>
                            Press "Record Answer" to begin answering the question. Once you finish the interview, you&apos;ll receive feedback comparing you responses with the ideal answer.
                            <br />
                            <br />
                            <strong>Note:</strong>{" "}
                            <span className="front-medium">Your video is never recorded.</span> You can disable the webcam anytime if preferred.
                        </AlertDescription>
                    </div>
                </Alert>
            </div>
            {interview?.questions && interview?.questions.length > 0 && (
                <div className='mt-4 w-full flex flex-col items-start gap-4'>
                    <QuestionSection questions={interview?.questions} />
                </div>
            )}
        </div>
    )
}

export default MockInterviewPage