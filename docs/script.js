function handleSignup(event) {
  event.preventDefault();

  const formData = {
    firstName: document.getElementById('firstName').value,
    lastName: document.getElementById('lastName').value,
    email: document.getElementById('email').value,
    operation: document.getElementById('operation').value,
    properties: document.getElementById('properties').value,
    contractors: document.getElementById('contractors').value,
    timestamp: new Date().toISOString()
  };

  // Hide form, show success message inline
  const form = document.getElementById('signupForm');
  const success = document.getElementById('signupSuccess');
  const subtext = document.getElementById('ctaSubtext');
  const emailLine = document.getElementById('successEmail');

  if (form) form.style.display = 'none';
  if (subtext) subtext.style.display = 'none';
  if (emailLine) emailLine.textContent = "We'll contact " + formData.email + " within 24 hours to schedule your free pilot.";
  if (success) success.style.display = 'block';

  // Log for debugging during development
  console.log('Early Access Signup:', formData);
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
  anchor.addEventListener('click', function(e) {
    var href = this.getAttribute('href');
    if (href === '#') return;
    e.preventDefault();
    var target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});
