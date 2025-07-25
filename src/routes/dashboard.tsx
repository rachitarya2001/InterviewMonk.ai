import Headings from "@/components/headings"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Plus } from "lucide-react"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import type { Interview } from '../types/index';
import { useAuth } from "@clerk/clerk-react"
import { collection, onSnapshot, query, where } from "firebase/firestore"
import { db } from "@/config/firebase.config"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
import InterviewPin from "@/components/pin"

const Dashboard = () => {
    const [interviews, setinterviews] = useState<Interview[]>([])
    const [loading, setLoading] = useState(false)
    const { userId } = useAuth();

    useEffect(() => {
        setLoading(true)
        const interviewQuery = query(
            collection(db, "interviews"),
            where("userId", "==", userId)
        );

        const unsubscribe = onSnapshot(interviewQuery, (snapshot) => {
            const interviewList: Interview[] = snapshot.docs.map((doc) => {
                const id = doc.id
                return {
                    id,
                    ...doc.data()
                }
            }) as Interview[]
            setinterviews(interviewList)
            setLoading(false)
        }, (error) => {
            console.error("Firebase error:", error);
            toast.error("Error..", {
                description: "Something went wrong.. Try again Later..",
            });
            setLoading(false);
        })
        return () => unsubscribe()

    }, [userId])


    return (
        <>
            <div className="flex w-full items-center justify-between">

                {/* {Heading} */}
                <Headings
                    title="Dashboard"
                    description="Create and start your AI Mock interview"
                />

                <Link to={"/generate/create"}>
                    <Button size={"sm"}>
                        <Plus />
                        Add New
                    </Button>
                </Link>
            </div>
            <Separator className="my-8" />

            {/* {Content Section} */}

            <div className="md:grid md:grid-cols-3 gap-3 py-4 ">
                {loading ? (Array.from({ length: 6 }).map((_, index) => (
                    <Skeleton key={index} className="h-24 md:h-32 rounded-md" />

                ))) : interviews.length > 0 ? (interviews.map((interview) => (<InterviewPin key={interview.id} interview={interview} />))) : (<div className="md:col-span-3 w-full flex flex-grow items-center justify-center h-96 flex-col">
                    <img
                        src="/assets/svg/not-found.svg"
                        className="w-44 h-44 object-contain"
                        alt=""
                    />

                    <h2 className="text-lg font-semibold text-muted-foreground">
                        No Data Found
                    </h2>

                    <p className="w-full md:w-96 text-center text-sm text-neutral-400 mt-4">
                        There is no available data to show. Please add some new mock
                        interviews
                    </p>

                    <Link to={"/generate/create"} className="mt-4">
                        <Button size={"sm"}>
                            <Plus className="min-w-5 min-h-5 mr-1" />
                            Add New
                        </Button>
                    </Link>
                </div>)}
            </div>
        </>

    )
}

export default Dashboard