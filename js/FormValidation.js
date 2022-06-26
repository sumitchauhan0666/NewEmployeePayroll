let isUpdate = false;
let employPayrollObject = {};

window.addEventListener('DOMContentLoaded', (event) => {
    validateName();
    salaryOutput();
    validateDate();
    checkForUpdate();
});

function salaryOutput() {
    const salary = document.querySelector('#salary');
    const output = document.querySelector('.salary-output');
    output.textContent = salary.value;
    salary.addEventListener('input', function () {
        output.textContent = salary.value;
    });
}

function validateName() {
    const name = document.querySelector('#name');
    const textError = document.querySelector('.text-error');
    name.addEventListener('input', function () {
        if (name.value.length == 0) {
            textError.textContent = "";
            return;
        }
        try {
            checkName(name.value);
            textError.textContent = "";
        } catch (e) {
            console.error(e);
            textError.textContent = e;
        }
    });
}

function validateDate() {
    const day = document.querySelector('#day');
    const month = document.querySelector('#month');
    const year = document.querySelector('#year');

    day.addEventListener('input', checkDate);
    month.addEventListener('input', checkDate);
    year.addEventListener('input', checkDate);
}

function checkDate() {
    const dateError = document.querySelector('.date-error');
    try {
        let date = day.value + " " + month.value + " " + year.value;
        checkStartDate(new Date(Date.parse(date)));
        dateError.textContent = "";
    } catch (e) {
        dateError.textContent = e;
    }
}


function redirect() {
    console.log("redirect")
    resetForm();
    window.location.replace(site_properties.home_page)
}

const save = (event) => {
    event.preventDefault();
    event.stopPropagation();
    try {
        // let empData = setEmployeePayrollObject();
        // createAndUpdateStorage(empData);

        setEmployeePayrollObject();
        if (site_properties.use_local_storage.match("true")) {
            createAndUpdateStorage();
            alert("Data Stored With Name " + employPayrollObject._name);
            redirect();
        } else
            createOrUpdateEmployeeInJsonServer();
        // alert("Data Updated With Name "+employPayrollObject._name);
        // redirect();

    } catch (e) {
        console.log(e)
        return;
    }
}

const setEmployeePayrollObject = () => {

    //Here we are directly store values in employPayrollObject
    if (!isUpdate && site_properties.use_local_storage.match("true")) {
        employPayrollObject.id = createNewEmpId();
    }
    employPayrollObject._name = getInputValueId('#name');
    employPayrollObject._profilePic = getSelectedValue('[name=profile]').pop();
    employPayrollObject._gender = getSelectedValue('[name=gender]').pop();
    employPayrollObject._department = getSelectedValue('[name=department]');
    employPayrollObject._salary = getInputValueId('#salary');
    employPayrollObject._note = getInputValueId('#notes').replace(/\s/g, ' ');
    let date = getInputValueId('#day') + " " + getInputValueId('#month') + " " + getInputValueId('#year');
    employPayrollObject._startDate = Date.parse(date);

    // let employeePayrollData = new EmployeePayrollData();
    // try {
    //     employeePayrollData.name = getInputValueId('#name');
    //     let date = getInputValueId('#day') + " " + getInputValueId('#month') + " " + getInputValueId('#year');
    //     employeePayrollData.startDate = new Date(Date.parse(date));
    // } catch (e) {
    //     if ('Incorrect Name' == e) {
    //         setTextValue('.text-error', e);
    //     } else {
    //         setTextValue('.date-error', e);
    //     }
    //     throw e
    // }
    // employeePayrollData.profilePic = getSelectedValue('[name=profile]').pop();
    // employeePayrollData.gender = getSelectedValue('[name=gender]').pop();
    // employeePayrollData.department = getSelectedValue('[name=department]');
    // employeePayrollData.salary = getInputValueId('#salary');
    // employeePayrollData.note = getInputValueId('#notes').replace(/\s/g, '');
    // employeePayrollData.id = employPayrollObject.id;
    // return employeePayrollData;
}

function createOrUpdateEmployeeInJsonServer() {
    let url = site_properties.server_url;
    let methodCall = "POST";
    let message = "Data Store with name ";
    if (isUpdate) {
        methodCall = "PUT";
        url = url + employPayrollObject.id.toString();
        message = "Data Updated with name ";
    }
    makeServiceCall(methodCall, url, true, employPayrollObject)
        .then(response => {
            //  return;
            alert(message + employPayrollObject._name)
            redirect();
        })
        .catch(error => {
            console.log("inside error")
            throw error
        });
}

const getInputValueId = (id) => {
    let value = document.querySelector(id).value;
    return value;
}

const getSelectedValue = (propertyValue) => {
    let allItem = document.querySelectorAll(propertyValue);
    let setItem = [];
    allItem.forEach(item => {
        if (item.checked) {
            setItem.push(item.value);
        }
    });
    return setItem;
}

const setTextValue = (id, value) => {
    let textError = document.querySelector(id);
    textError.textContent = value;
}

const createNewEmpId = () => {
    let empId = localStorage.getItem('EmpId');
    empId = !empId ? 1 : (parseInt(empId) + 1).toString();
    localStorage.setItem('EmpId', empId);
    return empId;
}

// const createAndUpdateStorage = (data) => {
//     let dataList = JSON.parse(localStorage.getItem("EmployeePayrollList"));
//     if (dataList) {
//         let existingEmpData = dataList.find(empData => empData.id == data.id);
//         if (!existingEmpData) {
//             data.id = createNewEmpId();
//             dataList.push(data);
//         } else {
//             const index = dataList.map(empData => empData.id).indexOf(data.id);
//             dataList.splice(index, 1, data);
//             console.log(dataList)
//         }
//     } else {
//         data.id = createNewEmpId();
//         dataList = [data]
//     }
//     localStorage.setItem("EmployeePayrollList", JSON.stringify(dataList));
// }

const createAndUpdateStorage = () => {
    let dataList = JSON.parse(localStorage.getItem("EmployeePayrollList"));

    if (dataList) {
        let existingEmpData = dataList.find(empData => empData.id == employPayrollObject.id);
        if (!existingEmpData) {
            //No Need of id it will added in json server bydefault
            // employPayrollObject.id = createNewEmpId();
            dataList.push(employPayrollObject);
        } else {
            const index = dataList.map(empData => empData.id).indexOf(employPayrollObject.id);
            dataList.splice(index, 1, employPayrollObject);
        }
    } else {
        dataList = [employPayrollObject];
    }
    localStorage.setItem("EmployeePayrollList", JSON.stringify(dataList));
}

const resetForm = () => {
    console.log("resetForm")
    setValue('#name', '');
    unsetSelectedValues('[name=profile]');
    unsetSelectedValues('[name=gender]');
    unsetSelectedValues('[name=department]');
    setValue('#salary', '');
    setTextValue('.salary-output', 400000);
    setValue('#notes', '');
    setValue('#day', '1');
    setValue('#month', 'Jan');
    setValue('#year', '2020');
}
const unsetSelectedValues = (propertyValue) => {
    let allItems = document.querySelectorAll(propertyValue);
    allItems.forEach(item => {
        item.checked = false;
    });
}

const setValue = (id, value) => {
    const element = document.querySelector(id);
    element.value = value;
}

const checkForUpdate = () => {
    const jsonData = localStorage.getItem('edit-emp');
    isUpdate = jsonData ? true : false;
    if (!isUpdate) return;
    employPayrollObject = JSON.parse(jsonData);
    setForm();
}

const setForm = () => {
    setValue('#name', employPayrollObject._name);
    setSelectedValue('[name = profile]', employPayrollObject._profilePic);
    setSelectedValue('[name = gender]', employPayrollObject._gender);
    setSelectedValue('[name = department]', employPayrollObject._department);
    setValue('#salary', employPayrollObject._salary);
    setTextValue('.salary-output', employPayrollObject._salary);
    let date = strigifyDate(employPayrollObject._startDate).split(" ");
    setValue('#day', date[0]);
    setValue('#month', date[1]);
    setValue('#year', date[2]);
    setValue('#notes', employPayrollObject._note);
}

const setSelectedValue = (propertyValue, value) => {
    let allItem = document.querySelectorAll(propertyValue);
    allItem.forEach(item => {
        if (Array.isArray(value)) {
            if (value.includes(item.value)) {
                item.checked = true;
            }
        } else if (item.value === value) {
            item.checked = true;
        }
    });
}