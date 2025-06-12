import Loaderpage from "@/routes/Loader-page";
import { useAuth, useUser } from "@clerk/clerk-react"
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { db } from "@/config/firebase.config";
import type { User } from "@/types";

const AuthHandler = () => {

    const { isSignedIn } = useAuth();
    const { user } = useUser();
    const navigate = useNavigate();
    const pathname = useLocation().pathname;

    const [loading, setLoading] = useState(false);
    useEffect(() => {
        const storeUserData = async () => {
            if (isSignedIn && user) {
                setLoading(true);
                try {
                    const userSanp = await getDoc(doc(db, "users", user.id));
                    if (!userSanp.exists()) {
                        const userData: User = {
                            id: user.id,
                            name: user.fullName || user.firstName || "Anonymous",
                            email: user.primaryEmailAddress?.emailAddress || "N/A",
                            imageUrl: user.imageUrl,
                            createdAt: serverTimestamp(),
                            updateAt: serverTimestamp()


                        }
                        await setDoc(doc(db, "users", user.id), userData)
                    }
                } catch (error) {
                    console.log("Error on Storing the user data", error);
                } finally {
                    setLoading(false);
                }
            }

        }
        storeUserData()
    }, [isSignedIn, user, pathname, navigate])

    if (loading) {
        return <Loaderpage />
    }
    return null
};

export default AuthHandler