// import { useState } from "react";
// import { Link } from "react-router-dom";
// import { toast } from "react-toastify";
// import { useAuth } from "../context/AuthContext.jsx";
// import AuthLayout from "../components/AuthLayout.jsx";


// const inputClass =
//   "w-full px-3 py-2.5 rounded-md border border-border text-sm bg-surface text-ink " +
//   "placeholder:text-muted/70 outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors";

// const labelClass = "block text-sm font-semibold mb-1.5 text-ink";

// export default function Register() {
//   const { register } = useAuth();
//   const [form, setForm] = useState({
//     role: "student",
//     name: "",
//     email: "",
//     password: "",
//     headline: "",
//     company: "",
//   });
//   const [submitting, setSubmitting] = useState(false);

//   const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!form.name || !form.email || !form.password) {
//       toast.error("Fill in name, email and password");
//       return;
//     }
//     if (form.password.length < 6) {
//       toast.error("Password must be at least 6 characters");
//       return;
//     }
//     setSubmitting(true);
//     try {
//       await register(form);
//     } catch (err) {
//       toast.error(err.response?.data?.message || "Couldn't create the account, try again");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const isStudent = form.role === "student";

//   return (
//     <AuthLayout>
//       <h2 className="text-[22px] font-bold mb-1">Create your account</h2>
//       <p className="text-sm text-muted mb-5">Tell us who you are and let's get you set up.</p>

//       {/* Role toggle */}
//       <div className="flex gap-2 mb-5 p-1 bg-primary-soft rounded-md">
//         {[
//           { key: "student", label: "Student" },
//           { key: "recruiter", label: "Recruiter" },
//         ].map((opt) => {
//           const active = form.role === opt.key;
//           const accentClass = opt.key === "student" ? "text-student" : "text-recruiter";
//           return (
//             <button
//               key={opt.key}
//               type="button"
//               onClick={() => setForm({ ...form, role: opt.key })}
//               className={`flex-1 py-2.5 rounded-md border-none text-sm font-semibold cursor-pointer transition-colors
//                 ${active ? `bg-surface shadow-card ${accentClass}` : "bg-transparent text-muted"}`}
//             >
//               {opt.label}
//             </button>
//           );
//         })}
//       </div>

//       <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
//         <div>
//           <label className={labelClass} htmlFor="name">Full name</label>
//           <input
//             id="name"
//             name="name"
//             type="text"
//             placeholder="Jordan Ahmed"
//             value={form.name}
//             onChange={handleChange}
//             className={inputClass}
//           />
//         </div>

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
//             autoComplete="new-password"
//             placeholder="At least 6 characters"
//             value={form.password}
//             onChange={handleChange}
//             className={inputClass}
//           />
//         </div>

//         {isStudent ? (
//           <div>
//             <label className={labelClass} htmlFor="headline">Headline (optional)</label>
//             <input
//               id="headline"
//               name="headline"
//               type="text"
//               placeholder="e.g. Final-year CS student"
//               value={form.headline}
//               onChange={handleChange}
//               className={inputClass}
//             />
//           </div>
//         ) : (
//           <div>
//             <label className={labelClass} htmlFor="company">Company (optional)</label>
//             <input
//               id="company"
//               name="company"
//               type="text"
//               placeholder="e.g. Acme Inc."
//               value={form.company}
//               onChange={handleChange}
//               className={inputClass}
//             />
//           </div>
//         )}

//         <button
//           type="submit"
//           disabled={submitting}
//           className={`mt-1.5 py-3 px-3.5 rounded-md border-none text-white font-semibold text-sm
//                       disabled:opacity-70 disabled:cursor-default cursor-pointer transition-colors
//                       ${isStudent ? "bg-student hover:bg-student/90" : "bg-recruiter hover:bg-recruiter/90"}`}
//         >
//           {submitting ? "Creating account..." : `Create ${isStudent ? "student" : "recruiter"} account`}
//         </button>
//       </form>

//       <p className="text-sm text-muted mt-6">
//         Already have an account?{" "}
//         <Link to="/login" className="text-primary font-semibold no-underline hover:underline">
//           Log in
//         </Link>
//       </p>
//     </AuthLayout>
//   );
// }


import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Eye,
  EyeOff,
  GraduationCap,
  Briefcase,
  ArrowRight,
} from "lucide-react";

import { useAuth } from "../context/AuthContext.jsx";
import AuthLayout from "../components/AuthLayout.jsx";


// --------------------------------------------------
// Input styling
// --------------------------------------------------

const inputClass =
  "w-full h-12 px-4 rounded-lg " +
  "border border-[#DDD9D0] " +
  "bg-white text-[#172033] text-sm " +
  "placeholder:text-slate-400 " +
  "outline-none " +
  "focus:border-[#D9A943] " +
  "focus:ring-4 focus:ring-[#D9A943]/10 " +
  "transition-all duration-200";

const labelClass =
  "block text-sm font-semibold text-[#172033] mb-2";


export default function Register() {

  const { register } = useAuth();

  const [form, setForm] = useState({
    role: "student",
    name: "",
    email: "",
    password: "",
    headline: "",
    company: "",
  });

  const [submitting, setSubmitting] = useState(false);

  const [showPassword, setShowPassword] = useState(false);


  // --------------------------------------------------
  // Handle input changes
  // --------------------------------------------------

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  // --------------------------------------------------
  // Handle role change
  // --------------------------------------------------

  const handleRoleChange = (role) => {
    setForm((prev) => ({
      ...prev,
      role,
    }));
  };


  // --------------------------------------------------
  // Submit
  // --------------------------------------------------

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (!form.name || !form.email || !form.password) {
      toast.error("Fill in name, email and password");
      return;
    }

    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setSubmitting(true);

    try {

      await register(form);

    } catch (err) {

      toast.error(
        err.response?.data?.message ||
        "Couldn't create the account, try again"
      );

    } finally {

      setSubmitting(false);

    }
  };


  const isStudent = form.role === "student";


  return (
    <AuthLayout>

      <div className="w-full">

        {/* ------------------------------------------- */}
        {/* Brand */}
        {/* ------------------------------------------- */}

        <div
          className="
            w-11 h-11
            rounded-xl
            bg-[#D9A943]
            flex
            items-center
            justify-center
            mb-6
            shadow-md
            shadow-[#D9A943]/20
          "
        >
          <span className="text-white font-bold text-lg">
            S
          </span>
        </div>


        {/* ------------------------------------------- */}
        {/* Heading */}
        {/* ------------------------------------------- */}

        <div className="mb-7">

          <h1 className="text-[32px] leading-tight font-bold tracking-tight text-[#172033]">
            Create your account
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Join SkillBridge and take your next career step.
          </p>

        </div>


        {/* ------------------------------------------- */}
        {/* Role */}
        {/* ------------------------------------------- */}

        <div className="mb-7">

          <label className={labelClass}>
            I am a
          </label>


          <div className="grid grid-cols-2 gap-3">

            {/* Student */}

            <button
              type="button"
              onClick={() => handleRoleChange("student")}
              className={`
                relative
                h-[76px]
                rounded-xl
                border
                flex
                items-center
                gap-3
                px-4
                text-left
                cursor-pointer
                transition-all
                duration-200
                ${
                  isStudent
                    ? "border-[#D9A943] bg-[#FFF9EA] shadow-sm"
                    : "border-[#DDD9D0] bg-white hover:border-[#C9C3B8]"
                }
              `}
            >

              <div
                className={`
                  w-10
                  h-10
                  rounded-lg
                  flex
                  items-center
                  justify-center
                  shrink-0
                  ${
                    isStudent
                      ? "bg-[#D9A943] text-white"
                      : "bg-[#F3F1EC] text-slate-500"
                  }
                `}
              >
                <GraduationCap size={20} />
              </div>


              <div>

                <p className="text-sm font-semibold text-[#172033]">
                  Student
                </p>

                <p className="text-[11px] text-slate-500 mt-0.5">
                  Build your career
                </p>

              </div>


              {isStudent && (
                <span
                  className="
                    absolute
                    top-3
                    right-3
                    w-2
                    h-2
                    rounded-full
                    bg-[#D9A943]
                  "
                />
              )}

            </button>


            {/* Recruiter */}

            <button
              type="button"
              onClick={() => handleRoleChange("recruiter")}
              className={`
                relative
                h-[76px]
                rounded-xl
                border
                flex
                items-center
                gap-3
                px-4
                text-left
                cursor-pointer
                transition-all
                duration-200
                ${
                  !isStudent
                    ? "border-[#D9A943] bg-[#FFF9EA] shadow-sm"
                    : "border-[#DDD9D0] bg-white hover:border-[#C9C3B8]"
                }
              `}
            >

              <div
                className={`
                  w-10
                  h-10
                  rounded-lg
                  flex
                  items-center
                  justify-center
                  shrink-0
                  ${
                    !isStudent
                      ? "bg-[#D9A943] text-white"
                      : "bg-[#F3F1EC] text-slate-500"
                  }
                `}
              >
                <Briefcase size={19} />
              </div>


              <div>

                <p className="text-sm font-semibold text-[#172033]">
                  Recruiter
                </p>

                <p className="text-[11px] text-slate-500 mt-0.5">
                  Find great talent
                </p>

              </div>


              {!isStudent && (
                <span
                  className="
                    absolute
                    top-3
                    right-3
                    w-2
                    h-2
                    rounded-full
                    bg-[#D9A943]
                  "
                />
              )}

            </button>

          </div>

        </div>


        {/* ------------------------------------------- */}
        {/* Form */}
        {/* ------------------------------------------- */}

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          {/* Full Name */}

          <div>

            <label
              htmlFor="name"
              className={labelClass}
            >
              Full name
            </label>

            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="Jordan Ahmed"
              value={form.name}
              onChange={handleChange}
              className={inputClass}
            />

          </div>


          {/* Email */}

          <div>

            <label
              htmlFor="email"
              className={labelClass}
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

            <label
              htmlFor="password"
              className={labelClass}
            >
              Password
            </label>


            <div className="relative">

              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="At least 6 characters"
                value={form.password}
                onChange={handleChange}
                className={`${inputClass} pr-12`}
              />


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


          {/* ------------------------------------------- */}
          {/* Student field */}
          {/* ------------------------------------------- */}

          {isStudent && (
            <div>

              <label
                htmlFor="headline"
                className={labelClass}
              >
                Professional headline

                <span className="font-normal text-slate-400 ml-1">
                  (optional)
                </span>
              </label>

              <input
                id="headline"
                name="headline"
                type="text"
                placeholder="e.g. Final-year CS student"
                value={form.headline}
                onChange={handleChange}
                className={inputClass}
              />

            </div>
          )}


          {/* ------------------------------------------- */}
          {/* Recruiter field */}
          {/* ------------------------------------------- */}

          {!isStudent && (
            <div>

              <label
                htmlFor="company"
                className={labelClass}
              >
                Company

                <span className="font-normal text-slate-400 ml-1">
                  (optional)
                </span>
              </label>

              <input
                id="company"
                name="company"
                type="text"
                placeholder="e.g. Acme Inc."
                value={form.company}
                onChange={handleChange}
                className={inputClass}
              />

            </div>
          )}


          {/* ------------------------------------------- */}
          {/* Submit */}
          {/* ------------------------------------------- */}

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
                <span
                  className="
                    w-4 h-4
                    border-2
                    border-[#172033]/30
                    border-t-[#172033]
                    rounded-full
                    animate-spin
                  "
                />

                Creating account...
              </>

            ) : (

              <>
                Create {isStudent ? "student" : "recruiter"} account
                <ArrowRight size={17} />
              </>

            )}

          </button>

        </form>


        {/* ------------------------------------------- */}
        {/* Login */}
        {/* ------------------------------------------- */}

        <div className="mt-7 pt-6 border-t border-[#E5E0D7]">

          <p className="text-sm text-center text-slate-500">

            Already have an account?{" "}

            <Link
              to="/login"
              className="
                font-semibold
                text-[#B38727]
                hover:text-[#8F6A1E]
                hover:underline
                transition-colors
              "
            >
              Log in
            </Link>

          </p>

        </div>


        {/* Footer */}

        <p className="text-center text-xs text-slate-400 mt-5">
          Free to start · Built for your career journey
        </p>

      </div>

    </AuthLayout>
  );
}