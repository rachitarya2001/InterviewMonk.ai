import Loaderpage from "@/routes/Loader-page"
import { useAuth } from "@clerk/clerk-react"
import { Navigate } from "react-router-dom"

function ProtectRoutes({ children }: { children: React.ReactNode }) {

    const { isLoaded, isSignedIn } = useAuth()

    if (!isLoaded) {
        return <Loaderpage />
    }
    if (!isSignedIn) {
        return <Navigate to={"/signin"} replace />
    }

    return children;
}

export default ProtectRoutes