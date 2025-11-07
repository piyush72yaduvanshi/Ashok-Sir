import React, { useState } from "react";
import {getAuth, createUserWithEmailAndPassword} from "firebase/auth";
import {app} from "../firebase";

const auth = getAuth(app);
const Signup = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const createUser = async () => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password).then((res) => alert("User created successfully"));
            console.log("User:", userCredential.user);
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
            <button onClick={createUser}>Sign Up</button>
        </div>
    )
};

export default Signup;