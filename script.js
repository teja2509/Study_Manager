document.addEventListener('DOMContentLoaded', function () {
    const timeElement = document.getElementById('time');
    const startButton = document.getElementById('startBtn');
    const stopButton = document.getElementById('stopBtn');
    const deleteAllButton = document.getElementById('deleteAllBtn');
    const logTableBody = document.querySelector('#logTable tbody');
    const topicSelect = document.getElementById('topic');
    const newTopicInput = document.getElementById('newTopic');
    const addTopicBtn = document.getElementById('addTopicBtn');
    const messageElement = document.createElement('p');
    let startTime;
    let stopTime;
    let isButtonClicked = false;
    let isTimerRunning = false; // Variable to track the running state
    let messageIntervalId;

    function showMessage(message, color) {
        messageElement.innerText = message;
        messageElement.style.color = color;

        // Append the message to the navbar container
        const navbarMessage = document.getElementById('navbarMessage');

        // Check if there is already a message element in the navbar
        const existingMessageElement = navbarMessage.querySelector('.message');

        // If there is an existing message, remove it
        if (existingMessageElement) {
            navbarMessage.removeChild(existingMessageElement);
        }

        // Add the new message element
        const newMessageElement = document.createElement('p');
        newMessageElement.className = 'message';
        newMessageElement.innerText = message;
        newMessageElement.style.color = color;
        navbarMessage.appendChild(newMessageElement);

        // Clear the message after 3 seconds
        setTimeout(() => {
            navbarMessage.removeChild(newMessageElement);
        }, 3000);

        // Reset the flag after the message is displayed
        isButtonClicked = false;
    }

    // Load log entries from local storage if they exist
    const storedLogEntries = JSON.parse(localStorage.getItem('timeTrackerEntries')) || [];

    // Debugging: Log the retrieved log entries
    console.log("Stored Log Entries:", storedLogEntries);

    // Add existing log entries to the table
    storedLogEntries.forEach(entry => {
        if (isValidLogEntry(entry)) {
            console.log("Adding entry to the table:", entry);
            addLogEntryToTable(entry);
        }
    });

    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);

    function updateCurrentTime() {
        const now = new Date();
        let hours = now.getHours();
        const amPm = hours >= 12 ? 'PM' : 'AM';
        hours = (hours % 12) || 12; // Convert to 12-hour format
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        timeElement.innerText = `${hours}:${minutes}:${seconds} ${amPm}`;
    }

    function startTimer() {
        if (!isTimerRunning) {
            startTime = new Date();
            localStorage.setItem('startTime', startTime);

            if (topicSelect.value !== "") {
                localStorage.setItem('topic', topicSelect.value);
                startButton.disabled = false;
            }

            intervalId = setInterval(updateCurrentTime, 1000);
            stopButton.disabled = false;
            startButton.disabled = true;

            // Display a start message continuously
            const topic = topicSelect.value || "No Topic";
            messageIntervalId = setInterval(() => {
                showMessage(`Timer is running with topic: ${topic}`, 'black');
            }, 1000);

            isTimerRunning = true; // Update the running state

            const selectedTopic = topicSelect.value;
    startButton.disabled = selectedTopic === ''; 
        }
    }

    function stopTimer() {
        if (isTimerRunning) {
            clearInterval(intervalId);
            clearInterval(messageIntervalId); // Clear the message interval
            stopButton.disabled = true;
            startButton.disabled = false;

            stopTime = new Date();
            const duration = Math.floor((stopTime - startTime) / 1000);
            const selectedTopic = topicSelect.value;

            // Save the log entry to local storage
            const logEntry = {
                start: startTime.toISOString(),
                stop: stopTime.toISOString(),
                duration: duration,
                topic: selectedTopic
            };

            storedLogEntries.push(logEntry);
            localStorage.setItem('timeTrackerEntries', JSON.stringify(storedLogEntries));

            // Debugging: Log the updated log entries
            console.log("Updated Log Entries:", storedLogEntries);

            // Add the log entry to the table
            addLogEntryToTable(logEntry);
            showMessage(`Timer stopped with ${duration} seconds.`, 'red');

            isTimerRunning = false; // Update the running state

            
    startButton.disabled = selectedTopic === '';
        }
    }

    function clearMessage() {
        // Clear the message
        const navbarMessage = document.getElementById('navbarMessage');
        const messageElement = navbarMessage.querySelector('.message');
        if (messageElement) {
            navbarMessage.removeChild(messageElement);
        }
    }

    function deleteAllEntries() {
        // Show a confirmation message in the navbar
        showMessage('All data will be deleted. Click again to confirm.', 'black');

        // Use the confirm function to display a browser alert
        const confirmation = confirm('Are you sure you want to delete all data? This action cannot be undone.');

        if (confirmation) {
            // Clear all log entries
            storedLogEntries.length = 0;
            localStorage.setItem('timeTrackerEntries', JSON.stringify(storedLogEntries));

            // Clear the table
            logTableBody.innerHTML = '';

            // Debugging: Log the cleared log entries
            console.log("Cleared Log Entries:", storedLogEntries);

            // Display a message indicating data deletion
            showMessage('Data deleted successfully.', 'red');
        } else {
            // User canceled the delete action, clear the confirmation message
            const navbarMessage = document.getElementById('navbarMessage');
            const confirmationMessage = navbarMessage.querySelector('.message');
            if (confirmationMessage) {
                navbarMessage.removeChild(confirmationMessage);
            }

            // Display a message indicating data safety
            showMessage('Data is safe.', 'green');
        }
        const selectedTopic = topicSelect.value;
    startButton.disabled = selectedTopic === ''; 
    }

    function addLogEntryToTable(entry) {
        if (isValidLogEntry(entry)) {
            const startDate = formatDate(new Date(entry.start));
            const startTime = formatTime(new Date(entry.start));
            const stopTime = formatTime(new Date(entry.stop));
            const durationFormatted = formatDuration(entry.duration);

            const row = logTableBody.insertRow();

            const dateCell = row.insertCell(0);
            const startTimeCell = row.insertCell(1);
            const stopTimeCell = row.insertCell(2);
            const durationCell = row.insertCell(3);
            const topicCell = row.insertCell(4);

            dateCell.innerText = startDate;
            startTimeCell.innerText = startTime;
            stopTimeCell.innerText = stopTime;
            durationCell.innerText = durationFormatted;
            topicCell.innerText = entry.topic;
        }
    }

    function isValidLogEntry(entry) {
        return (
            entry &&
            typeof entry.start === 'string' &&
            typeof entry.stop === 'string' &&
            typeof entry.duration === 'number' &&
            typeof entry.topic === 'string'
        );
    }

    function formatDate(date) {
        const options = { year: 'numeric', month: 'numeric', day: 'numeric' };
        return date.toLocaleDateString(undefined, options);
    }

    function formatTime(date) {
        const options = { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true };
        return date.toLocaleTimeString(undefined, options);
    }

    function formatDuration(durationInSeconds) {
        const hours = Math.floor(durationInSeconds / 3600).toString().padStart(2, '0');
        const minutes = Math.floor((durationInSeconds % 3600) / 60).toString().padStart(2, '0');
        const seconds = (durationInSeconds % 60).toString().padStart(2, '0');

        return `${hours}:${minutes}:${seconds}`;
    }

    // Disable start and stop buttons on page load
    startButton.disabled = true;
    stopButton.disabled = true;

    startButton.addEventListener('click', startTimer);
    stopButton.addEventListener('click', stopTimer);
    deleteAllButton.addEventListener('click', deleteAllEntries);

    // Enable the "Start" button when a topic is selected
    topicSelect.addEventListener('change', function () {
        const selectedTopic = topicSelect.value;
        if (selectedTopic === "") {
            // If no topic is selected, disable the "Start" button
            startButton.disabled = true;
        } else {
            // If a topic is selected, enable the "Start" button
            startButton.disabled = false;
        }
    });

    // Event listener for the "Add Topic" button
addTopicBtn.addEventListener('click', function () {
    const newTopicValue = newTopicInput.value.trim();
    const navbarMessage = document.getElementById('navbarMessage');

    if (newTopicValue !== '') {
        // Check if the topic already exists in the dropdown
        const existingOption = Array.from(topicSelect.options).find(
            option => option.value.toLowerCase() === newTopicValue.toLowerCase()
        );

        if (!existingOption) {
            // Create a new option and add it to the dropdown
            const newOption = document.createElement('option');
            newOption.value = newTopicValue;
            newOption.textContent = newTopicValue;
            topicSelect.add(newOption);

            // Select the newly added option
            topicSelect.value = newTopicValue;

            // Clear the new topic input
            newTopicInput.value = '';

            // Show success message in the navbar
            showMessage(`Topic "${newTopicValue}" added successfully.`, 'green');
        } else {
            // Topic already exists
            showMessage(`Topic "${newTopicValue}" already exists in the list.`, 'red');
        }
    } else {
        // No input provided
        showMessage('Please enter a topic.', 'black');
    }

    // Check if a topic is selected to determine the visibility of the "Start" button
    const selectedTopic = topicSelect.value;
    startButton.disabled = selectedTopic === ''; // Disable the "Start" button if no topic is selected
});

window.addEventListener('beforeunload', function () {
    // Check if the timer is running and store the necessary data
    if (isTimerRunning) {
        stopTimer(); // Stop the timer before leaving the page
    }
});





    function saveTopicsToLocalStorage() {
        const topics = Array.from(topicSelect.options).map(option => option.value);
        localStorage.setItem('timeTrackerTopics', JSON.stringify(topics));
    }

    // Clear message on page load
    clearMessage();
});
