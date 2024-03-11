const db = require('./db')
const {getDateTimeId} = require("./utils/utils")
const addUser = ({user})=>{
    const {email} = user
    console.log(email);
   return db.User.findOne({email}).then((result)=>{
    console.log(result);
     if(result){
        return {
            statusCode:400,
            message:"User already exist"
        }
     }else{
        const newUser = new db.User({
            id:email,
            ...details.user
        })
        newUser.save()
     }
     return {
        statusCode:200,
        message:"User added successfully"
    }
   }).catch(error=>{
    return {
        statusCode:400,
        message:"Something went wrong"
    }
   })
}

const getUser = ({email})=>{
    return db.User.findOne({email}).then((result)=>{
        if(result){
            const {id,email,name,task} = result
            return {
                result :{ statusCode:200,message:"" },
                details:{id,email,name,task}
            }
        }else{
            return {
                result :{ statusCode:400,message:"User not found" },
                details:{}
            }
        }
    }).catch(error=>{
        return {
            result :{ statusCode:400,message:"Something went wrong" },
            details:{}
        }
    })
}



const operations = async ({params})=>{
  const {operation,email,data} = params
  switch(operation){
    case "post" :
        return await addTask(email,data)
    case "delete" :
      return await deleteTask(email,data)
    case "update":
        return await updateTask(email,data)
      default :
        return  {
            statusCode:400,
            message:"Invalid operation"
        }
  }

}

const addTask = async (email,newTask)=>{
    try {
        const userDetails = await getUser({email})
        const {result,details} = userDetails
        if(result.statusCode == 200){
               const {task} = details
               task.push({...newTask,id:getDateTimeId()})
           try {
              const postResult = await db.User.findOneAndUpdate({email},{task},{new:true})
              console.log(postResult);
              const {id,name,task:newTaskSet} = postResult
              return {
                result :{ statusCode:200,message:"Task added successfully" },
                details:{id,email,name,task:newTaskSet}
            }
           } catch (error) {
            console.log(error);
            return {
                result :{ statusCode:500,message:"operation failed" },
                details:{}
            } 
           }
        }else{
            return {
                result :{ statusCode:500,message:"operation failed" },
                details:{}
            } 
        }
    } catch (error) {
        return {
            result :{ statusCode:400,message:"Something went wrong" },
            details:{}
        }
    }
  
 }

const deleteTask =async (email,taskToDelete)=>{
    const {id:taskId} = taskToDelete
    try {
        const userDetails = await getUser({email})
        const {result,details} = userDetails
        if(result.statusCode == 200){
               const currentTask = details.task
               const task = currentTask.filter(item=>item.id != taskId)
           try {
              const postResult = await db.User.findOneAndUpdate({email},{task},{new:true})
              console.log(postResult);
              const {id,name,task:updatedask} = postResult
              return {
                result :{ statusCode:200,message:"Task deleted successfully" },
                details:{id,email,name,task:updatedask}
            }
           } catch (error) {
            return {
                result :{ statusCode:500,message:"operation failed 1" },
                details:{}
            } 
           }
        }else{
            return {
                result :{ statusCode:500,message:"operation failed 1" },
                details:{}
            } 
        }
    } catch (error) {
        return {
            result :{ statusCode:400,message:"Something went wrong" },
            details:{}
        
    }
}
}

const updateTask =async (email,taskToUpdate)=>{
    const {id:taskId,status} = taskToUpdate
    try {
        const userDetails = await getUser({email})
        const {result,details} = userDetails
        if(result.statusCode == 200){
               const currentTask = details.task
               const task = currentTask.map(item=>{
                  if(item.id == taskId){
                    return {...taskToUpdate,status:!status}
                  }
                  return item
               })
           try {
              const postResult = await db.User.findOneAndUpdate({email},{task},{new:true})
              console.log(postResult);
              const {id,name,task:updatedask} = postResult
              return {
                result :{ statusCode:200,message:"Task updated successfully" },
                details:{id,email,name,task:updatedask}
            }
           } catch (error) {
            return {
                result :{ statusCode:500,message:"operation failed 1" },
                details:{}
            } 
           }
        }else{
            return {
                result :{ statusCode:500,message:"operation failed 1" },
                details:{}
            } 
        }
    } catch (error) {
        return {
            result :{ statusCode:400,message:"Something went wrong" },
            details:{}
        
    }
}
}

const getTask = ({email})=>{


   return email
}
module.exports={
    addUser,
    getUser,
    getTask,
    operations,
}