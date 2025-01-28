var mIncome = [];
var mCosts = [];
let mTransactions = [];
const savedTransactions = JSON.parse(localStorage.getItem("transactions")) || [];

var datepicker = new Datepicker('#datepicker');

document.addEventListener("DOMContentLoaded", () => {
	const savedTransactions = JSON.parse(localStorage.getItem("transactions")) || [];
	mTransactions = savedTransactions;
	console.log("Завантажені транзакції:", mTransactions);
	updateBalance(JSON.parse(localStorage.getItem("balance")));
	updateList();
});

function updateList() {
	const listField = document.getElementById("cost-list");
	listField.innerHTML = "";

	for (let i = 0; i < mTransactions.length; i++) {

		var listItem = document.createElement('LI');
		listItem.className = 'dash-list';
		listItem.textContent = `${mTransactions[i].type.toUpperCase()} : ${mTransactions[i].article} - $${mTransactions[i].amount} `;
		listItem.setAttribute("data-id", mTransactions[i].id);
		listItem.setAttribute("data-type", mTransactions[i].type.toUpperCase());
		listItem.setAttribute("data-amount", mTransactions[i].amount);
		listItem.onmouseover = function () {

			this.style.backgroundColor = "#719FE5";
			this.focus();
		};
		listItem.onmouseout = function () {

			this.style.backgroundColor = "#a771a2";
			this.focus();
		};
		listItem.onclick = function () {
			// Отримуємо ID з атрибуту
			const transactionId = this.getAttribute("data-id");
			const transactionType = this.getAttribute("data-type");
			const transactionAmount = this.getAttribute("data-amount");

			let vDel = confirm(`Delete record with ID ${transactionId}?`);
			if (vDel) {
				deleteRecordFromBD(parseInt(transactionId) - 1, transactionType, parseFloat(transactionAmount));
			}
		};

		listField.appendChild(listItem);
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

	console.log("Deleting record with ID:", list_id);
	const index = mTransactions.findIndex(transaction => transaction.id === list_id);

	if (index !== -1) {
		console.log("Record found at index:", index);
		mTransactions.splice(index, 1);

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

	console.log(dateField.value);

	let balDash = 0;

	const balanceField = document.getElementById("balance").textContent;

	if (!isNaN(balanceField) && balanceField.trim() !== "") {
		balDash = parseFloat(balanceField).toFixed(2);
	}

	if (/^-?\d+([.,]\d+)?$/.test(sumField.value) && articleField.value.trim() != "") {
		const costField = parseFloat(sumField.value.replace(",", "."));

		addTransaction(type, articleField.value.trim(), costField);

		sumField.value = "";
		articleField.value = "";
		balDash = (type === "income" ? balDash + costField : balDash - costField).toFixed(2);
		localStorage.setItem("balance", balDash);

		document.getElementById("balance").textContent = balDash;

		console.log("Новий баланс:", balDash);
		console.log("transactions:", localStorage.getItem("transactions"));
	} else {
		alert("Помилка! Введено некоректний символ.");
	}
}

function updateBalance(newBalance) {
	document.getElementById("balance").textContent = newBalance.toFixed(2);
	localStorage.setItem("balance", newBalance);
}

function addTransaction(type, article, amount) {
	const newTransaction = {
		id: mTransactions.length,
		type,
		article,
		amount: parseFloat(amount),
	};

	mTransactions.push(newTransaction);

	addLocalStorageTransaction();

	console.log("Додано транзакцію:", newTransaction);
	console.log("Оновлений масив транзакцій:", mTransactions);
}

function addLocalStorageTransaction() {
	localStorage.setItem("transactions", JSON.stringify(mTransactions));
}