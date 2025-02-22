import  { createContext, useEffect, useState } from 'react';
import auth from '../firebase/firebase.config';
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';


// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext(null);

// eslint-disable-next-line react/prop-types
const AuthProvider = ({ children }) => {
    const googleProvider = new GoogleAuthProvider();
    const [user, setUser] = useState([]);
    const [loading, setLoading] = useState(true);

    const googleSignIn = () => {
        setLoading(true);
        return signInWithPopup(auth, googleProvider);
    }

    const logOut = () => {
        setLoading(true)
        return signOut(auth);
    }


    useEffect(() => {
        const unSubscribe = onAuthStateChanged(auth, currentUser => {
            setUser(currentUser);
            console.log('state Captured', currentUser?.email);
            setLoading(false)
            // put it in the right place;

        })
        return () => {
            unSubscribe();
        }
    }, [])


    const userInfo = {
        user,
        loading,
        logOut,
        googleSignIn
    }

    return (
        <AuthContext.Provider value={userInfo}>
            {children}
        </AuthContext.Provider>
    )
};

export default AuthProvider;