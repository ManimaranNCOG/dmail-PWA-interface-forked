import React, { useState , useEffect } from 'react';
import styled from "styled-components";
import { Compose } from "@styled-icons/fluentui-system-regular/Compose";
import { Button, Modal } from 'antd';
import 'react-quill/dist/quill.snow.css';
import SendEmail from "../../pages/messages/SendEmail.js";
const iconStyles = `color: #ffffff; width: 20px; height: 20px;`;
const ComposeIcon = styled(Compose)`${iconStyles}`;

function CommonFooter() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const showModal = () => {   setIsModalOpen(true);    };
    const handleOk = () => {  setIsModalOpen(false);   };    
    const handleCancel = () => {  
      localStorage.setItem("sendingEmail", "");
      setIsModalOpen(false);  
    };

    useEffect(() => {
        const handleClick = (event) => {
          // Get the class name of the clicked element
          const className = event.target.className;
          if(className && typeof className === "string" && className.includes("sidebar-compose-section")){
            localStorage.setItem("sendingEmail", "");
            setIsModalOpen(true)
          }
        };    
        document.addEventListener('click', handleClick);    
        // Clean up event listeners when the component unmounts
        return () => {
            document.removeEventListener('click', handleClick);
        };
      }, []); 

    function reload(){
      const updateEvent = new CustomEvent('renderInbox', { detail: { data: true} });
      window.dispatchEvent(updateEvent);
      setIsModalOpen(false);
      localStorage.setItem("sendingEmail", "");
    }

    return (        
            <>            
                {/* <div className="common-footer-ele">
                    <button className="common-compose-footer-btn"  onClick={showModal} > 
                        <ComposeIcon /> Compose
                    </button>
                </div> */}

                <Modal className="modal-send-email-header" open={isModalOpen} onOk={handleOk} onCancel={handleCancel} footer={null} >
                        <div className='send-email-body-content'>
                              <SendEmail placeholder="Write something..." handleCancel={handleCancel} reRenderIt={reload} />
                        </div>             
                </Modal>
            </>
    );
}

export default CommonFooter;
