document.getElementById('login-form').addEventListener('submit', function (e) {
  e.preventDefault();

  // Fake login validation
  const companyId = document.getElementById('company-id').value;
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  if (companyId === '1' && username === '1' && password === '1') {
    document.getElementById('login-screen').classList.add('hidden');
    document.body.classList.remove('main');
    document.getElementById('dashboard-screen').classList.remove('hidden');
  } else {
    alert('Invalid credentials. Please try again.');
  }
});

document
  .getElementById('toggle-password')
  .addEventListener('click', function () {
    const passwordField = document.getElementById('password');
    passwordField.type =
      passwordField.type === 'password' ? 'text' : 'password';
  });

// Time Pickers:
document.querySelectorAll('.time-input').forEach(function (input) {
  input.addEventListener('focus', function () {
    if (this.value === this.dataset.placeholder) {
      this.value = '';
      this.type = 'time';
      this.style.color = '#222222';
    }
  });

  input.addEventListener('blur', function () {
    if (this.value === '') {
      this.type = 'text';
      this.value = this.dataset.placeholder;
      this.style.color = '#9d9d9d';
    }
  });
});


// Set initial state: FR button active
document.getElementById('ivButton').classList.remove('selected-button');
document.getElementById('frButton').classList.add('selected-button');
document.getElementById('tmButton').classList.remove('selected-button');
document.getElementById('ivContent').style.display = 'none';
document.getElementById('tmContent').style.display = 'none';
document.getElementById('frContent').style.display = 'block';

// Button event listeners
document.getElementById('frButton').addEventListener('click', function () {
  document.getElementById('frContent').style.display = 'block';
  document.getElementById('ivContent').style.display = 'none';
  document.getElementById('tmContent').style.display = 'none';
  document.getElementById('bothContent').style.display = 'none';
  this.classList.add('selected-button');
  document.getElementById('ivButton').classList.remove('selected-button');
  document.getElementById('tmButton').classList.remove('selected-button');
});

document.getElementById('ivButton').addEventListener('click', function () {
  document.getElementById('frContent').style.display = 'none';
  document.getElementById('tmContent').style.display = 'none';
  document.getElementById('ivContent').style.display = 'block';
  document.getElementById('bothContent').style.display = 'block';
  this.classList.add('selected-button');
  document.getElementById('frButton').classList.remove('selected-button');
  document.getElementById('tmButton').classList.remove('selected-button');
});

document.getElementById('tmButton').addEventListener('click', function () {
  document.getElementById('frContent').style.display = 'none';
  document.getElementById('tmContent').style.display = 'none';
  document.getElementById('ivContent').style.display = 'none';
  document.getElementById('bothContent').style.display = 'none';
  this.classList.add('selected-button');
  document.getElementById('frButton').classList.remove('selected-button');
  document.getElementById('ivButton').classList.remove('selected-button');
  // Open T&M modal only if there are no T&M items
 
    openTMModal();
  
});

// Global variables
const selectedPartsList = document.getElementById('selectedPartsList');
const tmPartsList = document.getElementById('tmPartsList');
const emptyInvoices = document.getElementById('noSelectedPartsList');
const partCheckboxes = document.querySelectorAll('.part-checkbox');
const totalPriceDisplay = document.getElementById('totalPrice');
let totalPrice = 0;
let partRows = [];
let uniqueIdCounter = 0;

// Initialize empty invoices message
if (partRows.length === 0) {
  emptyInvoices.style.display = 'block';
}

// Function to generate a unique ID
function generateUniqueId() {
  return `part_${++uniqueIdCounter}`;
}

// Event listener for checkboxes
partCheckboxes.forEach(checkbox => {
  checkbox.addEventListener('change', function () {
    const partItem = this.closest('.part-item');
    const partImageSrc = partItem.querySelector('img').src;
    const partNumber = partItem.querySelector('span:nth-of-type(1)').textContent;
    const partDescription = partItem.querySelector('span:nth-of-type(2)').textContent;
    const partPriceText = partItem.querySelector('span:nth-of-type(3)').textContent;
    const partPrice = parseFloat(partPriceText.replace('$', ''));

    if (this.checked) {
      const uniqueId = generateUniqueId();
      const partRow = createPartRow(uniqueId, partImageSrc, partNumber, partDescription, partPrice, 1);
      selectedPartsList.appendChild(partRow);
      partRows.push({
        id: uniqueId,
        partNumber,
        partDescription,
        partQuantity: 1,
        partPrice,
        rowElement: partRow,
        type: 'flr',
        checkbox: this,
      });
      addRowEventListeners(partRow, partPrice);
      totalPrice += partPrice;
      updateTotalPrice();
      emptyInvoices.style.display = 'none';
    } else {
      const rowToRemove = partRows.find(row => row.partNumber === partNumber && row.type === 'flr');
      if (rowToRemove) {
        removePartRow(rowToRemove.id, 'flr');
      }
    }
  });
});

// Function to open T&M modal
function openTMModal(existingRow = null) {
  const modal = document.getElementById('tm-modal');
  const numberInput = document.getElementById('tmNumber');
  const descriptionInput = document.getElementById('tmDescription');
  const priceInput = document.getElementById('tmPrice');
  const addButton = document.getElementById('tm-modal-add');

  

  if (existingRow) {
    const uniqueId = existingRow.dataset.uniqueId;
    const rowData = partRows.find(row => row.id === uniqueId);
    
    numberInput.value = existingRow.querySelector('.part-number').textContent;
    descriptionInput.value = existingRow.querySelector('.part-description').textContent;
    
    // Show the current unit price, not the total price
    priceInput.value = rowData.partPrice.toFixed(2);
    addButton.textContent = 'Update T&M Item';
  } else {
    // Generate a unique T&M number for new items
    const tmNumber = `TM${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    numberInput.value = tmNumber;
    descriptionInput.value = '';
    priceInput.value = '';
    addButton.textContent = 'Add T&M Item';
  }

  modal.style.display = 'block';

  

  addButton.onclick = function () {
    const newNumber = numberInput.value;
    const newDescription = descriptionInput.value;
    let newUnitPrice = parseFloat(priceInput.value);

    if (isNaN(newUnitPrice) || newUnitPrice <= 0) {
        // Set newUnitPrice to 0
        newUnitPrice = 0;
    }
   

    if (existingRow) {
      const uniqueId = existingRow.dataset.uniqueId;
      updateTMRow(uniqueId, newNumber, newDescription, newUnitPrice);
    } else {
      createTMRow(newNumber, newDescription, newUnitPrice);
    }

    modal.style.display = 'none';
    document.getElementById('ivButton').click();

    // Hide the "No selected parts" message if it's visible
    document.getElementById('noSelectedPartsList').style.display = 'none';
  };

  document.getElementById('tm-modal-close').onclick = function () {
    modal.style.display = 'none';
    document.getElementById('ivButton').click();
  };


}

// Function to update a T&M row
function updateTMRow(uniqueId, partNumber, partDescription, newUnitPrice) {
  const tmRow = tmPartsList.querySelector(`[data-unique-id="${uniqueId}"]`);
  const ivRow = selectedPartsList.querySelector(`[data-unique-id="${uniqueId}"]`);
  const partRowIndex = partRows.findIndex(row => row.id === uniqueId);

  if (partRowIndex !== -1) {
    const currentRow = partRows[partRowIndex];
    const oldPrice = currentRow.partPrice;
    const oldQuantity = currentRow.partQuantity;

    // Update part number and description without affecting quantity or price
    currentRow.partNumber = partNumber;
    currentRow.partDescription = partDescription;

    // Only update price and reset quantity if the price has changed
    if (oldPrice !== newUnitPrice) {
      currentRow.partPrice = newUnitPrice;
      currentRow.partQuantity = 1; // Reset quantity to 1 only when price changes
      updateRowDisplay(tmRow, currentRow);
      updateRowDisplay(ivRow, currentRow);
      recalculateTotalPrice();
    } else {
      // If price hasn't changed, update number, description, and keep the old quantity
      currentRow.partQuantity = oldQuantity;
      updateRowDisplayPartial(tmRow, currentRow);
      updateRowDisplayPartial(ivRow, currentRow);
    }
  }
}

function updateRowDisplay(row, data) {
  if (row) {
    row.querySelector('.part-number').textContent = data.partNumber;
    row.querySelector('.part-description').textContent = data.partDescription;
    row.querySelector('.part-price').textContent = `$${(data.partPrice * data.partQuantity).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
    row.querySelector('.part-quantity').value = data.partQuantity;
  }
}

function updateRowDisplayPartial(row, data) {
  if (row) {
    row.querySelector('.part-number').textContent = data.partNumber;
    row.querySelector('.part-description').textContent = data.partDescription;
    row.querySelector('.part-quantity').value = data.partQuantity;
    // Update the price display to reflect the current quantity
    row.querySelector('.part-price').textContent = `$${(data.partPrice * data.partQuantity).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
}

// Function to create a T&M row
function createTMRow(partNumber, partDescription, partPrice) {
  const uniqueId = generateUniqueId();
  const newRow = createPartRow(uniqueId, './public/hqdefault.jpg', partNumber, partDescription, partPrice, 1, true);

  tmPartsList.appendChild(newRow);

  const ivRow = newRow.cloneNode(true);
  selectedPartsList.appendChild(ivRow);

  addRowEventListeners(newRow, partPrice, 'tm');
  addRowEventListeners(ivRow, partPrice, 'iv');

  partRows.push({
    id: uniqueId,
    partNumber: partNumber,
    partDescription: partDescription,
    partQuantity: 1,
    partPrice: partPrice,
    rowElement: newRow,
    ivRowElement: ivRow,
    type: 'tm',
  });

  recalculateTotalPrice();
}

// Function to create a part row
function createPartRow(uniqueId, partImageSrc, partNumber, partDescription, partPrice, partQuantity, isTM = false) {
  const partRow = document.createElement('div');
  partRow.classList.add('selected-part-item');
  if (isTM) partRow.classList.add('tm-item');
  partRow.dataset.uniqueId = uniqueId;

  const imageOrSpan = isTM
    ? `<span class="part-img"></span>`
    : `<img class="part-img" src="${partImageSrc}" alt="Part Image" />`;

  partRow.innerHTML = `
    <div class="selected-part-item-one">
      <img src="./public/plus.svg" alt="add" class="plus-icon" />
      <img src="./public/trashcan.png" alt="Remove" class="trash-can-icon" />
      ${imageOrSpan}
      <div class="quantity">
        <button class="minus" aria-label="Decrease">&minus;</button>
        <input type="number" class="part-quantity" value="${partQuantity}" min="1" max="30">
        <button class="plus" aria-label="Increase">&plus;</button>
      </div> 
    </div>
    <div class="selected-part-item-two">
      <span class="part-number">${partNumber}</span>
      <span class="part-description">${partDescription}</span>
      <span class="part-price">$${(partPrice * partQuantity).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}</span>
    </div>
  `;
  return partRow;
}

// Function to add event listeners to each row
function addRowEventListeners(partRow, partPrice, rowType) {
  const inputBox = partRow.querySelector('.part-quantity');
  const uniqueId = partRow.dataset.uniqueId;
  const partType = partRow.classList.contains('tm-item') ? 'tm' : 'flr';

  // Remove existing event listeners
  const oldInputBox = inputBox.cloneNode(true);
  inputBox.parentNode.replaceChild(oldInputBox, inputBox);
  const newMinusButton = partRow.querySelector('.minus').cloneNode(true);
  partRow.querySelector('.minus').parentNode.replaceChild(newMinusButton, partRow.querySelector('.minus'));
  const newPlusButton = partRow.querySelector('.plus').cloneNode(true);
  partRow.querySelector('.plus').parentNode.replaceChild(newPlusButton, partRow.querySelector('.plus'));

  // Quantity buttons
  newMinusButton.addEventListener('click', () => updateQuantity(-1));
  newPlusButton.addEventListener('click', () => updateQuantity(1));

  // Quantity input
  oldInputBox.addEventListener('input', () => updateQuantity(0, parseInt(oldInputBox.value) || 1));

  // Plus icon (add new T&M item)
  const plusIcon = partRow.querySelector('.plus-icon');
  if (plusIcon) {
    plusIcon.addEventListener('click', () => openTMModal());
  }

  // Edit part details
  partRow.querySelector('.part-number').addEventListener('click', function () {
    if (partType === 'tm') openTMModal(partRow);
  });

  if (partType !== 'tm') {
    partRow.querySelector('.part-description').addEventListener('click', function () {
      const currentDescription = this.textContent;
      openUpdateModal(currentDescription, newDescription => {
        updatePartRowsArray(uniqueId, 'partDescription', newDescription);
        // Update the corresponding row in both lists
        updateDescriptionInRows(uniqueId, newDescription);
      });
    });
  } else {
    partRow.querySelector('.part-description').addEventListener('click', function () {
      if (partType === 'tm') openTMModal(partRow);
    });
  }

  partRow.querySelector('.part-price').addEventListener('click', function () {
    if (partType === 'tm') openTMModal(partRow);
  });

  // Trash can (remove row)
  const trashIcon = partRow.querySelector('.trash-can-icon');
  if (trashIcon) {
    trashIcon.addEventListener('click', () => removePartRow(uniqueId, partType));
  }

  function updateQuantity(change, newQuantity = null) {
    let quantity = newQuantity !== null ? newQuantity : (parseInt(oldInputBox.value) || 1) + change;
    quantity = Math.max(1, Math.min(quantity, 30));
    oldInputBox.value = quantity;

    updatePartRowsArray(uniqueId, 'partQuantity', quantity);

    const partPriceElement = partRow.querySelector('.part-price');
    const currentPartPrice = getCurrentPartPrice(uniqueId);
    const newPartPrice = currentPartPrice * quantity;
    partPriceElement.textContent = `$${newPartPrice.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

    // Update the corresponding row in the other list
    const otherRow = rowType === 'tm' ? selectedPartsList : tmPartsList;
    const correspondingRow = otherRow.querySelector(`[data-unique-id="${uniqueId}"]`);
    if (correspondingRow) {
      correspondingRow.querySelector('.part-quantity').value = quantity;
      correspondingRow.querySelector('.part-price').textContent = `$${newPartPrice.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }

    recalculateTotalPrice();
  }
}

// Function to update description in both rows
// Function to update description in both rows
function updateDescriptionInRows(uniqueId, newDescription) {
  const tmRow = tmPartsList.querySelector(`[data-unique-id="${uniqueId}"]`);
  const ivRow = selectedPartsList.querySelector(`[data-unique-id="${uniqueId}"]`);
  
  if (tmRow) {
    tmRow.querySelector('.part-description').textContent = newDescription;
  }
  if (ivRow) {
    ivRow.querySelector('.part-description').textContent = newDescription;
  }
  
  // Update the partRows array
  const partRowIndex = partRows.findIndex(row => row.id === uniqueId);
  if (partRowIndex !== -1) {
    partRows[partRowIndex].partDescription = newDescription;
  }
}

function getCurrentPartPrice(uniqueId) {
  const partRow = partRows.find(row => row.id === uniqueId);
  return partRow ? partRow.partPrice : 0;
}

// Function to open update description modal
function openUpdateModal(currentDescription, onSave) {
  const modal = document.getElementById('description-modal');
  const modalTextarea = document.getElementById('modal-description');
  const modalSaveBtn = document.getElementById('modal-save');
  const modalCloseBtn = document.getElementById('modal-close');

  modalTextarea.value = currentDescription;
  modal.style.display = 'block';

  modalSaveBtn.onclick = function () {
    onSave(modalTextarea.value);
    modal.style.display = 'none';
  };

  modalCloseBtn.onclick = () => (modal.style.display = 'none');
}

// Function to update partRows array
function updatePartRowsArray(uniqueId, property, value) {
  const partRowIndex = partRows.findIndex(item => item.id === uniqueId);
  if (partRowIndex > -1) {
    if (typeof value === 'object') {
      Object.assign(partRows[partRowIndex], value);
    } else {
      partRows[partRowIndex][property] = value;
    }
  }
}

// Function to remove part row
function removePartRow(uniqueId, partType) {
  const rowIndex = partRows.findIndex(item => item.id === uniqueId && item.type === partType);
  if (rowIndex > -1) {
    const item = partRows[rowIndex];
    selectedPartsList.removeChild(item.ivRowElement || item.rowElement);
    if (partType === 'tm') {
      tmPartsList.removeChild(item.rowElement);
    }
    totalPrice -= item.partPrice * item.partQuantity;
    partRows.splice(rowIndex, 1);

    if (partType === 'flr' && item.checkbox) {
      item.checkbox.checked = false;
    }

    updateTotalPrice();

    if (partRows.length === 0) {
      emptyInvoices.style.display = 'block';
    }
  }
}

// Function to recalculate total price
function recalculateTotalPrice() {
  totalPrice = partRows.reduce((total, item) => {
    return total + item.partPrice * item.partQuantity;
  }, 0);
  updateTotalPrice();
}

// Function to update total price display
function updateTotalPrice() {
  totalPriceDisplay.textContent = `Total: $${totalPrice.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

// Modal functionality
function openUpdateModal(currentDescription, onSave, isNewDescription = false) {
  const modal = document.getElementById('description-modal');
  const modalTextarea = document.getElementById('modal-description');
  const modalSaveBtn = document.getElementById('modal-save');
  const modalCloseBtn = document.getElementById('modal-close');

  // Set current description in the textarea
  modalTextarea.value = currentDescription;
  modal.style.display = 'block';

  // Update the modal save button text based on whether it's adding or updating
  modalSaveBtn.textContent = isNewDescription
    ? 'Add Description'
    : 'Update Description';

  // Handle save button click
  modalSaveBtn.onclick = function () {
    const newDescription = modalTextarea.value;
    onSave(newDescription);
    modal.style.display = 'none'; // Close the modal
  };

  // Handle close button click
  modalCloseBtn.onclick = function () {
    modal.style.display = 'none'; // Close the modal
  };
}

// ------------ Modals:

// Tech Notes Modal
const techButton = document.getElementById('techButton');
const officeButton = document.getElementById('officeButton');
const techNotesModal = document.getElementById('techNotesModal');
const officeNotesModal = document.getElementById('officeNotesModal');
const closeTechModal = document.getElementById('closeTechModal');
const closeOfficeModal = document.getElementById('closeOfficeModal');

const body = document.body;

// Function to open modal
const openModal = modal => {
  modal.style.display = 'block';
  body.classList.add('modal-open');
};

// Function to close modal
const closeModal = modal => {
  modal.style.display = 'none';
  body.classList.remove('modal-open');
};

// Open tech modal on button click
techButton.addEventListener('click', () => openModal(techNotesModal));

// Open office modal on button click
officeButton.addEventListener('click', () => openModal(officeNotesModal));

// Close tech modal on clicking the close button or overlay
closeTechModal.addEventListener('click', () => closeModal(techNotesModal));
closeOfficeModal.addEventListener('click', () => closeModal(officeNotesModal));

// Payment Modal
document.addEventListener('DOMContentLoaded', function () {
  const paymentSelect = document.getElementById('paymentType');
  const paymentModal = document.querySelector('.payment-modal');
  const confirmationModal = document.getElementById('confirmation-modal');
  const modalTabs = document.querySelectorAll('.tab'); // Select all tabs
  const modalSections = document.querySelectorAll('.payment-modal-body > div'); // Select all sections
  const closeWorkOrderBtn = document.querySelector('.payment-modal-btn'); // Button to open confirmation modal
  const confirmYesBtn = confirmationModal.querySelector('.payment-modal-btn'); // "Yes" button
  const confirmNoBtn = confirmationModal.querySelector(
    '.payment-modal-close-btn'
  ); // "No" button
  const cancelButton = document.querySelector('.payment-modal-close-btn'); // Cancel button in payment modal
  const submitButton = document.querySelector('.submit-button');

  // Function to open the payment modal and synchronize it with the dropdown
  function openPaymentModal() {
    const selectedIndex = paymentSelect.selectedIndex;
    setActiveTab(selectedIndex); // Ensure the right tab and section are visible
    paymentModal.style.display = 'block'; // Show the payment modal
    document.body.style.overflow = 'hidden'; // Hide body scroll
  }

  // Function to close the payment modal
  function closePaymentModal() {
    paymentModal.style.display = 'none'; // Hide the payment modal
    document.body.style.overflow = 'auto'; // Restore body scroll
  }

  // Function to open confirmation modal
  function openConfirmationModal() {
    confirmationModal.style.display = 'block'; // Show confirmation modal
  }

  // Function to close confirmation modal
  function closeConfirmationModal() {
    confirmationModal.style.display = 'none'; // Hide confirmation modal
  }

  // Function to set the active tab and show corresponding section
  function setActiveTab(index) {
    modalTabs.forEach((tab, i) => {
      if (i === index) {
        tab.classList.add('active'); // Highlight the active tab
        modalSections[i].classList.add('show'); // Show the corresponding section
        modalSections[i].classList.remove('hide');
      } else {
        tab.classList.remove('active'); // Remove active class from inactive tabs
        modalSections[i].classList.remove('show'); // Hide all other sections
        modalSections[i].classList.add('hide');
      }
    });
  }

  // Event listener to switch tabs and content when tab is clicked
  modalTabs.forEach((tab, index) => {
    tab.addEventListener('click', function () {
      setActiveTab(index); // Set the active tab based on click
    });
  });

  // Open payment modal on submit button click
  submitButton.addEventListener('click', openPaymentModal);

  // Event listener to open confirmation modal when "Close Work Order/Estimate" is clicked
  closeWorkOrderBtn.addEventListener('click', function () {
    openConfirmationModal();
  });

  // Event listener for the "Yes" button in the confirmation modal
  confirmYesBtn.addEventListener('click', function () {
    closeConfirmationModal();
    closePaymentModal(); // Close both confirmation and payment modals
  });

  // Event listener for the "No" button in the confirmation modal
  confirmNoBtn.addEventListener('click', function () {
    closeConfirmationModal(); // Only close the confirmation modal
  });

  // Cancel button event to close the payment modal
  cancelButton.addEventListener('click', closePaymentModal);

  // Optional: Close modal when clicking outside of it
  window.addEventListener('click', event => {
    if (event.target === paymentModal) {
      closePaymentModal();
    } else if (event.target === confirmationModal) {
      closeConfirmationModal();
    }
  });
});
