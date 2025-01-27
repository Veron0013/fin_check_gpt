var mIncome = [];
var mCosts = [];
let mTransactions = [];
const savedTransactions = JSON.parse(localStorage.getItem("transactions")) || [];
//let transactions = [
//	{ id: 1, type: 'income', article: 'salary', amount: 100 },
//	{ id: 2, type: 'expense', article: 'food', amount: 50 }
//];
document.addEventListener("DOMContentLoaded", () => {
	const savedTransactions = JSON.parse(localStorage.getItem("transactions")) || [];
	mTransactions = savedTransactions;
	console.log("Завантажені транзакції:", mTransactions);
});

function handleTransactionClick(type) {
	const costFieldRaw = document.getElementById(type === "income" ? "income-field" : "cost-field").value;
	let balDash = 0;

	const balanceField = document.getElementById("balance").textContent;
	if (!isNaN(balanceField) && balanceField.trim() !== "") {
		balDash = parseFloat(balanceField).toFixed(2);
	}

	if (/^-?\d+([.,]\d+)?$/.test(costFieldRaw)) {
		const costField = parseFloat(costFieldRaw.replace(",", "."));
		document.getElementById(type === "income" ? "income-field" : "cost-field").value = "";

		const vArticle = prompt("Enter article");
		if (vArticle == null || vArticle === "") {
			return;
		}

		addTransaction(type, vArticle, costField);

		localStorage.setItem("transactions", JSON.stringify(mTransactions));
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
		id: mTransactions.length + 1,
		type,
		article,
		amount: parseFloat(amount),
	};

	mTransactions.push(newTransaction);
	//localStorage.setItem("transactions", JSON.stringify(mTransactions));
	console.log("Додано транзакцію:", newTransaction);
	console.log("Оновлений масив транзакцій:", mTransactions);
}