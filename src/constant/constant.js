module.exports = {
    web3Constant : {
        invalidAddress : "0x0000000000000000000000000000000000000000", 
        signMessage : "hi there (from Web3)! \n\nTo ensure your ownership of this address, we need you to sign this message. \n\nThis request WILL NOT trigger a blockchain transaction or cost you any gas fees.",
        loginMessage : "I accept the ncog Terms of Service: \n\nURI:\nhttps://app.ncog.com\n\nVersion:\n1\n\nChain ID:\n1\n\n\n\n"
    } ,
    editorConstant : {
        toolBar : [
            [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }],
            [{ 'size': [] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' },
            { 'indent': '-1' }, { 'indent': '+1' }],
            ['link', 'image', 'video', 'file'],
            ['clean']
          ] ,
        format : [
            'header', 'font', 'size',
            'bold', 'italic', 'underline', 'strike', 'blockquote',
            'list', 'bullet', 'indent',
            'link', 'image', 'video'
          ]
    }

}