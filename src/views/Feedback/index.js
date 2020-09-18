export default () => {
  const container = document.querySelector('.feedback');
  const setMessage = (type = null, message = '') => {
    container.classList.toggle('text-danger', type === 'fail');
    container.classList.toggle('text-success', type === 'success');
    container.textContent = message;
  };
  return {
    fail: (message) => setMessage('fail', message),
    success: (message) => setMessage('success', message),
    clean: () => setMessage(),
  };
};
