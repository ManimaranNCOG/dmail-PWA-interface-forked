import { useEffect, useRef, useState } from "react";
import "./sidebar.css";
import styled from "styled-components";
import { Menu } from "@styled-icons/entypo/Menu";
import { Inbox } from "@styled-icons/heroicons-outline/Inbox";
import { Send } from "@styled-icons/fluentui-system-regular/Send";
import { ArrowIosForwardOutline } from "@styled-icons/evaicons-outline/ArrowIosForwardOutline";
import { DownArrow } from "@styled-icons/boxicons-regular/DownArrow";
import { Drafts } from "@styled-icons/fluentui-system-regular/Drafts";
import { Compose } from "@styled-icons/fluentui-system-regular/Compose";
import Cookies from "universal-cookie";
import { useNavigate } from "react-router-dom";
import { logout } from "../../auth/logout.js";


const cookies = new Cookies();

const iconStyles = `color: #4a88c5; width: 30px; height: 30px; `;
const menuIconStyles = `color: #4a88c5; width: 30px; height: 35px;`;

const MenuIcon = styled(Menu)`${menuIconStyles}`;
const InboxIcon = styled(Inbox)`${iconStyles}`;
const SendIcon = styled(Send)`${iconStyles}`;
const ArrowIosForwardOutlineIcon = styled(ArrowIosForwardOutline)`${iconStyles}`;
const DownArrowIcon = styled(DownArrow)`${iconStyles}`;
const DraftsIcon = styled(Drafts)`${iconStyles}`;
const ComposeIcon = styled(Compose)`${iconStyles}`;

const FavoriteValues = [
  {
    key: "Inbox",
    icon: <InboxIcon />,
    isOpened: false,
  },
  {
    key: "Sent Item",
    icon: <SendIcon />,
    isOpened: false,
  },
  {
    key: "Drafts",
    icon: <DraftsIcon />,
    isOpened: false,
  },
  {
    key: "Add Favourite",
    className: "custom-btn-add-fav",
  },
];

const FolderValues = [
  {
    key: "Inbox",
    icon: <InboxIcon />,
    isOpened: false,
  },
  {
    key: "Sent Item",
    icon: <SendIcon />,
    isOpened: false,
  },
  {
    key: "Drafts",
    icon: <DraftsIcon />,
    isOpened: false,
  },
  {
    key: "Add Folder",
    className: "custom-btn-add-fav",
  },
];


const isOpenIcon = <DownArrowIcon />;

const sidebarNavItemsValues = [
  {
    display: "Inbox",
    to: "inbox",
    isOpen: true,
    isHeader: true
  },
  {
    display: "Sent Item",
    to: "sent-item",
    isOpen: false,
    isHeader: true
  },
  {
    display: "Favorite",
    icon: <ArrowIosForwardOutlineIcon />,
    to: "/favorite",
    isOpen: false,
    values: FavoriteValues,
  },
  {
    display: "Folder",
    icon: <ArrowIosForwardOutlineIcon />,
    to: "/folder",
    isOpen: false,
    section: "started",
    values: FolderValues,
  },
  {
    display: "Group",
    icon: <ArrowIosForwardOutlineIcon />,
    isOpen: false,
    to: "/group",
  },
];

const Sidebar = (props) => {
  const [activeKey, setKeyIndex] = useState(null);
  const [sidebarNavItems, setSidebarNavItems] = useState(sidebarNavItemsValues);
  const [user] = useState(cookies.get("userObject"));
  const spanRef = useRef(null);
  const navigate = useNavigate();

  const currentPath = window.location.pathname.split("/")[1];
  useEffect(() => { }, [currentPath]);

  if (!user || !user.token) {
    return null; // Render nothing while redirecting
  }

  return (
    
    <div className={props.className ? 'sidebar sidebar-expanded' : 'sidebar sidebar-unexpanded'} style={{ transition: 'width 0.5s ease' }} >
      <div style={{ display: props.className ? 'block' : 'none' }} >
        <div className="sidebar__logo">
          <MenuIcon className="hamburgur-icon" onClick={() => {
            const updateEvent = new CustomEvent('isMenuClicked', { detail: { data: true } });
            window.dispatchEvent(updateEvent);
          }} /> <span className="web-3-tag-sidebar"> D </span>  <span className="email-span-sidebar"> Mails </span>
        </div>

        <div className="compose-email-btn">
          <button className="sidebar-compose-section"> < ComposeIcon onClick={(e) => {
            e.stopPropagation();
            if (spanRef.current) { spanRef.current.click(); }

          }} /> <span ref={spanRef} className="compose sidebar-compose-section"> Compose </span></button>
        </div>

        <div className="sidebar__menu">
          {sidebarNavItems.map((item, index) => (
            <div key={index}>
              <div className="parent-div-element-"></div>
              <div className={item.isOpen && item.isHeader ? `sidebar__menu__item parent-hover-key-div` : "sidebar__menu__item"} onClick={async (e) => {
                const recordsValue = [...sidebarNavItems]; // Create a copy of the state array
                recordsValue[index].isOpen = item.isHeader ? true : !recordsValue[index].isOpen;
                await setSidebarNavItems(recordsValue);
                const dataValue = sidebarNavItems;
                dataValue.forEach((item, indexs) => {
                  if (item.hasOwnProperty('isHeader') && indexs !== index) {
                    item.isOpen = false;
                  }
                });
                await setSidebarNavItems(dataValue);

                if (item.isHeader) {
                  navigate(recordsValue[index].to);
                }
              }}>
                <div
                  className="sidebar__menu__item__icon">
                  {item.isOpen && !item.isHeader ? isOpenIcon : item.icon}
                </div>
                <div className="sidebar__menu__item__text">{item.display}</div>
              </div>
              {item.isOpen && item.values && (
                <div className={`chil-div-sidbar ${item.isOpen && item.values ? 'active' : ''}`}>
                  {item.values.map((itemValue, keyIndex) => (
                    <div
                      className={
                        itemValue.isOpened
                          ? "parent-hover-key-div child-value-render"
                          : "default-text-sidebar-key"
                      }
                    >
                      <div className="child keys-sidebar">
                        <span> {itemValue.icon} </span>
                        <span
                          className={itemValue.className}
                          onClick={async (e) => {
                            setKeyIndex(keyIndex);
                            const recordsValue = sidebarNavItems;
                            recordsValue[index].values[keyIndex].isOpened = !recordsValue[index].values[keyIndex].isOpened;
                            if (activeKey != null && keyIndex != activeKey) recordsValue[index].values[activeKey].isOpened = false;
                            await setSidebarNavItems(recordsValue);
                          }}
                        >
                          {itemValue.key}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: props.className ? 'grid' : 'none' }} className="user-name-profile-name">  <span className="user-name-profile-span" > {user.name}  </span></div>
      <div style={{ display: props.className ? 'flex ' : "none" }} className="sidebar-logout-section">
        <button onClick={() => {
          logout();
        }}> Logout </button>
      </div>

    </div>
  );
};

export default Sidebar;
