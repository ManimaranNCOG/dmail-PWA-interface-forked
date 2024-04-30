import 'react-quill/dist/quill.snow.css';

// decrypted message will be displayed here
const Decrypt = (props) => {
    return  <div  dangerouslySetInnerHTML={{ __html: props.data }} />
}

export default Decrypt;