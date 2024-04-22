import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import Cookies from "universal-cookie";
import { verifyToken } from '../service/actions';
import { logout } from './logout';

const cookies = new Cookies();

const PrivateRoute = () => {
    const [user, setUser] = useState(cookies.get("userObject"));

    useEffect(() => {
        // Check if it's the last render before triggering API
        const isLastRender = () => {
            const currentRenderId = Math.random(); // Generate a unique id for current render
            setUser(prevUser => {
                if (prevUser && prevUser.token) {
                    verifyToken(prevUser.name).then((result)=>{
                        if(result && !result.isAuth) {
                            logout();
                        }
                    })
                }
                return { ...prevUser, currentRenderId }; // Update user object with current render id
            });
        };

        return () => {
            // Cleanup function: Check if it's the last render before component unmounts
            isLastRender();
        };
    }, []); // Empty dependency array ensures this effect runs only once after initial render

    if (!user || !user.token) {
        logout();
        return null; // Render nothing while redirecting
    }

    return <Outlet />; // Render child elements if user is authenticated
}

export default PrivateRoute;
