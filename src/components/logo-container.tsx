
import { Link } from 'react-router-dom'

function LogoContainer() {
    return (
        <Link to={"/"}>
            <img src='/assets/svg/logo.svg' alt='' className='min-w-10 object-contain' />
        </Link>
    )
}

export default LogoContainer