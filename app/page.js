'use client';

import React, { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { syncUser, sendMagicLink } from "./actions";

const App = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);


    const login = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });
                const googleUser = await res.json();
                const result = await syncUser(googleUser);

                if (result.success) {
                    window.location.href='/dashboard';
                }
            } catch (error) {
                console.error("Login failed:", error);
            }
        },
        onError: () => console.log('Login Failed'),
    });


    const handleEmailLogin = async () => {
        if (!email) return alert("Please enter your email");

        setLoading(true);
        const result = await sendMagicLink(email);
        setLoading(false);

        if (result.success) {
            alert(`Check your inbox! A magic link has been sent to ${email}`);
        } else {
            alert("Something went wrong. Make sure your RESEND_API_KEY is correct.");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#FFFFFF] text-[#37352F]">
            <div className="w-full max-w-[400px] p-10">
                <h1 className="text-3xl font-bold text-center mb-2">Log in</h1>
                <p className="text-center text-gray-500 mb-8 text-sm">
                    Welcome to your workspace.
                </p>

                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase ml-1">Email</label>
                        <input
                            type="email"
                            placeholder="Enter your email address..."
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                        />
                    </div>

                    <button
                        onClick={handleEmailLogin}
                        disabled={loading}
                        className="w-full bg-[#2383E2] hover:bg-[#0070D2] text-white font-medium py-2 rounded-md transition-colors shadow-sm disabled:bg-gray-400"
                    >
                        {loading ? "Sending..." : "Continue with Email"}
                    </button>
                </div>

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-200"></span>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-gray-400 font-semibold">OR</span>
                    </div>
                </div>

                <button
                    className="flex items-center justify-center w-full gap-3 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200 mb-4 font-medium"
                    onClick={() => login()}
                >
                    <img
                        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                        alt="Google"
                        className="w-5 h-5"
                    />
                    Continue with Google
                </button>

                <p className="mt-8 text-xs text-gray-400 text-center leading-relaxed">
                    By clicking continue, you agree to our <span className="underline cursor-pointer">Terms of Service</span> and <span className="underline cursor-pointer">Privacy Policy</span>.
                </p>
            </div>
        </div>
    );
};

export default App;
