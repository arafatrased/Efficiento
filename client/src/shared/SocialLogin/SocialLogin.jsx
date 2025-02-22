
import useAuth from '../../hooks/useAuth';

import { FcGoogle } from "react-icons/fc";
import toast from 'react-hot-toast';

const SocialLogin = () => {
    const { googleSignIn } = useAuth();
    // const navigate = useNavigate();

    const handleGoogleSignIn = () => {
        googleSignIn()
            .then(() => {
                toast.success('Google Sign In Successful');
                // navigate('/');

            })
    }
    return (
        <div className="dark:bg-black dark:text-white m-2">
            <div className="divider"></div>
            <div className='w-full'>
                <button onClick={handleGoogleSignIn} className="btn flex items-center justify-center dark:bg-black dark:text-white btn-outline w-full border-b-4 hover:bg-green-600 border-b-orange-200">
                    <FcGoogle className="mr-2"></FcGoogle>
                    Google
                </button>
            </div>
        </div>
    );
};

export default SocialLogin;