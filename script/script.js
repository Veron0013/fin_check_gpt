
let mTransactions = [];
const savedTransactions = JSON.parse(localStorage.getItem("transactions")) || [];

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


});

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
		var listDiv = document.createElement('div');
		listDiv.className = 'list-item active';
		listDiv.setAttribute("data-id", i);
		listDiv.setAttribute("data-date", mTransactions[i].date.trim());
		listDiv.setAttribute("data-type", mTransactions[i].type.toUpperCase());
		listDiv.setAttribute("data-amount", mTransactions[i].amount);

		// Створюємо комірки рядка
		var listItem1 = document.createElement('div'); // Використовуємо document.createElement
		listItem1.className = 'item-cell text-start';
		listItem1.textContent = mTransactions[i].date; // Дата чи ID
		listDiv.appendChild(listItem1); // Додаємо до головного контейнера

		//console.log(new Date(mTransactions[i].date).toDateString);
		//console.log(new Date(mTransactions[i].date));


		var listItem2 = document.createElement('div');
		listItem2.className = 'item-cell text-end';
		listItem2.textContent = mTransactions[i].type.toUpperCase(); // Тип
		listDiv.appendChild(listItem2);

		var listItem3 = document.createElement('div');
		listItem3.className = 'item-cell text-end';
		listItem3.textContent = mTransactions[i].article; // Стаття
		listDiv.appendChild(listItem3);

		var listItem4 = document.createElement('div');
		listItem4.className = 'item-cell text-end';
		listItem4.textContent = `$${mTransactions[i].amount}`; // Сума
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

		listDiv.onclick = function () {
			// Отримуємо дані з атрибутів
			const transactionId = this.getAttribute("data-id");
			const transactionType = this.getAttribute("data-type");
			const transactionAmount = this.getAttribute("data-amount");

			let vDel = confirm(`Видалити запис: ${this.getAttribute("data-date")} - ${transactionType} - $${transactionAmount}?`);
			if (vDel) {
				deleteRecordFromBD(parseInt(transactionId), transactionType, parseFloat(transactionAmount));
			}
		};

		// Додаємо контейнер до списку
		listField.appendChild(listDiv);
	}
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

	const balanceField = document.getElementById("balance").textContent;

	if (!isNaN(balanceField) && balanceField.trim() !== "") {
		balDash = parseFloat(balanceField);
	}

	const validated = checkValidate(dateField, articleField, sumField);

	//if (/^-?\d+([.,]\d+)?$/.test(sumField.value) && articleField.value.trim() != "" && dateField.value.trim() != "")
	if (validated) {
		const costField = parseFloat(sumField.value.replace(",", "."));
		const longIntTime = datepicker.getDate().getTime();

		addTransaction(dateField.value.trim(), longIntTime, type, articleField.value.trim(), costField);

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

function addTransaction(date, longIntTime, type, article, amount) {
	const newTransaction = {
		id: mTransactions.length,
		longIntTime,
		date,
		type,
		article,
		amount: parseFloat(amount),
	};

	mTransactions.push(newTransaction);

	addLocalStorageTransaction();

	//console.log("Додано транзакцію:", newTransaction);
	//console.log("Оновлений масив транзакцій:", mTransactions);
}

function addLocalStorageTransaction() {
	localStorage.setItem("transactions", JSON.stringify(mTransactions));
}