const App = () => {
  const state = {
    form: {
      processState: 'filling',
      isValid: true,
      errors: [],
      fields: {
        rSSLink: '',
      },
    },
    feeds: [],
    posts: [],
  };

  const newRSSLinkForm = document.querySelector('.rssLink');
  const rSSLinkInput = document.getElementById('rSSLink');

  rSSLinkInput.addEventListener('input', (e) => {
    const { target: { value } } = e;
    state.form.fields.rSSLink = value;
  })

};

export default App;