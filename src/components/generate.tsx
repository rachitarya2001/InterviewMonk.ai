import { Outlet } from "react-router-dom"

const Generate = () => {
    return (
        <div className="flex-col md:px:2">
            <Outlet />
        </div>
    )
}

export default Generate