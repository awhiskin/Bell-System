let bells = [];
let availableSounds = ['chime01.wav', 'chime02.wav'];

class Bell {
    constructor(time, sound) {
        this.time = time;
        this.sound = sound;
        this.audio = new Audio('audio/' + sound);
        this.timeout = null;
    }

	schedule() {
		let now = new Date();
		let bellDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), this.time.split(':')[0], this.time.split(':')[1]);

		if (now > bellDate) {
			bellDate.setDate(bellDate.getDate() + 1);
		}

		let timeToBell = bellDate - now;
		this.timeout = setTimeout(() => {
			this.audio.play();
			updateBellList();
			saveBells();
			this.schedule();
		}, timeToBell);
	}

    cancel() {
        clearTimeout(this.timeout);
    }
}

function saveBells() {
    let bellsData = bells.map(bell => ({time: bell.time, sound: bell.sound}));
    localStorage.setItem('bells', JSON.stringify(bellsData));
}

function loadBells() {
    let bellsData = JSON.parse(localStorage.getItem('bells')) || [];
    bells = bellsData.map(data => {
        let bell = new Bell(data.time, data.sound);
        if (!bell.triggered) {
            bell.schedule();
        }
        return bell;
    });
}

function sortBells() {
    bells.sort((a, b) => a.time.localeCompare(b.time));
}

function refreshGUI() {
	sortBells();
	updateBellList();
}

function addBell() {
	let bellTime = document.getElementById('bellTime').value;
	let bellSound = document.getElementById('bellSound').value;
	
	if (bells.some(bell => bell.time === bellTime) || (bellTime === undefined || bellTime === "")) {
		return;
	}
	let bell = new Bell(bellTime, bellSound);
	bell.schedule();
	bells.push(bell);
	sortBells();
	saveBells();
	updateBellList();
}

function clearAllBells() {
	if (bells.length === 0) { return; }
	
	if (window.confirm("Are you sure? This will clear all bells.") == true) {
		bells.forEach(bell => bell.cancel());
		bells = [];
		saveBells();
		updateBellList();
	}
}

function updateBellList() {
	let bellList = document.getElementById('bellList');
	bellList.innerHTML = '';

	let tableHeaderRow = document.createElement('tr');

	let tableHeaderColumn1 = document.createElement('th');
	tableHeaderColumn1.innerText = 'Time';
	tableHeaderColumn1.className = 'timeColumn';

	let tableHeaderColumn2 = document.createElement('th');
	tableHeaderColumn2.innerText = 'Sound';
	tableHeaderColumn2.className = 'soundColumn';

	let tableHeaderColumn3 = document.createElement('th');
	// tableHeaderColumn3.innerText = 'Delete?';
	tableHeaderColumn3.className = 'deleteColumn';
	
	tableHeaderRow.append(tableHeaderColumn1, tableHeaderColumn2, tableHeaderColumn3);
	bellList.appendChild(tableHeaderRow);

	let now = new Date();
	let currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

	for (let i = 0; i < bells.length; i++) {
		let listItem = document.createElement('tr');

		let timeParts = bells[i].time.split(':');
		let hours = timeParts[0] % 12 || 12;
		let minutes = timeParts[1];
		let ampm = timeParts[0] >= 12 ? 'PM' : 'AM';

		let timeElement = document.createElement('td');
		let timeSpan = document.createElement('span');
		timeSpan.textContent = hours + ':' + minutes + ' ' + ampm;
		timeElement.append(timeSpan);

		listItem.append(timeElement)

		if (bells[i].time <= currentTime) {
			listItem.classList.add('inactive')
			listItem.classList.remove('active')
		} else {
			listItem.classList.remove('inactive')
			listItem.classList.add('active')
		}

		let soundElement = document.createElement('td')
		let soundItem = document.createElement('span')
		soundItem.textContent = bells[i].sound
		soundElement.append(soundItem)
		listItem.append(soundElement)

		let deleteElement = document.createElement('td')
		let deleteButton = document.createElement('button');
		deleteButton.textContent = 'Delete';
		deleteButton.onclick = function() {
			if (confirm("Are you sure you wish to delete this bell for " + hours + ':' + minutes + ' ' + ampm + "?")) {
				bells[i].cancel();
				bells.splice(i, 1);
				sortBells();
				saveBells();
				updateBellList();
			}
		};
		deleteElement.append(deleteButton)
		listItem.append(deleteElement)

		bellList.appendChild(listItem);
	}
}

window.onload = function() {
    let select = document.getElementById('bellSound');
    for (let i = 0; i < availableSounds.length; i++) {
        let option = document.createElement('option');
        option.value = availableSounds[i];
        option.text = availableSounds[i];
        select.appendChild(option);
    }
	loadBells();
	sortBells();
	updateBellList();
	setInterval(refreshGUI, 15000);
    document.querySelector('#addBellButton').onclick = addBell;
    document.querySelector('#clearAllBellsButton').onclick = clearAllBells;
	
	// Set bellTime input field value to the current time plus 1 minute
    let now = new Date();
    now.setMinutes(now.getMinutes() + 1);
    let hours = now.getHours().toString().padStart(2, '0');
    let minutes = now.getMinutes().toString().padStart(2, '0');
    document.getElementById('bellTime').value = hours + ':' + minutes;

	displayTime();
	setInterval(displayTime, 100);
};

function displayTime() {
	var date = new Date();
	var hours = date.getHours();
	var minutes = date.getMinutes();
	var seconds = date.getSeconds();
	var ampm = hours >= 12 ? 'PM' : 'AM';
	hours = hours % 12;
	hours = hours ? hours : 12; // the hour '0' should be '12'
	minutes = minutes < 10 ? '0'+minutes : minutes;
	seconds = seconds < 10 ? '0'+seconds : seconds;
	var strTime = hours + ':' + minutes + ':' + seconds + ' ' + ampm;
	document.getElementById('clock').textContent = strTime;
}
