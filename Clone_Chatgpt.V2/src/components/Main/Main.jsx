import { useState ,useEffect} from "react";
import "./Main.css";
import axios from "axios";
import { assets } from "../../assets/assets";
import video from "../../assets/6153453-uhd_4096_2160_25fps.mp4";
// import server from "../../server";

function Main() {
  // Utility function to validate password
  const validatePassword = (password) => {
    if (password.length < 8)
      return "Password must be at least 8 characters long";
    if (!/[A-Z]/.test(password))
      return "Password must include at least one uppercase letter";
    if (!/[a-z]/.test(password))
      return "Password must include at least one lowercase letter";
    if (!/[0-9]/.test(password))
      return "Password must include at least one number";
    return null;
  };

  const [formView, setFormView] = useState(null);
  const [username, setUsername] = useState("");
  const [userIcon, setUserIcon] = useState(assets.user_icon);
  const [passwordError, setPasswordError] = useState("");

  const handleFormChange=(view)=>{
    setFormView(view);
  }
  const closeForm = () => {
    setFormView(null);
  };
  const handleSubmit =  (e) => {
    e.preventDefault();
    const formDate = new FormData(e.target);
    const data = Object.fromEntries(formDate.entries());
    console.log(data);
  
    if (formView === "register") {
      const passwordError = validatePassword(data.password);
      if (passwordError) {
        setPasswordError(passwordError);
        return;
      }
    }
  
    try {
      let response;
      if (formView === "register") {
        response =  axios.post("http://localhost:5000/register", data,{ withCredentials: true });
        alert(response.data.message);
      } else if (formView === "signin") {
        response =  axios.post("http://localhost:5000/signin", data,{ withCredentials: true });
        
        alert(response.data.message);
  
        if (response.data.token) {
          // Save the token and user info
          localStorage.setItem("token", response.data.token);
          setUsername(response.data.user.username);
          setUserIcon(response.data.user.userIcon);
          // Close the form view and show the main page
          setFormView(null);
        }
      }
    } catch (error) {
      console.log(error);
      alert("Error: " + error.response.data.message);
    }
  };




  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios
        .get("http://localhost:5000/user", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          setUsername(response.data.username);
          setUserIcon(response.data.userIcon);
        })
        .catch((error) => {
          console.log(error);
          // Handle cases where token is invalid or expired
          localStorage.removeItem("token");
        });
    }
  }, []);
  
  
  return (
    <div className="main">
      <div className="nav">
        <p>Clone_Chatgpt.V2</p>
        <img
          src={userIcon || assets.user_icon}
          onClick={() => handleFormChange("register")}
          alt="User_Icon"
        />
      </div>
      <div className="main-container">
        <div className="greet">
          <p>
            <span>Hello,{username || "Uchiha itachi"}.</span>
          </p>
          <p>How can I help today</p>
        </div>
        <div className="cards">
          <div className="card">
            <p>Suggest beautiful places to see on an upcoming road trip</p>
            <img src={assets.compass_icon} alt="" />
          </div>
          <div className="card">
            <p>Briefly summarize this concept: urban planning</p>
            <img src={assets.bulb_icon} alt="" />
          </div>
          <div className="card">
            <p>Brainstrom team bonding activities for our work retreat</p>
            <img src={assets.message_icon} alt="" />
          </div>
          <div className="card">
            <p>Improve the readability of the following code</p>
            <img src={assets.code_icon} alt="" />
          </div>
        </div>
        <div className="main-bottom">
          <div className="search-box">
            <input type="text" placeholder="Enter a prompt her..." />
            <div>
              <img src={assets.gallery_icon} alt="" />
              <img src={assets.mic_icon} alt="" />
              <img src={assets.send_icon} alt="" />
            </div>
          </div>
          <p className="bottom-info">
            Clone_Chatgpt.V2 may display inaccurate info, including about
            people, so double-check its responses. You privacy and
            Clone_Chatgpt.V2
          </p>
        </div>
      </div>

      {formView && (
        <div className="form-container">
          <video autoPlay muted loop>
            <source src={video} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="form">
            <button className="close-btn" onClick={() => setFormView(null)}>
              X
            </button>
            <form onSubmit={handleSubmit}>
              {formView === "register" && (
                <>
                  <h2>Register</h2>

                  <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    autoComplete="currect-username"
                    required
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    autoComplete="currect-email"
                    required
                  />
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    autoComplete="currect-password"
                    required
                    onChange={(e) =>
                      setPasswordError(validatePassword(e.target.value))
                    }
                  />
                  {passwordError && (
                    <p className="error-message">{passwordError}</p>
                  )}
                  <button type="submit" disabled={!!passwordError}>
                    Register
                  </button>

                  <p>
                    Already have a account ?{" "}
                    <span onClick={() => setFormView("signin")}>Sign In</span>
                  </p>
                </>
              )}
              {formView === "signin" && (
                <>
                  <h2>Sign In</h2>

                  <input type="email"  autoComplete="currect-email" name="email" placeholder="Email" required />
                  <input type="password" autoComplete="currect-password" name="password" placeholder="Password" required />
                  <button type="submit">Sign In</button>

                  <p>
                    Dont have an account?{" "}
                    <span onClick={() => setFormView("register")}>
                      Register
                    </span>
                  </p>
                </>
              )}

              {formView === "signout" && (
                <>
                  <h2>Sign Out</h2>
                  <p>Are you sure you want to sign out?</p>
                  <button onClick={closeForm}>Cancel</button>
                  <button onClick={() => alert("Signed out!")}>Sign Out</button>
                </>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
export default Main;
