export function cloneNodeFromTemplate(template) {
  return template.content.cloneNode(true);
}

export function getDataFromForm(form) {
  return Object.values(form).reduce((obj, field) => {
    if (field.name !== '') {
      obj[field.name] = field.value.trim();
    }

    return obj;
  }, {});
}

export function formatDate(date) {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();

  return `${day}.${month}.${year}`;
}
