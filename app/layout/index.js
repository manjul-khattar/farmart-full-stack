import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import AdminLayout from "../../admin/layout";
import { removeUser, updateUser } from "../redux/slices/authSlice";
import { selectItems, updateBasket } from "../redux/slices/basketSlice";
import { auth, db } from "../utils/firebase";
import { getPage } from "../utils/helpers";
import Footer from "./Footer";
import Header from "./Header";

const Layout = ({ children }) => {
  const dispatch = useDispatch();
  const cartItems = useSelector(selectItems);
  const [page, setPage] = React.useState(null);

  useEffect(() => {
    // firebase user listeners
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        db.collection("users")
          .doc(user.uid)
          .get()
          .then((doc) => {
            if (doc.exists) {
              dispatch(updateUser(doc.data()));
            }
          });
      } else {
        dispatch(removeUser());
      }
    });

    // get cart items from local storage
    const local_items = localStorage.getItem("@CART_ITEMS")
      ? JSON.parse(localStorage.getItem("@CART_ITEMS"))
      : [];

    dispatch(updateBasket(local_items));

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!cartItems.length) return;
    // save cart items to local storage
    const items = JSON.stringify(cartItems || []);
    localStorage.setItem("@CART_ITEMS", items);
  }, [cartItems]);

  useEffect(() => {
    setPage(getPage());
  }, []);

  if (page === null) return null;

  return (
    <>
      {page === "admin" ? (
        <AdminLayout>{children}</AdminLayout>
      ) : (
        <>
          <Header />
          <main>{children}</main>
          <Footer />
        </>
      )}
    </>
  );
};

export default Layout;
