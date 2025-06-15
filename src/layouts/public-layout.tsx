import { Footer } from "@/components/footer"
import Header from "@/components/header"
import AuthHandler from "@/handlers/auth-handler"
import { Outlet } from "react-router-dom"


const PublicLayout = () => {
    return (
        <div className='w-full'>

            <AuthHandler />

            <Header />

            <Outlet />
            <Footer />


        </div>
    )
}

export default PublicLayout