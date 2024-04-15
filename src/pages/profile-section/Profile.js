import React from 'react'
import styled from "styled-components";
import { Settings } from "@styled-icons/evaicons-solid/Settings";
import { AccountCircle } from "@styled-icons/material-twotone/AccountCircle";
import { GridDots } from "@styled-icons/fluentui-system-filled/GridDots";
import { ErrorWarning } from "@styled-icons/remix-line/ErrorWarning";
import "./profile.css"
import { Link, useNavigate } from "react-router-dom";


const iconStyles = `color: #4a88c5; width: 20px; height: 20px;`;

const SettingsIcon = styled(Settings)` ${iconStyles}`;
const AccountCircleIcon = styled(AccountCircle)` ${iconStyles} `;
const GridDotsIcon = styled(GridDots)`${iconStyles}`;
const ErrorWarningIcon = styled(ErrorWarning)`${iconStyles}`;

const Profile = () => {
  const navigate = useNavigate();

  const icons = [
    {
      component: <ErrorWarningIcon />,
      to: "notify"
    },
    {
      component: <SettingsIcon />,
      to: "settings"
    },
    {
      component: <GridDotsIcon />,
      to: "grid"
    },
    {
      component: <AccountCircleIcon />,
      to: "profile"
    }
  ];


  return (
    <div className='profile-section-head'>
        <div className='profile-section-body'>
          {icons.map((item, index) => (
          <React.Fragment key={index}>
            {React.cloneElement(item.component, { onClick: () => navigate(`/${item.to}`) })}
          </React.Fragment>
        ))}
        </div>
    </div>
  )
}

export default Profile
