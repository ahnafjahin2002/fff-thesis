export const checkStockingSuccess = (stock, required) => {
  return stock >= required;
};

export const calculateReward = (baseReward, shopLevel) => {
  return baseReward * shopLevel;
};
