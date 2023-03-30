    const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
    // Hold an instance of a db object for us to store the IndexedDB data in
    let db;
  
    // Create a reference to the notifications list in the bottom of the app; we will write database messages into this list by
    // appending list items as children of this element
  
    // All other UI elements we need for the app
    const taskList = document.getElementById('task-list');
    const taskForm = document.getElementById('task-form');
    const title = document.getElementById('title');
    const hours = document.getElementById('deadline-hours');
    const minutes = document.getElementById('deadline-minutes');
    const day = document.getElementById('deadline-day');
    const month = document.getElementById('deadline-month');
    const year = document.getElementById('deadline-year');
    const notificationBtn = document.getElementById('enable');
  
    // Do an initial check to see what the notification permission state is
    if (Notification.permission === 'denied' || Notification.permission === 'default') {
      notificationBtn.style.display = 'block';
    } else {
      notificationBtn.style.display = 'none';
    }
  
  
    // Let us open our database
    const DBOpenRequest = window.indexedDB.open('toDoList', 4);
  
    // Register two event handlers to act on the database being opened successfully, or not

  
    DBOpenRequest.onsuccess = (event) => {
  
      // Store the result of opening the database in the db variable. This is used a lot below
      db = DBOpenRequest.result;
  
      // Run the displayData() function to populate the task list with all the to-do list data already in the IndexedDB
      displayData();
    };
  
    // This event handles the event whereby a new version of the database needs to be created
    // Either one has not been created before, or a new version number has been submitted via the
    // window.indexedDB.open line above
    //it is only implemented in recent browsers
    DBOpenRequest.onupgradeneeded = (event) => {
      db = event.target.result;
  
      db.onerror = (event) => {
        console.log(event.error);
      };
  
      // Create an objectStore for this database with uonic title
      const objectStore = db.createObjectStore('toDoList', { keyPath: 'taskTitle' });
  
      // Define what data items the objectStore will contain
      objectStore.createIndex('hours', 'hours', { unique: false });
      objectStore.createIndex('minutes', 'minutes', { unique: false });
      objectStore.createIndex('day', 'day', { unique: false });
      objectStore.createIndex('month', 'month', { unique: false });
      objectStore.createIndex('year', 'year', { unique: false });
      objectStore.createIndex('notified', 'notified', { unique: false });
  
    };
  
    function displayData() {
      // First clear the content of the task list so that you don't get a huge long list of duplicate stuff each time
      // the display is updated.
      while (taskList.firstChild) {
        taskList.removeChild(taskList.lastChild);
      }
  
      // Open our object store and then get a cursor list of all the different data items in the IDB to iterate through
      const objectStore = db.transaction('toDoList').objectStore('toDoList');
      objectStore.openCursor().onsuccess = (event) => {
        const cursor = event.target.result;
        // Check if there are no (more) cursor items to iterate through
        if (!cursor) {
          // No more items to iterate through, we quit.
          return;
        }
        
        // Check which suffix the deadline day of the month needs
        const { hours, minutes, day, month, year, notified, taskTitle } = cursor.value;
  
        // Build the to-do list entry and put it into the list item.
        const toDoText = `${taskTitle} — ${hours}:${minutes}, ${month} ${day} ${year}.`;
        const listItem = createListItem(toDoText);
  
        if (notified === 'yes') {
          listItem.style.textDecoration = 'line-through';
          listItem.style.color = ' rgb(71, 130, 238)';
        }
  
        // Put the item item inside the task list
        taskList.appendChild(listItem);
  
        // Create a delete button inside each list item,
        const deleteButton = document.createElement('button');
        listItem.appendChild(deleteButton);
        deleteButton.textContent = 'X';
        
        // Set a data attribute on our delete button to associate the task it relates to.
        deleteButton.setAttribute('data-task', taskTitle);
        
        // Associate action (deletion) when clicked
        deleteButton.onclick = (event) => {
          deleteItem(event);
        };
  
        // continue on to the next item in the cursor
        cursor.continue();
      };
    };
  
    // Add listener for clicking the submit button
    taskForm.addEventListener('submit', addData, false);
  
    function addData(e) {
      // Prevent default, as we don't want the form to submit in the conventional way
      e.preventDefault();
  
      // Stop the form submitting if any values are left empty.
      // This should never happen as there is the required attribute
      if (title.value === '' || hours.value === null || minutes.value === null || day.value === '' || month.value === '' || year.value === null) {
        console.log("emty vaule");
        return;
      }
      
      // Grab the values entered into the form fields and store them in an object ready for being inserted into the IndexedDB
      const newItem = [
        { taskTitle: title.value, hours: hours.value, minutes: minutes.value, day: day.value, month: month.value, year: year.value, notified: 'no' },
      ];
  
      // Open a read/write DB transaction, ready for adding the data
      const transaction = db.transaction(['toDoList'], 'readwrite');
  
      // Report on the success of the transaction completing, when everything is done
      transaction.oncomplete = () => {
  
        // Update the display of data to show the newly added item, by running displayData() again.
        displayData();
      };
  
      // Handler for any unexpected error
      transaction.onerror = () => {
        alert(`Please enter another name of task `);
        throw ` transaction error here ${transaction.error}`
      };
  
      // Call an object store that's already been added to the database
      const objectStore = transaction.objectStore('toDoList');
      console.log(objectStore.indexNames);
      console.log(objectStore.keyPath);
      console.log(objectStore.name);
      console.log(objectStore.transaction);
      console.log(objectStore.autoIncrement);
  
      // Make a request to add our newItem object to the object store
      const objectStoreRequest = objectStore.add(newItem[0]);
      objectStoreRequest.onsuccess = (event) => {
  
        // Report the success of our request
        // (to detect whether it has been succesfully
        // added to the database, you'd look at transaction.oncomplete)
         console.log("Request successful");
        // Clear the form, ready for adding the next entry
        title.value = '';
        hours.value = null;
        minutes.value = null;
        day.value = 01;
        month.value = 'January';
        year.value = 2020;
      };
    };
  
    // from index Db
    function deleteItem(event) {
      // Retrieve the name of the task we want to delete
      const dataTask = event.target.getAttribute('data-task');
  
      // Open a database transaction and delete the task, finding it by the name we retrieved above
      const transaction = db.transaction(['toDoList'], 'readwrite');
      transaction.objectStore('toDoList').delete(dataTask);
  
      // Report that the data item has been deleted
      transaction.oncomplete = () => {
        // Delete the parent of the button, which is the list item, so it is no longer displayed
        event.target.parentNode.parentNode.removeChild(event.target.parentNode);
        console.log(`Task "${dataTask}" deleted.`);
      };
    };
  
    // Check deadline
    function checkDeadlines() {
      if (Notification.permission === 'denied' || Notification.permission === 'default') {
        notificationBtn.style.display = 'block';
      } else {
        notificationBtn.style.display = 'none';
      }
      const now = new Date();
  
      const minuteCheck = now.getMinutes();
      const hourCheck = now.getHours();
      const dayCheck = now.getDate(); // Do not use getDay() that returns the day of the week, 1 to 7
      const monthCheck = now.getMonth();
      const yearCheck = now.getFullYear(); // Do not use getYear() that is deprecated.
  
      // Open a new transaction
      const objectStore = db.transaction(['toDoList'], 'readwrite').objectStore('toDoList');
      
      // Open a cursor to iterate through all the data items in the IndexedDB
      objectStore.openCursor().onsuccess = (event) => {
        const cursor = event.target.result;
        if (!cursor) return;
        const { hours, minutes, day, month, year, notified, taskTitle } = cursor.value;
  
        // convert the month names we have installed in the IDB into a month number that JavaScript will understand.
        // The JavaScript date object creates month values as a number between 0 and 11.
        const monthNumber = MONTHS.indexOf(month);
        if (monthNumber === -1) throw new Error('Incorrect month entered in database.');
  
        // Check if the current hours, minutes, day, month and year values match the stored values for each task.
        // The parseInt() function transforms the value from a string to a number for comparison
        // (taking care of leading zeros, and removing spaces and underscores from the string).
        let matched = parseInt(hours) === hourCheck;
        matched &&= parseInt(minutes) === minuteCheck;
        matched &&= parseInt(day) === dayCheck;
        matched &&= parseInt(monthNumber) === monthCheck;
        matched &&= parseInt(year) === yearCheck;
        if (matched && notified === 'no') {
          if (Notification.permission === 'granted') {
            createNotification(taskTitle);
          }
        }
  
        // Move on to the next cursor item
        cursor.continue();
      };
    };
  
    // Ask for permission when the 'Enable notifications' button is clicked
    function askNotificationPermission() {
      // Function to actually ask the permissions
      function handlePermission(permission) {
        // Whatever the user answers, we make sure Chrome stores the information
        if (!Reflect.has(Notification, 'permission')) {
          Notification.permission = permission;
        }
  
        // Set the button to shown or hidden, depending on what the user answers
        if (Notification.permission === 'denied' || Notification.permission === 'default') {
          notificationBtn.style.display = 'block';
        } else {
          notificationBtn.style.display = 'none';
        }
      };
  
      // Check if the browser supports notifications
      if (!Reflect.has(window, 'Notification')) {
        console.log('This browser does not support notifications.');
      } else {
        if (checkNotificationPromise()) {
          Notification.requestPermission().then(handlePermission);
        } else {
          Notification.requestPermission(handlePermission);
        }
      }
    };
  
    // Check whether browser supports the promise version of requestPermission()
    // Safari only supports the old callback-based version
    function checkNotificationPromise() {
      try {
        Notification.requestPermission().then();
      } catch(e) {
        return false;
      }
  
      return true;
    };
  
    // Wire up notification permission functionality to 'Enable notifications' button
    notificationBtn.addEventListener('click', askNotificationPermission);
  
    function createListItem(contents) {
      const listItem = document.createElement('li');
      listItem.textContent = contents;
      return listItem;
    };
  
    // Create a notification with the given title
    function createNotification(title) {
      // Create and show the notification
      const img = '../img/do-list-icon-260nw-1081224032.webp';
      const text = `HEY! Your task "${title}" is now overdue.`;
      const notification = new Notification('To do list', { body: text, icon: img });
  
      // We need to update the value of notified to 'yes' in this particular data object, so the
      // notification won't be set off on it again
  
      // First open up a transaction
      const objectStore = db.transaction(['toDoList'], 'readwrite').objectStore('toDoList');
  
      // Get the to-do list object that has this title as its title
      const objectStoreTitleRequest = objectStore.get(title);
  
      objectStoreTitleRequest.onsuccess = () => {
        // Grab the data object returned as the result
        const data = objectStoreTitleRequest.result;
  
        // Update the notified value in the object to 'yes'
        data.notified = 'yes';
  
        // Create another request that inserts the item back into the database
        const updateTitleRequest = objectStore.put(data);
  
        // When this new request succeeds, run the displayData() function again to update the display
        updateTitleRequest.onsuccess = () => {
          displayData();
        };
      };
    };
  
    // Using a setInterval 
    setInterval(checkDeadlines, 1000);
  
  