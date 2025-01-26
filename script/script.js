function handleIncomeClick() {
	// Отримуємо значення з поля вводу
	const costFieldRaw = document.getElementById("income-field").value;
	let balDash = 0;

	// Якщо поле балансу не порожнє і це число, беремо його значення
	const balanceField = document.getElementById("balance").textContent;
	if (!isNaN(balanceField) && balanceField.trim() !== "") {
		balDash = parseFloat(balanceField).toFixed(2);
	}

	// Перевіряємо введене значення (допускаємо дробові числа і від'ємні)
	if (/^-?\d+([.,]\d+)?$/.test(costFieldRaw)) {
		// Замінюємо кому на крапку, якщо потрібно
		const costField = parseFloat(costFieldRaw.replace(",", "."));

		// Оновлюємо баланс
		balDash = (parseFloat(balDash) + costField).toFixed(2);

		// Зберігаємо новий баланс у полі
		document.getElementById("balance").textContent = balDash;

		// Логування для перевірки
		console.log("Новий баланс:", balDash);
		costFieldRaw.value = "";
	} else {
		alert("Помилка! Введено некоректний символ.");
	}
}

function handleCostClick() {
	// Отримуємо значення з поля вводу
	const costFieldRaw = document.getElementById("cost-field").value;
	let balDash = 0;

	// Якщо поле балансу не порожнє і це число, беремо його значення
	const balanceField = document.getElementById("balance").textContent;
	if (!isNaN(balanceField) && balanceField.trim() !== "") {
		balDash = parseFloat(balanceField).toFixed(2);
	}

	// Перевіряємо введене значення (допускаємо дробові числа і від'ємні)
	if (/^-?\d+([.,]\d+)?$/.test(costFieldRaw)) {
		// Замінюємо кому на крапку, якщо потрібно
		const costField = parseFloat(costFieldRaw.replace(",", "."));

		// Оновлюємо баланс
		balDash = (parseFloat(balDash) - costField).toFixed(2);

		// Зберігаємо новий баланс у полі
		document.getElementById("balance").textContent = balDash;

		// Логування для перевірки
		console.log("Новий баланс:", balDash);
		costFieldRaw.value = "";
	} else {
		alert("Помилка! Введено некоректний символ.");
	}
}