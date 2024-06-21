// experience.js

document.addEventListener('DOMContentLoaded', function () {
  const experienceItems = document.querySelectorAll('.experience-item');
  const experienceDetails = document.querySelectorAll('.experience-detail');

  experienceItems.forEach(item => {
      item.addEventListener('click', () => {
          const index = item.getAttribute('data-experience');
          
          experienceItems.forEach(i => i.classList.remove('active'));
          experienceDetails.forEach(detail => detail.classList.remove('active'));

          item.classList.add('active');
          document.getElementById(`experience-${index}`).classList.add('active');
      });
  });
});
