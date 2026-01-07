
// Globals
let calling;
let callingClient;
let correlationId;
let callHistory;
let line;
let call;
let incomingCall;
let localAudioStream;

const makeCallBtn = document.querySelector('.call-support-btn');
const muteBtn = document.getElementById('mute-unmute-btn');
//const holdBtn = document.getElementById('hold-resume-btn');

const callNotifyEvent = new CustomEvent('line:incoming_call', {
    detail: {
        callObject: call,
    },
});

// Step 1: Initialize Calling, pass calling config with relevant values to setup different clients available in the Calling SDK
// Step 2: Fetch the calling client, fetch the lines created for the user whose access token has been shared and register the line
async function initCalling(userType) {
    const webexConfig = await getWebexConfig(userType);
    const callingConfig = await getCallingConfig();

    // Initializing Calling
    calling = await Calling.init({ webexConfig, callingConfig });
    
    try {

        // Listen for ready event to identify if calling is ready
        calling.on("ready", () => {
            // register with webex calling
            calling.register().then(async () => {
            
            // Fetch the calling client 
            callingClient = window.callingClient = calling.callingClient;
    
            // Fetch lines
            line = Object.values(callingClient?.getLines())[0];
    
            // Trigger Line Registration
            setupLineListeners();
            line.register();

          });
        });
    } catch (err) {
        console.log("DEMO: failed to finish initCalling", err);
    }
}

// Step 3: Setup listeners on the registered line
function setupLineListeners() {
    try {
        line.on('registered', (lineInfo) => {    
            line = lineInfo;
            updateAvailability();
            document.getElementById('myCallButton').classList.add('call-support-btn');
            document.getElementById('myCallButton').disabled=false;
            document.getElementById('myLoading').style.visibility="hidden";
        });
    
        // Start listening for incoming calls
        line.on('line:incoming_call', (callObj) => {
            openCallNotification(callObj);
            incomingCall = callObj;
        });
    } catch (err) {
        console.log("DEMO: Failed while setting up line listeners");
    }
}



// Step 4: Create microphone stream which will be used as local audio stream for calls
async function getMediaStreams() {
    try {
        const localAudioElem = document.getElementById('local-audio');
        localAudioStream = await Calling.createMicrophoneStream({audio: true});
        
        // localAudioElem.srcObject = localAudioStream.outputStream;
    } catch (err) {
        console.log("DEMO: failed to get media ", err);
    }
}

// Step 5: Create a call instance, get the stream and initiate an outbound call. Setup call listeners are the same time to the call progressing different states
async function initiateCall(number) {
   try {
        await getMediaStreams();
        openCallWindow();
        call = line.makeCall();
    
        call.on('caller_id', (CallerIdEmitter) => {
           updateCallerId(CallerIdEmitter);
        });
    
        call.on('progress', (correlationId) => {
            // Add ringback on progress
        });
    
        call.on('connect', (correlationId) => {
            // if(number === "5007"){
            //     secondCallNotification.startTimer();
            //     secondCallNotification.enableCompleteTransfer();
            // }
            // else{
            //     if(window.location.href.includes('mytrips')){
            //         callNotification.startTimer();
            //     }
            // }
            callNotification.startTimer();
        });
    
        call.on('remote_media', (track) => {
            document.getElementById('customer-remote-audio').srcObject = new MediaStream([track]);
        });
    
        call.on('disconnect', (correlationId) => {
            closeCallWindow();
        });
    
        call.dial(localAudioStream);
    } catch (err) {
        console.log("DEMO: Failed in initiating call");
    }
}

// Step 6: Fetch the call instance from the call notification, setup call listeners, create media stream and answer the incoming call
// async function answerCall() {

// }


// Step 8: Disconnect the call
function disconnectCall() {
    try {
        call.end();
        closeCallWindow();
    } catch (err) {
        console.log("DEMO: failed to disconnect the call ", err);
    }
}


// Mute or unmute the call
function toggleMute() {
    call.mute(localAudioStream);
    callNotification.muteToggle();
}


function pressDigit(digit) {
    call.sendDigit(digit);
}


