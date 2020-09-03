const addErrorMessage = (message, container) => {
  container.classList.add('text-danger');
  container.textContent = message;
};

const removeErrorMessage = (container) => {
  container.classList.remove('text-danger');
  container.textContent = '';
};

const renderChannels = ({ channels, posts }, container) => {
  channels.forEach((channel) => {
    const { id, title } = channel;
    const titleElement = document.createElement('H2');
    titleElement.textContent = title;
    container.append(titleElement);

    const channelPosts = posts.filter(({ channelId }) => channelId === id);
    channelPosts.forEach((post) => {
      const { link, title } = post;
      const div = document.createElement('DIV');
      const linkElement = document.createElement('A');
      linkElement.setAttribute('href', link);
      linkElement.setAttribute('target', '_blank')
      linkElement.textContent = title;
      div.append(linkElement);
      container.append(div);
    });
  });
};

const renderForm = ({ disabled }, elements) => {
  const {
    newLinkInput,
    submitBtn,
  } = elements;
  if (disabled) {
    newLinkInput.setAttribute('readonly', true);
    submitBtn.setAttribute('disabled', "");
    return;
  }
  newLinkInput.removeAttribute('readonly');
  submitBtn.removeAttribute('disabled');
};

const render = (state, elements) => {
  const {
    newChannelForm,
    feedbackContainer,
    feedsContainer,
  } = elements;

  const renderDisabledForm = () => renderForm({ disabled: true }, elements);

  const renderEnabledForm = () => renderForm({ disabled: false }, elements);

  const { appState } = state;
  switch (appState) {
    case 'filling':
      renderEnabledForm();
      break;

    case 'processing':
      renderDisabledForm();
      break;
    
    case 'processed':
      newChannelForm.reset();
      renderEnabledForm();
      const { feeds } = state;
      renderChannels(feeds, feedsContainer);
      removeErrorMessage(feedbackContainer);
      break;

    case 'failed':
      const { errorMessage } = state;
      renderEnabledForm();
      addErrorMessage(errorMessage, feedbackContainer);
      break;
    
    default:
      throw new Error(`Unknown app state: "${appState}"`);
  };
};

export default render;
