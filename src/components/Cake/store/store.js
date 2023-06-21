import { createStore, applyMiddleware } from "redux";
import { composeWithDevTools } from "@redux-devtools/extension";
import thunk from "redux-thunk";
import cakeReducer from "./reducer";

const store = createStore(
  cakeReducer,
  // to watch in redux-devtools
  composeWithDevTools(applyMiddleware(thunk))
);

export default store;
