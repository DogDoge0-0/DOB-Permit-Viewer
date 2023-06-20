document.addEventListener('DOMContentLoaded', function() {
  // Initialization
  let checkboxes = document.querySelectorAll('.notAll');
  let switches = document.querySelectorAll('.notAll');
  let allSwitch = document.querySelector('#ALL');

  // Listen for switch states
  for (let i = 0; i < switches.length; i++) {
    switches[i].addEventListener('change', function() {
      saveSwitchState(this);
      updateAllSwitch();
    });
  }

  allSwitch.addEventListener('change', function() {
    toggleAllSwitch();
    updateAllSwitch();
  });

  // Load switch states from local storage on page load
  loadSwitchStates();

  // Function to save the state of a switch to local storage
  function saveSwitchState(switchElement) {
    localStorage.setItem(switchElement.id, switchElement.checked);
  }

  // Function to load switch states from local storage
  function loadSwitchStates() {
    for (let i = 0; i < checkboxes.length; i++) {
      let switchId = checkboxes[i].id;
      let switchState = localStorage.getItem(switchId);

      if (switchState === null) {
        // Switch state hasn't been saved before, set it to true
        checkboxes[i].checked = true;
        saveSwitchState(checkboxes[i]);
      } else {
        checkboxes[i].checked = switchState === 'true';
      }
    }
    updateAllSwitch();
  }

  // Function to update the state of the 'ALL' switch
  function updateAllSwitch() {
    let checkboxes = document.querySelectorAll('.notAll');
    let allSwitchState = true;
    for (let i = 0; i < checkboxes.length; i++) {
      if (!checkboxes[i].checked) {
        allSwitchState = false;
        break;
      }
    }
    allSwitch.checked = allSwitchState;
  }

  // Function to toggle the state of all switches based on the 'ALL' switch
  function toggleAllSwitch() {
    let checkboxes = document.querySelectorAll('.notAll');
    let allSwitchState = allSwitch.checked;
    for (let i = 0; i < checkboxes.length; i++) {
      checkboxes[i].checked = allSwitchState;
      saveSwitchState(checkboxes[i]);
    }
  }

});
