import React from 'react';
import Settings from '../settings/Settings';
import UserProfile from '../user-profile/UserProfile';
import Profile from './Profile';

const ProfileComponent = () => {

    const handleGoBack = () => {
        window.history.back();
    };
    const curPath = window.location.pathname.split('/')[1];
    const ComponentToRender = curPath === 'settings' ? Settings : UserProfile;

    return (
        <div>
            <div className='no-menu-top-header'>
                <button className='open-btn-menu-home' onClick={handleGoBack}>Back</button>
                <Profile />
            </div>
            <ComponentToRender />
        </div>
    );
};

export default ProfileComponent;
