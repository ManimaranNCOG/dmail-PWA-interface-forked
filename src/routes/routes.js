import Inbox from '../pages/messages/Inbox';
import SentItems from '../pages/messages/SentItems';
import ProfileComponent from '../pages/profile-section/ProfileComponent';
import WIP from '../pages/common/WIP';

// List for declaring the dynamic rounting with components
export const privateRoute = [
    { path : '/inbox' , element : <Inbox/> },
    { path : '/settings' , element : <ProfileComponent/> },
    { path : '/sent-item' , element : <SentItems props={"Sent Items"} /> },
    { path : '/emails' , element : <Inbox/> },
    { path : '/profile' , element : <ProfileComponent/> },
    { path : '/grid' , element : <WIP/> },
    { path : '/trash' , element : <SentItems props={"Deleted Items"} /> }
  ]