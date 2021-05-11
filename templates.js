import { html } from 'https://unpkg.com/lit-html?module';
import * as operations from './app.js';

const mainTemplate = (data, startArticle, deleteArticle, finishArticle) => html`
    <div id="loader"></div>
    <div class="wrapper">
        <section>
            <div>
                <h1 class="blue">Add Task</h1>
            </div>
            <div>
                <form @submit=${operations.addTask}>
                    <label for="task">Task</label><br>
                    <input type="text" id="task" name="task" placeholder="JS Advanced Exam"><br>
                    <label for="description">Description</label><br>
                    <textarea id="description" name="description"
                        placeholder="Lern DOM, Unit Testing and Classes"></textarea>
                    <label for="date">Due Date</label><br>
                    <input type="date" class="datepicker-input" id="date" name="date"><br>
                    <button type="submit" id="add"><i class="fas fa-plus"></i></button>
                </form>
                <button @click=${operations.changeTheme} class="change-theme">Change Theme</button> 
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

const openTaskTemplate = (task) => html`
<article id=${task.objectId}>
    <h3>${task.name}</h3>
    <p>Description: ${task.description}</p>
    <p>Due Date: ${task.date}</p>
    <div class="flex">
        <button id=${task.objectId} @click=${() => operations.startArticle(task.objectId)} class="green"><i
                class="fas fa-play"></i></button>
        <button id=${task.objectId} @click=${()=> operations.deleteArticle(task.objectId)} class="red"><i
                class="fas fa-trash"></i></button>
    </div>
</article>`;

const inProgressTaskTemplate = (task) => html`
<article id=${task.objectId}>
    <h3>${task.name}</h3>
    <p>Description: ${task.description}</p>
    <p>Due Date: ${task.date}</p>
    <div class="flex">
        <button id=${task.objectId} @click=${()=> operations.deleteArticle(task.objectId)} class="red"><i
                class="fas fa-trash"></i></button>
        <button id=${task.objectId} @click=${()=> operations.finishArticle(task.objectId)}
            class="orange"><i class="fas fa-check-square"></i></button>
    </div>
</article>`;

const finishedTaskTemplate = (task) => html`
<article id=${task.objectId}>
    <h3>${task.name}</h3>
    <p>Description: ${task.description}</p>
    <p>Due Date: ${task.date}</p>
    <div class="flex">
        <button id=${task.objectId} @click=${()=> operations.deleteArticle(task.objectId)} class="red"><i
                class="fas fa-trash"></i></button>
    </div>
</article>`;

const deletedTaskTemplate = (task) => html`
<article id=${task.objectId}>
    <h3>${task.name}</h3>
    <p>Description: ${task.description}</p>
    <p>Due Date: ${task.date}</p>
</article>`;

const loaderTemplate = () => html`<div class="loader"></div>`;

export {
    mainTemplate,
    openTaskTemplate,
    inProgressTaskTemplate,
    finishedTaskTemplate,
    deletedTaskTemplate,
    loaderTemplate,
};