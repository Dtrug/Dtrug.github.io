
// CDN to connect Firebase Database
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-analytics.js";
import { getDatabase, ref, set, get, update, push } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-database.js"; // Importing the Realtime Database functions

// Configuration connect Firebase
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

// DOM other element of modal
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

// DOM Show profile
const fullNameProfile = document.getElementById("fullName-profile");
const phoneProfile = document.getElementById("phone-profile");
const emailProfile = document.getElementById("email-profile");

// variable remember status of Edit construction(true) or Add construction(false)
var statusModalEditCons = false
// ID of construction is editing
var idConsEdit = null

// Declare information of status construction
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

// Declare list of construction
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

// Declare profile of User
let userProfile = {
  fullName: "",
  phone: "",
  email: ""
}

// Get data of user from Firebase
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

// Get Id from URL
const urlParams = new URLSearchParams(window.location.search);
let identifier = urlParams.get('id');
getDataFirebase(identifier)

// Function to open modal construction
const openModalCons = () => {
  modalCons.classList.remove("hidden");
  overlay.classList.remove("hidden");
};

// Function to open modal edit profile
window.openModalEditProfile = () => {
  modelEditProfile.classList.remove("hidden");
  overlay.classList.remove("hidden");

  fullNameProfileModal.value = userProfile.fullName
  phoneProfileModal.value = userProfile.phone
  emailProfileModal.value = userProfile.email
}

// Function to close modal
window.closeModal = () => {
  modelEditProfile.classList.add("hidden");
  modalCons.classList.add("hidden");
  overlay.classList.add("hidden");

  listNewMembers = []
  lisNewJobs = []
  resetModelCons();
};

// Add event onclick for open modal button
openModalAddConsBtn.addEventListener("click", () => {
  openModalCons();

  generalProgressCons.parentElement.style.display = "none"
  titleCons.innerHTML = "Thêm mới công trình"
  btnSubmitCons.innerHTML = "Xong"
  btnSubmitCons.style.backgroundColor = null

  statusModalEditCons = false
});

// Add event onclick for close modal
closeModalBtn.addEventListener("click", closeModal);
overlay.addEventListener("click", closeModal);

// Function to handle delete construction
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

// Declare list members of construction
let listNewMembers = []

// Function to handle when add new member of construction
window.handleAddNewMember = () => {
  let name = memberCons.value
  memberCons.value = ""
  memberCons.focus()
  listNewMembers = [...listNewMembers, name]

  const newItem = `<li>${name} <span style="margin-left: 5px; cursor: pointer;" onclick="handleDeleteMember(${listNewMembers.length})">&times;</span></li>`;
  listMemberCons.innerHTML += newItem;
}

// Function to add event type 'Enter'
memberCons.addEventListener("keypress", function(event) {
  if (event.key === "Enter") {
      event.preventDefault();
      handleAddNewMember();
  }
});

// Function to handle delete member
window.handleDeleteMember = (i) => {
  let newList = listNewMembers.filter((val,index) => index != i)
  listNewMembers = [...newList]

  listMemberCons.innerHTML = ""

  listNewMembers.map((val,index) => {
    listMemberCons.innerHTML += `<li>${val} <span style="margin-left: 5px; cursor: pointer;" onclick="handleDeleteMember(${index})">&times;</span></li>`;
  })
}


// Declare list jobs of construction
let lisNewJobs = []

// Function to handle when add new job of construction
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

// Function to handle when delete job of construction
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

// Function to handle Add new construction or Edit construction
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

// Function to format datatype of date
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

// Function to handle when user edit construction (keypress 'eye')
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

// Function to handle save information of profile
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

// Function to create random UID
const generateUniqueId = () => {
  const randomString = Math.random().toString(36).substring(2, 15);
  const timestamp = Date.now();
  return `${randomString}${timestamp}`;
}

// Function to reset all info of modal construction about the original state
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

// Function to load data of construction for table
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

// Function to load data of profile for table
const loadUserProfile = () => {
  fullNameProfile.innerHTML = `Họ tên: ${userProfile.fullName}`
  phoneProfile.innerHTML = `SĐT: ${userProfile.phone}`
  emailProfile.innerHTML = `Email: ${userProfile.email}`
}
loadUserProfile();