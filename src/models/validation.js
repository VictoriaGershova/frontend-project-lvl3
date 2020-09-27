import * as yup from 'yup';

yup.setLocale({
  mixed: {
    required: 'invalidLink',
    url: 'invalidLink',
    notOneOf: 'existedLink',
  },
});

const baseSchema = yup.string().required().url();

const validate = (link, channels) => {
  const existedLinks = channels.map(({ link }) => link);
  return baseSchema.notOneOf(existedLinks).validate(link, { abortEarly: false });
};

export default validate;
