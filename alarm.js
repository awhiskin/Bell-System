let alarms = [];
let availableSounds = ['chime01.wav', 'chime02.wav'];

class Alarm {
    constructor(time, sound) {
        this.time = time;
        this.sound = sound;
        this.audio = new Audio('audio/' + sound);
        this.timeout = null;
    }

	schedule() {
		let now = new Date();
		let alarmDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), this.time.split(':')[0], this.time.split(':')[1]);

		if (now > alarmDate) {
			alarmDate.setDate(alarmDate.getDate() + 1);
		}

		let timeToAlarm = alarmDate - now;
		this.timeout = setTimeout(() => {
			this.audio.play();
			updateAlarmList();
			saveAlarms();
			this.schedule();
		}, timeToAlarm);
	}

    cancel() {
        clearTimeout(this.timeout);
    }
}

function saveAlarms() {
    let alarmsData = alarms.map(alarm => ({time: alarm.time, sound: alarm.sound}));
    localStorage.setItem('alarms', JSON.stringify(alarmsData));
}

function loadAlarms() {
    let alarmsData = JSON.parse(localStorage.getItem('alarms')) || [];
    alarms = alarmsData.map(data => {
        let alarm = new Alarm(data.time, data.sound);
        if (!alarm.triggered) {
            alarm.schedule();
        }
        return alarm;
    });
}

function sortAlarms() {
    alarms.sort((a, b) => a.time.localeCompare(b.time));
}

function refreshGUI() {
	sortAlarms();
	updateAlarmList();
}

function addAlarm() {
	let alarmTime = document.getElementById('alarmTime').value;
	let alarmSound = document.getElementById('alarmSound').value;
	
	if (alarms.some(alarm => alarm.time === alarmTime) || (alarmTime === undefined || alarmTime === '')) {
		return;
	}
	let alarm = new Alarm(alarmTime, alarmSound);
	alarm.schedule();
	alarms.push(alarm);
	sortAlarms();
	saveAlarms();
	updateAlarmList();
}

function clearAllAlarms() {
	if (alarms.length === 0) { return; }
	
	if (window.confirm("Are you sure? This will clear all alarms.") == true) {
		alarms.forEach(alarm => alarm.cancel());
		alarms = [];
		saveAlarms();
		updateAlarmList();
	}
}

function updateAlarmList() {
	let alarmList = document.getElementById('alarmList');
	alarmList.innerHTML = '';
	let now = new Date();
	let currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
	for (let i = 0; i < alarms.length; i++) {
		let listItem = document.createElement('li');
		let timeParts = alarms[i].time.split(':');
		let hours = timeParts[0] % 12 || 12;
		let minutes = timeParts[1];
		let ampm = timeParts[0] >= 12 ? 'PM' : 'AM';
		listItem.textContent = hours + ':' + minutes + ' ' + ampm;
		if (alarms[i].time <= currentTime) {
			listItem.style.textDecoration = 'line-through';
		}
		let deleteButton = document.createElement('button');
		deleteButton.textContent = 'Delete';
		deleteButton.onclick = function() {
			alarms[i].cancel();
			alarms.splice(i, 1);
			sortAlarms();
			saveAlarms();
			updateAlarmList();
		};
		listItem.appendChild(deleteButton);
		alarmList.appendChild(listItem);
	}
}

window.onload = function() {
    let select = document.getElementById('alarmSound');
    for (let i = 0; i < availableSounds.length; i++) {
        let option = document.createElement('option');
        option.value = availableSounds[i];
        option.text = availableSounds[i];
        select.appendChild(option);
    }
	loadAlarms();
	sortAlarms();
	updateAlarmList();
	setInterval(refreshGUI, 15000);
    document.querySelector('#addAlarmButton').onclick = addAlarm;
    document.querySelector('#clearAllAlarmsButton').onclick = clearAllAlarms;
	
	// Set alarmTime input field value to the current time plus 1 minute
    let now = new Date();
    now.setMinutes(now.getMinutes() + 1);
    let hours = now.getHours().toString().padStart(2, '0');
    let minutes = now.getMinutes().toString().padStart(2, '0');
    document.getElementById('alarmTime').value = hours + ':' + minutes;
};
