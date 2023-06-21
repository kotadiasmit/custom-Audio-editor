const initialState = {
  noOfCakes: 25,
};

const cakeReducer = (state = initialState, { type }) => {
  switch (type) {
    case "buy-cake":
      return {
        ...state,
        noOfCakes: state.noOfCakes - 1,
      };

    case "make-cake":
      return {
        ...state,
        noOfCakes: state.noOfCakes + 1,
      };
    default:
      return state;
  }
};

export default cakeReducer;
