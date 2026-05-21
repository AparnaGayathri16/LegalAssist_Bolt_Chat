import { BookOpenCheck } from 'lucide-react';
import { Mail, Lock } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import { useRouter } from 'next/router';
import { useAuthStore } from '../../store/authStore';
import { Scale } from 'lucide-react';

export function SignIn() {
  const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const setUser = useAuthStore((state) => state.setUser);
  
    const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      console.log(formData);  

        try {
          const response = await fetch(
            `http://localhost:8082/token`,
            {
              method: "POST",
              body: formData,
            }
          );

          if (response.ok) {
            const data = await response.json();
            console.log(data);

            localStorage.setItem("authToken", data.access_token);
            localStorage.setItem("isSignedIn", "true");

            // Assuming username and password are part of formData
            const username = formData.get("username") as string;
            const password = formData.get("password") as string;

            localStorage.setItem("username", username);
            localStorage.setItem("password", password);
            setUser({ username, isAuthenticated: true });
            navigate('/client/switch');
          } else {
            console.log(response);
            alert("Invalid credentials");
          }
        } catch (error) {
          console.error("Error during sign-in:", error);
      }
    };
  
  return (
    <div className="min-h-screen bg-gray-50">      
      <div className="flex min-h-screen">
        {/* Left side - Image */}
        <div className="hidden lg:block lg:w-1/2 relative">
          <img
            className="absolute inset-0 h-full w-full object-cover"
            src="/images/signin.jpg"
            alt="Students studying"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-indigo-600 to-indigo-400 mix-blend-multiply opacity-60" />
        </div>

        {/* Right side - Sign in form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-6 lg:px-8">
              <div className="w-full max-w-md space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">Welcome back</h2>
                  <p className="mt-2 text-sm text-gray-600">
                    Please sign in to your account
                  </p>
                </div>
                 
                <form className="mt-8 space-y-6" onSubmit={handleSignIn}>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Username
                      </label>
                      <div className="mt-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"> 
                        </div>
                        <input
                          id="username"
                          name="username"
                          type="username"
                          required
                          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="Enter your username"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        Password
                      </label>
                      <div className="mt-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        </div>
                        <input
                          id="password"
                          name="password"
                          type="password"
                          required
                          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="Enter your password"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                        Remember me
                      </label>
                    </div>

                    <div className="text-sm">
                      <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                        Forgot your password?
                      </a>
                    </div>
                  </div>

                  <div>
                    <button
                      type="submit"
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Sign in
                    </button>
                  </div>
                </form>
              </div>
        </div>
      </div>
    </div>
  );
}

