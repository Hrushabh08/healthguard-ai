import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  return (
    <div style={{
      height: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center"
    }}>
      <div>
        <h1>Login Working</h1>

        <button onClick={() => navigate("/signup")}>
          Go to Signup
        </button>
      </div>
    </div>
  );
}