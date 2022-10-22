

const URL = "https://teachablemachine.withgoogle.com/models/VsST_uuZp/";


console.log("Hands.js Script is Runnig");
const video3 = document.getElementsByClassName('input_video3')[0];
const out3 = document.getElementsByClassName('webcam-container')[0];
const controlsElement3 = document.getElementsByClassName('control3')[0];
const canvasCtx3 = out3.getContext('2d');
const fpsControl = new FPS();


function onResultsHands(results) {
  document.body.classList.add('loaded');
  fpsControl.tick();

  canvasCtx3.save();
  canvasCtx3.clearRect(0, 0, out3.width, out3.height);
  canvasCtx3.drawImage(
      results.image, 0, 0, out3.width, out3.height);
  if (results.multiHandLandmarks && results.multiHandedness) {
    for (let index = 0; index < results.multiHandLandmarks.length; index++) {
      const classification = results.multiHandedness[index];
      const isRightHand = classification.label === 'Right';
      const landmarks = results.multiHandLandmarks[index];
      drawConnectors(
          canvasCtx3, landmarks, HAND_CONNECTIONS,
          {color: isRightHand ? '#00FF00' : '#FF0000'}),
      drawLandmarks(canvasCtx3, landmarks, {
        color: isRightHand ? '#00FF00' : '#FF0000',
        fillColor: isRightHand ? '#FF0000' : '#00FF00',
        radius: (x) => {
          return lerp(x.from.z, -0.15, .1, 10, 1);
        }
      });
    }
  }
  canvasCtx3.restore();
}

const hands = new Hands({locateFile: (file) => {
  return `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.1/${file}`;
}});
hands.onResults(onResultsHands);

const camera = new Camera(video3, {
  onFrame: async () => {
    await hands.send({image: video3});
  },
  width: 400,
  height: 400
});
camera.start();

new ControlPanel(controlsElement3, {
      selfieMode: true,
      maxNumHands: 2,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7
    })
    .add([
      new StaticText({title: 'MediaPipe Hands'}),
      fpsControl,
      new Toggle({title: 'Selfie Mode', field: 'selfieMode'}),
      new Slider(
          {title: 'Max Number of Hands', field: 'maxNumHands', range: [1, 4], step: 1}),
      new Slider({
        title: 'Min Detection Confidence',
        field: 'minDetectionConfidence',
        range: [0, 1],
        step: 0.01
      }),
      new Slider({
        title: 'Min Tracking Confidence',
        field: 'minTrackingConfidence',
        range: [0, 1],
        step: 0.01
      }),
    ])
    .on(options => {
      video3.classList.toggle('selfie', options.selfieMode);
      hands.setOptions(options);
    });

 //---------------------------------------------------------------------------------------//

console.log("Script.js is Runnig");
let model, webcam, labelContainer, maxPredictions;
const WIDTH = 375 , HEIGHT = 410;

var isChecked = document.getElementById("GraphSwitch");
var gdata = [["Element", "%", { role: "style" }],["Label", 50, "gold"]];


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
    console.log("Model Started ");
    window.requestAnimationFrame(loop);

    // append elements to the DOM
    labelContainer = document.getElementById("label-container");
    for (let i = 0; i < maxPredictions; i++) { // and class labels
        labelContainer.appendChild(document.createElement("div"));
    }
}


async function PauseCam() {
    video3.pause(); // Pause the webcam frame

}
async function PlayCam() {
    video3.play(); // Play the webcam frame

}

async function loop() {
    webcam.update(); // update the webcam frame
    await predict();
    window.requestAnimationFrame(loop);
}

// run the webcam image through the image model
async function predict() {
    // predict can take in an image, video or canvas html element
    const prediction = await model.predict(video3);

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




