const formHandler = {
  init() {
    this.form = document.querySelector('.contact-form');
    if (!this.form) return;

    this.steps = Array.from(document.querySelectorAll('.form-step'));
    this.currentStep = 0;
    this.progressSteps = document.querySelectorAll('.progress-step');
    
    this.setupEventListeners();
  },

  setupEventListeners() {
    // Next button
    const nextButtons = document.querySelectorAll('.form-next-btn');
    nextButtons.forEach(button => {
      button.addEventListener('click', (e) => this.handleNext(e));
    });

    // Previous button
    const prevButtons = document.querySelectorAll('.form-prev-btn');
    prevButtons.forEach(button => {
      button.addEventListener('click', () => this.handlePrevious());
    });

    // Form submission
    if (this.form) {
      this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }
  },

  handleNext(e) {
    e.preventDefault();
    const currentStep = this.steps[this.currentStep];
    const inputs = currentStep.querySelectorAll('input[required]');
    let isValid = true;

    // Validate current step
    inputs.forEach(input => {
      if (!input.checkValidity()) {
        input.reportValidity();
        isValid = false;
      }
    });

    if (!isValid) return;

    // Move to next step
    this.currentStep++;
    this.updateForm();
  },

  handlePrevious() {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.updateForm();
    }
  },

  updateForm() {
    // Hide all steps
    this.steps.forEach(step => {
      step.classList.remove('active');
    });

    // Show current step
    this.steps[this.currentStep].classList.add('active');

    // Update progress
    this.updateProgress();
  },

  updateProgress() {
    this.progressSteps.forEach((step, index) => {
      if (index < this.currentStep + 1) {
        step.classList.add('active');
      } else {
        step.classList.remove('active');
      }
    });
  },

  async handleSubmit(e) {
    e.preventDefault();
    
    // Here you would typically send the form data to a server
    const formData = new FormData(this.form);
    const data = Object.fromEntries(formData);
    
    console.log('Form submitted:', data);
    
    // Show success message or redirect
    alert('¡Gracias por tu solicitud! Nos pondremos en contacto contigo pronto.');
    this.form.reset();
    
    // Reset form to first step
    this.currentStep = 0;
    this.updateForm();
  }
};

export default formHandler;
