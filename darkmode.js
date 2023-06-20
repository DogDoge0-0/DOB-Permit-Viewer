// Initaialization
let darkModeButton = document.querySelector('#darkModeSet');
let HTML = document.querySelector('html');
let mainTable = document.querySelector('.mainTable');
let gearLoading = document.querySelector('.gearLoading');
let gear = document.querySelector('.gear');

function darkModeApply() {
  if (localStorage.getItem('darkMode') == 'false') {
    HTML.setAttribute('class', 'darkMode');
    mainTable.classList.add('table-dark');
    mainTable.classList.remove('table-light');
    localStorage.setItem('darkMode', 'true');
    darkModeButton.innerHTML = 'Light Mode';
    gearLoading.setAttribute('src', 'gear-dark.svg');
    gear.setAttribute('src', 'gear-dark.svg');
  }
  else {
    HTML.setAttribute('class', '');
    mainTable.classList.add('table-light');
    mainTable.classList.remove('table-dark');
    localStorage.setItem('darkMode', 'false');
    darkModeButton.innerHTML = 'Dark Mode';
    gearLoading.setAttribute('src', 'gear.svg');
    gear.setAttribute('src', 'gear.svg');
  }
}

darkModeButton.onclick = () => {
  darkModeApply();
};

// Run a variant on page load
if (localStorage.getItem('darkMode') == 'true') {
  HTML.setAttribute('class', 'darkMode');
  mainTable.classList.add('table-dark');
  mainTable.classList.remove('table-light');
  localStorage.setItem('darkMode', 'true');
  darkModeButton.innerHTML = 'Light Mode';
  gearLoading.setAttribute('src', 'gear-dark.svg');
  gear.setAttribute('src', 'gear-dark.svg');
}
else {
  HTML.setAttribute('class', '');
  mainTable.classList.add('table-light');
  mainTable.classList.remove('table-dark');
  localStorage.setItem('darkMode', 'false');
  darkModeButton.innerHTML = 'Dark Mode';
  gearLoading.setAttribute('src', 'gear.svg');
  gear.setAttribute('src', 'gear.svg');
}
