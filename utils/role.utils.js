exports.hasRole = function (user = {}, role) {
  let hasRole = false;
  (user.role || []).forEach((thisRole) => {
    if (thisRole.name == role) {
      hasRole = true;
    }
  })

  return hasRole;
}