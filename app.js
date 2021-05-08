import { html, render } from 'https://unpkg.com/lit-html?module'

const privateKeys = {
    ApplicationId: 'TaBgbSxM35ip2IsCb9GmD4USsmJ3cmvC2gzry9FS',
    RESTKey: 'LzdgF3zjzHLJZlfQmjx60yebSH1Q8ZmhcgoGOXMD',
}

const dbHost = 'https://parseapi.back4app.com/classes/tasks';

const headers = {
    'Content-Type': 'application/json',
    'X-Parse-Application-Id': privateKeys.ApplicationId,
    'X-Parse-REST-API-Key': privateKeys.RESTKey,
}

//creating templates
const mainTemplate = (data, startArticle, deleteArticle, finishArticle, changeTheme) => html`
    <div id="loader"></div>
    <div class="wrapper">
        <section>
            <div>
                <h1 class="blue">Add Task</h1>
            </div>
            <div>
                <form @submit=${addTask}>
                    <label for="task">Task</label><br>
                    <input type="text" id="task" name="task" placeholder="JS Advanced Exam"><br>
                    <label for="description">Description</label><br>
                    <textarea id="description" name="description"
                        placeholder="Lern DOM, Unit Testing and Classes"></textarea>
                    <label for="date">Due Date</label><br>
                    <input type="text" id="date" name="date" placeholder="2020.04.14"><br>
                    <button type="submit" id="add">Add</button>
                </form>
                <button @click=${changeTheme} class="change-theme">Change Theme</button>
    
            </div>
        </section>
    
        <section>
            <div>
                <h1 class="orange">Open</h1>
            </div>
            <div id="open">
                ${data.filter(x => x.status == 'open').map((x) => openTaskTemplate(x, startArticle, deleteArticle))}
            </div>
        </section>
        <section>
            <div>
                <h1 class="yellow">In Progress</h1>
            </div>
            <div id="inProgress">
                ${data.filter(x => x.status == 'inProgress').map((x) =>
     inProgressTaskTemplate(x, deleteArticle, finishArticle))}
            </div>
        </section>
        <section>
            <div>
                <h1 class="green">Complete</h1>
            </div>
            <div id="completed">
                ${data.filter(x => x.status == 'finished').map((x) => finishedTaskTemplate(x, deleteArticle))}
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
        <button id=${task.objectId} @click=${()=> deleteArticle(task.objectId)} class="red">Delete</button>
    </div>
</article>`;

const inProgressTaskTemplate = (task, deleteArticle, finishArticle) => html`
<article id=${task.objectId}>
    <h3>${task.name}</h3>
    <p>Description: ${task.description}</p>
    <p>Due Date: ${task.date}</p>
    <div class="flex">
        <button id=${task.objectId} @click=${()=> deleteArticle(task.objectId)} class="red">Delete</button>
        <button id=${task.objectId} @click=${()=> finishArticle(task.objectId)} class="orange">Finish</button>
    </div>
</article>`;

const finishedTaskTemplate = (task, deleteArticle) => html`
<article id=${task.objectId}>
    <h3>${task.name}</h3>
    <p>Description: ${task.description}</p>
    <p>Due Date: ${task.date}</p>
    <div class="flex">
        <button id=${task.objectId} @click=${()=> deleteArticle(task.objectId)} class="red">Delete</button>
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
    render(loaderTemplate(), main);

    const data = await getTasksFromServer();
    let tasksArray = Object.values(data)[0];
    render(mainTemplate(tasksArray, startArticle, deleteArticle, finishArticle, changeTheme), main)
}

//server requests
async function getTasksFromServer() {
    const response = await fetch(dbHost, {
        method: 'get',
        headers,
    })

    const data = await response.json();
    return data;
}

async function getTaskById(id) {
    const response = await fetch(`${dbHost}/${id}`, {
        method: 'get',
        headers,
    })

    const data = await response.json();
    return data;
}

async function postTaskToServer(body) {
    await fetch(dbHost, {
        method: 'post',
        headers,
        body: JSON.stringify(body)
    });
}

//updating in server
async function updateTaskToInProgress(body) {
    body.status = 'inProgress';
    delete body.createdAt;
    delete body.updatedAt;

    await fetch(`${dbHost}/${body.objectId}`, {
        method: 'put',
        headers,
        body: JSON.stringify(body),
    });

    await loadTasks(startArticle, deleteArticle, finishArticle);
}

async function updateTaskToDeleted(body) {
    body.status = 'deleted';
    delete body.createdAt;
    delete body.updatedAt;
    await fetch(`${dbHost}/${body.objectId}`, {
        method: 'put',
        headers,
        body: JSON.stringify(body),
    });

    await loadTasks(startArticle, deleteArticle, finishArticle);
}
async function updateTaskToFinished(body) {
    body.status = 'finished';
    delete body.createdAt;
    delete body.updatedAt;

    await fetch(`${dbHost}/${body.objectId}`, {
        method: 'put',
        headers,
        body: JSON.stringify(body),
    });

    await loadTasks(startArticle, deleteArticle, finishArticle);
}

function changeTheme() {
    document.querySelector('html').style.background == 'black' ? setThemeWhite() : setThemeBlack(); 
}

function setThemeBlack(){
    document.querySelector('html').style.background = 'black';
    document.querySelector('div.wrapper').style.background = '#183452';
    document.querySelector('form').style.border = "2px solid white";
    document.querySelector('form').style.background = 'radial-gradient(black, transparent)';
    document.querySelectorAll('h3').forEach(x=>x.style.color = 'white');
    document.querySelectorAll('p').forEach(x=>x.style.color = 'white');
    document.querySelectorAll('label').forEach(x=>x.style.color = 'white');
    document.querySelectorAll('article').forEach(x=>x.style.background = 'radial-gradient(black, transparent)');
    document.querySelectorAll('article').forEach(x=>x.style.border = "2px solid white");
}

function setThemeWhite(){
    document.querySelector('html').style.background = 'white';
    document.querySelector('div.wrapper').style.background = '#4b86c5';
    document.querySelector('form').style.border = "2px solid black";
    document.querySelector('form').style.background = 'radial-gradient(white, transparent)';
    document.querySelectorAll('h3').forEach(x=>x.style.color = 'black');
    document.querySelectorAll('p').forEach(x=>x.style.color = 'black');
    document.querySelectorAll('label').forEach(x=>x.style.color = 'black');
    document.querySelectorAll('article').forEach(x=>x.style.background = 'radial-gradient(white, transparent)');
    document.querySelectorAll('article').forEach(x=>x.style.border = "2px solid black");
}