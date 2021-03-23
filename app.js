import { html, render } from 'https://unpkg.com/lit-html?module'

const privateKeys = {
    ApplicationId: 'TaBgbSxM35ip2IsCb9GmD4USsmJ3cmvC2gzry9FS',
    RESTKey: 'LzdgF3zjzHLJZlfQmjx60yebSH1Q8ZmhcgoGOXMD',
}

//creating templates
const mainTemplate = (data, startArticle, deleteArticle, finishArticle) => html`
    <div id="loader"></div>
<div class="wrapper">
    <section>
        <div>
            <h1 class="gray">Add Task</h1>
        </div>
        <div>
            <form @submit=${addTask} action="">
                <label for="task">Task</label><br>
                <input type="text" id="task" name="task" placeholder="JS Advanced Exam"><br>
                <label for="description">Description</label><br>
                <textarea id="description" name="description"
                    placeholder="Lern DOM, Unit Testing and Classes"></textarea>
                <label for="date">Due Date</label><br>
                <input type="text" id="date" name="date" placeholder="2020.04.14"><br>
                <button id="add">Add</button>
            </form>
        </div>
    </section>

    <section>
        <div>
            <h1 class="orange">Open</h1>
        </div>
        <div id="open">
            ${data.filter(x => x.status == 'open').map((x) =>  openTaskTemplate(x,startArticle, deleteArticle))}
        </div>
    </section>
    <section>
        <div>
            <h1 class="yellow">In Progress</h1>
        </div>
        <div id="inProgress">
            ${data.filter(x => x.status == 'inProgress').map((x) =>  inProgressTaskTemplate(x,deleteArticle,finishArticle))}
        </div>
    </section>
    <section>
        <div>
            <h1 class="green">Complete</h1>
        </div>
        <div id="completed">
            ${data.filter(x => x.status == 'finished').map((x) =>  finishedTaskTemplate(x,deleteArticle))}
        </div>
    </section>
    <section>
        <div>
            <h1 class="red">Deleted</h1>
        </div>
        <div id="deleted">
            ${data.filter(x => x.status == 'deleted').map(deletedTaskTemplate)}
        </div>
    </section>
</div>`;

const openTaskTemplate = (task, startArticle, deleteArticle) => html`
<article id=${task.objectId}>
    <h3>${task.name}</h3>
    <p>Description: ${task.description}</p>
    <p>Due Date: ${task.date}</p>
    <div class="flex">
        <button id=${task.objectId} @click=${() => startArticle(task.objectId)} class="green">Start</button>
        <button id=${task.objectId} @click=${()=>deleteArticle(task.objectId)}  class="red">Delete</button>
    </div>
</article>`;

const inProgressTaskTemplate = (task, deleteArticle,finishArticle) => html`
<article id=${task.objectId}>
    <h3>${task.name}</h3>
    <p>Description: ${task.description}</p>
    <p>Due Date: ${task.date}</p>
    <div class="flex">
        <button id=${task.objectId} @click=${()=>deleteArticle(task.objectId)} class="red">Delete</button>
        <button id=${task.objectId} @click=${()=>finishArticle(task.objectId)} class="orange">Finish</button>
    </div>
</article>`;

const finishedTaskTemplate = (task,deleteArticle) => html`
<article id=${task.objectId}>
    <h3>${task.name}</h3>
    <p>Description: ${task.description}</p>
    <p>Due Date: ${task.date}</p>
    <div class="flex">
        <button id=${task.objectId} @click=${()=>deleteArticle(task.objectId)} class="red">Delete</button>
    </div>
</article>`;

const deletedTaskTemplate = (task) => html`
<article id=${task.objectId}>
    <h3>${task.name}</h3>
    <p>Description: ${task.description}</p>
    <p>Due Date: ${task.date}</p>
</article>`

const loaderTemplate = () => html`<div class="loader"></div>`;

//Start of App
loadTasks(startArticle, deleteArticle, finishArticle);

//task operations
async function addTask(e) {

    e.preventDefault();
    let formData = new FormData(e.target);
    let name = formData.get('task');
    let description = formData.get('description');
    let dueDate = formData.get('date');

    if (!name || !description || !dueDate) { return alert('Cannot add task with empty fields!') }
    e.target.reset();

    const task = {
        name: name,
        date: dueDate,
        description: description,
        status: 'open'
    }
    await postTaskToServer(task);
    await loadTasks(startArticle, deleteArticle, finishArticle);
}
async function startArticle(id) {
    let task = await getTaskById(id);
    await updateTaskToInProgress(task)
}
async function deleteArticle(id) {
    let task = await getTaskById(id);
    await updateTaskToDeleted(task)
}
async function finishArticle(id) {
    let task = await getTaskById(id);
    await updateTaskToFinished(task)
}

//loading tasks
async function loadTasks(startArticle, deleteArticle, finishArticle) {
    const main = document.getElementById('main');
    render(loaderTemplate(),main);
    
    const data = await getTasksFromServer();
    let tasksArray = Object.values(data)[0];
    render(mainTemplate(tasksArray, startArticle, deleteArticle, finishArticle), main)
}

//server requests
async function getTasksFromServer() {
    const response = await fetch('https://parseapi.back4app.com/classes/tasks', {
        method: 'get',
        headers: {
            'Content-Type': 'application/json',
            'X-Parse-Application-Id': privateKeys.ApplicationId,
            'X-Parse-REST-API-Key': privateKeys.RESTKey,
        }
    })

    const data = await response.json();
    return data;
}
async function getTaskById(id) {
    const response = await fetch('https://parseapi.back4app.com/classes/tasks/' + id, {
        method: 'get',
        headers: {
            'Content-Type': 'application/json',
            'X-Parse-Application-Id': privateKeys.ApplicationId,
            'X-Parse-REST-API-Key': privateKeys.RESTKey,
        }
    })

    const data = await response.json();
    return data;
}
async function postTaskToServer(body) {
    const response = await fetch('https://parseapi.back4app.com/classes/tasks', {
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
            'X-Parse-Application-Id': privateKeys.ApplicationId,
            'X-Parse-REST-API-Key': privateKeys.RESTKey,
        },
        body: JSON.stringify(body)
    });
}
//updating in server
async function updateTaskToInProgress(body) {
    body.status = 'inProgress';
    delete body.createdAt;
    delete body.updatedAt;
    const response = await fetch('https://parseapi.back4app.com/classes/tasks/' + body.objectId, {
        method: 'put',
        headers: {
            'Content-Type': 'application/json',
            'X-Parse-Application-Id': privateKeys.ApplicationId,
            'X-Parse-REST-API-Key': privateKeys.RESTKey,
        },
        body: JSON.stringify(body),
    });
    await loadTasks(startArticle, deleteArticle, finishArticle);
}
async function updateTaskToDeleted(body) {
    body.status = 'deleted';
    delete body.createdAt;
    delete body.updatedAt;
    const response = await fetch('https://parseapi.back4app.com/classes/tasks/' + body.objectId, {
        method: 'put',
        headers: {
            'Content-Type': 'application/json',
            'X-Parse-Application-Id': privateKeys.ApplicationId,
            'X-Parse-REST-API-Key': privateKeys.RESTKey,
        },
        body: JSON.stringify(body),
    });
    await loadTasks(startArticle, deleteArticle, finishArticle);
}
async function updateTaskToFinished(body) {
    body.status = 'finished';
    delete body.createdAt;
    delete body.updatedAt;
    const response = await fetch('https://parseapi.back4app.com/classes/tasks/' + body.objectId, {
        method: 'put',
        headers: {
            'Content-Type': 'application/json',
            'X-Parse-Application-Id': privateKeys.ApplicationId,
            'X-Parse-REST-API-Key': privateKeys.RESTKey,
        },
        body: JSON.stringify(body),
    });
    await loadTasks(startArticle, deleteArticle, finishArticle);
}