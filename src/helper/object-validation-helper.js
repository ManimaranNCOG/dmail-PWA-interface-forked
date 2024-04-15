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