const button = document.getElementById('runawayBtn');
let isCtrlPressed = false;
const threshold = 100; // Distance to trigger movement

// Position the button in the center on load
window.addEventListener('load', () => {
  const centerX = (window.innerWidth - button.offsetWidth) / 2;
  const centerY = (window.innerHeight - button.offsetHeight) / 2;
  button.style.left = `${centerX}px`;
  button.style.top = `${centerY}px`;
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Control') isCtrlPressed = true;
});
document.addEventListener('keyup', (e) => {
  if (e.key === 'Control') isCtrlPressed = false;
});

// Runaway logic
document.addEventListener('mousemove', (e) => {
  if (isCtrlPressed) return;

  const mouseX = e.clientX;
  const mouseY = e.clientY;

  const btnRect = button.getBoundingClientRect();
  const btnCenterX = btnRect.left + btnRect.width / 2;
  const btnCenterY = btnRect.top + btnRect.height / 2;

  const dx = mouseX - btnCenterX;
  const dy = mouseY - btnCenterY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance < threshold) {
    moveButtonAway();
  }
});

function moveButtonAway() {
  const maxX = window.innerWidth - button.offsetWidth;
  const maxY = window.innerHeight - button.offsetHeight;

  let newX, newY;
  do {
    newX = Math.random() * maxX;
    newY = Math.random() * maxY;
  } while (
    Math.abs(newX - parseFloat(button.style.left)) < 50 &&
    Math.abs(newY - parseFloat(button.style.top)) < 50
  );

  button.style.left = `${newX}px`;
  button.style.top = `${newY}px`;
}

// Click logic


function yourOtherFunction() {
  console.log("Nice try! Hold CTRL to click me.");
}
