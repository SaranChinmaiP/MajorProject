const searchWrapper = document.querySelector(".search-input");
const inputBox = searchWrapper.querySelector("input");
const suggBox = searchWrapper.querySelector(".autocom-box");
const icon = document.getElementById('search');
// if user press any key and release
inputBox.onkeyup = (e) => {
    let userData = e.target.value; //user enetered data
    let emptyArray = [];
    if (userData) {
        icon.onclick = () => {
            processText(userData);

        }

        emptyArray = suggestions.filter((data) => {
            //filtering array value and user characters to lowercase and return only those words which are start with user enetered chars
            return data.toLocaleLowerCase().startsWith(userData.toLocaleLowerCase());
        });
        emptyArray = emptyArray.map((data) => {
            // passing return data inside li tag
            return data = `<li>${data}</li>`;
        });
        searchWrapper.classList.add("active"); //show autocomplete box
        showSuggestions(emptyArray);
        let allList = suggBox.querySelectorAll("li");
        for (let i = 0; i < allList.length; i++) {
            //adding onclick attribute in all li tag
            allList[i].setAttribute("onclick", "select(this)");
        }
    } else {
        searchWrapper.classList.remove("active"); //hide autocomplete box
    }
}

function select(element) {
    let selectData = element.textContent;
    inputBox.value = selectData;
    icon.onclick = () => {
        processText(selectData);

    }
    searchWrapper.classList.remove("active");
}

function showSuggestions(list) {
    let listData;
    if (!list.length) {
        userValue = inputBox.value;
        listData = `<li>${userValue}</li>`;
    } else {
        listData = list.join('');
    }
    suggBox.innerHTML = listData;
}


function processText(userData) {
    console.log(userData + "is the Raw Input");
    let Check1 = (element) => element.toLowerCase().trim() === userData.toLowerCase().trim();

    const indexCheck1 = suggestions.findIndex(Check1);
    if (indexCheck1 > -1) {
        console.log("Sentence Found in the Box");
        const newImg = document.createElement("img");
        newImg.style.height = "250px";
        newImg.className = "img-thumbnail";
        newImg.src = `../sentences/s${indexCheck1}.png`;
        document.body.appendChild(newImg);
    }
    else {
        console.log("Loose Processing the data");
        looseProcess(userData)
    }
}


function looseProcess(signText) {
    const Text = signText.toUpperCase().trim();
    console.log(Text);
    for (let i in Text) {
        console.log(Text[i]);
        getImg(Text[i])
    }

}
function getImg(letter) {

    const newImg = document.createElement("img");
    newImg.style.width = "120px";
    newImg.style.height = "120px";
    newImg.className = "img-thumbnail";
    newImg.src = `../Alpha/${letter}.png`;

    document.body.appendChild(newImg);

}


function clearScreen() {
    inputBox.value = "";
    const Images = document.querySelectorAll('img');
    Images.forEach(box => {
        box.remove();
    });

}