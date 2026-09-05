// import { useState } from "react";
// import { Link } from "react-router-dom";
// import { toast } from "react-toastify";
// import { useAuth } from "../context/AuthContext.jsx";
// import AuthLayout from "../components/AuthLayout.jsx";

// const inputClass =
//   "w-full px-3 py-2.5 rounded-md border border-border text-sm bg-surface text-ink " +
//   "placeholder:text-muted/70 outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors";

// const labelClass = "block text-sm font-semibold mb-1.5 text-ink";

// export default function Login() {
//   const { login } = useAuth();
//   const [form, setForm] = useState({ email: "", password: "" });
//   const [submitting, setSubmitting] = useState(false);

//   const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!form.email || !form.password) {
//       toast.error("Enter your email and password");
//       return;
//     }
//     setSubmitting(true);
//     try {
//       await login(form);
//     } catch (err) {
//       toast.error(err.response?.data?.message || "Couldn't log you in, try again");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <AuthLayout>
//       <h2 className="text-[22px] font-bold mb-1">Log in</h2>
//       <p className="text-sm text-muted mb-7">Welcome back — enter your details to continue.</p>

//       <form onSubmit={handleSubmit} className="flex flex-col gap-4">
//         <div>
//           <label className={labelClass} htmlFor="email">Email</label>
//           <input
//             id="email"
//             name="email"
//             type="email"
//             autoComplete="email"
//             placeholder="you@example.com"
//             value={form.email}
//             onChange={handleChange}
//             className={inputClass}
//           />
//         </div>

//         <div>
//           <label className={labelClass} htmlFor="password">Password</label>
//           <input
//             id="password"
//             name="password"
//             type="password"
//             autoComplete="current-password"
//             placeholder="••••••••"
//             value={form.password}
//             onChange={handleChange}
//             className={inputClass}
//           />
//         </div>

//         <button
//           type="submit"
//           disabled={submitting}
//           className="mt-1.5 py-3 px-3.5 rounded-md border-none bg-primary text-white font-semibold text-sm
//                      disabled:opacity-70 disabled:cursor-default cursor-pointer hover:bg-primary-dark transition-colors"
//         >
//           {submitting ? "Logging in..." : "Log in"}
//         </button>
//       </form>

//       <p className="text-sm text-muted mt-6">
//         Don't have an account?{" "}
//         <Link to="/register" className="text-primary font-semibold no-underline hover:underline">
//           Create one
//         </Link>
//       </p>
//     </AuthLayout>
//   );
// }


import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { Eye, EyeOff, ArrowRight } from "lucide-react";

import { useAuth } from "../context/AuthContext.jsx";
import AuthLayout from "../components/AuthLayout.jsx";


const inputClass =
  "w-full h-12 px-4 rounded-lg " +
  "border border-[#DDD9D0] " +
  "bg-white text-[#172033] text-sm " +
  "placeholder:text-slate-400 " +
  "outline-none " +
  "focus:border-[#D9A943] " +
  "focus:ring-4 focus:ring-[#D9A943]/10 " +
  "transition-all duration-200";


export default function Login() {

  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [submitting, setSubmitting] = useState(false);

  const [showPassword, setShowPassword] = useState(false);


  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };


  const handleSubmit = async (e) => {

    e.preventDefault();

    if (!form.email || !form.password) {
      toast.error("Enter your email and password");
      return;
    }

    setSubmitting(true);

    try {

      await login(form);

    } catch (err) {

      toast.error(
        err.response?.data?.message ||
        "Couldn't log you in, try again"
      );

    } finally {

      setSubmitting(false);

    }
  };


  return (
    <AuthLayout>

      <div>

        {/* Small brand mark */}
        <div className="w-11 h-11 rounded-xl bg-[#D9A943] flex items-center justify-center mb-7 shadow-md shadow-[#D9A943]/20">

          <span className="text-white font-bold text-lg">
            S
          </span>

        </div>


        {/* Heading */}
        <div className="mb-8">

          <h1 className="text-[32px] leading-tight font-bold tracking-tight text-[#172033]">
            Welcome back
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Sign in to continue your career journey.
          </p>

        </div>


        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          {/* Email */}
          <div>

            <label
              htmlFor="email"
              className="block text-sm font-semibold text-[#172033] mb-2"
            >
              Email address
            </label>

            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              className={inputClass}
            />

          </div>


          {/* Password */}
          <div>

            <div className="flex items-center justify-between mb-2">

              <label
                htmlFor="password"
                className="text-sm font-semibold text-[#172033]"
              >
                Password
              </label>

              <button
                type="button"
                className="
                  text-xs
                  font-semibold
                  text-[#B38727]
                  hover:text-[#8F6A1E]
                  bg-transparent
                  border-0
                  p-0
                  cursor-pointer
                "
              >
                Forgot password?
              </button>

            </div>


            {/* Password input */}
            <div className="relative">

              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                className={`${inputClass} pr-12`}
              />


              {/* Show password */}
              <button
                type="button"
                onClick={() =>
                  setShowPassword((prev) => !prev)
                }
                className="
                  absolute
                  right-3
                  top-1/2
                  -translate-y-1/2
                  p-2
                  text-slate-400
                  hover:text-[#172033]
                  bg-transparent
                  border-0
                  cursor-pointer
                  transition-colors
                "
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >

                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}

              </button>

            </div>

          </div>


          {/* Login button */}
          <button
            type="submit"
            disabled={submitting}
            className="
              w-full
              h-12
              mt-2
              rounded-lg
              bg-[#D9A943]
              text-[#172033]
              font-bold
              text-sm
              border-0
              flex
              items-center
              justify-center
              gap-2
              cursor-pointer
              shadow-sm
              hover:bg-[#E2B552]
              hover:shadow-md
              active:scale-[0.99]
              focus:outline-none
              focus:ring-4
              focus:ring-[#D9A943]/20
              disabled:opacity-60
              disabled:cursor-not-allowed
              transition-all
              duration-200
            "
          >

            {submitting ? (
              <>
                <span className="w-4 h-4 border-2 border-[#172033]/30 border-t-[#172033] rounded-full animate-spin" />
                Logging in...
              </>
            ) : (
              <>
                Log in
                <ArrowRight size={17} />
              </>
            )}

          </button>

        </form>


        {/* Register */}
        <div className="mt-8 pt-6 border-t border-[#E5E0D7]">

          <p className="text-sm text-center text-slate-500">

            Don't have an account?{" "}

            <Link
              to="/register"
              className="
                font-semibold
                text-[#B38727]
                hover:text-[#8F6A1E]
                hover:underline
                transition-colors
              "
            >
              Create one
            </Link>

          </p>

        </div>


        {/* Security text */}
        <p className="text-center text-xs text-slate-400 mt-5">
          Your career journey starts with SkillBridge AI.
        </p>

      </div>

    </AuthLayout>
  );
}