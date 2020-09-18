import _ from 'lodash';

export default () => {
  const repository = {
    data: [],
  };

  const all = () => [...repository.data];

  const find = (id) => {
    const result = repository.data.find((entity) => entity.id === id);
    return !result ? null : result;
  };

  const findBy = (params) => {
    const result = _.find(repository.data, params);
    return !result ? null : result;
  };

  const findAllBy = (params) => {
    const result = _.filter(repository.data, params);
    return result;
  };

  const save = (entity) => {
    const foundEntity = findBy(entity);
    if (foundEntity) {
      repository.data = repository.data.filter((e) => e.id !== foundEntity.id);
    }
    repository.data.push(entity);
  };

  const saveAll = (...entities) => entities.forEach((entity) => save(entity));

  return {
    all,
    find,
    findBy,
    findAllBy,
    save,
    saveAll,
  };
};
