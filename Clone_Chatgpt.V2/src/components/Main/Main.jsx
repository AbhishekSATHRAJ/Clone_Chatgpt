import { useState } from "react";
import "./Main.css";
import { assets } from "../../assets/assets";
import video from "../../assets/6153453-uhd_4096_2160_25fps.mp4" ;

function Main() {
  const [formView, setFormView] = useState(null);

  const HandleChange=()=>{
    setFormView('register');
  }
  const closeForm=()=>{
    setFormView(null);
  }
  const handleSubmit=(e)=>{
    e.preventDefault();
    alert( "Form submitted");

  }
  return (
    <div className="main">
      <div className="nav">
        <p>Clone_Chatgpt.V2</p>
        <img src={assets.user_icon} onClick={HandleChange} alt="" />
      </div>
      <div className="main-container">
        <div className="greet">
          <p>
            <span>Hello,Uchiha itachi.</span>
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
            <button className="close-btn" onClick={closeForm}>
              X
            </button>
            {formView === "register" && (
              <>
                <h2>Register</h2>
                <form onSubmit={handleSubmit}>
                  <input type="text" placeholder="Username" required />
                  <input type="email" placeholder="Email" required />
                  <input type="password" placeholder="Password" required />
                  <button type="submit">Register</button>
                </form>
                <p>
                  Already have a account ?{" "}
                  <span onClick={() => setFormView("signin")}>Sign In</span>
                </p>
              </>
            )}
            {formView === "signin" && (
              <>
                <h2>Sign In</h2>
                <form onSubmit={handleSubmit}>
                  <input type="email" placeholder="Email" required />
                  <input type="password" placeholder="Password" required />
                  <button type="submit">Sign In</button>
                </form>
                <p>
                  Dont have an account?{" "}
                  <span onClick={() => setFormView("register")}>Register</span>
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
          </div>
        </div>
      )}
    </div>
  );
}
export default Main;