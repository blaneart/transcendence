import CustomButton from '../custom-button/custom-button.component';

const uuid = require("uuid");


const REDIRECT_URL : string = process.env.REACT_APP_FRONTEND_URL || "http://127.0.0.1:3001"; // 42 api will send the user back here
let API_UID : string;
if (process.env.REACT_APP_API_UID) {
  API_UID = process.env.REACT_APP_API_UID;
} else {
  throw new Error("REACT_APP_API_UID environment variable is not set");
}


// Redirect to 42, and 42 will send the user back to us
function signUpButtonClicked() {
    let STATE = uuid.v4();
    window.location.href = `https://api.intra.42.fr/oauth/authorize?client_id=${API_UID}&redirect_uri=${REDIRECT_URL}&scope=public&state=${STATE}&response_type=code`;
}

const Login = () => {

    return (
    <div className="login">
        <CustomButton isLogged={0} onClick={signUpButtonClicked}>SIGN IN</CustomButton>
    </div>
    );
}


export default Login;