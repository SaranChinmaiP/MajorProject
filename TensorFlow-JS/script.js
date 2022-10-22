
let model, webcam, labelContainer, maxPredictions;
const WIDTH = 375 , HEIGHT = 410;
const URL = "https://teachablemachine.withgoogle.com/models/VsST_uuZp/";

var isChecked = document.getElementById("GraphSwitch");
var gdata = [["Element", "%", { role: "style" }],["Label", 50, "gold"]];

console.log("Script.js is Reachable");

// Load the image model and setup the webcam
async function init() {

    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    // load the model and metadata
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();
    console.log(maxPredictions);
    // Convenience function to setup a webcam
    const flip = true; // whether to flip the webcam
    webcam = new tmImage.Webcam(WIDTH, HEIGHT, flip); // width, height, flip
    await webcam.setup(); // request access to the webcam
    await webcam.play();
    console.log("Camera is Live ")
    window.requestAnimationFrame(loop);

    // append elements to the DOM
    document.getElementById("webcam-container").appendChild(webcam.canvas);
    labelContainer = document.getElementById("label-container");
    for (let i = 0; i < maxPredictions; i++) { // and class labels
        labelContainer.appendChild(document.createElement("div"));
    }
}


async function PauseCam() {
    webcam.pause(); // Pause the webcam frame

}
async function PlayCam() {
    webcam.play(); // Play the webcam frame

}

async function loop() {
    webcam.update(); // update the webcam frame
    await predict();
    window.requestAnimationFrame(loop);
}

// run the webcam image through the image model
async function predict() {
    // predict can take in an image, video or canvas html element
    const prediction = await model.predict(webcam.canvas);

    // Gets the Maximum Prediction of the Probabilty
    var max = Math.max.apply(null,
        Object.keys(prediction).map(function (e) {
            return prediction[e]['probability'];
        }));
// checks for the Bar Graph Switch Condition
        if(isChecked.checked == true){
            console.log("Input is checked");
            gdata = prediction.map(function (a) {
                return [a["className"], Math.floor(a["probability"] * 100)];
            })
            gdata.unshift(["Label", "Confidence"]);
          } 
        

    

    const Factor = Math.floor(max * 100);
    //Finds the Class Name of the  maximum value
    const index = prediction.findIndex((element) => element.probability === max);
    console.log(prediction[index]['className'] + ' : ' + Factor + "%");
    document.getElementById('status').innerText = "Sign : " + prediction[index]['className'] + ' : ' + Factor + "% (confidence rate)";

    for (let i = 0; i < maxPredictions; i++) {
        const classPrediction =
            prediction[i].className + ": " + prediction[i].probability.toFixed(2) * 100 + "%";
        labelContainer.childNodes[i].innerHTML = classPrediction;
    }

    // Code for Charting 
    google.charts.load('current', { 'packages': ['corechart'] });
    google.charts.setOnLoadCallback(drawChart);

    function drawChart() {
        var data = google.visualization.arrayToDataTable(gdata);

        var options = {
            title: 'Recognition Confidence Rate ',
            width: 375,
            height: 400,
            bar: { groupWidth: "10%" },
            legend: { position: "none" }
        };

        var chart = new google.visualization.BarChart(document.getElementById('myChart'));
        chart.draw(data, options);
    }



}




