let employeePayrollList;

window.addEventListener('DOMContentLoaded', (event) => {
    if (site_properties.use_local_storage.match("true")) {
        getDataFromLocalStorage();
    } else
        getPayrollDataFromServer();
})

function processEmployeePayrollDataResponse() {
    //Create another method for response because this should implement after we get response from server
    document.querySelector('.emp-count').textContent = employeePayrollList.length;
    createInnerHtml();
    localStorage.removeItem("edit-emp");
}

const getDataFromLocalStorage = () => {
    employeePayrollList = localStorage.getItem('EmployeePayrollList') ?
        JSON.parse(localStorage.getItem('EmployeePayrollList')) : [];
    processEmployeePayrollDataResponse();
}

const getPayrollDataFromServer = () => {

    makeServiceCall("GET", site_properties.server_url, true)
        .then(response => {
            employeePayrollList = JSON.parse(response);
            processEmployeePayrollDataResponse();
        })
        .catch(error => {
            console.log("Get Error Status : " + JSON.stringify(error));
            employeePayrollList = [];
            processEmployeePayrollDataResponse();
        })
}


const createInnerHtml = () => {
    const headerHtml = "<tr><th></th><th>Name</th><th>Gender</th>" +
        "<th>Department</th><th>Salary</th><th>Start Date</th><th>Actions</th></tr>";
    let innerHtml = `${headerHtml}`;
    for (let empPayrollData of employeePayrollList) {
        innerHtml = `${innerHtml}
            <tr>
            <td><img src ="${empPayrollData._profilePic}"></td>
            <td>${empPayrollData._name}</td>
            <td>${empPayrollData._gender}</td>
            <td>${getDepartmentHtml(empPayrollData._department)}</td>
            <td>${empPayrollData._salary}</td>
            <td>${strigifyDate(empPayrollData._startDate)}</td>
            <td>
                <img id ="${empPayrollData.id}" src="../assets/icons/delete-black-18dp.svg" alt="Delete" onClick=remove(this)>
                <img id ="${empPayrollData.id}" src="../assets/icons/create-black-18dp.svg" alt="Edit" onClick=update(this)>
            </td>
        </tr>`
            ;
    }
    document.querySelector('#display').innerHTML = innerHtml;
}

const getDepartmentHtml = (data) => {
    let deptHtml = '';
    for (let dept of data) {
        deptHtml = `${deptHtml} <div class='dept-label'>${dept}</div>`;
    }
    return deptHtml;
}


const remove = (data) => {

    let employeeData = employeePayrollList.find(empData => empData.id == data.id);
    if (!employeeData) {
        return;
    }
    const index = employeePayrollList.map(empData => empData.id).indexOf(employeeData.id);
    if (site_properties.use_local_storage.match("true")) {
        employeePayrollList.splice(index, 1);
        localStorage.setItem('EmployeePayrollList', JSON.stringify(employeePayrollList));
        document.querySelector('.emp-count').textContent = employeePayrollList.length;
        createInnerHtml();
    } else {
        const deleteUrl = site_properties.server_url + employeeData.id.toString();
        makeServiceCall("DELETE", deleteUrl, true)
            .then(response => {
                console.log(response)
                document.querySelector(".emp-count").textContent = employeePayrollList.length;
                createInnerHtml();
            })
            .catch(error => {
                alert("Error while deleting " + error)
            })
    }

}

const update = (data) => {

    let employeeData = employeePayrollList.find(empData => empData.id == data.id);
    if (!employeeData) {
        return;
    }
    localStorage.setItem('edit-emp', JSON.stringify(employeeData));
    window.location.replace(site_properties.add_employee_page);
}