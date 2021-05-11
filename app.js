import { render } from 'https://unpkg.com/lit-html?module';

import * as templates from './templates.js';
import { privateKeys, allowedIpAddresses, dbHost, ipRecordHost } from './externalData.js';

const headers = {
    'Content-Type': 'application/json',
    'X-Parse-Application-Id': privateKeys.ApplicationId,
    'X-Parse-REST-API-Key': privateKeys.RESTKey,
}

//Start of App
await loadTasks(startArticle, deleteArticle, finishArticle);

//task operations
export async function addTask(e) {

    e.preventDefault();
    let formData = new FormData(e.target);
    let name = formData.get('task');
    let description = formData.get('description');
    let date = formData.get('date');

    if (!name || !description || !date) { return alert('Cannot add task with empty fields!') }
    e.target.reset();

    const dateElements = date.split('-');
    date = `${dateElements[2]}.${dateElements[1]}.${dateElements[0]}`;

    const task = {
        name,
        date,
        description,
        status: 'open'
    }

    if (await authorize()) {
        await postTaskToServer(task);
        await loadTasks(startArticle, deleteArticle, finishArticle);
    }
}

export async function startArticle(id) {
    if (await authorize()) {
        let task = await getTaskById(id);
        await updateTaskToInProgress(task);
    }
}

export async function deleteArticle(id) {
    if (await authorize()) {
        let task = await getTaskById(id);
        await updateTaskToDeleted(task);
    }
}

export async function finishArticle(id) {
    if (await authorize()) {
        let task = await getTaskById(id);
        await updateTaskToFinished(task);
    }
}

//loading tasks in main wrapper
async function loadTasks(startArticle, deleteArticle, finishArticle) {
    const main = document.getElementById('main');
    render(templates.loaderTemplate(), main);

    const data = await getTasksFromServer();
    let tasksArray = Object.values(data)[0];
    render(templates.mainTemplate(tasksArray, startArticle, deleteArticle, finishArticle, changeTheme), main)

    updateThemeFromCookie();
}

//#region server requests

//GET ALL
async function getTasksFromServer() {
    const response = await fetch(dbHost, {
        method: 'get',
        headers,
    })

    const data = await response.json();
    return data;
}

//GET/ID
async function getTaskById(id) {
    const response = await fetch(`${dbHost}/${id}`, {
        method: 'get',
        headers,
    })

    const data = await response.json();
    return data;
}

//POST
async function postTaskToServer(body) {
    await fetch(dbHost, {
        method: 'post',
        headers,
        body: JSON.stringify(body)
    });
}
//#endregion

//#region updating data in Back4App

//PUT - inProgress
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

//PUT - deleted
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

//PUT finished
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
//#endregion

//#region themes
export function changeTheme() {
    document.querySelector('html').style.background == 'black' ? setThemeWhite() : setThemeBlack();
}

function setThemeBlack() {
    setCookie('black');

    document.querySelector('html').style.background = 'black';
    document.querySelector('body').style.background = 'black';
    document.querySelector('div.wrapper').style.background = '#183452';
    document.querySelector('footer').style.background = '#183452';
    document.querySelector('.footer a').style.color = 'white';
    document.querySelector('form').style.border = "2px solid white";
    document.querySelector('form').style.background = 'radial-gradient(black, transparent)';
    document.querySelectorAll('h3, p, label').forEach(x => x.style.color = 'white');
    document.querySelectorAll('article').forEach(x => x.style.background = 'radial-gradient(black, transparent)');
    document.querySelectorAll('article').forEach(x => x.style.border = "2px solid white");
}

function setThemeWhite() {
    setCookie('white');

    document.querySelector('html').style.background = 'white';
    document.querySelector('body').style.background = 'white';
    document.querySelector('div.wrapper').style.background = '#d9dbde';
    document.querySelector('footer').style.background = '#d9dbde';
    document.querySelector('.footer a').style.color = 'black';
    document.querySelector('form').style.border = "2px solid black";
    document.querySelector('form').style.background = 'radial-gradient(white, transparent)';
    document.querySelectorAll('h3, p, label').forEach(x => x.style.color = 'black');
    document.querySelectorAll('article').forEach(x => x.style.background = 'radial-gradient(white, transparent)');
    document.querySelectorAll('article').forEach(x => x.style.border = "2px solid black");
}

function getCookieValue() {
    return document.cookie
        .split('; ')
        .find(row => row.startsWith('theme='))
        .split('=')[1];
}

function setCookie(value) {
    var now = new Date();
    var time = now.getTime();
    var expireTime = time + 1000 * 36000 * 36000; //Set cookie to never expire
    now.setTime(expireTime);
    document.cookie = `theme=${value};expires=` + now.toUTCString() + ';path=/';
}

function updateThemeFromCookie() {
    getCookieValue() == 'black' ? setThemeBlack() : setThemeWhite();
}
//#endregion

//#region Authorization
//Get Ip from ipdata
async function getIp() {
    const response = await fetch(`https://api.ipdata.co/?api-key=${privateKeys.IpDataKey}`);

    const data = await response.json();
    return data.ip;

}

//Authorization with allowed IPs
async function authorize() {
    const userIp = await getIp();
    await addIpRecordToDb(userIp);
    
    if (allowedIpAddresses.includes(userIp)) {
        return true;
    } else {
        alert("Accress denied!");
        return false;
    }
}

//Recording user IP
async function addIpRecordToDb(userIp) {
    let body = {
        ip: userIp,
    };

    delete body.createdAt;
    delete body.updatedAt;

    await fetch(`${ipRecordHost}`, {
        method: 'post',
        headers,
        body: JSON.stringify(body),
    });
}
//#endregion