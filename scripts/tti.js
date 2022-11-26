function getInput() {
    var signText = document.getElementById("myText").value;

    document.getElementById("demo").innerHTML = signText;
    clearScreen();
    process(signText);
}

function process(signText) {
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

    switch (letter) {
        case "A": newImg.src = "../Alpha/A.png";
            break;
        case "B": newImg.src = "../Alpha/B.png";
            break;
        case "C": newImg.src = "../Alpha/C.png";
            break;
        case "D": newImg.src = "../Alpha/D.png";
            break;
        case "E": newImg.src = "../Alpha/E.png";
            break;
        case "F": newImg.src = "../Alpha/F.png";
            break;
        case "G": newImg.src = "../Alpha/G.png";
            break;
        case "H": newImg.src = "../Alpha/H.png";
            break;
        case "I": newImg.src = "../Alpha/I.png";
            break;
        case "J": newImg.src = "../Alpha/J.png";
            break;
        case "K": newImg.src = "../Alpha/K.png";
            break;
        case "L": newImg.src = "../Alpha/L.png";
            break;
        case "M": newImg.src = "../Alpha/M.png";
            break;
        case "N": newImg.src = "../Alpha/N.png";
            break;
        case "O": newImg.src = "../Alpha/O.png";
            break;
        case "P": newImg.src = "../Alpha/P.png";
            break;
        case "Q": newImg.src = "../Alpha/Q.png";
            break;
        case "R": newImg.src = "../Alpha/R.png";
            break;
        case "S": newImg.src = "../Alpha/S.png";
            break;
        case "T": newImg.src = "../Alpha/T.png";
            break;
        case "U": newImg.src = "../Alpha/U.png";
            break;
        case "V": newImg.src = "../Alpha/V.png";
            break;
        case "W": newImg.src = "../Alpha/W.png";
            break;
        case "X": newImg.src = "../Alpha/X.png";
            break;
        case "Y": newImg.src = "../Alpha/Y.png";
            break;
        case "Z": newImg.src = "../Alpha/U.png";
            break;
        case "1": newImg.src = "../Alpha/1.png";
            break;
        case "2": newImg.src = "../Alpha/2.png";
            break;
        case "3": newImg.src = "../Alpha/3.png";
            break;
        case "4": newImg.src = "../Alpha/4.png";
            break;
        case "5": newImg.src = "../Alpha/5.png";
            break;
        case "6": newImg.src = "../Alpha/6.png";
            break;
        case "7": newImg.src = "../Alpha/7.png";
            break;
        case "8": newImg.src = "../Alpha/8.png";
            break;
        case "9": newImg.src = "../Alpha/9.png";
            break;
        case "10": newImg.src = "../Alpha/10.png";
            break;
        case " ": newImg.src = "../Alpha/space.png";
        break;
        case "!": newImg.src = "../Alpha/!.png";
        break;

        default: newImg.src = "../Alpha/default.png";


    }

    document.body.appendChild(newImg);

}


function clearScreen() {
    const Images = document.querySelectorAll('img');
    Images.forEach(box => {
        box.remove();
    });

}