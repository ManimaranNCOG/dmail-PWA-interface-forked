import React, { useState , useEffect} from "react";
import { Modal } from 'antd';
import "./modal.css"
import PropTypes from 'prop-types';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { editorConstant, web3Constant } from '../../constant/constant';
import styled from "styled-components";
import { Verified } from "@styled-icons/material/Verified";
import key from "../../assets/gif-loader/key.png";
import Web3 from 'web3';
import { getChainDetailsFromHost } from "../../helper/wallet-helper";
import config  from '../../config/config.json';
import { getCacheStorage } from "../../helper/cache-helper.js";
import { Delete } from "@styled-icons/fluentui-system-regular/Delete";
import { sendEmails } from "../../helper/send-email-helper.js";
import { optionalValidation } from "../../helper/object-validation-helper.js";
import Cookies from "universal-cookie";
import moment from 'moment';
const cookies = new Cookies();

const web3 = new Web3(window.ethereum);
const iconStyles = `color: #0f7929; width: 20px; height: 20px;`;
const iconStyle = `color: #fffff; width: 20px; height: 20px;`;

const VerifiedIcon = styled(Verified)`${iconStyles}`;
const DeleteIcon = styled(Delete)`${iconStyle}`;

const chainId = config.json.CHAIN_ID;

const svgValue = <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="m7.731 19.5 2.6.697v-.911l.213-.215h1.486v1.822h-1.592l-1.964-.857-.743-.536Z" fill="#CDBDB2"></path><path fill-rule="evenodd" clip-rule="evenodd" d="m16.222 19.5-2.547.697v-.911l-.213-.215h-1.486v1.822h1.592l1.964-.857.69-.536Z" fill="#CDBDB2"></path><path fill-rule="evenodd" clip-rule="evenodd" d="m10.544 17.518-.213 1.768.266-.215h2.76l.318.215-.213-1.768-.424-.268-2.123.054-.371.214Z" fill="#393939"></path><path fill-rule="evenodd" clip-rule="evenodd" d="m9.11 5.571 1.274 3 .584 8.733h2.07l.637-8.733 1.167-3H9.111Z" fill="#F89C35"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M3.54 12.16 2.052 16.5l3.715-.214h2.388V14.41l-.106-3.857-.531.428-3.98 1.179Z" fill="#F89D35"></path><path fill-rule="evenodd" clip-rule="evenodd" d="m6.352 12.643 4.351.107-.478 2.25-2.07-.536-1.803-1.821Z" fill="#D87C30"></path><path fill-rule="evenodd" clip-rule="evenodd" d="m6.352 12.697 1.804 1.714v1.714l-1.804-3.428Z" fill="#EA8D3A"></path><path fill-rule="evenodd" clip-rule="evenodd" d="m8.156 14.464 2.122.536.69 2.304-.477.268-2.335-1.393v-1.715Z" fill="#F89D35"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M8.156 16.179 7.73 19.5l2.813-1.982-2.388-1.34Z" fill="#EB8F35"></path><path fill-rule="evenodd" clip-rule="evenodd" d="m10.703 12.75.265 4.554-.796-2.33.531-2.224Z" fill="#EA8E3A"></path><path fill-rule="evenodd" clip-rule="evenodd" d="m5.715 16.232 2.44-.053-.424 3.321-2.016-3.268Z" fill="#D87C30"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M3.22 20.947 7.732 19.5l-2.016-3.268-3.662.268 1.168 4.447Z" fill="#EB8F35"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M10.384 8.571 8.103 10.5l-1.751 2.143 4.351.16-.319-4.232Z" fill="#E8821E"></path><path fill-rule="evenodd" clip-rule="evenodd" d="m7.731 19.5 2.813-1.982-.213 1.714v.965l-1.91-.376-.69-.32Zm8.491 0-2.76-1.982.213 1.714v.965l1.91-.376.637-.32Z" fill="#DFCEC3"></path><path fill-rule="evenodd" clip-rule="evenodd" d="m9.535 13.714.584 1.232-2.07-.535 1.486-.697Z" fill="#393939"></path><path fill-rule="evenodd" clip-rule="evenodd" d="m3.168 3.054 7.216 5.517-1.22-3-5.996-2.517Z" fill="#E88F35"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M3.168 3.054 2.212 6l.531 3.214-.371.215.53.482-.424.375.583.535-.371.322.849 1.071 3.98-1.232c1.946-1.571 2.9-2.375 2.865-2.41-.035-.036-2.44-1.876-7.216-5.518Z" fill="#8E5A30"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M20.414 12.16 21.9 16.5l-3.715-.214h-2.388V14.41l.106-3.857.531.428 3.98 1.179Z" fill="#F89D35"></path><path fill-rule="evenodd" clip-rule="evenodd" d="m17.602 12.643-4.352.107.478 2.25 2.07-.536 1.804-1.821Z" fill="#D87C30"></path><path fill-rule="evenodd" clip-rule="evenodd" d="m17.602 12.697-1.805 1.714v1.714l1.805-3.428Z" fill="#EA8D3A"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M15.797 14.464 13.675 15l-.69 2.304.477.268 2.335-1.393v-1.715Z" fill="#F89D35"></path><path fill-rule="evenodd" clip-rule="evenodd" d="m15.797 16.179.425 3.321-2.76-1.928 2.335-1.393Z" fill="#EB8F35"></path><path fill-rule="evenodd" clip-rule="evenodd" d="m13.25 12.75-.265 4.554.796-2.33-.53-2.224Z" fill="#EA8E3A"></path><path fill-rule="evenodd" clip-rule="evenodd" d="m18.238 16.232-2.44-.053.424 3.321 2.016-3.268Z" fill="#D87C30"></path><path fill-rule="evenodd" clip-rule="evenodd" d="m20.732 20.947-4.51-1.447 2.016-3.268 3.662.268-1.168 4.447Z" fill="#EB8F35"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M13.569 8.571 15.85 10.5l1.752 2.143-4.352.16.319-4.232Z" fill="#E8821E"></path><path fill-rule="evenodd" clip-rule="evenodd" d="m14.418 13.714-.584 1.232 2.07-.535-1.486-.697Z" fill="#393939"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M20.785 3.054 13.57 8.57l1.22-3 5.996-2.517Z" fill="#E88F35"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M20.785 3.054 21.741 6l-.531 3.214.371.215-.53.482.424.375-.583.535.371.322-.849 1.071-3.98-1.232c-1.946-1.571-2.9-2.375-2.866-2.41.036-.036 2.441-1.876 7.217-5.518Z" fill="#8E5A30"></path></svg>;

// connecting js with metamask for connecting the wallet account
async function connectWallet(){
            try {
            // Requesting MetaMask to connect
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

            const domainObject = await getCacheStorage("domain");        
            const chainJson = await getChainDetailsFromHost(domainObject.domain);

            if (window.ethereum.networkVersion !== chainId) {
                try {
                  await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: web3.utils.toHex(chainId) }]
                  });
                } catch (err) {
                  if (err.code === 4902) {
                    await window.ethereum.request({
                      method: 'wallet_addEthereumChain',
                      params: [
                        {
                          chainName: chainJson.name,
                          chainId: web3.utils.toHex(chainId),
                          nativeCurrency: { name: chainJson.nativeCurrency.name , decimals: 18, symbol: chainJson.nativeCurrency.symbol },
                          rpcUrls: chainJson.rpc
                        }
                      ]
                    });
                  }else{
                    return null;
                  }
                }
              }


            if (accounts.length > 0) {

                const message = web3Constant.signMessage;
                const signature = await window.ethereum.request({
                    method: 'personal_sign',
                    params: [message, accounts[0]]
                });

                return signature;
     
            } else {
                return null;
            }
        } catch (error) {
            console.log(error)
            return null;
        }
}

// Connect wallet modal on account creation
const ConnectWallet =(params) => {
    const [buttonName, setButtonName] = useState('Connect with MetaMask');

    return (
        <div>
            <Modal className="modal-alert-header connect-wallet-account" open={params.isModalOpen} onOk={params.close} onCancel={params.close} footer={null} >
                <div className='send-alert-body-content connect-wallet-account-div'>
                    <div className='label-title-metamask'> Sign Up With Wallet </div>
                        <div className='common-alert-connect-meta'>
                             <button className={`wallet-connect-btn ${buttonName}`} onClick={async()=> { 
                                    setButtonName("Connecting MetaMask");
                                    const sign = await connectWallet();
                                    setButtonName("Connect with MetaMask");

                                    params.sendSign(sign);
                                }} > <span className='metamask-icon'> {svgValue}  </span>{buttonName} </button>
                        </div>
                </div>
            </Modal>
        </div>
    )
}



// Loader while sending email
const SendEmailLoader =(params) => {


  const successMessage = ["Message Sent" , "Account Switched"];

    return (
        <div>
            <Modal className="modal-alert-header connect-wallet-account email-loader-send" open={params.isOpen}  closable={false} footer={null} >
                <div className='send-alert-body-content connect-wallet-account-div send-email'>

                    {(!successMessage.includes(params.msg)) && 
                        <div class="loader-value"></div>
                    }

                    <div className='label-title-metamask email-send-div key'> 
                    <div> {params.msg} </div>              

                    { params.msg === "Message Sent" &&
                        <VerifiedIcon/>                        
                    }
                    
                     </div>
                </div>
            </Modal>
        </div>
    )
}


const AddFolderModal = (params) =>{
  const [folderName, setFolderName] = useState('');
  
  return (
    <div>
      <Modal className="modal-alert-header add-quick-user-send-email" open={params.isOpen} onOk={params.close} onCancel={params.close} footer={null}>
        <div className='send-alert-body-content connect-wallet-account-div'>
              <input className="email-username" placeholder="Add a folder" value={folderName}  onChange={(e) => setFolderName(e.target.value)}  />            
        </div>

        <div className="send-alert-body-content connect-wallet-account-div footer-quick-send">              
            <button onClick={params.close} className="save-quick-send-btn cursor-pointer"> <DeleteIcon /> </button>
            <button className="save-quick-send-btn cursor-pointer" onClick={async (e)=> {
              e.preventDefault();
              if (!folderName.trim()) return;    
              const json ={name : folderName}
              await params.addFolder(json);
              params.action(false);
              setFolderName('');
            }}>Add Folder</button>
        </div>
      </Modal>
    </div>
)
}

const AddQuickAccessUser = (params) =>{
    const [userName, setUserName] = useState('');
    const [userEmail, setUserEmail] = useState('');

  return (
    <div>
        <Modal className="modal-alert-header add-quick-user-send-email" open={params.isModalOpen} onOk={params.close} onCancel={params.close} footer={null}>

          <>Add User</>
          <div className='send-alert-body-content connect-wallet-account-div'>
                <input className="email-username" placeholder="User Name" value={userName} onChange={(e)=> setUserName(e.target.value) }  />
                <input className="email-username" placeholder="User Email" value={userEmail}  onChange={(e)=> setUserEmail(e.target.value) }   />            
          </div>

          <div className="send-alert-body-content connect-wallet-account-div footer-quick-send">              
             <button onClick={params.close} className="save-quick-send-btn cursor-pointer"> <DeleteIcon /> </button>
             <button className="save-quick-send-btn cursor-pointer" onClick={async ()=> {
                const json ={name : userName, email : userEmail}
                await params.addQuickAccessUser(json);
                setUserName("")
                setUserEmail("")
                params.close();
             }}>SAVE</button>
          </div>
        </Modal>
    </div>
  )
}

const ReplyModal = (params) =>{ 

  const [sender, setSender] = useState('');
  const [receiver, setReceiver] = useState('');
  const [subject, setSubject] = useState('');
  const [senderLoader, setSenderLoader] = useState('');  
  const [check, setCheck] = useState(true);  
  const [user] = useState(cookies.get("userObject"));

  const headerJson = JSON.parse(optionalValidation(params , "msg.emailObject.header"));
  const created_at = optionalValidation(params , "msg.emailObject.created_at");
  const decryptedMessage = optionalValidation(params , "decryptedMessage");
  const formattedDate = moment(created_at, 'M/D/YYYY h:mm A').format('DD-MM-YYYY hh:mm a');
  
  useEffect(() => {
    setSender(user && user.name);
    setReceiver(optionalValidation(params , "msg.emailObject.sender"));
    if (headerJson.subject.startsWith("Re: ")) {
      // Remove "Re: " from the beginning of the string
      headerJson.subject = headerJson.subject.substring(4);
  }
    setSubject(`Re: ${headerJson.subject}`);
  }, []);
  
  // compose editor
  const Editor = ({ placeholder  , check }) => {

    const [editorHtml, setEditorHtml] = useState(localStorage.getItem("replyEmail") || "");
    const [isTyped, setIsTyped] = useState(false);
    const [theme] = useState('snow');

    const html = `<div>
      <p><br></p> 
        <p><br>---------------------------------------------------------------------</p>
          <p>On ${formattedDate}, ${receiver} wrote:</p> 
        <blockquote>${decryptedMessage} </blockquote>
      <p></p>
    </div>`;


    useEffect(() => {
      if(!check){
        localStorage.setItem("replyEmail", "");
        setIsTyped(true);   
        setEditorHtml('');
      }
    }, [check]);


    useEffect(() => {
      const editor = document.querySelector('.ql-editor');
      if (editor) {
        editor.focus();
      }
    }, [document.querySelector('.ql-editor')]);


    return (
      <div className="quil-text-editor">
        <ReactQuill theme={theme} onChange={async (e)=> {
          if(!senderLoader){
            setTimeout(function() {
              setIsTyped(true);      
            }, 1000);
  
            localStorage.setItem("replyEmail", e);
            setEditorHtml(e);
          }

        } } value={isTyped ? editorHtml : html} modules={Editor.modules} formats={Editor.formats} placeholder={placeholder} />
        <div className="send-reply-email" onClick={ async ()=> {
          const recipient = receiver;
          const cc = ""
          const bcc = ""
          const props = { handleCancel : params.close }
          await sendEmails(recipient.replace(/\s/g, '').split(",") , cc.replace(/\s/g, '').split(",") , bcc.replace(/\s/g, '').split(",") , subject, localStorage.getItem("replyEmail") , props , false , "OK");
          setSenderLoader(true);
            setTimeout(function() {
              setSenderLoader(false);      
            }, 5000);
        }}> {  senderLoader ? <div class="loader-ring-reply"></div> : "Send Reply"} </div>
      </div>
    );
  };

  // textbox editor spec
  Editor.propTypes = { placeholder: PropTypes.string };
  Editor.modules = { toolbar: editorConstant.toolBar };
  Editor.formats = editorConstant.format;


return (
  <div>

      <Modal className="modal-send-email-header parent-div-content-reply-mail" open={params.isModalOpen} onOk={params.close} onCancel={params.close} footer={null}>
          <div className="parent-div-content-reply-mail-child">
      <div className='label-title-check-box'> Include Reply Message                   
                          <input
                            type="checkbox"
                            id ="check-box-reply-email"
                            checked={check}
                            onChange={()=> {
                              setCheck(!check);                              
                            }}
                        />  
                        
                        </div>
                <div className='send-alert-body-content connect-wallet-account-div reply-email-user'>
                    <div className="email-username reply-user"> 
                           <span>Sender :</span>
                           <input className="reply-user-input" value={sender} />
                     </div>
                    <div className="email-username reply-user">
                            <span>Recipient :</span>
                            <input className="reply-user-input"  value={receiver} />                    
                    </div>    

                      <div className="email-username reply-user">
                            <span>Topic :</span>
                            <input className="reply-user-input"  value={subject} />                    
                    </div>          
                </div>
                    <Editor placeholder="Write something..." check ={check} />
          </div> 
      </Modal>
  </div>
)
}

export {
    ConnectWallet,
    SendEmailLoader,
    AddFolderModal ,
    AddQuickAccessUser,
    ReplyModal
}
