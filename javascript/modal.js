document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('emailModal');
    const closeBtn = document.querySelector('.close');
    const emailMeBtn = document.querySelector('#contact .cta-btn');
  
    emailMeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        modal.style.display = 'flex'; // Changed to 'flex' to match the display style of modal
    });
  
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
  
    window.addEventListener('click', (e) => {
        if (e.target == modal) {
            modal.style.display = 'none';
        }
    });
  });
  