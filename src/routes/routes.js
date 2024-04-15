import Settings from '../pages/settings/Settings';
import Inbox from '../pages/messages/Inbox';
import SentItems from '../pages/messages/SentItems';
import UserProfile from '../pages/user-profile/UserProfile';
import ProfileComponent from '../pages/profile-section/ProfileComponent';

export const privateRoute = [
    {
        path : '/inbox' , 
        element : <Inbox/>
    },
    {
        path : '/settings' , 
        element : <ProfileComponent/>
    },
    {
        path : '/sent-item' , 
        element : <SentItems/>
    },
    {
        path : '/emails' , 
        element : <Inbox/>
    },
    {
        path : '/profile' , 
        element : <ProfileComponent/>
    },
  ]