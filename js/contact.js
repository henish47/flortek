
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const alertBox = document.getElementById('formAlert');
  const submitBtn = form.querySelector('.btn-send-message');

  const fields = {
    name: {
      input: document.getElementById('f-name'),
      error: document.getElementById('nameError'),
      validate: (val) => {
        const trimmed = val.trim();
        if (!trimmed) return 'Name is required.';
        if (trimmed.length < 2) return 'Name must be at least 2 characters.';
        if (!/^[a-zA-Z\s.'-]+$/.test(trimmed)) return 'Name should contain only letters and spaces.';
        return '';
      }
    },
    phone: {
      input: document.getElementById('f-phone'),
      error: document.getElementById('phoneError'),
      validate: (val) => {
        const trimmed = val.trim();
        if (!trimmed) return 'Phone number is required.';
        // Digits-only count
        const digitsOnly = trimmed.replace(/\D/g, '');
        if (digitsOnly.length < 10 || digitsOnly.length > 15) {
          return 'Enter a valid 10-digit phone number.';
        }
        if (!/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/.test(trimmed)) {
          return 'Invalid phone number format.';
        }
        return '';
      }
    },
    email: {
      input: document.getElementById('f-email'),
      error: document.getElementById('emailError'),
      validate: (val) => {
        const trimmed = val.trim();
        if (!trimmed) return 'Email address is required.';
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(trimmed)) return 'Please enter a valid email address (e.g., name@domain.com).';
        return '';
      }
    },
    company: {
      input: document.getElementById('f-company'),
      error: document.getElementById('companyError'),
      validate: (val) => {
        // Optional field
        const trimmed = val.trim();
        if (trimmed.length > 0 && trimmed.length < 2) {
          return 'Company name must be at least 2 characters if provided.';
        }
        return '';
      }
    },
    country: {
      input: document.getElementById('f-country'),
      error: document.getElementById('countryError'),
      validate: (val) => {
        if (!val || val.trim() === '') return 'Please select your country.';
        return '';
      }
    },
    message: {
      input: document.getElementById('f-message'),
      error: document.getElementById('messageError'),
      validate: (val) => {
        const trimmed = val.trim();
        if (!trimmed) return 'Message is required.';
        if (trimmed.length < 10) return 'Message must be at least 10 characters long.';
        return '';
      }
    }
  };

  // Helper to display error for a single field
  function validateField(key, showSuccess = true) {
    const field = fields[key];
    if (!field || !field.input) return true;

    const errorMsg = field.validate(field.input.value);

    if (errorMsg) {
      field.input.classList.add('is-invalid');
      field.input.classList.remove('is-valid');
      if (field.error) {
        field.error.textContent = errorMsg;
        field.error.style.display = 'block';
      }
      return false;
    } else {
      field.input.classList.remove('is-invalid');
      if (showSuccess && (field.input.value.trim() !== '' || key === 'country')) {
        field.input.classList.add('is-valid');
      } else {
        field.input.classList.remove('is-valid');
      }
      if (field.error) {
        field.error.textContent = '';
        field.error.style.display = 'none';
      }
      return true;
    }
  }

  // Helper to shake an element
  function shakeElement(el) {
    el.classList.remove('field-shake');
    // Force reflow
    void el.offsetWidth;
    el.classList.add('field-shake');
    setTimeout(() => {
      el.classList.remove('field-shake');
    }, 400);
  }

  // Attach live event listeners to fields
  Object.keys(fields).forEach((key) => {
    const field = fields[key];
    if (!field.input) return;

    // Validate on blur
    field.input.addEventListener('blur', () => {
      validateField(key);
    });

    // Real-time validation on typing once modified
    field.input.addEventListener('input', () => {
      if (field.input.classList.contains('is-invalid')) {
        validateField(key);
      }
    });

    if (field.input.tagName === 'SELECT') {
      field.input.addEventListener('change', () => {
        validateField(key);
      });
    }
  });

  // Handle form submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let isFormValid = true;
    let firstInvalidField = null;

    // Check all fields
    Object.keys(fields).forEach((key) => {
      const isValid = validateField(key, true);
      if (!isValid) {
        isFormValid = false;
        if (!firstInvalidField) {
          firstInvalidField = fields[key].input;
        }
        shakeElement(fields[key].input);
      }
    });

    if (!isFormValid) {
      if (firstInvalidField) {
        firstInvalidField.focus();
      }
      showAlert('error', 'Please correct the highlighted errors before submitting.');
      return;
    }

    // Success state simulation
    const originalBtnContent = submitBtn ? submitBtn.innerHTML : 'SEND MESSAGE';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <i class="fa-solid fa-spinner fa-spin" style="margin-right: 8px;"></i>
        SENDING...
      `;
    }

    setTimeout(() => {
      const senderName = fields.name.input.value.trim();
      showAlert('success', `Thank you, ${senderName}! Your message has been sent successfully. Our team will contact you shortly.`);

      // Reset form
      form.reset();

      // Clear valid classes
      Object.keys(fields).forEach((key) => {
        const field = fields[key];
        if (field.input) {
          field.input.classList.remove('is-valid');
          field.input.classList.remove('is-invalid');
        }
        if (field.error) {
          field.error.textContent = '';
          field.error.style.display = 'none';
        }
      });

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnContent;
      }

      // Smooth scroll to alert
      if (alertBox) {
        alertBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 1000);
  });

  function showAlert(type, message) {
    if (!alertBox) return;

    alertBox.className = `form-alert ${type}`;
    alertBox.innerHTML = `
      <i class="fa-solid ${type === 'success' ? 'fa-circle-check' : 'fa-triangle-exclamation'}"></i>
      <span>${message}</span>
    `;
    alertBox.style.display = 'flex';

    if (type === 'success') {
      setTimeout(() => {
        alertBox.style.display = 'none';
      }, 7000);
    }
  }
});
