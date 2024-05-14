import React, { useState } from 'react';
import { copyEmail } from '../../helper/email-helper';
import Cookies from "universal-cookie";


const cookies = new Cookies();

const ContextMenu = ({ x, y, onClose , types , selectedContext }) => {
    const [visible, setVisible] = useState(true); // State to manage visibility of the context menu
    const [user] = useState(cookies.get("userObject"));

    // Function to handle click outside of the context menu
    const handleClickOutside = (event) => {
        if (!event.target.closest('.contextMenu')) {
            onClose(); // Close the context menu
        }
    };

    // Attach click event listener to handle clicks outside of the context menu
    React.useEffect(() => {
        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    // Style object to position the context menu
    const style = {
        position: 'fixed',
        left: x + 'px',
        top: y + 'px',
        background: 'white'
    };

    // Function to handle context menu option click
    const handleOptionClick = async (folderName) => {
        await copyEmail(selectedContext , folderName , user.name );
        // Add your logic here
        onClose(); // Close the context menu
    };

    return (
        visible && (
            <div className="contextMenu" style={style}>
                {types.length > 0 &&  types.map((item, index) => (
                   <div className="contextMenu--option cursor-pointer" onClick={()=> handleOptionClick(item) }>
                         Copy to {item.name}
                     </div>
                ))}
            </div>
        )
    );
};

export default ContextMenu;
