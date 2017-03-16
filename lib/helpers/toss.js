'use strict';

module.exports = (e) => {
  if (e) {
    let error = new Error(e || 'Uh Oh');
    throw error
  }
}
