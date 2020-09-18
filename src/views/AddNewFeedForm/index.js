import i18n from 'i18next';

export default (state, onLinkInput, onSubmit) => {
  const {
    processState,
    validState,
  } = state;

  const
    form = document.querySelector('.rss-form'),
    linkInput = document.getElementById('link'),
    submitBtn = document.getElementById('submit'),
    linkExample = document.getElementById('example');

  const toggleActivity = (mes) => {
    const IsNotActive = mes !== 'activate';
    submitBtn.toggleAttribute('disabled', IsNotActive);
    linkInput.toggleAttribute('readonly', IsNotActive);
  };

  const toggleValidity = (mes) => {
    const isInvalid = mes !== 'valid';
    linkInput.classList.toggle('is-invalid', isInvalid);
  };

  const activate = () => toggleActivity('activate');
  const deactivate = () => toggleActivity('deactivate');
  const makeValid = () => toggleValidity('valid');
  const makeInvalid = () => toggleValidity('invalid');

  switch (processState) {
    case 'initialization':
      form.addEventListener('submit', onSubmit);
      linkInput.addEventListener('input', onLinkInput);
      linkInput.setAttribute('placeholder', i18n.t('link.placeholder'));
      linkExample.textContent = i18n.t('link.example');

    case 'filling':
      activate();
      break;

    case 'validation':
      deactivate();
      break;

    case 'processing':
      makeValid();
      break;

    case 'processed':
      form.reset();
      activate();
      break;

    case 'failed':
      if (validState === 'invalid') {
        makeInvalid();
      }
      activate();
      break;
    
    default:
      throw new Error(`Unknown NewFeedForm state: "${processState}"`);
  }
};
