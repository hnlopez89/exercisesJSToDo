let myUsers = [
	{ name: "Hugo", age: 32, equipo: "Depor" },
	{ name: "Jorge", age: 38, equipo: "Racing de Ferrol" },
	{ name: "Pablo", age: 34, equipo: "Celta" },
	{ name: "Igor", age: 28, equipo: "Celta" },
];

let copyMyUsers = [...myUsers];
console.log(copyMyUsers);
console.log(myUsers);

let saludo = myUsers.map((user, index) => {
	return `${index}: Hola, me llamo ${user.name} y tengo ${user.age} años`;
});

console.log(saludo);

let saludoCelta = myUsers
	.filter((user) => user.equipo === "Celta")
	.map((user, index) => {
		return `${index}: Hola, me llamo ${user.name} y me gusta mucho el ${user.equipo}`;
	});

console.log(saludoCelta);

let usersMessenger = myUsers
	.filter((user) => user.age > 30)
	.map((user) => {
		return `Hola, me llamo ${user.name} y hace tiempo, utilicé el msn messenger, y mandaba zumbidos cuando no me contestaban`;
	});

console.log(usersMessenger);

let totalAge = myUsers.reduce((acumulator, value) => {
	return acumulator + value.age;
}, 0);

console.log(totalAge);

let averageAge =
	myUsers.reduce((acumulator, value) => {
		return acumulator + value.age;
	}, 0) / myUsers.length;

console.log(averageAge);

let youngest = copyMyUsers.sort((a, b) => {
	return a.age - b.age;
});

console.log(youngest);

let alphabetically = copyMyUsers.sort((a, b) => {
	if (a.name < b.name) {
		return -1;
	}
	if (a.name > b.name) {
		return 1;
	}
	return 0;
});

console.log(alphabetically);

console.log(myUsers);

let celtaFans = copyMyUsers.find((user) => {
	return user.equipo === "Celta";
});

console.log(celtaFans);

let shouldBeWorried = myUsers.some((user) => {
	return user.equipo === "Depor";
});

shouldBeWorried
	? console.log("Sí, hay un loco del depor en la sala")
	: console.log("no hay moros en la costa");

let worried = myUsers.includes("Depor");
console.log(worried);
