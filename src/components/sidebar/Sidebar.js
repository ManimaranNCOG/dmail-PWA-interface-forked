import { useEffect, useRef, useState } from "react";
import "./sidebar.css";
import styled from "styled-components";
import { Menu } from "@styled-icons/entypo/Menu";
import { DownArrow } from "@styled-icons/boxicons-regular/DownArrow";
import { Compose } from "@styled-icons/fluentui-system-regular/Compose";
import Cookies from "universal-cookie";
import { useNavigate } from "react-router-dom";
import { logout } from "../../auth/logout.js";
import { sidebar } from "../../constant/constant.js";
import { web3AccountCheck } from "../../helper/web3-helper.js";
import contractData from '../../contracts/contract.json';
import config from '../../config/config.json';
import { getCurrentDate, validateTheWebReturedValues } from "../../helper/object-validation-helper.js";
import { AddFolderModal, AddQuickAccessUser } from "../../pages/modal-popup/CommonAlert.js";
import { transactionAction } from "../../helper/chain-helper.js";
import ContextMenu from "../layout/ContextMenu.js";

const cookies = new Cookies();
const iconStyles = `color: #4a88c5; width: 30px; height: 30px; `;
const menuIconStyles = `color: #4a88c5; width: 30px; height: 35px;`;
const MenuIcon = styled(Menu)`${menuIconStyles}`;
const DownArrowIcon = styled(DownArrow)`${iconStyles}`;
const ComposeIcon = styled(Compose)`${iconStyles}`;
const isOpenIcon = <DownArrowIcon />;


const Sidebar = (props) => {
  const [activeKey, setKeyIndex] = useState(null);
  const [sidebarNavItems, setSidebarNavItems] = useState(sidebar.sidebarNavItemsValues);
  const [user] = useState(cookies.get("userObject"));
  const [web3Value, setWeb3] = useState(null);
  const [account, setAccount] = useState('');
  const [folderJson, setFolderJson] = useState([]);
  const [folderModal, setFolderModal] = useState(false);
  const [SC, setSC] = useState(false);
  const [selectedContext, setContext] = useState(false);
  const [quickSend, setQuickSend] = useState(false);
  const [quick, setAddQuick] = useState(false);
  const [quickUsers, setQuickUsers] = useState([]);

  const [contextMenuVisible, setContextMenuVisible] = useState(false); // State to manage context menu visibility
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 }); // State to manage context menu position



  // Handle right-click event to show context menu
  const handleContextMenu = (e , item) => {
      e.preventDefault(); // Prevent default context menu
      setContextMenuVisible(true); // Show context menu
      setContextMenuPosition({ x: e.clientX, y: e.clientY }); // Set context menu position
      setContext(item.display);
  };

  // Close context menu
  const handleCloseContextMenu = () => {
      setContextMenuVisible(false);
  };

  const spanRef = useRef(null);
  const navigate = useNavigate();

  const currentPath = window.location.pathname.split("/")[1];
  useEffect(() => { }, [currentPath]);

  useEffect(() => {
    if(web3Value) fetchData();
  }, [web3Value , account]);


  async function fetchData(){
    const contractInstance = new web3Value.eth.Contract(contractData.storageContract, config.json.CONTRACT);
    setSC(contractInstance);

    if(account){
            const folderRecords = await contractInstance.methods.getUserFolders(user.name).call({from : account});  
            let returnList = [];        
            for (let value of folderRecords) {
              const filteredData = validateTheWebReturedValues(value);
              returnList.push(filteredData);
            }
            setFolderJson(returnList);
            const quickUsers = await contractInstance.methods.getUsersQuickSend(user.name).call({from : account});
            setQuickSend(true);
            setQuickUsers(quickUsers);
            
    }
  }


  useEffect(() => {
    // Check if MetaMask is installed
    web3AccountCheck(setWeb3 , setAccount);
    return () => {
      localStorage.setItem("sendingEmail", "");
    };
  }, []);




  if (!user || !user.token) {
    return null; // Render nothing while redirecting
  }


  async function addFoldedOnChain(folderJSON){
    const functionParams  = [user.name , folderJSON.name , getCurrentDate() , "todo" , "todo" , []];
    const txHash = await transactionAction(SC, "addFolder", functionParams, account);
    fetchData();
    return txHash;
  }

  async function addQuickAccessOnChain(quickAccessJSON){
    const functionParams  = [user.name , quickAccessJSON.email , quickAccessJSON.name ];
    const txHash = await transactionAction(SC, "saveQuickSend", functionParams, account);
    fetchData();
    return txHash;
  }



  return (
    
    <div className={'sidebar sidebar-expanded'}    >
      <div style={{ display: props.className ? 'block' : 'none' }} >
        <div className="sidebar__logo">
          <MenuIcon className="hamburgur-icon" /> <span className="web-3-tag-sidebar"> D </span>  <span className="email-span-sidebar"> Mails </span>
        </div>

        <div className="compose-email-btn">
          <button className="sidebar-compose-section"> < ComposeIcon onClick={(e) => {
            e.stopPropagation();
            const eventData = { email : "" }; 
            const customEvent = new CustomEvent("quick_access", { detail: eventData });
            window.dispatchEvent(customEvent);

            if (spanRef.current) { spanRef.current.click(); }

          }} /> <span ref={spanRef} className="compose sidebar-compose-section"> Compose </span></button>
        </div>

        <div className="sidebar__menu">
          {sidebarNavItems.map((item, index) => (
            <div key={index}>
              <div className="parent-div-element-"></div>
              <div onContextMenu={(e)=> handleContextMenu(e , item ) }  className={item.isOpen && item.isHeader ? `sidebar__menu__item parent-hover-key-div` : "sidebar__menu__item"} onClick={async (e) => {
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

        <div className="quicksend-div">
            <div className="folder-header">
                <h4>Quick Send to : {quickUsers.length}</h4>
                <button onClick={()=> {
                  setQuickSend(true)
                }}>Edit list</button>
            </div>

            {quickSend && 
              <div className="div-class-foot-quick cursor-pointer"> 
                 {quickUsers.length > 0 && quickUsers.map((itemValue, keyIndex) => (
                  <div key={keyIndex} className="div-class-foot-quick-child" onClick={async()=> {

                    const eventData = { email : itemValue.userEmail }; 
                    const customEvent = new CustomEvent("quick_access", { detail: eventData });
                    window.dispatchEvent(customEvent);

                    if (spanRef.current) {
                      // Add extra class name
                      spanRef.current.classList.add('extra-class-quick_access');                    
                      // Trigger click event
                      spanRef.current.click();                    
                      spanRef.current.classList.remove('extra-class-quick_access');
                    }
                  }} >
                    <div className="circle-add-user">{itemValue.userName[0].toUpperCase()} </div> 
                    <div>
                      <div className="quick-user name"> {itemValue.userName} </div>
                      <div className="quick-user email"> {itemValue.userEmail} </div>
                    </div>            
                  </div>
                ))}
                  <div className="div-class-foot-quick-child" onClick={() => {
                  setAddQuick(true)
                 }}>
                    <div className="circle-add-user">+</div> Add New User
                 </div>
              </div>
            } 
        </div>

        <div className="folder-div"> 
            <div className="folder-header">
                <h4>Folder</h4>
                <button onClick={()=> {
                  setFolderModal(true)
                }}>Create</button>
            </div>

            <div className="folder-render">
                {folderJson && folderJson.length > 0 &&  folderJson.map((item, index) => (
                    <div key={index} className="folder-name-index"> {item.name} </div>
                ))}
  
                </div>
        </div>
      </div>
      <div style={{ display: props.className ? 'grid' : 'none' }} className="user-name-profile-name">  <span className="user-name-profile-span" > {user.name}  </span></div>
      <div style={{ display: props.className ? 'flex ' : "none" }} className="sidebar-logout-section">
        <button onClick={() => {
          logout();
        }}> Logout </button>
      </div>

        {contextMenuVisible && (
                <ContextMenu 
                    x={contextMenuPosition.x} 
                    y={contextMenuPosition.y} 
                    onClose={handleCloseContextMenu} // Pass function to close context menu
                    types={folderJson}
                    selectedContext={selectedContext}
                />
            )}

            <AddFolderModal isOpen={folderModal} close={() => setFolderModal(false)} action ={setFolderModal} addFolder={addFoldedOnChain} /> 
            <AddQuickAccessUser isModalOpen ={quick} close={() => setAddQuick(false)} addQuickAccessUser ={addQuickAccessOnChain} />
    </div>
  );
};

export default Sidebar;
