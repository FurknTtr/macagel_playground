import { createBrowserRouter, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import SignUp from "../pages/SignUp";
import Menu from "../pages/Menu";
import MatchList from "../pages/MatchList";
import Match from "../pages/Match";
import PlayerProfile from "../pages/PlayerProfile";
import CreateMatch from "../pages/CreateMatch";
import Location from "../pages/Location";
import AccountSettings from "../pages/AccountSettings";
import App from "../App";

// İleride farklı sayfalar geldikçe buraya ekleyeceğiz (Örn: Home, Register)
export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />, // Ana kapsayıcı bileşenimiz
    children: [
      {
        path: "/",
        element: <Navigate to="/login" replace />, // "/" adresine girildiğinde direkt "/login" sayfasına yönlendirir.
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/register",
        element: <SignUp />,
      },
      {
        path: "/menu",
        element: <Menu />,
      },
      {
        path: "/discover",
        element: <MatchList />,
      },
      {
        path: "/account-settings",
        element: <AccountSettings />,
      },
      {
        path: "/player/:id",
        element: <PlayerProfile />,
      },
      {
        path: "/create-match",
        element: <CreateMatch />,
      },
      {
        // :id parametresi ile her maçın kendi sayfasına gitmesini sağlıyoruz
        path: "/match/:id",
        element: <Match />,
      },
      {
        path: "/location/:id?",
        element: <Location />,
      }
    ]
  }
]);
