
let mTransactions = [];
const savedTransactions = JSON.parse(localStorage.getItem("transactions")) || [];
let isLongTap = false;
var contextMenu = document.getElementById('context-menu');
//console.log(contextMenu);

var datepicker = new Datepicker('#datepicker');

document.addEventListener("DOMContentLoaded", () => {
	const savedTransactions = JSON.parse(localStorage.getItem("transactions")) || [];
	mTransactions = savedTransactions;

	//console.log("Завантажені транзакції:", mTransactions);

	updateBalance();
	updateList();

	document.getElementById("date-col").addEventListener("click", () => mySort("longIntTime"));
	document.getElementById("art-col").addEventListener("click", () => mySort("article"));
	document.getElementById("type-col").addEventListener("click", () => mySort("type"));
	document.getElementById("amount-col").addEventListener("click", () => mySort("amount"));

	document.getElementById("button-income").addEventListener("click", () => handleTransactionClick("income"));
	document.getElementById("button-cost").addEventListener("click", () => handleTransactionClick("expense"));

	document.getElementById("theme-switch").addEventListener("click", () => changeThemeStyle());

	const savedTheme = localStorage.getItem("theme");
	if (savedTheme === "dark") {
		document.body.classList.add("dark-theme");
	}

	//menu
	document.getElementById('edit').addEventListener('click', function () {
		const selectedId = document.getElementById('context-menu').getAttribute('data-selected-id');

		const formInput = document.getElementById("income-form");
		formInput.inputId.value = selectedId;
		formInput.inputArt.value = mTransactions[selectedId].article.trim();
		formInput.inputSum.value = mTransactions[selectedId].amount;
		datepicker.setDate(mTransactions[selectedId].longIntTime);
		//editTransaction(selectedId);
		closeContextMenu();
	});

	document.getElementById('delete').addEventListener('click', function (event) {
		const selectedId = document.getElementById('context-menu').getAttribute('data-selected-id');
		const selectedType = document.getElementById('context-menu').getAttribute('data-type-ctx');
		const selectedAmount = document.getElementById('context-menu').getAttribute('data-amount-ctx');

		//console.log(selectedId);
		//console.log(mTransactions[Number(selectedId)]);

		// Викликаємо simpleConfirm з повідомленням
		simpleConfirm(event, 'Ви дійсно хочете видалити цю транзакцію?', function (confirmed) {
			if (confirmed) {
				//console.log(selectedId, selectedType, selectedAmount);
				deleteRecordFromBD(selectedId, selectedType, parseFloat(selectedAmount));
			}
			closeContextMenu();  // Закриття контекстного меню в будь-якому випадку
		});
	});

	document.getElementById('cancel').addEventListener('click', closeContextMenu);

	document.querySelectorAll('.list-item').forEach(item => {
		item.addEventListener('contextmenu', (e) => showContextMenu(e, item));
	});

});


//Контекст меню
function addLongPressListener(element) {
	let longPressTimer = null;

	function startPressTimer(event) {
		if (longPressTimer) return; // Запобігаємо повторному запуску таймера
		longPressTimer = setTimeout(() => {
			showContextMenu(event, true);
		}, 500);
	}

	function clearPressTimer() {
		if (longPressTimer) {
			clearTimeout(longPressTimer);
			longPressTimer = null;
		}
	}

	// Для миші
	element.addEventListener('mousedown', startPressTimer);
	element.addEventListener('mouseup', clearPressTimer);
	element.addEventListener('mouseleave', clearPressTimer);

	// Для сенсорних пристроїв
	element.addEventListener("touchstart", startPressTimer, { passive: false });
	element.addEventListener("touchend", clearPressTimer);
	element.addEventListener("touchmove", clearPressTimer);
}

function handleOutsideClick(event) {

	if (isLongTap) {
		isLongTap = false; // Скидаємо прапорець
		return; // Вихід із функції, щоб не закривати меню
	}

	if (!contextMenu.contains(event.target)) {
		closeContextMenu();
		document.removeEventListener('click', handleOutsideClick);
	}
}

function closeContextMenu() {
	contextMenu.classList.remove('show');
	contextMenu.classList.add('visually-hidden');
}

async function showContextMenu(event, element, longTap = false) {
	event.preventDefault();

	//contextMenu.classList.remove('visually-hidden');
	//contextMenu.classList.add('show');

	if (event.touches && event.touches.length > 0) {
		xPos = event.touches?.[0].pageX || event.clientX;
		yPos = event.touches?.[0].pageY || event.clientY;
	} else {
		xPos = event.clientX;
		yPos = event.clientY;
	}

	//console.log("*", xPos);
	//console.log("*", yPos);

	await getAttributeAsync(element, "data-type");

	await nextFrame();

	contextMenu.classList.remove('visually-hidden');
	contextMenu.classList.add('show');

	let coords = getInScreenCoords(event, contextMenu.offsetWidth, contextMenu.offsetHeight);

	contextMenu.style.left = `${coords.x}px`;
	contextMenu.style.top = `${coords.y}px`;

	contextMenu.setAttribute('data-type-ctx', element.getAttribute('data-type'));
	contextMenu.setAttribute('data-amount-ctx', element.getAttribute('data-amount'));
	contextMenu.setAttribute('data-selected-id', element.getAttribute('data-id'));


	//console.log(contextMenu.style.left);
	//console.log(contextMenu.style.top);

	isLongTap = longTap;
	setTimeout(() => {
		document.addEventListener('click', handleOutsideClick);
	}, 50);
}

//хз нашо 
function nextFrame() {
	return new Promise(requestAnimationFrame);
}

function getAttributeAsync(element, attribute) {
	return new Promise((resolve, reject) => {

		if (!element) return reject("Елемент не існує!");

		try {
			let attr = element.getAttribute(attribute);
			if (attr !== null) {
				resolve(attr);
			} else {
				reject(`Атрибут ${attribute} не знайдено!`);
			}
		} catch (error) {
			reject(error);
		}
	});
}

function getInScreenCoords(event, objWidth, objHeight, objPadding = 10) {
	const screenWidth = window.innerWidth;
	const screenHeight = window.innerHeight;

	let xPos = 0;
	let yPos = 0;

	if (event.touches && event.touches.length > 0) {
		xPos = event.touches[0].pageX;
		yPos = event.touches[0].pageY;
	} else {
		xPos = event.clientX;
		yPos = event.clientY;
	}

	// Виправляємо, якщо елемент виходить за межі екрану
	if (xPos + objWidth + objPadding > screenWidth) {
		xPos = screenWidth - objWidth - objPadding;
	}
	if (yPos + objHeight + objPadding > screenHeight) {
		yPos = screenHeight - objHeight - objPadding;
	}

	// Додаємо скрол для правильного позиціонування
	const scrollY = window.scrollY || document.documentElement.scrollTop;

	yPos = Math.max(yPos + scrollY, objPadding);
	xPos = Math.max(xPos, objPadding);

	return { x: xPos, y: yPos };
}

//Кінець меню
function simpleConfirm(event, message, onConfirm) {
	let xConfirm = contextMenu.style.left;
	let yConfirm = contextMenu.style.top;

	closeContextMenu(); // Закриваємо контекстне меню

	// Створюємо попап
	const confirmBox = document.createElement('div');
	confirmBox.innerHTML = `
        <p>${message}</p>
        <div>
            <button id="yes-btn">Так</button>
            <button id="no-btn">Ні</button>
        </div>`;
	confirmBox.classList.add('context-box');

	confirmBox.style.left = xConfirm;
	confirmBox.style.top = yConfirm;
	document.body.appendChild(confirmBox);

	// Обробка кнопок
	confirmBox.querySelector('#yes-btn').onclick = () => {
		onConfirm(true);
		closeConfirmBox();
	};

	confirmBox.querySelector('#no-btn').onclick = () => {
		onConfirm(false);
		closeConfirmBox();
	};

	// Закриття при кліку поза попапом
	function handleClickOutside(e) {
		if (!confirmBox.contains(e.target)) {
			closeConfirmBox();
		}
	}

	function closeConfirmBox() {
		confirmBox.remove();
		document.removeEventListener('click', handleClickOutside);
	}

	setTimeout(() => {
		document.addEventListener('click', handleClickOutside);
	}, 50); // Невелика затримка, щоб не спрацювало одразу після створення
}
//Кінець конфірм

function changeThemeStyle() {
	document.body.classList.toggle("dark-theme");
	let img_field = document.getElementById("theme-switch");
	if (document.body.classList.contains("dark-theme")) {
		localStorage.setItem("theme", "dark");
		img_field.setAttribute("src", "./img/sun-regular.svg");
		img_field.setAttribute("alt", "Light theme");
	} else {
		localStorage.setItem("theme", "light");
		img_field.setAttribute("src", "./img/moon-solid.svg");
		img_field.setAttribute("alt", "Dark theme");
	}
}

//робочі функції
function mySort(key) {
	mTransactions.sort((a, b) => {
		if (typeof a[key] === "number" && typeof b[key] === "number") {
			return a[key] - b[key];
		}
		if (typeof a[key] === "string" && typeof b[key] === "string") {
			return a[key].localeCompare(b[key]);
		}
		return 0;
	});
	updateList();
}

function checkValidate(dateField, articleField, sumField) {
	if (dateField.value.trim().length !== 10) {
		//console.log('date ', dateField.value.trim());
		return false;
	}

	if (/^\s*$/.test(articleField.value.trim())) {
		//console.log('articleField ', articleField.value.trim());
		return false;
	}

	if (/^-?\d+([.,]\d+)?$/.test(sumField.value)) {
		//console.log('sum ', sumField.value);
		return true;
	} else {
		return false;
	}
}

//додавання і апдейт
function addTransaction(date, longIntTime, type, article, amount, index = null) {
	const newTransaction = {
		id: index === null ? mTransactions.length : index,
		longIntTime,
		date,
		type,
		article,
		amount: parseFloat(amount),
	};

	if (index == null) {
		mTransactions.push(newTransaction);
	} else {
		mTransactions[index] = newTransaction;
	}

	addLocalStorageTransaction();
}

function addLocalStorageTransaction() {
	localStorage.setItem("transactions", JSON.stringify(mTransactions));
}

function handleTransactionClick(type) {
	const formInput = document.getElementById("income-form");

	const sumField = formInput.inputSum;
	const articleField = formInput.inputArt;
	const dateField = formInput.datepicker;
	const idField = formInput.inputId.valueAsNumber;

	const trIndex = isNaN(idField) ? null : idField;

	const validated = checkValidate(dateField, articleField, sumField);

	//if (/^-?\d+([.,]\d+)?$/.test(sumField.value) && articleField.value.trim() != "" && dateField.value.trim() != "")
	if (validated) {
		const costField = parseFloat(sumField.value.replace(",", "."));
		const longIntTime = datepicker.getDate().getTime();

		addTransaction(dateField.value.trim(), longIntTime, type, articleField.value.trim(), costField, trIndex);

		formInput.reset();
		updateList();
		updateBalance();
		//localStorage.setItem("balance", balDash);

		//document.getElementById("balance").textContent = balDash;

		//console.log("Новий баланс:", balDash);
		//console.log("transactions:", localStorage.getItem("transactions"));
	} else {
		alert("Помилка! Введено некоректний символ.");
	}
}

function updateBalance() {
	newBalance = 0;
	mTransactions.forEach((item) => {
		if (item.type == "income") {
			newBalance = newBalance + item.amount;
		} else {
			newBalance = newBalance - item.amount;
		};
	});

	document.getElementById("balance").textContent = newBalance;
	localStorage.setItem("balance", newBalance);
}

function updateList() {

	const listField = document.getElementById("statistic-sec");

	while (listField.children.length > 3) {
		listField.removeChild(listField.lastChild);
	}

	for (let i = 0; i < mTransactions.length; i++) {
		// Створюємо головний контейнер для рядка
		let listDiv = document.createElement('div');
		let typeTrans = mTransactions[i].type.toUpperCase().trim();

		listDiv.className = 'list-item active';
		listDiv.setAttribute("data-id", i);
		listDiv.setAttribute("data-date", mTransactions[i].date.trim());
		listDiv.setAttribute("data-type", typeTrans);
		listDiv.setAttribute("data-amount", mTransactions[i].amount);

		addLongPressListener(listDiv, contextMenu);

		// Додаємо елемент на сторінку
		//document.querySelector('#transactions-container').appendChild(listDiv);

		// Створюємо комірки рядка
		let listItem1 = document.createElement('div'); // Використовуємо document.createElement
		listItem1.className = 'item-cell text-start';
		listItem1.textContent = mTransactions[i].date; // Дата чи ID
		listDiv.appendChild(listItem1); // Додаємо до головного контейнера

		//console.log(new Date(mTransactions[i].date).toDateString);
		//console.log(new Date(mTransactions[i].date));


		let listItem2 = document.createElement('div');
		listItem2.className = 'item-cell text-end';
		listItem2.textContent = mTransactions[i].type.toUpperCase(); // Тип
		listDiv.appendChild(listItem2);

		let listItem3 = document.createElement('div');
		listItem3.className = 'item-cell text-end';
		listItem3.textContent = mTransactions[i].article; // Стаття
		listDiv.appendChild(listItem3);

		let listItem4 = document.createElement('div');
		listItem4.className = 'item-cell text-end';
		listItem4.textContent = `$${mTransactions[i].amount}`; // Сума

		if (typeTrans == "EXPENSE") {
			listItem4.classList.add('expenses-bg');
			//listItem4.classList.remove('income-bg');
		} else {
			listItem4.classList.add('income-bg');
			//listItem4.classList.remove('expenses-bg');
		}

		listDiv.appendChild(listItem4);

		// Додаємо події
		listDiv.onmouseover = function () {
			this.style.fontWeight = "700";
			this.style.textShadow = "2px 2px 4px 0.5";
			this.style.cursor = "pointer";
		};

		listDiv.onmouseout = function () {
			this.style.fontWeight = "400";
			this.style.textShadow = "0 0 0";
		};


		//listDiv.onclick = function () {
		//	// Отримуємо дані з атрибутів
		//	const transactionId = this.getAttribute("data-id");
		//	const transactionType = this.getAttribute("data-type");
		//	const transactionAmount = this.getAttribute("data-amount");

		//	let vDel = confirm(`Видалити запис: ${this.getAttribute("data-date")} - ${transactionType} - $${transactionAmount}?`);
		//	if (vDel) {
		//		deleteRecordFromBD(parseInt(transactionId), transactionType, parseFloat(transactionAmount));
		//	}
		//};


		// Додаємо контейнер до списку
		listField.appendChild(listDiv);
	}
}

//Видалення
function deleteRecordFromBD(list_id, list_type, List_amount) {

	if (list_id >= 0) {
		//console.log("Record found at index:", list_id);
		mTransactions.splice(list_id, 1);

		addLocalStorageTransaction();
		updateList();
		updateBalance();
	} else {
		console.warn("Record not found for ID:", list_id);
	}
}
