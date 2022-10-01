function isEmpty(obj) {
  if (!obj) {
    return true;
  } else return Object.keys(obj).length === 0;
}

module.exports = isEmpty;
