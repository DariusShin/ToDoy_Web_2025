const DOMS = {
    input: document.querySelector('#todo-text'),
    listContainer: document.querySelector('.todo-list'),
    addButton: document.querySelector('#add-button'),
    taskCounter: document.getElementById('task-counter'),
}

/* Format for the objects in the array
[{
    id: 1,
    task: 'Task 1',
    signature: 'task1', // to check for duplication
    isCompleted: false,
},
{
    id: 2,
    task: 'Task 2',
    signature: 'task2', // to check for duplication
    isCompleted: false,
}]
*/

// define an array for storing task objects
let taskList, count;

// handler to get the object from the local storage
function getObjFromLocalStorage() {
    return JSON.parse(localStorage.getItem('taskObj')) || {};
}

// handler to set the object{counter and task array} into the local storage
function setObjToLocalStorage() {
    localStorage.setItem('taskObj', JSON.stringify({
        count,
        taskList,
    }));
}

// hanlder to convert task into signature (no space and all lowercases)
function getSignature(task){
    return task.trim().toLowerCase().replace(/\s/g, '');
}

// hanlder for adding a new task into the list and UI 
function addTask() {
    let task = DOMS.input.value;

    // check if the task is empty
    if(!task) {console.log('empty task...');return}; 

    // check if the task is duplicated
    if(checkDuplicate(task)) return;

    // create new element by passing the value of the task
    count++;

    // create new element by passing the value of the task
    let liElement = createTaskDOMElement(count, task);
    DOMS.listContainer.appendChild(liElement);

    // clear the input textbox
    DOMS.input.value = '';

    // create new task object
    let newTask = createTask(count, task);

    console.log(newTask);

    // append the new task to the list
    taskList.push(newTask);

    // update the task counter
    updateCounter();
};

// handler for creating the new task-item element dynamiclly
function createTaskDOMElement(taskID, task) {
    // Create main container
    const li = document.createElement('li');
    li.id = `todo-item-${taskID}`;
    li.classList.add('todo-item');
    li.setAttribute('draggable', 'true');

    // get the element with the same id in the list
    for (let i = 0; i < taskList.length; i++){
        if(taskList[i].id === taskID) {
            if(taskList[i].isCompleted) {
                li.classList.add('completed');
            }
            break;
        }
    }

    // Create wrapper
    const wrapper = document.createElement('div');
    wrapper.classList.add('wrapper');

    // Create checkbox
    const checkbox = document.createElement('div');
    checkbox.id = `checkbox-item-${taskID}`;
    checkbox.classList.add('checkbox');
    const checkboxP = document.createElement('p');
    checkbox.addEventListener('click', function(e) {
        // get the target item by its id and toggle its class 'completed'
        let targetItem = document.getElementById(`todo-item-${taskID}`);
        targetItem.classList.toggle('completed');

        // update the isCompleted property for the task object in the list
        // for loop throught the task list until finding the specific item with same id
        for(let i = 0; i < taskList.length; i++) {
            if(taskList[i].id === taskID) {
                taskList[i].isCompleted = !taskList[i].isCompleted;
                break;
            }
        }
        // update the task counter
        updateCounter(); 
    });
    checkbox.appendChild(checkboxP);

    // Create text wrapper
    const textWrapper = document.createElement('div');
    textWrapper.classList.add('text-wrapper');

    // Create label and input
    const label = document.createElement('label');
    label.classList.add('task-content');
    label.setAttribute('for', `task-text-${taskID}`);
    label.textContent = task;

    const input = document.createElement('input');
    input.type = 'text';
    input.id = `task-text-${taskID}`;
    input.placeholder = 'Update task';
    input.alt = 'Update todo task field';

    // Assemble text wrapper
    textWrapper.appendChild(label);
    textWrapper.appendChild(input);

    // Assemble wrapper
    wrapper.appendChild(checkbox);
    wrapper.appendChild(textWrapper);

    // Create actions section
    const actions = document.createElement('div');
    actions.classList.add('actions');

    // Create update button
    const updateBtn = document.createElement('button');
    updateBtn.id = `update-btn-item-${taskID}`;
    updateBtn.title = 'update button';
    updateBtn.alt = 'Update task button';
    updateBtn.onclick = () => updateTask(getIdFromDOMS(updateBtn.id));
    const updateIcon = document.createElement('i');
    updateIcon.classList.add('fa-solid', 'fa-pen');
    updateBtn.appendChild(updateIcon);

    // Create delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.id = `delete-btn-item-${taskID}`;
    deleteBtn.title = 'delete button';
    deleteBtn.alt = 'Delete task button';
    deleteBtn.onclick = () => deleteTask(getIdFromDOMS(deleteBtn.id));
    const deleteIcon = document.createElement('i');
    deleteIcon.classList.add('fa-solid', 'fa-trash-can');
    deleteBtn.appendChild(deleteIcon);

    // Create drag icon
    const dragIcon = document.createElement('div');
    dragIcon.classList.add('drag-icon', 'drag-handle');
    dragIcon.title = 'drag icon';
    dragIcon.alt = 'Drag icon';
    const dragIconI = document.createElement('i');
    dragIconI.classList.add('fa-solid', 'fa-grip');
    dragIcon.appendChild(dragIconI);

    // Assemble actions
    actions.appendChild(updateBtn);
    actions.appendChild(deleteBtn);
    actions.appendChild(dragIcon);

    // Final assembly
    li.appendChild(wrapper);
    li.appendChild(actions);

    return li;
}

// factory function for creating a new task object
function createTask(id, task) {
    return {
        id,
        task,
        signature: getSignature(task),
        isCompleted: false,
    }
}

// handler to update a task
function updateTask(taskID) {
    // get the target input with the ID
    let targetInput = document.getElementById(`task-text-${taskID}`);
    let targetLabel = document.querySelector(`label[for=task-text-${taskID}]`);

    // show the current label text in the textbox
    targetInput.value = targetLabel.textContent;

    // show the input textbox
    targetInput.style.display = 'block';

    targetInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            // return when the user didn't enter a new task value
            if(targetInput.value === targetLabel.textContent) {
                targetInput.style.display = 'none'; 
                return;
            };
            
            // get the new value and update the obejct from the list
            let newValue = targetInput.value;

            // update the label for the input in the target elemen
            targetLabel.textContent = newValue;

            // updtae the value from the list
            for(let i = 0; i < taskList.length; i++) {
                if(taskList[i].id === parseInt(taskID)) {
                    taskList[i].task = newValue;
                    taskList[i].signature = getSignature(newValue);
                    break;
                } else {
                    console.log('task not found in the list...');
                }
            }

            // hide the input textbox
            targetInput.style.display = 'none';
        }
    });
}

// hanlder to delete a task from list and UI
function deleteTask(taskID) {
    // delete the target object from the list
    for(let i = 0; i < taskList.length; i++) {
        if(taskList[i].id === parseInt(taskID)) {
            // Store reference to the object
            const removedTaskObject = taskList[i];

            // delete the task from the list
            taskList.splice(i, 1);

            // delete the target task object
            delete removedTaskObject;

            console.log("here");

            break;
        } else {
            console.log('task not found in the list...');
        }
    }

    // rerender the UI for the updated list
    reRenderUI();
}

// handler to calculate the number of incompleted task and update to the footer
function updateCounter() {
    // get the current task count by calculating the list length
    let incompletedTaskCount = taskList.filter(obj => obj.isCompleted === false).length;
    if(!incompletedTaskCount){ // all task completed
        DOMS.taskCounter.textContent = '';
    } else {
        DOMS.taskCounter.textContent = `remianing task: ${incompletedTaskCount}`;
    }

    // set the new taskList and counter to localStorage
    setObjToLocalStorage();
}

// function to check for the task duplicate
function checkDuplicate(task) {
    // check whether the task already exist by comparing with the existing properties in the object
    let signature = getSignature(task);

    for (let i=0; i < taskList.length; i++){
        // if the task is duplicated and the isCompleted property is false, then return true
        if(signature === taskList[i].signature && taskList[i].isCompleted === false) {
            console.log('duplicate task detected...');
            DOMS.input.value = '';
            return true;
        // else if the task is duplicated and the isCompleted property is true, change the properties to false and rerender the UI
        } else if(signature === taskList[i].signature && taskList[i].isCompleted === true) {
            taskList[i].isCompleted = false;

            // toggle the 'completed' class for the target task item
            let targetItem = document.getElementById(`todo-item-${taskList[i].id}`);
            targetItem.classList.remove('completed');

            // update the task counter
            updateCounter();
            return true;
        }
    }
    
    // completely new task
    return false;
}

// handler to extract id from the checkbox element
function getIdFromDOMS(domID) {
    // logic to check whether the current index is 1 digit or more
    let numOfDigit = domID.split('-')[3].length;

    if(!numOfDigit > 0) return domID[domID.length - 1];

    let returnId = '';
    for(let i = 0; i < numOfDigit; i++) {
        returnId += domID[domID.length - numOfDigit + i];
    }
    return returnId;
}

// handler to re-render the UI after delete the task items
function reRenderUI() {
    // clear the list container
    DOMS.listContainer.innerHTML = '';

    // clear the input textbox
    DOMS.input.value = '';

    // loop through the task list and render the task
    taskList.forEach(task => {
        let liElement = createTaskDOMElement(task.id, task.task);
        DOMS.listContainer.appendChild(liElement);
    });

    // update the task counter
    updateCounter();
}

// add event listener to the input field and button
DOMS.input.addEventListener('keypress', function(e) {
    if(e.key === 'Enter') addTask();
});

// add page load listener
document.addEventListener('DOMContentLoaded', () => {
    // Load saved tasks
    taskList = getObjFromLocalStorage().taskList || [];
    count = getObjFromLocalStorage().count || 0;

    console.log(taskList, count);
    
    // render the task list when there is previous task saved
    if(taskList.length) reRenderUI();
});

// Drag and Drop API
let dragSourceNode;
DOMS.listContainer.ondragstart = (e) => {
    // make the code asynchronous, so the drag happen first and then after a small delay will add in the class
    setTimeout(() => {
        e.target.classList.add('moving');
    }, 0);
    dragSourceNode = e.target;
};

DOMS.listContainer.ondragover = (e) => {
    e.preventDefault(); // prevent the drag source node from going back to the initial position
}

DOMS.listContainer.ondragenter = (e) => {
    e.preventDefault(); // prevent the drag source node from going back to the initial position
    if(e.target === DOMS.listContainer || e.target === dragSourceNode){
        return;
    }

    // get the index of the source node and target node
    const childNodes = [...DOMS.listContainer.children];
    const sourceIndex = childNodes.indexOf(dragSourceNode); // get the node index of the dragging node
    const targetIndex = childNodes.indexOf(e.target); // get the node index of the drag-entered node

    // move the target node up when sourceIndex is smaller than targetIndex
    if (sourceIndex < targetIndex) {
        DOMS.listContainer.insertBefore(dragSourceNode, e.target.nextSibling);
    } else { // move the target node down when sourceIndex is greater than targetIndex
        DOMS.listContainer.insertBefore(dragSourceNode, e.target);
    }
};

DOMS.listContainer.ondragend = (e) => {
    e.preventDefault(); // prevent the drag source node from going back to the initial position
    dragSourceNode.classList.remove('moving');

    // update the arragement of task in the taskList
    const newTaskList = [];
    const childNodes = [...DOMS.listContainer.children];
    childNodes.forEach((node) => {
        const id = parseInt(node.id.split('-')[2]); // get the id from the node
        const task = taskList.find(task => task.id === id); // find the object with the same id, and add it to the new list
        newTaskList.push(task);
    });
    taskList = newTaskList; // update the taskList with the new list
    setObjToLocalStorage(); // update the local storage with the new taskList arragement
}

// Touch event handling for mobile device
DOMS.listContainer.addEventListener('touchstart', handleTouchStart, { passive: false });
DOMS.listContainer.addEventListener('touchmove', handleTouchMove, { passive: false });
DOMS.listContainer.addEventListener('touchend', handleTouchEnd);

let touchStartNode = null;
let touchStartY = 0;

function handleTouchStart(e) {
    if (!e.target.closest('.drag-handle')) {
        return; // Ignore touches outside the drag handle
    }
    const touch = e.touches[0];
    const target = e.target.closest('.todo-item'); // Ensure you are dragging a list item
    if (!target) return;

    touchStartNode = target;
    touchStartY = touch.clientY;
    target.classList.add('moving');
}

function handleTouchMove(e) {
    if (!e.target.closest('.drag-handle')) {
        return; // Ignore touches outside the drag handle
    }
    e.preventDefault(); // Prevent scrolling while dragging
    if (!touchStartNode) return;

    const touch = e.touches[0];
    const targetY = touch.clientY;
    const deltaY = targetY - touchStartY;

    // Find the item currently being hovered over
    const hoverElement = document.elementFromPoint(touch.clientX, touch.clientY)?.closest('.todo-item');
    if (hoverElement && hoverElement !== touchStartNode) {
        const childNodes = [...DOMS.listContainer.children];
        const sourceIndex = childNodes.indexOf(touchStartNode);
        const targetIndex = childNodes.indexOf(hoverElement);

        // Reorder the tasks based on drag direction
        if (sourceIndex < targetIndex) {
            DOMS.listContainer.insertBefore(touchStartNode, hoverElement.nextSibling);
        } else {
            DOMS.listContainer.insertBefore(touchStartNode, hoverElement);
        }
    }

    touchStartY = targetY; // Update Y-coordinate
}

function handleTouchEnd() {
    if (touchStartNode) {
        touchStartNode.classList.remove('moving');
        touchStartNode = null;
    }

    // Reorder task list based on new arrangement
    const newTaskList = [];
    const childNodes = [...DOMS.listContainer.children];
    childNodes.forEach((node) => {
        const id = parseInt(node.id.split('-')[2]); // Get the ID from the node
        const task = taskList.find((task) => task.id === id); // Find the object with the same ID
        newTaskList.push(task);
    });
    taskList = newTaskList; // Update the taskList with the new order
    setObjToLocalStorage(); // Save the updated order to localStorage
}
