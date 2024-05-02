import 'react-quill/dist/quill.snow.css';
import './decrypt.css'

function formatDate(dateString) {
    // Convert the dateString to a Date object
    const date = new Date(dateString);
    // Get the day of the week
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayOfWeek = days[date.getDay()];
    // Get the month
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    // Get the day of the month
    const day = date.getDate();
    // Get the hours and minutes
    const hours = date.getHours();
    const minutes = date.getMinutes();
    // Get the current date and time
    const currentDate = new Date();
    // Calculate the difference in milliseconds
    const difference = currentDate - date;
    // Convert milliseconds to days, hours, and minutes
    const daysAgo = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hoursAgo = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutesAgo = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    
    // Check if the date is today
    if (daysAgo === 0) {
      return `${hours}:${minutes < 10 ? '0' + minutes : minutes} (${hoursAgo === 0 ? minutesAgo + ' minutes ago' : hoursAgo + ' hours ago'})`;
    } else {
      return `${dayOfWeek}, ${day} ${month}, ${hours < 10 ? '0' + hours : hours}:${minutes < 10 ? '0' + minutes : minutes} (${daysAgo === 1 ? '1 day ago' : daysAgo + ' days ago'})`;
    }
  }

  

// decrypted message will be displayed here
const Decrypt = (props) => {
    console.log("props", props);
    return (

        <div class="px-6 py-5 bg-white shadow rounded-lg mb-4 md:mb-8">
        <div class="flex mb-4">
          <div class="flex-grow mr-2">
            <header class="flex md:flex-col xl:flex-row justify-between mr-2 mb-2 leading-snug">
              <div>
                <h1 class="text-lg font-semibold sender">{props.emailObject.subject}</h1>
                <h2 class="flex flex-wrap address-element">
                  <span class="text-gray-800">{`${props.emailObject.sender.split("@")[0]}`} <span className='address-spn'> { `<${props.emailObject.sender}>` }</span></span>
              <time class="flex flex-col items-end md:items-start xl:items-end text-xs xl:text-sm text-gray-700">
                <span>{formatDate(props.emailObject.created_at+" 10:24 am")}</span>
              </time>
                </h2>
              </div>
            </header>
          </div>
        </div>
        <div class="space-y-4">
         <div dangerouslySetInnerHTML={{ __html: props.data }} />
        </div>
       </div>
    ) 
}

export default Decrypt;