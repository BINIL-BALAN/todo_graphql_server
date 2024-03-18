const db = require("./db");
const { getDateTimeId } = require("./utils/utils");
const fs = require("fs");

const addUser = (_, { user }) => {
  const { email, file, name } = user;

  //  console.log(file.encoded);
  return db.User.findOne({ email })
    .then((result) => {
      if (result) {
        return {
          statusCode: 400,
          message: "User already exist",
        };
      } else {
        let filePath = ""
        if (file?.encoded) {
            const base64Image = file.encoded;
            const binaryImage = Buffer.from(base64Image.split(';base64,').pop(), 'base64');
            filePath = 'assets/images/' + (name+"."+file.name.split(".")[1]);
            console.log(filePath);
            fs.writeFile(filePath, binaryImage, (err) => {
              if (err) {
                console.error('Error saving image:', err);
              } else {
                console.log('Image saved successfully');
              }
            });
        }
        const newUser = new db.User({
            id: email,
           image:filePath,
            ...user,
        });
        console.log(newUser);
        newUser.save()
        return {
          statusCode: 200,
          message: "User added successfully",
        };
      }
    })
    .catch((error) => {
      return {
        statusCode: 400,
        message: "Something went wrong",
      };
    });
};

const getUser = (_,{ email }) => {
    console.log(email);
  return db.User.findOne({ email })
    .then((result) => {
      if (result) {
        const { id, email, name, task,image } = result;
        return {
          result: { statusCode: 200, message: "" },
          details: { id, email, name,image, task },
        };
      } else {
        return {
          result: { statusCode: 400, message: "User not found" },
          details: {},
        };
      }
    })
    .catch((error) => {
      return {
        result: { statusCode: 400, message: "Something went wrong" },
        details: {},
      };
    });
};

const operations = async (_,{ params }) => {
  const { operation, email, data } = params;
  console.log(params);
  switch (operation) {
    case "post":
      return await addTask(email, data);
    case "delete":
      return await deleteTask(email, data);
    case "update":
      return await updateTask(email, data);
    default:
      return {
        statusCode: 400,
        message: "Invalid operation",
      };
  }
};

const addTask = async (email, newTask) => {
    // console.log(email);
  try {
    console.log("before",email);
    const userDetails = await getUser(null,{ email });
    console.log("after");
    const { result, details } = userDetails;
    if (result.statusCode == 200) {
      const { task } = details;
      task.push({ ...newTask, id: getDateTimeId() });
      console.log(task);
      try {
        const postResult = await db.User.findOneAndUpdate(
          { email },
          { task },
          { new: true }
        );
        console.log(postResult);
        const { id, name, task: newTaskSet } = postResult;
        return {
          result: { statusCode: 200, message: "Task added successfully" },
          details: { id, email, name, task: newTaskSet },
        };
      } catch (error) {
        console.log(error);
        return {
          result: { statusCode: 500, message: "operation failed" },
          details: {},
        };
      }
    } else {
      return {
        result: { statusCode: 500, message: "operation failed" },
        details: {},
      };
    }
  } catch (error) {
    return {
      result: { statusCode: 400, message: "Something went wrong" },
      details: {},
    };
  }
};

const deleteTask = async (email, taskToDelete) => {
  const { id: taskId } = taskToDelete;
  try {
    const userDetails = await getUser(null,{ email });
    const { result, details } = userDetails;
    if (result.statusCode == 200) {
      const currentTask = details.task;
      const task = currentTask.filter((item) => item.id != taskId);
      try {
        const postResult = await db.User.findOneAndUpdate(
          { email },
          { task },
          { new: true }
        );
        console.log(postResult);
        const { id, name, task: updatedask } = postResult;
        return {
          result: { statusCode: 200, message: "Task deleted successfully" },
          details: { id, email, name, task: updatedask },
        };
      } catch (error) {
        return {
          result: { statusCode: 500, message: "operation failed 1" },
          details: {},
        };
      }
    } else {
      return {
        result: { statusCode: 500, message: "operation failed 1" },
        details: {},
      };
    }
  } catch (error) {
    return {
      result: { statusCode: 400, message: "Something went wrong" },
      details: {},
    };
  }
};

const updateTask = async (email, taskToUpdate) => {
  const { id: taskId, status } = taskToUpdate;
  try {
    const userDetails = await getUser(null,{ email });
    const { result, details } = userDetails;
    if (result.statusCode == 200) {
      const currentTask = details.task;
      const task = currentTask.map((item) => {
        if (item.id == taskId) {
          return { ...taskToUpdate, status: !status };
        }
        return item;
      });
      try {
        const postResult = await db.User.findOneAndUpdate(
          { email },
          { task },
          { new: true }
        );
        console.log(postResult);
        const { id, name, task: updatedask } = postResult;
        return {
          result: { statusCode: 200, message: "Task updated successfully" },
          details: { id, email, name, task: updatedask },
        };
      } catch (error) {
        return {
          result: { statusCode: 500, message: "operation failed 1" },
          details: {},
        };
      }
    } else {
      return {
        result: { statusCode: 500, message: "operation failed 1" },
        details: {},
      };
    }
  } catch (error) {
    return {
      result: { statusCode: 400, message: "Something went wrong" },
      details: {},
    };
  }
};

const getTask = ({ email }) => {
  return email;
};
const getFormData = ({formData})=>{
    console.log(formData);
    return "data received"
}
module.exports = {
  addUser,
  getUser,
  getTask,
  operations,
  getFormData
};
