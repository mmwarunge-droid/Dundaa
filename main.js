const firstName = "Susan";
const lastName = "Njeri";
console.log(`${firstName} ${lastName} Welcome to Dundaa!!!`);

let age = 17;

if (age > 18) {
    console.log("You are eligible to use Dundaa services.");
}else if (age == 17) {
    console.log("You need to age just a lil bit more to use Dundaa, so close!!!");
}
else {
    console.log("You must be at least 18 years old to use Dundaa services.");
}

let i = 1;
while (i <= 15) {
    console.log(`The amount indicated is insufficient`, i);
    i += 1;
}