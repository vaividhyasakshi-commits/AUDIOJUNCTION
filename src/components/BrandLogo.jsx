import logo from "../assets/images/logo.PNG";

export default function BrandLogo({ small = false }) {
  return (
    <img
      src={logo}
      alt="Audio Junction"
      className={
        small
          ? "audio-junction-logo dashboard-logo"
          : "audio-junction-logo"
      }
    />
  );
}
