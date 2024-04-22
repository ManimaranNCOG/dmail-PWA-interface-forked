import React from 'react';
import styled from "styled-components";
import { Youtube } from "@styled-icons/boxicons-logos/Youtube";
import { Tiktok } from "@styled-icons/fa-brands/Tiktok";    
import { Instagram } from "@styled-icons/boxicons-logos/Instagram";    
import { FacebookCircle } from "@styled-icons/boxicons-logos/FacebookCircle";    
import { Linkedin } from "@styled-icons/fa-brands/Linkedin";    
import { TwitterOutline } from "@styled-icons/evaicons-outline/TwitterOutline";    


const iconStyles = `color: #62626A; width: 20px; height: 20px;`;
const YoutubeIcon = styled(Youtube)`${iconStyles}`;
const TiktokIcon = styled(Tiktok)`${iconStyles}`;
const InstagramIcon = styled(Instagram)`${iconStyles}`;
const FacebookCircleIcon = styled(FacebookCircle)`${iconStyles}`;
const LinkedinIcon = styled(Linkedin)`${iconStyles}`;
const TwitterOutlineIcon = styled(TwitterOutline)`${iconStyles}`;



function InitialFooter() {
    
    return (        
            <>         
                <div className='initial-footer-comp-element'>
                    <span> © Web3 mail All Rights Reserved. </span>
                    <span> English </span>
                    <span> Privacy Policy </span>
                    <span> Terms </span>
                    <TwitterOutlineIcon />
                    <YoutubeIcon />
                    <TiktokIcon />
                    <InstagramIcon />
                    <FacebookCircleIcon />
                    <LinkedinIcon />
                </div>   
            </>
    );
}

export default InitialFooter;
