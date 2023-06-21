import { useSelector, useDispatch } from "react-redux";
import { buyOrMakeCake } from "./store/action";

const Cake = () => {
  const remainingNoOfCakes = useSelector((state) => state.noOfCakes);
  const dispatch = useDispatch();
  return (
    <>
      <p>Cake Count - {remainingNoOfCakes}</p>
      <button
        onClick={() => dispatch(buyOrMakeCake("buy-cake"))}
        style={{ margin: 10 }}
      >
        buy cake
      </button>
      <button
        style={{ margin: 10 }}
        onClick={() => dispatch(buyOrMakeCake("make-cake"))}
      >
        Make Cake
      </button>
    </>
  );
};
export default Cake;
