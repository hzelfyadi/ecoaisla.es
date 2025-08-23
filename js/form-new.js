// Main form functionality
function initializeForm() {
    console.log('Initializing form...');
    
    // Form elements
    const form = document.querySelector('.et_pb_contact_form');
    const formContainer = document.querySelector('.form-container');
    const steps = document.querySelectorAll('.form-step');
    const progressSteps = document.querySelectorAll('.progress-step');
    const nextButtons = document.querySelectorAll('.form-next-btn');
    const prevButtons = document.querySelectorAll('.form-prev-btn');
    const submitButton = document.querySelector('.form-submit-btn');
    let currentStep = 0;
    
    // Form data object to store all inputs
    const formData = {
        vivienda: '',
        atico: '',
        cp: '',
        nombre: '',
        telefono: '',
        email: '',
        privacidad: false
    };

    // Initialize form
    showStep(currentStep);

    // Next button click handler
    nextButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (validateStep(currentStep)) {
                // Save current step data
                saveStepData(currentStep);
                
                // Move to next step
                currentStep++;
                showStep(currentStep);
                updateProgressBar();
                
                // Scroll to top of form on step change
                formContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // Previous button click handler
    prevButtons.forEach(button => {
        button.addEventListener('click', () => {
            currentStep--;
            showStep(currentStep);
            updateProgressBar();
        });
    });

    // Show current step and hide others
    function showStep(step) {
        steps.forEach((stepElement, index) => {
            if (index === step) {
                stepElement.classList.add('active');
            } else {
                stepElement.classList.remove('active');
            }
        });

        // Show/hide navigation buttons
        document.querySelectorAll('.form-navigation').forEach(nav => {
            const prevBtn = nav.querySelector('.form-prev-btn');
            const nextBtn = nav.querySelector('.form-next-btn');
            
            if (step === 0) {
                nav.style.justifyContent = 'flex-end';
                if (prevBtn) prevBtn.style.display = 'none';
                if (nextBtn) nextBtn.style.display = 'block';
            } else if (step === steps.length - 1) {
                nav.style.justifyContent = 'flex-start';
                if (prevBtn) prevBtn.style.display = 'block';
                if (nextBtn) nextBtn.style.display = 'none';
            } else {
                nav.style.justifyContent = 'space-between';
                if (prevBtn) prevBtn.style.display = 'block';
                if (nextBtn) nextBtn.style.display = 'block';
            }
        });
    }

    // Validate current step before proceeding
    function validateStep(step) {
        const currentStepElement = steps[step];
        const requiredFields = currentStepElement.querySelectorAll('[required]');
        let isValid = true;
        
        // First, clear all previous error messages
        currentStepElement.querySelectorAll('.error-message').forEach(el => el.remove());
        currentStepElement.querySelectorAll('.error').forEach(el => el.classList.remove('error'));

        // Check required fields
        requiredFields.forEach(field => {
            const isRadio = field.type === 'radio';
            const isCheckbox = field.type === 'checkbox';
            const radioGroup = isRadio ? field.name : null;
            
            // Skip radio buttons in this loop, we'll handle them separately
            if (isRadio) return;
            
            if ((!field.value && !isCheckbox) || (isCheckbox && !field.checked)) {
                field.classList.add('error');
                isValid = false;
                
                // Add error message
                const errorMessage = document.createElement('span');
                errorMessage.className = 'error-message';
                errorMessage.textContent = isCheckbox ? 'Debes aceptar la política de privacidad' : 'Este campo es obligatorio';
                errorMessage.style.color = '#ef4444';
                errorMessage.style.fontSize = '0.8rem';
                errorMessage.style.marginTop = '0.25rem';
                errorMessage.style.display = 'block';
                
                // Insert after the field or its container for checkboxes
                if (isCheckbox) {
                    field.closest('.checkbox-group').appendChild(errorMessage);
                } else {
                    field.parentNode.insertBefore(errorMessage, field.nextSibling);
                }
            }
        });

        // Special validation for radio groups
        const radioGroups = currentStepElement.querySelectorAll('.radio-group');
        radioGroups.forEach(group => {
            const radioInputs = group.querySelectorAll('input[type="radio"]');
            const radioName = radioInputs[0]?.name;
            const isRadioChecked = Array.from(radioInputs).some(radio => radio.checked);
            
            if (!isRadioChecked) {
                // Only add error if not already present
                if (!group.querySelector('.error-message')) {
                    const errorMessage = document.createElement('div');
                    errorMessage.className = 'error-message';
                    errorMessage.textContent = 'Por favor, selecciona una opción';
                    errorMessage.style.color = '#ef4444';
                    errorMessage.style.fontSize = '0.9rem';
                    errorMessage.style.marginTop = '0.5rem';
                    errorMessage.style.padding = '0.5rem';
                    errorMessage.style.borderRadius = '4px';
                    errorMessage.style.backgroundColor = '#fef2f2';
                    group.appendChild(errorMessage);
                }
                
                // Add error class to all radio inputs in the group
                radioInputs.forEach(radio => {
                    const option = radio.closest('.radio-option');
                    if (option) option.classList.add('error');
                });
                
                isValid = false;
            } else {
                // Remove any existing error messages and error classes
                const existingError = group.querySelector('.error-message');
                if (existingError) existingError.remove();
                radioInputs.forEach(radio => {
                    const option = radio.closest('.radio-option');
                    if (option) option.classList.remove('error');
                });
            }
        });

        return isValid;
    }

    // Update progress bar
    function updateProgressBar() {
        progressSteps.forEach((step, index) => {
            if (index <= currentStep) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });
    }

    // Add input validation
    if (form) {
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            // Remove error class on input
            input.addEventListener('input', () => {
                if (input.value) {
                    input.classList.remove('error');
                    const errorMessage = input.nextElementSibling;
                    if (errorMessage?.classList?.contains('error-message')) {
                        errorMessage.remove();
                    }
                }
            });

            // Add focus styles
            input.addEventListener('focus', () => {
                const parent = input.parentElement;
                if (parent) parent.classList.add('focused');
            });

            input.addEventListener('blur', () => {
                const parent = input.parentElement;
                if (parent) parent.classList.remove('focused');
            });
        });
    }

    // Form submission
    if (submitButton) {
        submitButton.addEventListener('click', async (e) => {
            e.preventDefault();
            
            if (validateStep(currentStep)) {
                // Save final step data
                saveStepData(currentStep);
                
                // Show loading state
                submitButton.disabled = true;
                submitButton.innerHTML = 'Enviando...';
                
                try {
                    // Prepare form data for submission
                    const submissionData = {
                        fullName: formData.nombre || '',
                        phone: formData.telefono || '',
                        email: formData.email || '',
                        address: formData.direccion || '',
                        city: formData.ciudad || '',
                        postalCode: formData.cp || '',
                        propertyType: formData.vivienda || '',
                        atticType: formData.atico || '',
                        privacyAccepted: formData.privacidad || false,
                        timestamp: new Date().toISOString()
                    };
                    
                    // Send data to server
                    const response = await fetch('http://localhost:3000/api/submit', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(submissionData)
                    });
                    
                    const result = await response.json();
                    
                    if (!response.ok) {
                        throw new Error(result.error || 'Error al enviar el formulario');
                    }
                    
                    // Create success message
                    const successHTML = `
                        <div class="form-success">
                            <div class="success-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                </svg>
                            </div>
                            <h3>¡Solicitud Enviada con Éxito!</h3>
                            <p>Gracias por completar el formulario. Nuestro equipo se pondrá en contacto contigo en breve para continuar con el proceso.</p>
                            <div class="form-data-summary">
                                <h4>Resumen de tu solicitud:</h4>
                                <p><strong>Tipo de vivienda:</strong> ${formData.vivienda || 'No especificado'}</p>
                                <p><strong>Tipo de ático:</strong> ${formData.atico || 'No especificado'}</p>
                                <p><strong>Código postal:</strong> ${formData.cp || 'No especificado'}</p>
                                <p><strong>Nombre:</strong> ${formData.nombre || 'No especificado'}</p>
                                <p><strong>Teléfono:</strong> ${formData.telefono || 'No especificado'}</p>
                                <p><strong>Email:</strong> ${formData.email || 'No especificado'}</p>
                            </div>
                            <button class="btn btn-primary" onclick="window.location.reload()">Volver al inicio</button>
                        </div>
                    `;
                    
                    // Replace form with success message
                    if (formContainer) {
                        formContainer.innerHTML = successHTML;
                    }
                    
                } catch (error) {
                    console.error('Error submitting form:', error);
                    
                    // Show error message
                    const errorMessage = error.message || 'Ocurrió un error al enviar el formulario. Por favor, inténtalo de nuevo más tarde.';
                    showError(errorMessage);
                    
                    // Reset button state
                    submitButton.disabled = false;
                    submitButton.innerHTML = 'Enviar solicitud';
                }
            }
        });
    }
    
    // Save form data at each step
    function saveStepData(step) {
        const currentStepElement = steps[step];
        if (!currentStepElement) return;
        
        // Save radio button values
        const radioInputs = currentStepElement.querySelectorAll('input[type="radio"]:checked');
        radioInputs.forEach(input => {
            formData[input.name] = input.value;
        });
        
        // Save text/email/tel inputs
        const textInputs = currentStepElement.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"]');
        textInputs.forEach(input => {
            formData[input.id] = input.value;
        });
        
        // Save checkbox
        const checkbox = currentStepElement.querySelector('input[type="checkbox"]');
        if (checkbox) {
            formData[checkbox.id] = checkbox.checked;
        }
    }
    
    // Show error message
    function showError(message) {
        if (!formContainer) return;
        
        // Remove any existing error messages
        const existingError = formContainer.querySelector('.form-error');
        if (existingError) {
            existingError.remove();
        }
        
        // Create and show new error message
        const errorElement = document.createElement('div');
        errorElement.className = 'form-error';
        errorElement.style.color = '#ef4444';
        errorElement.style.padding = '1rem';
        errorElement.style.margin = '1rem 0';
        errorElement.style.borderRadius = '8px';
        errorElement.style.backgroundColor = '#fef2f2';
        errorElement.style.border = '1px solid #fecaca';
        errorElement.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <span>${message}</span>
            </div>
        `;
        
        formContainer.insertBefore(errorElement, formContainer.firstChild);
        
        // Auto-hide error after 5 seconds
        setTimeout(() => {
            errorElement.style.opacity = '0';
            errorElement.style.transition = 'opacity 0.5s ease';
            setTimeout(() => errorElement.remove(), 500);
        }, 5000);
    }
}

// Initialize the form when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded');
    initializeForm();
});
