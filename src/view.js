const addErrorMessage = (message, container) => {
  container.classList.add('text-danger');
  container.textContent = message;
};

const removeErrorMessage = (container) => {
  container.classList.remove('text-danger');
  container.textContent = '';
};

const renderFeeds = ({ channels, posts }, container) => {
  container.textContent = '';
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

const render = (state, elements) => {
  const {
    newChannelForm,
    newLinkInput,
    submitBtn,
    feedbackContainer,
    feedsContainer,
  } = elements;
  const { appState } = state;
  switch (appState) {
    case 'filling':
      newLinkInput.removeAttribute('readonly');
      submitBtn.removeAttribute('disabled');
      break;

    case 'processing':
      newLinkInput.setAttribute('readonly', true);
      submitBtn.setAttribute('disabled', "");
      newLinkInput.classList.remove('is-invalid');
      removeErrorMessage(feedbackContainer);
      break;
    
    case 'processed':
      const { feeds } = state;
      newChannelForm.reset();
      newLinkInput.removeAttribute('readonly');
      submitBtn.removeAttribute('disabled');
      renderFeeds(feeds, feedsContainer);
      break;

    case 'failed':
      const { errorMessage } = state;
      newLinkInput.classList.add('is-invalid');
      newLinkInput.removeAttribute('readonly');
      submitBtn.removeAttribute('disabled');
      addErrorMessage(errorMessage, feedbackContainer);
      break;
    
    default:
      throw new Error(`Unknown app state: "${appState}"`);
  };
};

export default render;
