import Swal from 'sweetalert2';

// Create a custom mixin to style buttons with tailwind styles matching the Emerald/Stone theme
const swalCustom = Swal.mixin({
  customClass: {
    confirmButton: 'bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-6 rounded-xl mx-2 transition-all cursor-pointer shadow-md shadow-emerald-100 outline-none text-sm border-0',
    cancelButton: 'bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold py-2 px-6 rounded-xl mx-2 transition-all cursor-pointer outline-none text-sm border-0',
    denyButton: 'bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-xl mx-2 transition-all cursor-pointer shadow-md shadow-red-100 outline-none text-sm border-0',
    input: 'border border-stone-300 rounded-xl px-4 py-2 w-4/5 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-medium text-stone-800 text-sm'
  },
  buttonsStyling: false
});

/**
 * Show a success notification alert.
 */
export const showSuccess = (message) => {
  return swalCustom.fire({
    title: 'Success',
    text: message || 'Operation completed successfully',
    icon: 'success',
    confirmButtonText: 'OK'
  });
};

/**
 * Show an error notification alert.
 */
export const showError = (message) => {
  return swalCustom.fire({
    title: 'Error',
    text: message || 'Something went wrong',
    icon: 'error',
    confirmButtonText: 'OK'
  });
};

/**
 * Show a warning notification alert.
 */
export const showWarning = (message) => {
  return swalCustom.fire({
    title: 'Warning',
    text: message || 'Please check your input',
    icon: 'warning',
    confirmButtonText: 'OK'
  });
};

/**
 * Show an info notification alert.
 */
export const showInfo = (message) => {
  return swalCustom.fire({
    title: 'Info',
    text: message,
    icon: 'info',
    confirmButtonText: 'OK'
  });
};

/**
 * Show a general confirmation dialog.
 * Resolves to true if confirmed, false otherwise.
 */
export const showConfirm = async (title, text) => {
  const result = await swalCustom.fire({
    title: title || 'Are you sure?',
    text: text || 'This action cannot be undone.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes',
    cancelButtonText: 'Cancel'
  });
  return result.isConfirmed;
};

/**
 * Show a delete confirmation dialog.
 */
export const showDeleteConfirm = async (title, text) => {
  const result = await swalCustom.fire({
    title: title || 'Are you sure?',
    text: text || 'This action cannot be undone.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Delete',
    cancelButtonText: 'Cancel',
    customClass: {
      confirmButton: 'bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-xl mx-2 transition-all cursor-pointer shadow-md shadow-red-100 outline-none text-sm border-0',
      cancelButton: 'bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold py-2 px-6 rounded-xl mx-2 transition-all cursor-pointer outline-none text-sm border-0'
    }
  });
  return result.isConfirmed;
};

/**
 * Show auction success alert.
 */
export const showAuctionSuccess = (message) => {
  return swalCustom.fire({
    title: 'Auction Status',
    text: message || 'Auction event triggered successfully',
    icon: 'success',
    confirmButtonText: 'OK'
  });
};

/**
 * Show bid success alert.
 */
export const showBidSuccess = (message) => {
  return swalCustom.fire({
    title: 'Bid Placed',
    text: message || 'Bid submitted successfully',
    icon: 'success',
    confirmButtonText: 'OK'
  });
};

/**
 * Show order success alert.
 */
export const showOrderSuccess = (message) => {
  return swalCustom.fire({
    title: 'Order Status',
    text: message || 'Order update completed successfully',
    icon: 'success',
    confirmButtonText: 'OK'
  });
};

/**
 * Show login success alert.
 */
export const showLoginSuccess = () => {
  return swalCustom.fire({
    title: 'Login Successful',
    text: 'Welcome back!',
    icon: 'success',
    timer: 2000,
    showConfirmButton: false
  });
};

/**
 * Show logout confirmation dialog.
 */
export const showLogoutConfirm = async () => {
  const result = await swalCustom.fire({
    title: 'Are you sure?',
    text: 'You will be logged out of your session.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, Logout',
    cancelButtonText: 'Cancel'
  });
  return result.isConfirmed;
};

/**
 * Show payment success alert.
 */
export const showPaymentSuccess = (message) => {
  return swalCustom.fire({
    title: 'Payment Status',
    text: message || 'Payment processed successfully',
    icon: 'success',
    confirmButtonText: 'OK'
  });
};

/**
 * Show validation error alert.
 */
export const showValidationError = (message) => {
  return swalCustom.fire({
    title: 'Validation Error',
    text: message || 'Please correct the invalid input fields.',
    icon: 'error',
    confirmButtonText: 'OK'
  });
};

/**
 * Show a prompt input dialog.
 */
export const showInputPrompt = async (title, text, placeholder = '', defaultValue = '') => {
  const result = await swalCustom.fire({
    title,
    text,
    input: 'text',
    inputValue: defaultValue,
    inputPlaceholder: placeholder,
    showCancelButton: true,
    confirmButtonText: 'Submit',
    cancelButtonText: 'Cancel'
  });
  return result.value;
};

/**
 * Show a persistent loading alert.
 */
export const showLoading = (title = 'Loading...', text = 'Please wait') => {
  swalCustom.fire({
    title,
    text,
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });
};

/**
 * Close any active loading alerts.
 */
export const closeLoading = () => {
  swalCustom.close();
};
