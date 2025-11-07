import { app } from "../firebase";
import React, {useState} from "react";
import {getAuth, signInWithEmailAndPassword} from "firebase/auth";

const auth = getAuth(app);

const SignIn = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const signInUser = async () => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password).then((res) => alert("User signed in successfully"));
        } catch (error) {
            console.error("Error:", error);
        }
    };
    return (
        <div>
            <label htmlFor="">Email</label>
            <input onChange={(e) => setEmail(e.target.value)} value={email} type="email" required placeholder="Enter Your Email here"/>
            <label htmlFor="">Password</label>
            <input onChange={(e) => setPassword(e.target.value)} value={password} type="password" required placeholder="Enter Your Password here" />
            <button onClick={signInUser}>Sign In</button>
        </div>
    )
};

export default SignIn;