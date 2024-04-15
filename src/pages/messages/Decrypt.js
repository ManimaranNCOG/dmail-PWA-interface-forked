import 'react-quill/dist/quill.snow.css';

const Decrypt = (props) => {
    return  <div  dangerouslySetInnerHTML={{ __html: props.data }} />
}

export default Decrypt;