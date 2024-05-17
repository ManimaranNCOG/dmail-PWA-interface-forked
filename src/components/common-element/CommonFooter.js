import React, { useState , useEffect } from 'react';
import { Modal } from 'antd';
import 'react-quill/dist/quill.snow.css';
import SendEmail from "../../pages/messages/SendEmail.js";

function CommonFooter() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [toEmail, setToEmail] = useState("");

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

            if(!className.includes("extra-class-quick_access")){
              setToEmail("");
            }
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

      useEffect(() => {
        const handleQuickAccess = (e) => {
            if (e.detail) {
                setToEmail(e.detail.email);
            }
        };
    
        window.addEventListener("quick_access", handleQuickAccess);
    
        // Cleanup the event listener on component unmount
        return () => {
            window.removeEventListener("quick_access", handleQuickAccess);
        };
    }, [toEmail]);


    // render the inbox component
    function reload(){
      const updateEvent = new CustomEvent('renderInbox', { detail: { data: true} });
      window.dispatchEvent(updateEvent);
      setIsModalOpen(false);
      localStorage.setItem("sendingEmail", "");
    }

    return (        
            <>            
                <Modal className="modal-send-email-header" open={isModalOpen} onOk={handleOk} onCancel={handleCancel} footer={null} >
                        <div className='send-email-body-content'>
                              <SendEmail placeholder="Write something..." handleCancel={handleCancel} reRenderIt={reload} toEmail ={toEmail} />
                        </div>             
                </Modal>
            </>
    );
}

export default CommonFooter;
