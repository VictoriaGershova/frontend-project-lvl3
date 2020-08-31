import * as yup from 'yup';

const schema = yup.object().shape({
  rSSLink: yup.string().required()
    .url()
    .when('$feeds', (feeds, schema) => (
      !feeds ? schema : schema.notOneOf(feeds, 'Must be uniq url')))
});

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

  const handleSubmit = () => {
    state.form.processState = 'validation';
    const { feeds } = state;
    schema
      .validate(state.form.fields, { abortEarly: false, context: { feeds } })
      .then(() => {
        state.form.isValid = true;
        state.form.processState = 'processing';
        state.errors = [];
        state.feeds.push(state.form.fields.rSSLink);
      })
      .catch((err) => {
        state.form.isValid = false;
        state.form.processState = 'filling';
        state.errors = err.errors;
      });
  };

  const newRSSLinkForm = document.querySelector('.rss-form');
  const rSSLinkInput = document.getElementById('rSSLink');

  rSSLinkInput.addEventListener('input', (e) => {
    const { target: { value } } = e;
    state.form.fields.rSSLink = value;
  })

  newRSSLinkForm.addEventListener('submit', (e) => {
    e.preventDefault();
    handleSubmit();
  });

};

export default App;