import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-analytics.js";
import { getDatabase, ref, set, get, update, push } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-database.js"; // Importing the Realtime Database functions

const firebaseConfig = {
  apiKey: "AIzaSyBJS3__rGkW0-Hfa-AQ9IJ44haB7ObTOLk",
  authDomain: "my-project-9c723.firebaseapp.com",
  databaseURL: "https://my-project-9c723-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "my-project-9c723",
  storageBucket: "my-project-9c723.appspot.com",
  messagingSenderId: "541445396586",
  appId: "1:541445396586:web:ed309c68e61de64dfe1213",
  measurementId: "G-M7DLQCP2SN"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);


const modalCons = document.getElementById("modal-cons");
const modelEditProfile = document.getElementById("modal-edit-profile");
const overlay = document.querySelector(".overlay");
const openModalAddConsBtn = document.getElementById("btn-open-model-add-cons");
const closeModalBtn = document.querySelector(".btn-close");

const listConsTbody = document.getElementById("list-cons-tbody");

// DOM Add construction modal
const titleCons = document.getElementById("title-cons");
const nameCons = document.getElementById("name-cons");
const startDateCons = document.getElementById("startdate-cons");
const finishDateCons = document.getElementById("finishdate-cons");
const statusCons = document.getElementById("status-cons");
const generalProgressCons = document.getElementById("generalProgress-cons");
const detailedDescriptionCons = document.getElementById("detailDescription-cons");
const memberCons = document.getElementById("member-cons");
const listMemberCons = document.getElementById("listMember-cons");
const jobNameCons = document.getElementById("jobName-cons");
const jobDescriptionCons = document.getElementById("jobDescription-cons");
const executorCons = document.getElementById("executor-cons");
const listJobsCons = document.getElementById("listJobs-cons");
const btnSubmitCons = document.getElementById("btnSubmit-cons");

// DOM Edit profile modal
const fullNameProfileModal = document.getElementById("fullName-profile-modal");
const phoneProfileModal = document.getElementById("phone-profile-modal");
const emailProfileModal = document.getElementById("email-profile-modal");

const fullNameProfile = document.getElementById("fullName-profile");
const phoneProfile = document.getElementById("phone-profile");
const emailProfile = document.getElementById("email-profile");

var statusModalEditCons = false
var idConsEdit = null

const statusConstruction = [
  {
    id: 1,
    name: "Đang thực hiện",
    textColor: "#ffa127"
  },
  {
    id: 2,
    name: "Hoàn thành",
    textColor: "#00b14f"
  },
  {
    id: 3,
    name: "Tạm ngưng",
    textColor: "#555555"
  },
  {
    id: 4,
    name: "Đã huỷ",
    textColor: "red"
  }
]

let listConstruction = []

// let listConstruction = [
//   {
//     id: 1,
//     name: "Công trình 1",
//     startDate: "2014-01-02T11:42",
//     finishDate: "2014-01-02T11:42",
//     status: 1,
//     detailedDescription: "Mô tả chi tiết",
//     members: ["Nguyễn Văn A", "Nguyễn Văn B", "Nguyễn Văn C"],
//     jobs: [
//       {
//         jobName: "Công việc 1",
//         description: "Mô tả công việc 1",
//         progress: 2,
//         executor: "Nguyễn Văn B"
//       },
//       {
//         jobName: "Công việc 2",
//         description: "Mô tả công việc 2",
//         progress: 5,
//         executor: "Nguyễn Văn A, Nguyễn Văn C"
//       }
//     ]
//   }
// ]

let userProfile = {
  fullName: "",
  phone: "",
  email: ""
}

const getDataFirebase = (code) => {
  const database = getDatabase(); 
  const dataRef = ref(database, code); 

  get(dataRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        userProfile = data.userProfile || [];
        listConstruction = data.listConstruction.list || [];
      } else {
        userProfile = {
          fullName: "",
          phone: "",
          email: ""
        }
        listConstruction = []
      }
      loadDataForTable()
      loadUserProfile();
    })
    .catch((error) => {
      console.error("Error getting data from the database:", error);
    });
}

const urlParams = new URLSearchParams(window.location.search);
let identifier = urlParams.get('id');
getDataFirebase(identifier)

const openModalCons = () => {
  modalCons.classList.remove("hidden");
  overlay.classList.remove("hidden");
};

window.openModalEditProfile = () => {
  modelEditProfile.classList.remove("hidden");
  overlay.classList.remove("hidden");

  fullNameProfileModal.value = userProfile.fullName
  phoneProfileModal.value = userProfile.phone
  emailProfileModal.value = userProfile.email
}

window.closeModal = () => {
  modelEditProfile.classList.add("hidden");
  modalCons.classList.add("hidden");
  overlay.classList.add("hidden");

  listNewMembers = []
  lisNewJobs = []
  resetModelCons();
};

openModalAddConsBtn.addEventListener("click", () => {
  openModalCons();

  generalProgressCons.parentElement.style.display = "none"
  titleCons.innerHTML = "Thêm mới công trình"
  btnSubmitCons.innerHTML = "Xong"
  btnSubmitCons.style.backgroundColor = null

  statusModalEditCons = false

});

closeModalBtn.addEventListener("click", closeModal);
overlay.addEventListener("click", closeModal);

window.deleteItem = (id) => {
  let text = "Bạn có chắc chắn muốn xoá không?";
  if (confirm(text) == true) {
    let newList = listConstruction.filter(val => val.id != id)
    listConstruction = [...newList]

    const database = getDatabase(); 
    const dataRef = ref(database, `${identifier}/listConstruction`);
  
    update(dataRef, {list: listConstruction})
    .then(() => {
      console.log("Data was successfully updated in the database.");
    })
    .catch((error) => {
      console.error("Error updating data in the database:", error);
    });

    loadDataForTable()
  }
}

let listNewMembers = []
window.handleAddNewMember = () => {
  let name = memberCons.value
  memberCons.value = ""
  memberCons.focus()
  listNewMembers = [...listNewMembers, name]

  const newItem = `<li>${name} <span style="margin-left: 5px; cursor: pointer;" onclick="handleDeleteMember(${listNewMembers.length})">&times;</span></li>`;
  listMemberCons.innerHTML += newItem;
}
memberCons.addEventListener("keypress", function(event) {
  if (event.key === "Enter") {
      event.preventDefault();
      handleAddNewMember();
  }
});

window.handleDeleteMember = (i) => {
  let newList = listNewMembers.filter((val,index) => index != i)
  listNewMembers = [...newList]

  listMemberCons.innerHTML = ""

  listNewMembers.map((val,index) => {
    listMemberCons.innerHTML += `<li>${val} <span style="margin-left: 5px; cursor: pointer;" onclick="handleDeleteMember(${index})">&times;</span></li>`;
  })
}


// Handle List Jobs
let lisNewJobs = []
window.handleAddNewJob = () => {
  let jobName = jobNameCons.value
  let description = jobDescriptionCons.value
  let executor = executorCons.value
  let progress = 0

  jobNameCons.value = ""
  jobDescriptionCons.value = ""
  executorCons.value = ""

  lisNewJobs = [
    ...lisNewJobs,
    {
      jobName,
      description,
      executor,
      progress
    }
  ]

  let newItem = null
  if(statusModalEditCons){
    newItem = `
      <div>
        <h4>${lisNewJobs.length}. ${jobName} <span style="margin-left: 5px; cursor: pointer;" onclick="handleDeleteJob(${lisNewJobs.length-1})">&times;</span></h4>
        <p>- Mô tả: ${description}</p>
        <div >
            <span>- Tiến độ: </span>
            <input type="range" max="5" min="0" value="0" name="input-progress" />
        </div>
        <p>- Người thực hiện: ${executor}</p>
      </div>
    `
  }else{
    newItem = `
      <div>
        <h4>${lisNewJobs.length}. ${jobName} <span style="margin-left: 5px; cursor: pointer;" onclick="handleDeleteJob(${lisNewJobs.length-1})">&times;</span></h4>
        <p>- Mô tả: ${description}</p>
        <p>- Người thực hiện: ${executor}</p>
      </div>
    `
  }

   
  listJobsCons.innerHTML += newItem
}

window.handleDeleteJob = (i) => {
  let newList = lisNewJobs.filter((val,index) => index != i)
  lisNewJobs = [...newList]

  listJobsCons.innerHTML = ""

  if(statusModalEditCons){
    lisNewJobs.map((val,index) => {
      listJobsCons.innerHTML += `
        <div>
          <h4>${index+1}. ${val.jobName} <span style="margin-left: 5px; cursor: pointer;" onclick="handleDeleteJob(${index})">&times;</span></h4>
          <p>- Mô tả: ${val.description}</p>
          <div >
              <span>- Tiến độ: </span>
              <input type="range" max="5" min="0" value="${val.progress}" name="input-progress" />
          </div>
          <p>- Người thực hiện: ${val.executor}</p>
        </div>
      `;
    })
  }else{
    lisNewJobs.map((val,index) => {
      listJobsCons.innerHTML += `
        <div>
          <h4>${index+1}. ${val.jobName} <span style="margin-left: 5px; cursor: pointer;" onclick="handleDeleteJob(${index})">&times;</span></h4>
          <p>- Mô tả: ${val.description}</p>
          <p>- Người thực hiện: ${val.executor}</p>
        </div>
      `;
    })
  }
}

window.handleAddConstruction = () => {
  let name = nameCons.value
  let startDate = startDateCons.value
  let finishDate = finishDateCons.value
  let status = statusCons.value
  let detailedDescription = detailedDescriptionCons.value
  let members = [...listNewMembers]
  let jobs = [...lisNewJobs]
  

  if(statusModalEditCons){
    listConstruction = listConstruction.map(val => {
      if(val.id==idConsEdit){
        let inputProgress = document.getElementsByName('input-progress');
        let jobUpdate = jobs.map((val,index) => {
          return {
            ...val,
            progress: inputProgress[index].value
          }
        })

        let newVal = {...val,
          name,
          startDate,
          finishDate,
          status,
          detailedDescription,
          members,
          jobs: jobUpdate
        }
        return newVal
      }
      return val
    })
    
    loadDataForTable()
  }else{
    let id = generateUniqueId()
    let newConstruction = {
      id,
      name,
      startDate,
      finishDate,
      status,
      detailedDescription,
      members: members,
      jobs: jobs
    }
  
    listConstruction = [...listConstruction, newConstruction]

    

    let newItem = `
      <tr>
        <td>${listConstruction.length}</td>
        <td style="text-align: left; padding: 5px 15px; text-align: justify;">${name}</td>
        <td>${formatDate(startDate)}</td>
        <td style="color: ${statusConstruction.find(val => val.id == status).textColor}; font-weight: 500;">${statusConstruction.find(val => val.id == status).name}</td>
        <td class="features-col">
            <button onclick="handleEditConstruction('${id}')"><i class="fa-solid fa-eye"></i></button>
            <button onclick="deleteItem('${id}')"><i class="fa-solid fa-trash-can"></i></button>
        </td>
      </tr>
    `
    listConsTbody.innerHTML += newItem
  }

  const database = getDatabase(); 
  const dataRef = ref(database, `${identifier}/listConstruction`);

  update(dataRef, {list: listConstruction})
  .then(() => {
    console.log("Data was successfully updated in the database.");
  })
  .catch((error) => {
    console.error("Error updating data in the database:", error);
  });

  closeModal()
}

const formatDate = (timestamp) => {
  const date = new Date(timestamp);

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
  const year = date.getFullYear();

  const formattedDate = `${hours}:${minutes} ${day}/${month}/${year}`;

  return formattedDate;
}

window.handleEditConstruction = (id) => {
  openModalCons();
  generalProgressCons.parentElement.style.display = "block"
  titleCons.innerHTML = "Chỉnh sửa công trình"
  btnSubmitCons.innerHTML = "Lưu"
  btnSubmitCons.style.backgroundColor = "#ffa127"

  statusModalEditCons = true
  idConsEdit = id

  let consEdit = listConstruction.find(val => val.id == id)

  nameCons.value = consEdit.name
  startDateCons.value = consEdit.startDate
  finishDateCons.value = consEdit.finishDate
  statusCons.value = consEdit.status
  generalProgressCons.innerHTML = consEdit.jobs?`${consEdit.jobs.filter(val => val.progress == 5).length}/${consEdit.jobs.length}`:"0/0"
  detailedDescriptionCons.value = consEdit.detailedDescription

  listMemberCons.innerHTML = ""
  listJobsCons.innerHTML = ""

  listNewMembers = consEdit.members?[...consEdit.members] : []
  lisNewJobs = consEdit.jobs?[...consEdit.jobs] : []

  listNewMembers.map((val,index) => {
    listMemberCons.innerHTML += `<li>${val} <span style="margin-left: 5px; cursor: pointer;" onclick="handleDeleteMember(${index})">&times;</span></li>`;
  })

  lisNewJobs.map((val,index) => {
    listJobsCons.innerHTML += `
      <div>
        <h4>${index+1}. ${val.jobName} <span style="margin-left: 5px; cursor: pointer;" onclick="handleDeleteJob(${index})">&times;</span></h4>
        <p>- Mô tả: ${val.description}</p>
        <div >
            <span>- Tiến độ: </span>
            <input type="range" max="5" min="0" value="${val.progress}" name="input-progress" />
        </div>
        <p>- Người thực hiện: ${val.executor}</p>
      </div>
    `
  })
}

window.handleSaveProfile = () => {
  userProfile = {
    fullName: fullNameProfileModal.value,
    phone: phoneProfileModal.value,
    email: emailProfileModal.value
  }

  const database = getDatabase(); 
  const dataRef = ref(database, `${identifier}/userProfile`); 

  update(dataRef, userProfile)
    .then(() => {
      console.log("Data was successfully updated in the database.");
    })
    .catch((error) => {
      console.error("Error updating data in the database:", error);
    });

  loadUserProfile()
  closeModal()
}

const generateUniqueId = () => {
  const randomString = Math.random().toString(36).substring(2, 15);
  const timestamp = Date.now();
  return `${randomString}${timestamp}`;
}

const resetModelCons = () => {
  nameCons.value = ""
  startDateCons.value = ""
  finishDateCons.value = ""
  statusCons.value = 1
  detailedDescriptionCons.value = ""
  memberCons.value = ""
  listMemberCons.innerHTML = ""
  jobNameCons.value = ""
  jobDescriptionCons.value = ""
  executorCons.value = ""
  listJobsCons.innerHTML = ""
}

const loadDataForTable = () => {
  listConsTbody.innerHTML = null

  listConstruction.map((val,index)=>{
    listConsTbody.innerHTML += `
    <tr>
      <td>${index+1}</td>
      <td style="text-align: left; padding: 5px 15px; text-align: justify;">${val.name}</td>
      <td>${formatDate(val.startDate)}</td>
      <td style="color: ${statusConstruction.find(value => value.id == val.status).textColor}; font-weight: 500;">${statusConstruction.find(value => value.id == val.status).name}</td>
      <td class="features-col">
          <button onclick="handleEditConstruction('${val.id}')"><i class="fa-solid fa-eye"></i></button>
          <button onclick="deleteItem('${val.id}')"><i class="fa-solid fa-trash-can"></i></button>
      </td>
    </tr>
  `
  })
}
loadDataForTable()

const loadUserProfile = () => {
  fullNameProfile.innerHTML = `Họ tên: ${userProfile.fullName}`
  phoneProfile.innerHTML = `SĐT: ${userProfile.phone}`
  emailProfile.innerHTML = `Email: ${userProfile.email}`
}
loadUserProfile();


















function writeData() {
    const database = getDatabase(); // Get a reference to the database
    const dataRef = ref(database, 'mycode/name'); // Replace 'path/to/data' with the path where you want to write the data

    const dataToWrite = {
        name: "John Doe",
        age: 30,
        email: "john.doe@example.com"
        // Add more properties as needed
    };

    // Use the 'set' method to write the data to the specified location in the database
    set(dataRef, dataToWrite)
        .then(() => {
        console.log("Data was successfully written to the database.");
        })
        .catch((error) => {
        console.error("Error writing data to the database:", error);
    });
}
//writeData();

function getData() {
  const database = getDatabase(); // Get a reference to the database
  const dataRef = ref(database, 'mycode/name'); // Replace 'path/to/data' with the path from where you want to fetch the data

  // Use the 'get' method to retrieve the data from the specified location
  get(dataRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        console.log("Data retrieved from the database:", data);
      } else {
        console.log("No data available at the specified location.");
      }
    })
    .catch((error) => {
      console.error("Error getting data from the database:", error);
    });
}

// Call the getData function to retrieve data from the database
//getData();


function updateData() {
  const database = getDatabase(); // Get a reference to the database
  const dataRef = ref(database, 'mycode/name'); // Replace 'path/to/data' with the path where you want to update the data

  const updateData = {
    age: 31, // Updating the 'age' property
    city: "New York" // Adding a new property 'city'
  };

  // Use the 'update' method to update specific properties of the data at the specified location
  update(dataRef, updateData)
    .then(() => {
      console.log("Data was successfully updated in the database.");
    })
    .catch((error) => {
      console.error("Error updating data in the database:", error);
    });
}


// Call the updateData function to update data in the database
//updateData();

async function addToArray() {
  const database = getDatabase(); // Get a reference to the database
  const arrayRef = ref(database, 'mycode/name/list'); // Replace 'path/to/array' with the path where your array is located

  // Fetch the current array data from the database
  const snapshot = await get(arrayRef);
  const currentArray = snapshot.val() || [];

  // Add the new data to the array
  const newData = {
    item: "New item",
    quantity: 1
    // Add more properties as needed for your array items
  };

  currentArray.push(newData);

  // Set the updated array back to the database
  set(arrayRef, currentArray)
    .then(() => {
      console.log("Data was successfully added to the array in the database.");
    })
    .catch((error) => {
      console.error("Error adding data to the array in the database:", error);
    });
}

// Call the addToArray function to add data to the array in the database
//addToArray();






// Function to add data to the array in the database
function addToArray1() {
  const database = getDatabase(); // Get a reference to the database
  const arrayRef = ref(database, 'mycode/name/list1'); // Replace 'path/to/array' with the path where your array is located

  const newData = {
    item: "New item",
    quantity: 1
    // Add more properties as needed for your array items
  };

  // Use the 'push' method to add the new data to the array
  push(arrayRef, newData)
    .then(() => {
      console.log("Data was successfully added to the array in the database.");
    })
    .catch((error) => {
      console.error("Error adding data to the array in the database:", error);
    });
}

// Call the addToArray function to add data to the array in the database
//addToArray1();








async function updateElementInArray() {
  const database = getDatabase(); // Get a reference to the database
  const arrayRef = ref(database, 'mycode/name/list'); // Replace 'path/to/array' with the path where your array is located

  // Fetch the current array data from the database
  const snapshot = await get(arrayRef);
  const currentArray = snapshot.val() || [];

  // Find the index of the element you want to update in the array
  const elementIndexToUpdate = currentArray.findIndex((val, index) => index == 0); // Replace 'ELEMENT_ID_TO_UPDATE' with the unique identifier of the element

  // If the element exists in the array, update it
  if (elementIndexToUpdate !== -1) {
    const updatedElement = {
      ...currentArray[elementIndexToUpdate],
      quantity:10,
      propertyToUpdate: "New value" // Modify the property you want to update
    };

    currentArray[elementIndexToUpdate] = updatedElement;

    // Set the updated array back to the database
    set(arrayRef, currentArray)
      .then(() => {
        console.log("Element was successfully updated in the array in the database.");
      })
      .catch((error) => {
        console.error("Error updating element in the array in the database:", error);
      });
  } else {
    console.log("Element not found in the array.");
  }
}

// Call the updateElementInArray function to update an element in the array in the database
//updateElementInArray();




async function deleteElementFromArray() {
  const database = getDatabase(); // Get a reference to the database
  const arrayRef = ref(database, 'mycode/name/list'); // Replace 'path/to/array' with the path where your array is located

  // Fetch the current array data from the database
  const snapshot = await get(arrayRef);
  const currentArray = snapshot.val() || [];

  // Find the index of the element you want to delete in the array
  const elementIndexToDelete = currentArray.findIndex((val, index) => index == 1); // Replace 'ELEMENT_ID_TO_DELETE' with the unique identifier of the element

  // If the element exists in the array, delete it
  if (elementIndexToDelete !== -1) {
    currentArray.splice(elementIndexToDelete, 1); // Remove the element from the array

    // Set the updated array back to the database
    set(arrayRef, currentArray)
      .then(() => {
        console.log("Element was successfully deleted from the array in the database.");
      })
      .catch((error) => {
        console.error("Error deleting element from the array in the database:", error);
      });
  } else {
    console.log("Element not found in the array.");
  }
}

// Call the deleteElementFromArray function to delete an element from the array in the database
//deleteElementFromArray();