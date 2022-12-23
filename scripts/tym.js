var classCounter = 1;
var classNameCounter = "";
const STATUS = document.getElementById('status');
const VIDEO = document.getElementById('webcam');
const ENABLE_CAM_BUTTON = document.getElementById('Cam');
const RESET_BUTTON = document.getElementById('reset');
const TRAIN_BUTTON = document.getElementById('train');
const MOBILE_NET_INPUT_WIDTH = 224;
const MOBILE_NET_INPUT_HEIGHT = 224;
const STOP_DATA_GATHER = -1;
const CLASS_NAMES = [];
const EPOCHS_VALUE = document.getElementById('epochsValue');
const CONSOLE_LOG = document.getElementById('consoleLog');
const ADD_CLASS = document.getElementById('AddClass');

ENABLE_CAM_BUTTON.addEventListener('click', enableCam);
TRAIN_BUTTON.addEventListener('click', trainModel);
RESET_BUTTON.addEventListener('click', reset);
var epochParamter = EPOCHS_VALUE.value;
EPOCHS_VALUE.addEventListener('keyup', function () { epochParamter = EPOCHS_VALUE.value; });
const ClassContainer = document.getElementsByClassName("btn-group-vertical");

function createNewClass() {
  const newClassButton = document.createElement("button");
  newClassButton.style.textAlign = "center";
  newClassButton.setAttribute("class", "dataCollector btn btn-outline-secondary");
  newClassButton.setAttribute("data-1hot", classCounter++);
  classNameCounter = "Class " + classCounter;
  newClassButton.setAttribute("data-name", classNameCounter);
  newClassButton.innerText = "Gather Class " + classCounter;

  const newClassName   = document.createElement("input") ;
  newClassName.setAttribute("placeholder",classNameCounter);
  newClassName.value = classNameCounter ;
  console.log("New Class Created " + classNameCounter )
  newClassName.setAttribute("class","nameCollector");

  ClassContainer[0].appendChild(newClassName);
  ClassContainer[0].appendChild(newClassButton);
  

}

ADD_CLASS.addEventListener('click',FeedClassName); 

function FeedClassName() {
  CLASS_NAMES.length = 0;
  let dataCollectorButtons = document.querySelectorAll('button.dataCollector');
  let nameCollector =   document.querySelectorAll('input.nameCollector');


  for (let i = 0; i < dataCollectorButtons.length; i++) {
    dataCollectorButtons[i].addEventListener('mousedown', gatherDataForClass);
    dataCollectorButtons[i].addEventListener('mouseup', gatherDataForClass);
    // Populate the human readable names for classes.
    console.log(nameCollector[i].value);
    CLASS_NAMES.push(nameCollector[i].value);
  }
  modelCompile();
}

let mobilenet = undefined;
let gatherDataState = STOP_DATA_GATHER;
let videoPlaying = false;
let trainingDataInputs = [];
let trainingDataOutputs = [];
let examplesCount = [];
let predict = false;


/**
 * Loads the MobileNet model and warms it up so ready for use.
 **/
async function loadMobileNetFeatureModel() {
  const URL = 'https://tfhub.dev/google/tfjs-model/imagenet/mobilenet_v3_small_100_224/feature_vector/5/default/1';
  mobilenet = await tf.loadGraphModel(URL, { fromTFHub: true });
  STATUS.innerText = 'MobileNet v3 loaded successfully!';

  // Warm up the model by passing zeros through it once.
  tf.tidy(function () {
    let answer = mobilenet.predict(tf.zeros([1, MOBILE_NET_INPUT_HEIGHT, MOBILE_NET_INPUT_WIDTH, 3]));
    console.log(answer.shape);
  });
}

loadMobileNetFeatureModel();
model = tf.sequential();
model.add(tf.layers.dense({ inputShape: [1024], units: 128, activation: 'relu' }));


function modelCompile() {
  model.add(tf.layers.dense({ units: CLASS_NAMES.length, activation: 'softmax' }));

  model.summary();

  // Compile the model with the defined optimizer and specify a loss function to use.
  model.compile({
    // Adam changes the learning rate over time which is useful.
    optimizer: 'adam',
    // Use the correct loss function. If 2 classes of data, must use binaryCrossentropy.
    // Else categoricalCrossentropy is used if more than 2 classes.
    loss: (CLASS_NAMES.length === 2) ? 'binaryCrossentropy' : 'categoricalCrossentropy',
    // As this is a classification problem you can record accuracy in the logs too!
    metrics: ['accuracy']
  });
}

/**
 * Check if getUserMedia is supported for webcam access.
 **/
function hasGetUserMedia() {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}


/**
 * Enable the webcam with video constraints applied.
 **/
function enableCam() {
  if (hasGetUserMedia()) {
    // getUsermedia parameters.
    const constraints = {
      video: true,
      width: 380,
      height: 380
    };

    // Activate the webcam stream.
    navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
      VIDEO.srcObject = stream;
      VIDEO.addEventListener('loadeddata', function () {
        videoPlaying = true;
        ENABLE_CAM_BUTTON.classList.add('removed');
      });
    });
  } else {
    console.warn('getUserMedia() is not supported by your browser');
  }
}


/**
 * Handle Data Gather for button mouseup/mousedown.
 **/
function gatherDataForClass() {
  let classNumber = parseInt(this.getAttribute('data-1hot'));
  gatherDataState = (gatherDataState === STOP_DATA_GATHER) ? classNumber : STOP_DATA_GATHER;
  dataGatherLoop();
}


function calculateFeaturesOnCurrentFrame() {
  return tf.tidy(function () {
    // Grab pixels from current VIDEO frame.
    let videoFrameAsTensor = tf.browser.fromPixels(VIDEO);
    // Resize video frame tensor to be 224 x 224 pixels which is needed by MobileNet for input.
    let resizedTensorFrame = tf.image.resizeBilinear(
      videoFrameAsTensor,
      [MOBILE_NET_INPUT_HEIGHT, MOBILE_NET_INPUT_WIDTH],
      true
    );

    let normalizedTensorFrame = resizedTensorFrame.div(255);

    return mobilenet.predict(normalizedTensorFrame.expandDims()).squeeze();
  });
}


/**
 * When a button used to gather data is pressed, record feature vectors along with class type to arrays.
 **/
function dataGatherLoop() {
  // Only gather data if webcam is on and a relevent button is pressed.
  if (videoPlaying && gatherDataState !== STOP_DATA_GATHER) {
    // Ensure tensors are cleaned up.
    let imageFeatures = calculateFeaturesOnCurrentFrame();

    trainingDataInputs.push(imageFeatures);
    trainingDataOutputs.push(gatherDataState);

    // Intialize array index element if currently undefined.
    if (examplesCount[gatherDataState] === undefined) {
      examplesCount[gatherDataState] = 0;
    }
    // Increment counts of examples for user interface to show.
    examplesCount[gatherDataState]++;

    STATUS.innerText = '';
    for (let n = 0; n < CLASS_NAMES.length; n++) {
      STATUS.innerHTML += CLASS_NAMES[n] + ' data count: ' + examplesCount[n] + '. ' + "<br/>";
    }

    window.requestAnimationFrame(dataGatherLoop);
  }
}


/**
 * Once data collected actually perform the transfer learning.
 **/
async function trainModel() {
  predict = false;
  STATUS.innerHTML += "***TRAINING STARTED***";

  tf.util.shuffleCombo(trainingDataInputs, trainingDataOutputs);

  let outputsAsTensor = tf.tensor1d(trainingDataOutputs, 'int32');
  let oneHotOutputs = tf.oneHot(outputsAsTensor, CLASS_NAMES.length);
  let inputsAsTensor = tf.stack(trainingDataInputs);
  let results = await model.fit(inputsAsTensor, oneHotOutputs, {
    shuffle: true,
    batchSize: 5,
    epochs: epochParamter,
    callbacks: { onEpochEnd: logProgress }
  });

  outputsAsTensor.dispose();
  oneHotOutputs.dispose();
  inputsAsTensor.dispose();
  predict = true;
}


/**
 * Log training progress.
 **/
function logProgress(epoch, logs) {
  CONSOLE_LOG.innerHTML = " "
  console.log(epoch, logs);
  CONSOLE_LOG.innerHTML = "Training data for epoch " + (epoch + 1);

}


/**
 *  Make live predictions from webcam once trained.
 **/
function predictLoop() {
  if (predict) {
    tf.tidy(function () {
      let imageFeatures = calculateFeaturesOnCurrentFrame();
      let prediction = model.predict(imageFeatures.expandDims()).squeeze();
      let highestIndex = prediction.argMax().arraySync();
      let predictionArray = prediction.arraySync();
      STATUS.innerText = 'Prediction: ' + CLASS_NAMES[highestIndex] + ' with ' + Math.floor(predictionArray[highestIndex] * 100) + '% confidence';
    });

    window.requestAnimationFrame(predictLoop);
  }
}


/**
 * Purge data and start over. Note this does not dispose of the loaded 
 * MobileNet model and MLP head tensors as you will need to reuse 
 * them to train a new model.
 **/
function reset() {
  predict = false;
  examplesCount.splice(0);
  for (let i = 0; i < trainingDataInputs.length; i++) {
    trainingDataInputs[i].dispose();
  }
  trainingDataInputs.splice(0);
  trainingDataOutputs.splice(0);
  STATUS.innerText = 'No Data collected';

  console.log('Tensors in memory: ' + tf.memory().numTensors);
}

async function modelDownload() {
  await model.save('downloads://my-model');

}