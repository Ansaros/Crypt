const videoElement = document.getElementById('video');
const overlayElement = document.getElementById('overlay');

// Initialize webcam and video capture
const webcam = new cv2.VideoCapture(0);
const video = new cv2.VideoCapture('video.mp4');

// Load target images and their corresponding video paths
const imagePaths = ['image1.jpg', 'image2.jpg'];
const videoPaths = ['video1.mp4', 'video2.mp4'];

// Load target images and their features
const targetImages = [];
const targetFeatures = [];

for (let i = 0; i < imagePaths.length; i++) {
    const image = cv2.imread(imagePaths[i]);
    const orb = cv2.ORB_create();
    const keypoints, descriptors = orb.detectAndCompute(image, null);
    targetImages.push(image);
    targetFeatures.push(descriptors);
}

// Function to draw bounding box around detected image
function drawBoundingBox(image, x, y, w, h, color) {
    cv2.rectangle(image, [x, y], [x + w, y + h], color, 2);
}

// Function to play video overlay
function playVideoOverlay(videoPath) {
    overlayElement.style.display = 'block';
    const videoOverlay = new cv2.VideoCapture(videoPath);

    let frameCount = 0;
    const intervalId = setInterval(() => {
        success, frame = videoOverlay.read();
        if (success) {
            frameCount++;

            // Resize frame to match webcam frame size
            const resizedFrame = cv2.resize(frame, { width: videoElement.videoWidth, height: videoElement.videoHeight });

            // Display video overlay
            overlayElement.innerHTML = '<canvas id="overlayCanvas"></canvas>';
            const overlayCanvas = document.getElementById('overlayCanvas');
            const overlayCtx = overlayCanvas.getContext('2d');
            overlayCanvas.width = videoElement.videoWidth;
            overlayCanvas.height = videoElement.videoHeight;
            overlayCtx.drawImage(resizedFrame, 0, 0);

            // Stop playing video when it reaches the end
            if (frameCount === videoOverlay.get(cv2.CAP_PROP_FRAME_COUNT)) {
                clearInterval(intervalId);
                overlayElement.style.display = 'none';
                videoOverlay.release();
                frameCount = 0;
            }
        } else {
            console.error('Error reading video frame');
            clearInterval(intervalId);
            overlayElement.style.display = 'none';
            videoOverlay.release();
            frameCount = 0;
        }
    }, 33);
}

// Main loop for webcam capture and image detection
let currentVideoPath = null;
let detection = false;

setInterval(() => {
    success, frame = webcam.read();
    if (success) {
        // Convert frame to RGB format
        const rgbFrame = new cv2.Mat();
        cv2.cvtColor(frame, rgbFrame, cv2.COLOR_BGR2RGB);

        // Detect objects in the frame
        const detections = [];
        for (let i = 0; i < targetImages.length; i++) {
            const orb = cv2.ORB_create();
            const queryKeypoints, queryDescriptors = orb.detectAndCompute(targetImages[i], null);
            const bfMatcher = new cv2.BFMatcher();
            const matches = bfMatcher.knnMatch(queryDescriptors, rgbFrame.detectAndCompute(null)[1], 2);

            const goodMatches = matches.filter(match => match[0].distance < 0.8 * match[1].distance);

            if (goodMatches.length > 25) {
                detection = true;
                const obj = { imageIndex: i };  // Store the index of the detected image

                // Find bounding box coordinates using homography calculation
                const srcPoints = queryKeypoints.map(kp => kp.pt);
                const dstPoints = goodMatches.map(match => rgbFrame.detectAndCompute(null)[1][match[0].queryIdx].pt);
                const matrix, mask = cv2.findHomography(srcPoints, dstPoints, cv2.RANSAC, 5);

                if (matrix) {
                    const imageWidth = targetImages[i].cols;
                    const imageHeight = targetImages[i].rows;
                    const pts = cv2.matFromArray([[0, 0], [0, imageHeight], [imageWidth, imageHeight], [imageWidth, 0]]);
                    const dst = cv2.perspectiveTransform(pts, matrix);
                    const [xMin, yMin] = dst.colMin();
                    const [xMax, yMax] = dst.colMax();
                    obj.x = xMin;
                    obj.y = yMin;
                    obj.w = xMax - xMin;
                    obj.h = yMax - yMin;
                    
                    drawBoundingBox(frame, xMin, yMin, xMax - xMin, yMax - yMin, (0, 255, 0));  // Green for detection
                }

                detections.push(obj);
            }
        }

        // Play video overlay if a detection occurs
        if (detection) {
            if (currentVideoPath !== videoPaths[detections[0].imageIndex]) {
                currentVideoPath = videoPaths[detections[0].imageIndex];
                playVideoOverlay(currentVideoPath);
            }
        } else {
            detection = false;
            currentVideoPath = null;
            overlayElement.style.display = 'none';
        }

        // Display the webcam frame with bounding boxes (if any)
        cv2.imshow('Video', frame);
    } else {
        console.error('Error reading webcam frame');
    }
}, 33);

// Release resources when the user closes the browser window
window.addEventListener('beforeunload', () => {
    webcam.release();
    video.release();
});
