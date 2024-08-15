export function cloneNodeFromTemplate(template) {
  return template.content.cloneNode(true);
}

export function getDataFromForm(form) {
  return Object.values(form).reduce((obj, field) => {
    if (field.name !== '') {
      obj[field.name] = field.value;
    }

    return obj;
  }, {});
}
