
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

	if (mTransactions.length == 0) {
		updateBalance(0);
	} else {
		updateBalance(JSON.parse(localStorage.getItem("balance")));
	}
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
		editTransaction(selectedId);
		closeContextMenu();
	});

	document.getElementById('delete').addEventListener('click', function (event) {
		const selectedId = document.getElementById('context-menu').getAttribute('data-selected-id');
		const selectedType = document.getElementById('context-menu').getAttribute('data-type-ctx');
		const selectedAmount = document.getElementById('context-menu').getAttribute('data-amount-ctx');

		// Викликаємо simpleConfirm з повідомленням
		simpleConfirm(event, 'Ви дійсно хочете видалити цю транзакцію?', function (confirmed) {
			if (confirmed) {
				//console.log(selectedId, selectedType, selectedAmount);
				deleteRecordFromBD(selectedId, selectedType, parseFloat(selectedAmount));  // Видалення при підтвердженні
			}
			closeContextMenu();  // Закриття контекстного меню в будь-якому випадку
		});
	});

	document.getElementById('cancel').addEventListener('click', closeContextMenu);

	document.querySelectorAll('.list-item').forEach(item => {
		item.addEventListener('contextmenu', (e) => showContextMenu(e, item));
	});

});

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

function simpleConfirm(event, message, onConfirm) {

	closeContextMenu();
	// Отримуємо кольори з CSS змінних
	const rootStyles = getComputedStyle(document.documentElement);
	const bgColor = rootStyles.getPropertyValue('--bg-color').trim();
	const textColor = rootStyles.getPropertyValue('--text-color').trim();
	const accentColor = rootStyles.getPropertyValue('--accent-color').trim();
	const hoverColor = rootStyles.getPropertyValue('--hover-color').trim();

	// Створюємо попап
	const confirmBox = document.createElement('div');
	console.log(confirmBox);

	//ширина/висота

	confirmBox.style.position = 'absolute';
	confirmBox.style.left = `${event.pageX - 150}px`;
	confirmBox.style.top = `${event.pageY - 50}px`;
	confirmBox.style.background = bgColor;
	confirmBox.style.color = textColor;
	confirmBox.style.border = `1px solid ${textColor}`;
	confirmBox.style.padding = '10px';
	confirmBox.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
	confirmBox.style.borderRadius = '5px';
	confirmBox.style.zIndex = 1000;
	confirmBox.innerHTML = `
    <p>${message}</p>
		<div style="justify-content:space-around; display:flex;">
    <button id="yes-btn" style="background:${accentColor}; color:${textColor}; border:none; padding:5px 10px; margin-right:5px; border-radius:5px">Так</button>
    <button id="no-btn" style="background:${hoverColor}; color:${textColor}; border:none; padding:5px 10px;border-radius:5px">Ні</button>
		</div>
  `;

	document.body.appendChild(confirmBox);
	console.log(confirmBox);

	// Обробники кнопок
	confirmBox.querySelector('#yes-btn').onclick = () => {
		onConfirm(true);
		confirmBox.remove();
	};

	confirmBox.querySelector('#no-btn').onclick = () => {
		onConfirm(false);
		confirmBox.remove();
	};

	// Закриття при кліку поза попапом
	//document.addEventListener('click', function handleClickOutside(e) {
	//	console.log('remove');

	//	if (!confirmBox.contains(e.target)) {
	//		confirmBox.remove();
	//		document.removeEventListener('click', handleClickOutside);
	//	}
	//}, { once: true });
}

function deleteRecordFromBD(list_id, list_type, List_amount) {
	const balanceValue = parseFloat(document.getElementById("balance").textContent);
	let newBalanceValue = 0;

	if (list_type == "INCOME") {
		newBalanceValue = balanceValue - List_amount;
	} else {
		newBalanceValue = balanceValue + List_amount;
	}

	//console.log("Видалити запис: ", list_id);

	if (list_id >= 0) {
		//console.log("Record found at index:", list_id);
		mTransactions.splice(list_id, 1);

		addLocalStorageTransaction();
		updateList();
		updateBalance(newBalanceValue);
	} else {
		console.warn("Record not found for ID:", list_id);
	}
}

function handleTransactionClick(type) {
	const sumField = document.getElementById("input-sum");
	const articleField = document.getElementById("input-art");
	const dateField = document.getElementById("datepicker");

	let balDash = 0;
	let trIndex = null;

	const balanceField = document.getElementById("balance").textContent;

	if (!isNaN(balanceField) && balanceField.trim() !== "") {
		balDash = parseFloat(balanceField);
	}

	const validated = checkValidate(dateField, articleField, sumField);

	//if (/^-?\d+([.,]\d+)?$/.test(sumField.value) && articleField.value.trim() != "" && dateField.value.trim() != "")
	if (validated) {
		const costField = parseFloat(sumField.value.replace(",", "."));
		const longIntTime = datepicker.getDate().getTime();

		addTransaction(dateField.value.trim(), longIntTime, type, articleField.value.trim(), costField, trIndex);

		sumField.value = "";
		articleField.value = "";

		balDash = (type === "income" ? balDash + costField : balDash - costField).toFixed(2);

		updateList();
		updateBalance(balDash);
		//localStorage.setItem("balance", balDash);

		//document.getElementById("balance").textContent = balDash;

		//console.log("Новий баланс:", balDash);
		//console.log("transactions:", localStorage.getItem("transactions"));
	} else {
		alert("Помилка! Введено некоректний символ.");
	}
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

function updateBalance(newBalance) {
	document.getElementById("balance").textContent = newBalance;
	localStorage.setItem("balance", newBalance);
}

function addTransaction(date, longIntTime, type, article, amount, index = null) {
	const newTransaction = {
		id: mTransactions.length,
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

function addLongPressListener(element) {
	let longPressTimer;

	element.addEventListener('mousedown', function (e) {
		longPressTimer = setTimeout(() => {
			showContextMenu(e, element, true); // Передаємо елемент для роботи з його даними
		}, 500); // Час довгого натискання
	});

	element.addEventListener('mouseup', function () {
		clearTimeout(longPressTimer);
	});

	element.addEventListener('mouseleave', function () {
		clearTimeout(longPressTimer);
	});
}

function showContextMenu(event, element, longTap = false) {

	console.log("SHOW", contextMenu);
	event.preventDefault();

	let coords = getInScreenCoords(event, contextMenu.offsetWidth, contextMenu.offsetHeight);

	contextMenu.style.left = `${coords.x}px`;
	contextMenu.style.top = `${coords.y}px`;

	contextMenu.classList.add('show');

	contextMenu.setAttribute('data-selected-id', element.getAttribute('data-id'));
	contextMenu.setAttribute('data-type-ctx', element.getAttribute('data-type'));
	contextMenu.setAttribute('data-amount-ctx', element.getAttribute('data-amount'));

	isLongTap = longTap;
	setTimeout(() => {
		document.addEventListener('click', handleOutsideClick);
	}, 50);
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
}

function getInScreenCoords(event, objWidth, objHeight, objPadding = 10) {
	const screenWidth = window.innerWidth;
	const screenHeight = window.innerHeight;

	let xPos = event.pageX;
	let yPos = event.pageY;

	if (xPos + objWidth + objPadding > screenWidth) {
		xPos = screenWidth - objWidth - objPadding;
	}

	if (yPos + objHeight + objPadding > screenHeight) {
		yPos = screenHeight - objHeight - objPadding;
	}

	return { x: xPos, y: yPos };
}


