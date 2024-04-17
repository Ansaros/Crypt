const videoEls = document.querySelectorAll('video');
const imageEls = document.querySelectorAll('img');
const imagePlanes = document.querySelectorAll('a-plane[id^=imagePlane]');

const sceneEl = document.querySelector('a-scene');
const cameraEl = document.querySelector('a-camera');

// Helper function to get the center of an element on screen
function getElementCenter(el) {
  const rect = el.getBoundingClientRect();
  return {
    x: (rect.left + rect.right) / 2,
    y: (rect.top + rect.bottom) / 2,
  };
}

cameraEl.addEventListener('camera-update', () => {
  const cameraDirection = new THREE.Vector3();
  cameraEl.object3D.getWorldDirection(cameraDirection);

  imagePlanes.forEach((imagePlane, index) => {
    const imageCenter = getElementCenter(imageEls[index]);
    const screenCenter = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    // Calculate the difference between camera direction and image center,
    // normalized to screen center
    const directionToImage = new THREE.Vector3(
      imageCenter.x - screenCenter.x,
      imageCenter.y - screenCenter.y,
      0
    ).normalize();

    const angle = cameraDirection.dot(directionToImage);

    // Play video when the angle is above a certain threshold (adjust as needed)
    const threshold = 0.8; // Adjust this value to control video trigger sensitivity
    if (angle > threshold) {
      videoEls[index].play();
      imagePlane.setAttribute('visible', true); // Optionally, highlight the active image
    } else {
      videoEls[index].pause();
      imagePlane.setAttribute('visible', false);
    }
  });
});
