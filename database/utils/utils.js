const getDateTimeId = ()=>{
    const currentDate = new Date();
   const str = currentDate.toString()
    return str.replace(/\s/g, '');
}

module.exports={
    getDateTimeId
}