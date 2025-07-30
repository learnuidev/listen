const { polarApi } = require("./polar-api");

const getCheckout = ({ id }) => {
  return polarApi.checkouts.get({ id });
};

module.exports = {
  getCheckout,
};

// getCheckout({ id: "b7cc221b-69a2-438f-8617-24ea3f292f0a" }).then((order) => {
//   console.log("ORDER", order);
// });
