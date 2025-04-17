import { createBrowserRouter, RouterProvider } from "react-router-dom";
import React from "react";
import ReactDOM from "react-dom/client";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import CartPage from "./pages/CartPage";
import ProfilePage from "./pages/ProfilePage";
import AdminPage from "./pages/AdminPage";
import DashboardAdmin from "./pages/outlets/DashboardAdmin";
import ViewProductAdmin from "./pages/outlets/ViewProductAdmin";
import ViewTransactionAdmin from "./pages/outlets/ViewTransactionAdmin";
import ViewUserAdmin from "./pages/outlets/ViewUserAdmin";
import DetailTransactionAdmin from './pages/DetailTransactionAdmin'
import Settings from "./pages/outlets/Settings";
import CheckTransactionPage from "./pages/CheckTransactionPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <LoginPage/>
  },
  {
    path: "/home",
    element: <HomePage/>
  },
  {
    path: "/admin",
    element: <AdminPage/>,
    children: [
      {
        path: "",
        element: <DashboardAdmin/>
      },
      {
        path: "dashboard",
        element: <DashboardAdmin/>
      },
      {
        path: "products",
        element: <ViewProductAdmin/>
      },
      {
        path: "transactions",
        element: <ViewTransactionAdmin/>,
      },
      {
        path: 'transactions/:id',
        element: <DetailTransactionAdmin/>
      },
      {
        path: "users",
        element: <ViewUserAdmin/>
      },
      // {
      //   path: "reports",
      //   element: <ViewReportAdmin/>
      // },
      {
        path: "settings",
        element: <Settings/>
      }
    ]
  },
  {
    path: "/cart",
    element: <CartPage/>
  },
  {
    path: "/profile",
    element: <ProfilePage/>
  },
  {
    path: "/transaction",
    element: <CheckTransactionPage/>
  }
])

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
