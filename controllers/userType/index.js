const isEmployeeLevel = (userType) => {
  return ["EMPLOYEE", "ADMIN", "MANAGER"].includes(userType);
};

module.exports = {
  isEmployeeLevel
};
