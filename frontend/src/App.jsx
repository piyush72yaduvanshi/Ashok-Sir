// import React, { useEffect, useState } from "react";
// import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
// import { app } from "./firebase";
// import "./App.css";
// import Signup from "./pages/signup";
// import SignIn from "./pages/signIn";

// const auth = getAuth(app);

// function App() {
//   const [user, setUser] = useState(null);
//   useEffect(() => {
//     onAuthStateChanged(auth, (user) => {
//       if (user) {
//         const uid = user.uid;
//         console.log("User signed in:", uid);
//         setUser(user);
//       } else {
//         setUser(null);
//         console.log("User signed out");
//       }
//     });
//   }, []);
//   if (user === null) {
//     return (
//       <div>
//         <h1 className="Justify-content-center">Firebase try</h1>
//         <Signup />
//         <SignIn />
//       </div>
//     );
//   } else {
//     return (
//       <div>
//         <h1 className="Justify-content-center">Welcome {user.email}</h1>
//         <button onClick={() => signOut(auth)}>Sign Out</button>

//       </div>
//     );
//   }
// }

// export default App;

import React from "react";
import "./App.css";
import { app } from "./firebase";
import {getFirestore, collection,addDoc, getDoc, doc} from "firebase/firestore"


const firestore = getFirestore(app);

function App() {
  const writeData = async () => {
    try {
      const docRef = await addDoc(collection(firestore, "users/2geiKEz99E9OoyRcTNub/place"), {
        first: "Adasdsd",
        last: "Lovelacesd",
        born: 18152,
      });
      console.log("Document written with ID: ", docRef);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }

  const readData = async () => {
    const ref = doc(firestore, "users", "IwbKBr3QMmmFslfmG4A6");
    const docSnap = await getDoc(ref);
    console.log(docSnap.data());
  }
  return (
    <div className="App">
      <h1>hello</h1>
      <button onClick={writeData}>write data</button>
      <button onClick={readData}>read data</button>
    </div>
  );
}

export default App;
