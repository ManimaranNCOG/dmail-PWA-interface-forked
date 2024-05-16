import React, { useState, useEffect } from 'react';
import 'react-quill/dist/quill.snow.css';
import './decrypt.css'
import { formatDate } from '../../helper/email-helper';
import { ReplyModal } from '../modal-popup/CommonAlert';
  

// decrypted message will be displayed here
const Decrypt = (props) => {
  const [replyModal, setReplyModal] = useState(false);

    const headerDetails = props.emailObject && (props.emailObject.header ||  props.emailObject.receiver);
    let headerJson = null;
    if(headerDetails) headerJson = JSON.parse(headerDetails);

    return (

        <div class="px-6 py-5 bg-white shadow rounded-lg mb-4 md:mb-8">
        <div class="flex mb-4">
          <div class="flex-grow mr-2">
            <header class="flex md:flex-col xl:flex-row justify-between mr-2 mb-2 leading-snug">
              <div>
                <h1 class="text-lg font-semibold sender reply" onClick={()=> {
                  setReplyModal(true);
                  props.onCancel();
                }}>Reply Here</h1>
                <h1 class="text-lg font-semibold sender">{props.emailObject.subject}</h1>
                <h2 class="flex flex-wrap address-element">
                  <span class="text-gray-800">{`${props.emailObject.sender.split("@")[0]}`} <span className='address-spn'> { `<${props.emailObject.sender}>` }</span></span>
              <time class="flex flex-col items-end md:items-start xl:items-end text-xs xl:text-sm text-gray-700">
                <span>{formatDate(props.emailObject.created_at || props.emailObject.receivedDate)}</span>
              </time>
                </h2>

                {headerJson && headerJson.to.toString()  &&                 
                  <h2 class="flex flex-wrap address-element address-element-header-content">
                    <span>to</span>
                    <span>{headerJson.to.toString()}</span>
                  </h2>
                }

                {headerJson && headerJson.cc.toString() && 
                  <h2 class="flex flex-wrap address-element address-element-header-content">
                    <span>cc</span>
                    <span>{headerJson.cc.toString()}</span>
                  </h2>                
                }

              {headerJson && headerJson.bcc.toString() && (props.emailObject.isBCC || props.sentItem) &&
                  <h2 class="flex flex-wrap address-element address-element-header-content">
                    <span>bcc</span>
                    <span>{headerJson.bcc.toString()}</span>
                  </h2>
              }

              </div>
            </header>
          </div>
        </div>
        <div class="space-y-4">
         <div dangerouslySetInnerHTML={{ __html: props.data }} />
        </div>
        <ReplyModal  isModalOpen ={replyModal} close={() => setReplyModal(false)} msg={props} />
       </div>
    ) 
}

export default Decrypt;