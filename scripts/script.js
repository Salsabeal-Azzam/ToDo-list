const taskList = document.getElementById('task-list');
const title = document.getElementById('title');
const hours = document.getElementById('deadline-hours');
const minutes = document.getElementById('deadline-minutes');
const day = document.getElementById('deadline-day');
const month = document.getElementById('deadline-month');
const year = document.getElementById('deadline-year');
const submit = document.getElementById('enable');
var interval;
Notification.requestPermission().then(() => console.log('permission Granted'));

submit.addEventListener('click', createTask);
const db = idb.open('todo-list', 1, function (upgradeDB) {
  switch (upgradeDB.oldVersion) {
    case 0:
    case 1:
      upgradeDB.createObjectStore('to-do-list', { keyPath: 'id' });
      break;
  }
});

function createTask() {
  let obj = {
    id: 15,
    taskName: title.value,
    hour: hours.value,
    minutes: minutes.value,
    day: day.value,
    month: month.value,
    year: year.value,
  };
  db.then((dbObj) => {
    const objectStore = dbObj
      .transaction('to-do-list', 'readwrite')
      .objectStore('to-do-list');
    const add = objectStore.add(obj).then(() => {
      getTasks();
      interval = createInterval();
    });
    return add;
  });
}
function getTasks() {
  db.then((dbobj) => {
    const objectStore = dbobj
      .transaction('to-do-list')
      .objectStore('to-do-list');
    return objectStore.getAll().then((data) => {
      data.map((task) => {
        let item = `<p>${task.taskName}</p>`;
        taskList.innerHTML += item;
      });
    });
  });
}

function showNotification() {
  navigator.serviceWorker
    .getRegistration()
    .then((worker) => worker.showNotification('This is a notification'));
}

function createInterval() {
  return setInterval(() => {
    db.then((dbobj) => {
      const objectStore = dbobj
        .transaction('to-do-list')
        .objectStore('to-do-list');
      return objectStore.getAll().then((data) => {
        const now = new Date();

        const minuteCheck = now.getMinutes();
        const hourCheck = now.getHours();
        const dayCheck = now.getDate();
        const monthCheck = now.getMonth();
        const yearCheck = now.getFullYear();
        data.map((item) => {
          if (
            minuteCheck == parseInt(item.minutes) &&
            hourCheck == parseInt(item.hour) &&
            dayCheck == parseInt(item.day) &&
            monthCheck == 0 &&
            yearCheck == parseInt(item.year)
          ) {
            console.log('now');
            navigator.serviceWorker.getRegistration().then((worker) => {
              worker.showNotification(item.taskName);
              objectStore.delete('to-do-list', item.id);
              clearInterval(interval);
              return false;
            });
          }
        });
      });
    });
  }, 1000);
}
interval = setInterval(() => {
  db.then((dbobj) => {
    const objectStore = dbobj
      .transaction('to-do-list')
      .objectStore('to-do-list');
    return objectStore.getAll().then((data) => {
      const now = new Date();

      const minuteCheck = now.getMinutes();
      const hourCheck = now.getHours();
      const dayCheck = now.getDate();
      const monthCheck = now.getMonth();
      const yearCheck = now.getFullYear();
      data.map((item) => {
        if (
          minuteCheck == parseInt(item.minutes) &&
          hourCheck == parseInt(item.hour) &&
          dayCheck == parseInt(item.day) &&
          monthCheck == 0 &&
          yearCheck == parseInt(item.year)
        ) {
          console.log('now');
          navigator.serviceWorker.getRegistration().then((worker) => {
            worker.showNotification(item.taskName);
            objectStore.delete('to-do-list', item.id);
            clearInterval(interval);
            return false;
          });
        }
      });
    });
  });
}, 1000);
document
  .getElementsByTagName('button')[0]
  .addEventListener('click', () => clearInterval(interval));
