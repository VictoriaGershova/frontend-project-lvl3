import * as yup from 'yup';

yup.setLocale({
  mixed: {
    required: 'invalidLink',
    url: 'invalidLink',
    notOneOf: 'existedLink',
  },
});

const channelSchema = yup.object().shape({
  link: yup.string().required().url()
    .when('$channels', (channels, schema) => {
      if (channels.length === 0) {
        return schema;
      }
      const existedLinks = channels.map(({ link }) => link);
      return schema.notOneOf(existedLinks);
    }),
});

const validate = ({ link }, channels) => channelSchema
  .validate({ link }, { abortEarly: false, context: { channels } });

export default validate;
