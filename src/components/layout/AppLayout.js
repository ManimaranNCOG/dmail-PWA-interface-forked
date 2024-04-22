import React, { useState , useEffect } from 'react';
import { Outlet } from "react-router-dom";
import Sidebar from "../sidebar/Sidebar";
import InitialFooter from "../common-element/InitialFooter";
import styled from "styled-components";
import { Menu } from "@styled-icons/entypo/Menu";

const iconStyles = `color: #4a88c5; width: 50px; height: 30px;`;
const MenuIcon = styled(Menu)`${iconStyles}`;


const AppLayout = () => {
  const currentPath = window.location.pathname.split("/")[1];
  const pageCondition = (!currentPath || currentPath ===  'register');

    const [isModalOpen, setIsModalOpen] = useState(!pageCondition);

    useEffect(() => {
        const handleClick = () => {
          setIsModalOpen(false);
        };    
        window.addEventListener('isMenuClicked', handleClick);    
        const pageCondition = (!currentPath || currentPath ===  'register');
        if(!pageCondition) setIsModalOpen(true);
        return () => {
          window.removeEventListener('isMenuClicked', handleClick);
        };
      }, []); // Empty dependency array to run effect only once


    if(isModalOpen){
        return (    
        <div className='with-sidebar-comp' style={{  padding: '25px 50px 0px 370px' ,transition: 'padding 0.5s ease 0s' }}>
            <Sidebar className={true}  />
            <Outlet />
        </div>
        );

    }else{

      const currentPath = window.location.pathname.split("/")[1];
      let isButtonRender = true;
      

      if(!currentPath || currentPath ===  'register'){
        isButtonRender = false;
      }

        return (    
            <div style={{  padding: '25px 80px 0px' , transition: 'padding 0.5s ease 0s'   }}>
                {isButtonRender && <Sidebar  className={false}  /> }
                {isButtonRender && 
                  <div className='no-menu-top-header absolute'> 
                  <button className='open-btn-menu-home absolute' onClick={(e)=> { setIsModalOpen(true) }}><MenuIcon /></button>
                  </div>
                }
                <Outlet />
                {!isButtonRender && <InitialFooter /> }                
            </div>
            );
    }


};

export default AppLayout;
