import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { app } from "./firebase";
import "./App.css";
import Signup from "./pages/signup";
import SignIn from "./pages/signIn";

const auth = getAuth(app);

function App() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        const uid = user.uid;
        console.log("User signed in:", uid);
        setUser(user);
      } else {
        setUser(null);
        console.log("User signed out");
      }
    });
  }, []);
  if (user === null) {
    return (
      <div>
        <h1 className="Justify-content-center">Firebase try</h1>
        <Signup />
        <SignIn />
      </div>
    );
  } else {
    return (
      <div>
        <h1 className="Justify-content-center">Welcome {user.email}</h1>
        <button onClick={() => signOut(auth)}>Sign Out</button>

      </div>
    );
  }
}

export default App;
