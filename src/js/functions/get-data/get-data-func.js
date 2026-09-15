const getData = async (url) => {
	const res = await fetch(url);

	const json = await res.json();

	return json;
};

export default getData;

// Вызов функции и получение данных
getData('$1')
	.then((data) => console.log(data))
	.catch((error) => console.log(error.message));
