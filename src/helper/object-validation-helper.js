// Function to operate the optional validation customizingly
export const optionalValidation = (obj, path, defaultValue=null) => {
    try{
        const properties = path.split(".");
        let result = obj;
        for (const prop of properties) {
          if (result === null || result === undefined) {
            return defaultValue;
          }
          result = result[prop];
        }
        return result !== undefined ? result : defaultValue;    
    }catch(err){
      return false    
    }
  
}


export const validateTheWebReturedValues = (obj) => {

  const filteredData = {};
  for (const key in obj) {
    if (!isNaN(key)) continue; // Skip if the key is a number
    filteredData[key] = obj[key];
  }


  if(filteredData && filteredData["__length__"]) delete filteredData["__length__"];
  return filteredData;
}



export const getCurrentDate = ()=> {

  const currentDateValue = new Date();
  const formattedDateTime = currentDateValue.toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric'
  }) + ' ' + currentDateValue.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
  });

  return formattedDateTime;
}